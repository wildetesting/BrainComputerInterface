import Link from "next/link";
import type { Activity } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

interface ActivityCardProps {
  activity: Activity;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  return (
    <Link
      href={`/activities/${activity.id}`}
      className="block rounded-2xl border border-card-border bg-card p-5 transition hover:border-accent/40 hover:bg-accent-muted/20"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={activity.status} />
            <span className="rounded-full border border-card-border px-2.5 py-0.5 text-xs text-muted">
              {CATEGORY_LABELS[activity.category]}
            </span>
          </div>
          <h3 className="text-lg font-semibold">{activity.title}</h3>
          {activity.summary && (
            <p className="line-clamp-2 text-sm text-muted">{activity.summary}</p>
          )}
        </div>
        <div className="text-right text-xs text-muted">
          <p>{activity.target_brand ?? "No brand"}</p>
          <p className="mt-1">{activity.flipper_protocol ?? activity.protocol ?? "—"}</p>
        </div>
      </div>
    </Link>
  );
}
