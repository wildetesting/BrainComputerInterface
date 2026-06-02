import Link from "next/link";

import type { Snapshot } from "@/lib/types";
import { formatDateTime, relativeTime } from "@/lib/utils";

type FeedCardProps = {
  snapshot: Snapshot;
};

export function FeedCard({ snapshot }: FeedCardProps) {
  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 md:grid-cols-[220px_1fr]">
        <div className="bg-slate-100">
          <img
            src={snapshot.imageUrl}
            alt={`Screenshot for ${snapshot.title}`}
            className="h-full min-h-56 w-full object-cover"
          />
        </div>

        <div className="p-5 sm:p-6">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <Link
              href={`/category/${snapshot.categorySlug}`}
              className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700"
            >
              {snapshot.categoryName}
            </Link>
            <span>Updated {relativeTime(snapshot.updatedAt)}</span>
            <span aria-hidden="true">•</span>
            <time dateTime={snapshot.updatedAt}>{formatDateTime(snapshot.updatedAt)}</time>
          </div>

          <h2 className="text-xl font-semibold tracking-tight text-slate-950">{snapshot.title}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-700">{snapshot.summary}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {snapshot.topics.map((topic) => (
              <span
                key={topic}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600"
              >
                {topic}
              </span>
            ))}
          </div>

          <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-3">
              <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Interest score
              </div>
              <div className="mt-1 font-semibold text-slate-800">
                {Math.round(snapshot.importanceScore * 100)}%
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3">
              <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Source
              </div>
              {snapshot.sourceUrl ? (
                <a
                  href={snapshot.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 block truncate font-semibold text-blue-700 hover:underline"
                >
                  {snapshot.sourceUrl}
                </a>
              ) : (
                <div className="mt-1 font-semibold text-slate-700">
                  Not visible ({snapshot.sourceConfidence})
                </div>
              )}
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-500">{snapshot.factualityNote}</p>
        </div>
      </div>
    </article>
  );
}
