import { NextResponse } from "next/server";
import { getActivityById } from "@/lib/activities";
import type { StepStatus } from "@/lib/types";
import { updateStepStatus } from "@/lib/activities";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string; stepId: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id, stepId } = await context.params;
  const activityId = Number(id);
  const activity = getActivityById(activityId);

  if (!activity) {
    return NextResponse.json({ error: "Activity not found" }, { status: 404 });
  }

  const body = await request.json();
  const status = body.status as StepStatus;

  if (!["pending", "done", "failed", "skipped"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = updateStepStatus(Number(stepId), status);
  if (!updated) {
    return NextResponse.json({ error: "Step not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
