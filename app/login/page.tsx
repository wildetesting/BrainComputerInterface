import { getAppPassword } from "@/lib/config";

import { loginAction } from "./actions";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const isConfigured = Boolean(getAppPassword());

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-700">Private access</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Sign in</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        Enter the dashboard passcode. In local development, the default is{" "}
        <code className="rounded bg-slate-100 px-1.5 py-0.5">demo-pass</code>; set{" "}
        <code className="rounded bg-slate-100 px-1.5 py-0.5">APP_PASSWORD</code> before deploying.
      </p>

      {!isConfigured ? (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          APP_PASSWORD is required in production before the dashboard can be accessed.
        </div>
      ) : null}

      {params.error ? (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          The passcode was not correct.
        </div>
      ) : null}

      <form action={loginAction} className="mt-6 space-y-4">
        <input type="hidden" name="next" value={params.next ?? "/dashboard"} />
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Passcode</span>
          <input
            type="password"
            name="password"
            required
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none ring-blue-500 transition focus:ring-4"
            placeholder="Enter passcode"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-2xl bg-slate-950 px-4 py-3 font-semibold text-white shadow-sm hover:bg-slate-800"
        >
          Open dashboard
        </button>
      </form>
    </div>
  );
}
