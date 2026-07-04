import type { ActivityStatus } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/types";

const STATUS_STYLES: Record<ActivityStatus, string> = {
  planned: "border-card-border bg-card text-muted",
  in_progress: "border-accent/40 bg-accent-muted text-accent",
  success: "border-success/40 bg-success/10 text-success",
  failed: "border-danger/40 bg-danger/10 text-danger",
  skipped: "border-card-border bg-card text-muted",
};

interface StatusBadgeProps {
  status: ActivityStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
