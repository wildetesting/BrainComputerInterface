import Link from "next/link";

import { CategorySidebar } from "@/components/category-sidebar";
import { FeedCard } from "@/components/feed-card";
import { requireAuth } from "@/lib/auth";
import { getPublicBaseUrl, getRssToken } from "@/lib/config";
import { listCategories, listSnapshots } from "@/lib/storage";

type DashboardPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const userId = await requireAuth();
  const [categories, snapshots] = await Promise.all([
    listCategories(userId),
    listSnapshots(userId, { query: params.q })
  ]);
  const rssToken = getRssToken();
  const rssUrl = rssToken ? `${getPublicBaseUrl()}/rss/${encodeURIComponent(rssToken)}` : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <CategorySidebar categories={categories} />

      <section className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white/85 p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-700">
                Factual feed
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                Latest screenshots
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Private dashboard entries created from screenshots you upload. Existing categories
                are updated automatically when new screenshots match them.
              </p>
            </div>
            <Link
              href="/upload"
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              Upload screenshot
            </Link>
          </div>

          <form className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              type="search"
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Search titles, summaries, categories, or extracted text"
              className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-blue-500 transition focus:ring-4"
            />
            <button
              type="submit"
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Search
            </button>
          </form>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <span className="font-semibold text-slate-900">Private RSS:</span>{" "}
            {rssUrl ? (
              <a href={rssUrl} className="break-all text-blue-700 hover:underline">
                {rssUrl}
              </a>
            ) : (
              "Set RSS_TOKEN or APP_PASSWORD to enable."
            )}
          </div>
        </div>

        {snapshots.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/75 p-10 text-center">
            <h2 className="text-xl font-semibold text-slate-950">No screenshots yet</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
              Upload your first phone screenshot to create the first factual feed card.
            </p>
            <Link
              href="/upload"
              className="mt-5 inline-flex rounded-full bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
            >
              Add screenshot
            </Link>
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
