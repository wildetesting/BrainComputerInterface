export const DEFAULT_USER_ID = "private-owner";

export const AUTH_COOKIE_NAME = "screenshot_dashboard_session";

export function getAppPassword(): string | null {
  if (process.env.APP_PASSWORD) {
    return process.env.APP_PASSWORD;
  }

  if (process.env.NODE_ENV !== "production") {
    return "demo-pass";
  }

  return null;
}

export function getRssToken(): string | null {
  if (process.env.RSS_TOKEN) {
    return process.env.RSS_TOKEN;
  }

  if (process.env.APP_PASSWORD) {
    return process.env.APP_PASSWORD;
  }

  if (process.env.NODE_ENV !== "production") {
    return "demo-pass";
  }

  return null;
}

export function getPublicBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export function hasSupabaseConfig(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      process.env.SUPABASE_STORAGE_BUCKET
  );
}
