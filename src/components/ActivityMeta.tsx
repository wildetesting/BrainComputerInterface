import type { ActivityWithDetails } from "@/lib/types";

interface ActivityMetaProps {
  activity: ActivityWithDetails;
}

function MetaRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4 border-b border-card-border py-2 text-sm last:border-0">
      <span className="text-muted">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

export function ActivityMeta({ activity }: ActivityMetaProps) {
  return (
    <div className="rounded-2xl border border-card-border bg-card p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Target device</h3>
      <div className="mt-3">
        <MetaRow label="Brand" value={activity.target_brand} />
        <MetaRow label="Model" value={activity.target_model} />
        <MetaRow label="Frequency" value={activity.frequency} />
        <MetaRow label="Protocol" value={activity.protocol} />
        <MetaRow label="Code type" value={activity.code_type} />
        <MetaRow label="Flipper protocol" value={activity.flipper_protocol} />
      </div>
      {activity.outcome_notes && (
        <div className="mt-4 border-t border-card-border pt-4">
          <h4 className="text-sm font-semibold">Outcome notes</h4>
          <p className="mt-2 text-sm text-muted">{activity.outcome_notes}</p>
        </div>
      )}
    </div>
  );
}
