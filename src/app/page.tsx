import Link from "next/link";
import { listActivities } from "@/lib/activities";
import { ActivityCard } from "@/components/ActivityCard";
import { StatsBar } from "@/components/StatsBar";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const activities = listActivities();

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">Dashboard</p>
        <h1 className="text-3xl font-semibold sm:text-4xl">Flipper Zero activities</h1>
        <p className="max-w-2xl text-muted">
          Track protocols, pairing steps, artifacts, and outcomes for every Flipper project.
        </p>
      </section>

      <StatsBar activities={activities} />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Activities</h2>
          <span className="text-sm text-muted">{activities.length} total</span>
        </div>

        {activities.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-card-border bg-card p-10 text-center">
            <p className="text-muted">No activities yet.</p>
            <Link
              href="/activities/new"
              className="mt-4 inline-block text-sm font-medium text-accent hover:underline"
            >
              Create your first activity
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {activities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
