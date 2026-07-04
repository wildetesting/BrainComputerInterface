"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ActivityStep, StepStatus } from "@/lib/types";
import { STEP_STATUS_LABELS } from "@/lib/types";

interface StepChecklistProps {
  activityId: number;
  steps: ActivityStep[];
}

const NEXT_STATUS: Record<StepStatus, StepStatus> = {
  pending: "done",
  done: "pending",
  failed: "pending",
  skipped: "pending",
};

const STATUS_RING: Record<StepStatus, string> = {
  pending: "border-card-border bg-background",
  done: "border-success bg-success text-black",
  failed: "border-danger bg-danger text-white",
  skipped: "border-card-border bg-card text-muted",
};

export function StepChecklist({ activityId, steps }: StepChecklistProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<number | null>(null);

  async function toggleStep(step: ActivityStep) {
    setPendingId(step.id);
    const nextStatus = NEXT_STATUS[step.status];

    await fetch(`/api/activities/${activityId}/steps/${step.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });

    setPendingId(null);
    router.refresh();
  }

  async function setStepStatus(step: ActivityStep, status: StepStatus) {
    setPendingId(step.id);
    await fetch(`/api/activities/${activityId}/steps/${step.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setPendingId(null);
    router.refresh();
  }

  return (
    <ol className="space-y-3">
      {steps.map((step) => (
        <li
          key={step.id}
          className="rounded-2xl border border-card-border bg-card p-4"
        >
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => toggleStep(step)}
              disabled={pendingId === step.id}
              aria-label={`Mark step ${step.position} ${step.status === "done" ? "pending" : "done"}`}
              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition disabled:opacity-50 ${STATUS_RING[step.status]}`}
            >
              {step.status === "done" ? "✓" : step.position}
            </button>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{step.title}</p>
                <span className="text-xs text-muted">{STEP_STATUS_LABELS[step.status]}</span>
              </div>
              {step.description && (
                <p className="text-sm text-muted">{step.description}</p>
              )}
              <div className="flex flex-wrap gap-2 pt-2">
                {(["failed", "skipped"] as StepStatus[]).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStepStatus(step, status)}
                    disabled={pendingId === step.id}
                    className="rounded-md border border-card-border px-2 py-1 text-xs text-muted transition hover:border-foreground/20 hover:text-foreground disabled:opacity-50"
                  >
                    Mark {STEP_STATUS_LABELS[status].toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
