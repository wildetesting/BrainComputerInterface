import { NextRequest, NextResponse } from "next/server";

import { analyzeScreenshot } from "@/lib/analysis";
import { requireAuth } from "@/lib/auth";
import { createSnapshot, saveScreenshotImage } from "@/lib/storage";

export const runtime = "nodejs";

const maxBytes = 10 * 1024 * 1024;
const allowedMimeTypes = new Set(["image/png", "image/jpeg", "image/webp"]);

export async function POST(request: NextRequest) {
  const userId = await requireAuth();
  const formData = await request.formData();
  const screenshot = formData.get("screenshot");

  if (!(screenshot instanceof File)) {
    return NextResponse.json({ error: "A screenshot file is required." }, { status: 400 });
  }

  if (!allowedMimeTypes.has(screenshot.type)) {
    return NextResponse.json(
      { error: "Only PNG, JPEG, and WebP screenshots are supported." },
      { status: 400 }
    );
  }

  if (screenshot.size > maxBytes) {
    return NextResponse.json({ error: "Screenshot must be 10 MB or smaller." }, { status: 400 });
  }

  const bytes = Buffer.from(await screenshot.arrayBuffer());
  const imageUrl = await saveScreenshotImage(userId, screenshot.name, screenshot.type, bytes);
  const analysis = await analyzeScreenshot(screenshot.name, screenshot.type, bytes);

  await createSnapshot({
    userId,
    imageUrl,
    originalName: screenshot.name,
    mimeType: screenshot.type,
    analysis
  });

  return NextResponse.redirect(new URL("/dashboard", request.url), { status: 303 });
}
