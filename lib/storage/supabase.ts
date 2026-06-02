import "server-only";

import path from "node:path";

import { createClient } from "@supabase/supabase-js";
import { nanoid } from "nanoid";

import type { Category, FeedFilters, Snapshot, SnapshotInput } from "@/lib/types";
import { slugify } from "@/lib/utils";

function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase is not configured.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false
    }
  });
}

function bucketName(): string {
  const bucket = process.env.SUPABASE_STORAGE_BUCKET;
  if (!bucket) {
    throw new Error("SUPABASE_STORAGE_BUCKET is required when Supabase is enabled.");
  }

  return bucket;
}

function toCategory(row: Record<string, unknown>): Category {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    name: String(row.name),
    slug: String(row.slug),
    description: String(row.description ?? ""),
    itemCount: Number(row.item_count ?? 0),
    lastUpdatedAt: String(row.last_updated_at),
    createdAt: String(row.created_at)
  };
}

function toSnapshot(row: Record<string, unknown>): Snapshot {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    imageUrl: String(row.image_url),
    originalName: String(row.original_name),
    mimeType: String(row.mime_type),
    title: String(row.title),
    summary: String(row.summary),
    extractedText: String(row.extracted_text ?? ""),
    sourceUrl: row.source_url ? String(row.source_url) : null,
    sourceConfidence: String(row.source_confidence ?? "none") as Snapshot["sourceConfidence"],
    categoryId: String(row.category_id),
    categoryName: String(row.category_name),
    categorySlug: String(row.category_slug),
    topics: Array.isArray(row.topics) ? (row.topics as string[]) : [],
    importanceScore: Number(row.importance_score ?? 0.5),
    factualityNote: String(row.factuality_note ?? ""),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  };
}

function extensionFor(fileName: string, mimeType: string): string {
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

export async function saveSupabaseImage(
  userId: string,
  fileName: string,
  mimeType: string,
  bytes: Buffer
): Promise<string> {
  const supabase = supabaseAdmin();
  const storagePath = `${userId}/${nanoid()}${extensionFor(fileName, mimeType)}`;
  const { error } = await supabase.storage.from(bucketName()).upload(storagePath, bytes, {
    contentType: mimeType,
    upsert: false
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(bucketName()).getPublicUrl(storagePath);
  return data.publicUrl;
}

export async function listSupabaseCategories(userId: string): Promise<Category[]> {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", userId)
    .order("last_updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => toCategory(row));
}

export async function getSupabaseCategoryBySlug(
  userId: string,
  slug: string
): Promise<Category | null> {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", userId)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? toCategory(data) : null;
}

export async function listSupabaseSnapshots(
  userId: string,
  filters: FeedFilters = {}
): Promise<Snapshot[]> {
  const supabase = supabaseAdmin();
  let query = supabase
    .from("snapshots")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (filters.categorySlug) {
    query = query.eq("category_slug", filters.categorySlug);
  }

  if (filters.query?.trim()) {
    const search = `%${filters.query.trim()}%`;
    query = query.or(
      `title.ilike.${search},summary.ilike.${search},category_name.ilike.${search},extracted_text.ilike.${search}`
    );
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => toSnapshot(row));
}

export async function createSupabaseSnapshot(input: SnapshotInput): Promise<Snapshot> {
  const supabase = supabaseAdmin();
  const now = new Date().toISOString();
  const categorySlug = slugify(input.analysis.category);

  const { data: existingCategory, error: categorySelectError } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", input.userId)
    .eq("slug", categorySlug)
    .maybeSingle();

  if (categorySelectError) {
    throw categorySelectError;
  }

  let category: Category;

  if (existingCategory) {
    const { data, error } = await supabase
      .from("categories")
      .update({
        description: input.analysis.categoryDescription || existingCategory.description,
        item_count: Number(existingCategory.item_count ?? 0) + 1,
        last_updated_at: now
      })
      .eq("id", existingCategory.id)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    category = toCategory(data);
  } else {
    const { data, error } = await supabase
      .from("categories")
      .insert({
        user_id: input.userId,
        name: input.analysis.category,
        slug: categorySlug,
        description: input.analysis.categoryDescription,
        item_count: 1,
        last_updated_at: now,
        created_at: now
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    category = toCategory(data);
  }

  const { data: snapshot, error: snapshotError } = await supabase
    .from("snapshots")
    .insert({
      user_id: input.userId,
      image_url: input.imageUrl,
      original_name: input.originalName,
      mime_type: input.mimeType,
      title: input.analysis.title,
      summary: input.analysis.summary,
      extracted_text: input.analysis.extractedText,
      source_url: input.analysis.sourceUrl,
      source_confidence: input.analysis.sourceConfidence,
      category_id: category.id,
      category_name: category.name,
      category_slug: category.slug,
      topics: input.analysis.topics,
      importance_score: input.analysis.importanceScore,
      factuality_note: input.analysis.factualityNote,
      created_at: now,
      updated_at: now
    })
    .select("*")
    .single();

  if (snapshotError) {
    throw snapshotError;
  }

  return toSnapshot(snapshot);
}
