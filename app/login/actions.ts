"use server";

import { redirect } from "next/navigation";

import { createSession } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");
  const success = await createSession(password);

  if (!success) {
    redirect(`/login?error=1&next=${encodeURIComponent(next)}`);
  }

  redirect(next.startsWith("/") ? next : "/dashboard");
}
