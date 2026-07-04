import type { Activity } from "@/lib/types";

interface StatsBarProps {
  activities: Activity[];
}

export function StatsBar({ activities }: StatsBarProps) {
  const inProgress = activities.filter((a) => a.status === "in_progress").length;
  const success = activities.filter((a) => a.status === "success").length;
  const planned = activities.filter((a) => a.status === "planned").length;

  const stats = [
    { label: "Total", value: activities.length },
    { label: "In progress", value: inProgress },
    { label: "Success", value: success },
    { label: "Planned", value: planned },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl border border-card-border bg-card px-4 py-5"
        >
          <p className="text-xs uppercase tracking-wide text-muted">{stat.label}</p>
          <p className="mt-1 text-2xl font-semibold">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
