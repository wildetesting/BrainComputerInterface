import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { nanoid } from "nanoid";

import type { Category, FeedFilters, Snapshot, SnapshotInput } from "@/lib/types";
import { slugify } from "@/lib/utils";

type LocalDatabase = {
  categories: Category[];
  snapshots: Snapshot[];
};

const dataDir = path.join(process.cwd(), ".data");
const dbPath = path.join(dataDir, "db.json");
const uploadDir = path.join(process.cwd(), "public", "uploads");

async function ensureDirectories(): Promise<void> {
  await mkdir(dataDir, { recursive: true });
  await mkdir(uploadDir, { recursive: true });
}

async function readDatabase(): Promise<LocalDatabase> {
  await ensureDirectories();

  try {
    const raw = await readFile(dbPath, "utf8");
    return JSON.parse(raw) as LocalDatabase;
  } catch {
    return {
      categories: [],
      snapshots: []
    };
  }
}

async function writeDatabase(database: LocalDatabase): Promise<void> {
  await ensureDirectories();
  await writeFile(dbPath, JSON.stringify(database, null, 2));
}

function fileExtension(fileName: string, mimeType: string): string {
  const fromName = path.extname(fileName).toLowerCase();
  if (fromName) {
    return fromName;
  }

  if (mimeType === "image/png") {
    return ".png";
  }

  if (mimeType === "image/webp") {
    return ".webp";
  }

  return ".jpg";
}

export async function saveLocalImage(
  fileName: string,
  mimeType: string,
  bytes: Buffer
): Promise<string> {
  await ensureDirectories();

  const safeExtension = fileExtension(fileName, mimeType);
  const storedFileName = `${nanoid()}${safeExtension}`;
  await writeFile(path.join(uploadDir, storedFileName), bytes);

  return `/uploads/${storedFileName}`;
}

export async function listLocalCategories(userId: string): Promise<Category[]> {
  const database = await readDatabase();

  return database.categories
    .filter((category) => category.userId === userId)
    .sort(
      (a, b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime()
    );
}

export async function getLocalCategoryBySlug(
  userId: string,
  slug: string
): Promise<Category | null> {
  const database = await readDatabase();

  return (
    database.categories.find(
      (category) => category.userId === userId && category.slug === slug
    ) ?? null
  );
}

export async function listLocalSnapshots(
  userId: string,
  filters: FeedFilters = {}
): Promise<Snapshot[]> {
  const database = await readDatabase();
  const query = filters.query?.trim().toLowerCase();

  return database.snapshots
    .filter((snapshot) => snapshot.userId === userId)
    .filter((snapshot) => !filters.categorySlug || snapshot.categorySlug === filters.categorySlug)
    .filter((snapshot) => {
      if (!query) {
        return true;
      }

      const searchable = [
        snapshot.title,
        snapshot.summary,
        snapshot.categoryName,
        snapshot.extractedText,
        ...snapshot.topics
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export async function createLocalSnapshot(input: SnapshotInput): Promise<Snapshot> {
  const database = await readDatabase();
  const now = new Date().toISOString();
  const categorySlug = slugify(input.analysis.category);

  let category = database.categories.find(
    (existing) => existing.userId === input.userId && existing.slug === categorySlug
  );

  if (category) {
    category.description = input.analysis.categoryDescription || category.description;
    category.itemCount += 1;
    category.lastUpdatedAt = now;
  } else {
    category = {
      id: nanoid(),
      userId: input.userId,
      name: input.analysis.category,
      slug: categorySlug,
      description: input.analysis.categoryDescription,
      itemCount: 1,
      lastUpdatedAt: now,
      createdAt: now
    };
    database.categories.push(category);
  }

  const snapshot: Snapshot = {
    id: nanoid(),
    userId: input.userId,
    imageUrl: input.imageUrl,
    originalName: input.originalName,
    mimeType: input.mimeType,
    title: input.analysis.title,
    summary: input.analysis.summary,
    extractedText: input.analysis.extractedText,
    sourceUrl: input.analysis.sourceUrl,
    sourceConfidence: input.analysis.sourceConfidence,
    categoryId: category.id,
    categoryName: category.name,
    categorySlug: category.slug,
    topics: input.analysis.topics,
    importanceScore: input.analysis.importanceScore,
    factualityNote: input.analysis.factualityNote,
    createdAt: now,
    updatedAt: now
  };

  database.snapshots.unshift(snapshot);
  await writeDatabase(database);

  return snapshot;
}
