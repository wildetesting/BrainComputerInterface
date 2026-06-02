import { requireAuth } from "@/lib/auth";

export default async function UploadPage() {
  await requireAuth();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-700">
          New screenshot
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Upload from your phone
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Add a screenshot and the system will create a factual feed card with a category,
          topics, last-updated time, and source link when one is visible.
        </p>

        <form
          action="/api/snapshots"
          method="post"
          encType="multipart/form-data"
          className="mt-8 space-y-5"
        >
          <label className="block rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center transition hover:border-blue-300 hover:bg-blue-50">
            <span className="block text-lg font-semibold text-slate-900">Choose screenshot</span>
            <span className="mt-2 block text-sm text-slate-500">PNG, JPEG, or WebP up to 10 MB</span>
            <input
              type="file"
              name="screenshot"
              required
              accept="image/png,image/jpeg,image/webp"
              className="mt-5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-2xl bg-slate-950 px-4 py-3 font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            Analyze and add to feed
          </button>
        </form>
      </div>
    </div>
  );
}
