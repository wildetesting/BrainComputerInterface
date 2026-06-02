import "server-only";

import { hasSupabaseConfig } from "@/lib/config";
import {
  createLocalSnapshot,
  getLocalCategoryBySlug,
  listLocalCategories,
  listLocalSnapshots,
  saveLocalImage
} from "@/lib/storage/local";
import {
  createSupabaseSnapshot,
  getSupabaseCategoryBySlug,
  listSupabaseCategories,
  listSupabaseSnapshots,
  saveSupabaseImage
} from "@/lib/storage/supabase";
import type { FeedFilters, SnapshotInput } from "@/lib/types";

export async function saveScreenshotImage(
  userId: string,
  fileName: string,
  mimeType: string,
  bytes: Buffer
): Promise<string> {
  if (hasSupabaseConfig()) {
    return saveSupabaseImage(userId, fileName, mimeType, bytes);
  }

  return saveLocalImage(fileName, mimeType, bytes);
}

export async function createSnapshot(input: SnapshotInput) {
  if (hasSupabaseConfig()) {
    return createSupabaseSnapshot(input);
  }

  return createLocalSnapshot(input);
}

export async function listCategories(userId: string) {
  if (hasSupabaseConfig()) {
    return listSupabaseCategories(userId);
  }

  return listLocalCategories(userId);
}

export async function getCategoryBySlug(userId: string, slug: string) {
  if (hasSupabaseConfig()) {
    return getSupabaseCategoryBySlug(userId, slug);
  }

  return getLocalCategoryBySlug(userId, slug);
}

export async function listSnapshots(userId: string, filters: FeedFilters = {}) {
  if (hasSupabaseConfig()) {
    return listSupabaseSnapshots(userId, filters);
  }

  return listLocalSnapshots(userId, filters);
}
