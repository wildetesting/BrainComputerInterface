export type SourceConfidence = "none" | "low" | "medium" | "high";

export type ScreenshotAnalysis = {
  title: string;
  summary: string;
  category: string;
  categoryDescription: string;
  topics: string[];
  sourceUrl: string | null;
  sourceConfidence: SourceConfidence;
  extractedText: string;
  importanceScore: number;
  factualityNote: string;
};

export type Category = {
  id: string;
  userId: string;
  name: string;
  slug: string;
  description: string;
  itemCount: number;
  lastUpdatedAt: string;
  createdAt: string;
};

export type Snapshot = {
  id: string;
  userId: string;
  imageUrl: string;
  originalName: string;
  mimeType: string;
  title: string;
  summary: string;
  extractedText: string;
  sourceUrl: string | null;
  sourceConfidence: SourceConfidence;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  topics: string[];
  importanceScore: number;
  factualityNote: string;
  createdAt: string;
  updatedAt: string;
};

export type SnapshotInput = {
  userId: string;
  imageUrl: string;
  originalName: string;
  mimeType: string;
  analysis: ScreenshotAnalysis;
};

export type FeedFilters = {
  categorySlug?: string;
  query?: string;
};
