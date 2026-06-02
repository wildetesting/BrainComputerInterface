import Link from "next/link";

import type { Category } from "@/lib/types";
import { relativeTime } from "@/lib/utils";

type CategorySidebarProps = {
  categories: Category[];
  activeSlug?: string;
};

export function CategorySidebar({ categories, activeSlug }: CategorySidebarProps) {
  return (
    <aside className="rounded-3xl border border-slate-200 bg-white/85 p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Categories</h2>
        <Link href="/dashboard" className="text-sm font-medium text-blue-700 hover:underline">
          All
        </Link>
      </div>

      <div className="space-y-2">
        {categories.length === 0 ? (
          <p className="text-sm text-slate-500">Categories appear after your first upload.</p>
        ) : (
          categories.map((category) => (
            <Link
              href={`/category/${category.slug}`}
              key={category.id}
              className={`block rounded-2xl border p-3 transition ${
                activeSlug === category.slug
                  ? "border-blue-300 bg-blue-50 text-blue-950"
                  : "border-slate-100 bg-slate-50 text-slate-700 hover:border-slate-200 hover:bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium">{category.name}</span>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-500">
                  {category.itemCount}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">Updated {relativeTime(category.lastUpdatedAt)}</p>
            </Link>
          ))
        )}
      </div>
    </aside>
  );
}
