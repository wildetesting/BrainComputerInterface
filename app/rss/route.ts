import { NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const category = request.nextUrl.searchParams.get("category");

  if (!token) {
    return new NextResponse("Missing token", { status: 400 });
  }

  const destination = new URL(`/rss/${encodeURIComponent(token)}`, request.url);
  if (category) {
    destination.searchParams.set("category", category);
  }

  return NextResponse.redirect(destination, { status: 307 });
}
