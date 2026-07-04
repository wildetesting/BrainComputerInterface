import Link from "next/link";
import { notFound } from "next/navigation";
import { getActivityById } from "@/lib/activities";
import { ActivityMeta } from "@/components/ActivityMeta";
import { StepChecklist } from "@/components/StepChecklist";
import { StatusBadge } from "@/components/StatusBadge";
import { CATEGORY_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ActivityDetailPage({ params }: PageProps) {
  const { id } = await params;
  const activity = getActivityById(Number(id));

  if (!activity) notFound();

  const doneSteps = activity.steps.filter((s) => s.status === "done").length;

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Link href="/" className="text-sm text-muted transition hover:text-foreground">
          ← Back to dashboard
        </Link>
        <div className="flex flex-wrap items-start gap-3">
          <StatusBadge status={activity.status} />
          <span className="rounded-full border border-card-border px-3 py-1 text-xs text-muted">
            {CATEGORY_LABELS[activity.category]}
          </span>
        </div>
        <h1 className="text-3xl font-semibold">{activity.title}</h1>
        {activity.summary && <p className="max-w-3xl text-muted">{activity.summary}</p>}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Steps</h2>
            <span className="text-sm text-muted">
              {doneSteps}/{activity.steps.length} complete
            </span>
          </div>
          <StepChecklist activityId={activity.id} steps={activity.steps} />
        </section>

        <aside className="space-y-4">
          <ActivityMeta activity={activity} />
          {activity.safety_notes && (
            <div className="rounded-2xl border border-warning/30 bg-warning/10 p-4">
              <h3 className="text-sm font-semibold text-warning">Safety</h3>
              <p className="mt-2 text-sm text-muted">{activity.safety_notes}</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
