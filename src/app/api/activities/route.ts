import { NextResponse } from "next/server";
import { createActivity, listActivities } from "@/lib/activities";
import type { ActivityCategory } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(listActivities());
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.title || typeof body.title !== "string") {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const activity = createActivity({
    title: body.title,
    category: body.category as ActivityCategory,
    summary: body.summary,
    target_brand: body.target_brand,
    target_model: body.target_model,
    frequency: body.frequency,
    protocol: body.protocol,
    code_type: body.code_type,
    flipper_protocol: body.flipper_protocol,
    safety_notes: body.safety_notes,
    steps: body.steps,
  });

  return NextResponse.json(activity, { status: 201 });
}
