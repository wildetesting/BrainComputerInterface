import { NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/config";

const protectedPrefixes = ["/dashboard", "/upload", "/category", "/api/snapshots"];

export function middleware(request: NextRequest) {
  const isProtected = protectedPrefixes.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const appPassword =
    process.env.APP_PASSWORD ?? (process.env.NODE_ENV !== "production" ? "demo-pass" : null);

  if (!appPassword || request.cookies.get(AUTH_COOKIE_NAME)?.value !== appPassword) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/upload/:path*", "/category/:path*", "/api/snapshots/:path*"]
};
