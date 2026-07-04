import type { ActivityArtifact } from "@/lib/types";

interface ActivityArtifactsProps {
  artifacts: ActivityArtifact[];
}

export function ActivityArtifacts({ artifacts }: ActivityArtifactsProps) {
  if (artifacts.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Scripts &amp; artifacts</h2>
      <div className="space-y-4">
        {artifacts.map((artifact) => (
          <div
            key={artifact.id}
            className="overflow-hidden rounded-2xl border border-card-border bg-card"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-card-border px-4 py-3">
              <div>
                <p className="font-medium">{artifact.name}</p>
                <p className="text-xs text-muted">{artifact.kind}</p>
              </div>
              {artifact.path_or_url && (
                <code className="rounded bg-background px-2 py-1 text-xs text-accent">
                  {artifact.path_or_url}
                </code>
              )}
            </div>
            {artifact.notes && (
              <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-muted">
                {artifact.notes}
              </pre>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
