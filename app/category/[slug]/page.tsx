import Link from "next/link";
import { notFound } from "next/navigation";

import { CategorySidebar } from "@/components/category-sidebar";
import { FeedCard } from "@/components/feed-card";
import { requireAuth } from "@/lib/auth";
import { getCategoryBySlug, listCategories, listSnapshots } from "@/lib/storage";
import { formatDateTime, relativeTime } from "@/lib/utils";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const userId = await requireAuth();
  const [category, categories, snapshots] = await Promise.all([
    getCategoryBySlug(userId, slug),
    listCategories(userId),
    listSnapshots(userId, { categorySlug: slug })
  ]);

  if (!category) {
    notFound();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <CategorySidebar categories={categories} activeSlug={slug} />

      <section className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-sm">
          <Link href="/dashboard" className="text-sm font-medium text-blue-700 hover:underline">
            Back to dashboard
          </Link>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-700">
                Category
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                {category.name}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                {category.description || "Screenshots grouped under this category."}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <div>
                <span className="font-semibold text-slate-900">{category.itemCount}</span>{" "}
                screenshot{category.itemCount === 1 ? "" : "s"}
              </div>
              <div className="mt-1">
                Last updated {relativeTime(category.lastUpdatedAt)}
              </div>
              <div className="mt-1 text-xs">{formatDateTime(category.lastUpdatedAt)}</div>
            </div>
          </div>
        </div>

        {snapshots.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/75 p-10 text-center">
            <h2 className="text-xl font-semibold text-slate-950">No screenshots in this category</h2>
          </div>
        ) : (
          <div className="space-y-5">
            {snapshots.map((snapshot) => (
              <FeedCard key={snapshot.id} snapshot={snapshot} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
