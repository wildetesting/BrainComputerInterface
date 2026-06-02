import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AUTH_COOKIE_NAME, DEFAULT_USER_ID, getAppPassword } from "@/lib/config";

export async function isAuthenticated(): Promise<boolean> {
  const password = getAppPassword();
  if (!password) {
    return false;
  }

  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value === password;
}

export async function requireAuth(): Promise<string> {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }

  return DEFAULT_USER_ID;
}

export async function createSession(password: string): Promise<boolean> {
  const appPassword = getAppPassword();
  if (!appPassword || password !== appPassword) {
    return false;
  }

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, appPassword, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });

  return true;
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}
