"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ActivityCategory } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ActivityCategory[];

export function NewActivityForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const stepsRaw = String(form.get("steps") ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const payload = {
      title: String(form.get("title") ?? ""),
      category: String(form.get("category") ?? "other"),
      summary: String(form.get("summary") ?? "") || undefined,
      target_brand: String(form.get("target_brand") ?? "") || undefined,
      target_model: String(form.get("target_model") ?? "") || undefined,
      frequency: String(form.get("frequency") ?? "") || undefined,
      protocol: String(form.get("protocol") ?? "") || undefined,
      code_type: String(form.get("code_type") ?? "") || undefined,
      flipper_protocol: String(form.get("flipper_protocol") ?? "") || undefined,
      safety_notes: String(form.get("safety_notes") ?? "") || undefined,
      steps: stepsRaw.map((title) => ({ title })),
    };

    const response = await fetch("/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      setError("Could not create activity.");
      setLoading(false);
      return;
    }

    const activity = (await response.json()) as { id: number };
    router.push(`/activities/${activity.id}`);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-card-border bg-card p-6"
    >
      <Field label="Title" name="title" required placeholder="NFC hotel key read test" />
      <div>
        <label htmlFor="category" className="mb-1 block text-sm text-muted">
          Category
        </label>
        <select
          id="category"
          name="category"
          defaultValue="sub-ghz"
          className="w-full rounded-lg border border-card-border bg-background px-3 py-2"
        >
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {CATEGORY_LABELS[category]}
            </option>
          ))}
        </select>
      </div>
      <TextArea label="Summary" name="summary" rows={3} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Target brand" name="target_brand" placeholder="Dominator" />
        <Field label="Target model" name="target_model" placeholder="PTX4" />
        <Field label="Frequency" name="frequency" placeholder="433.92 MHz" />
        <Field label="Protocol" name="protocol" placeholder="SecuraCode" />
        <Field label="Code type" name="code_type" placeholder="Rolling code" />
        <Field label="Flipper protocol" name="flipper_protocol" placeholder="ATA PTX4" />
      </div>
      <TextArea
        label="Steps (one per line)"
        name="steps"
        rows={6}
        placeholder={"Update firmware\nAdd Manually → ATA PTX4\nPair at motor"}
      />
      <TextArea label="Safety notes" name="safety_notes" rows={2} />
      {error && <p className="text-sm text-danger">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
      >
        {loading ? "Creating…" : "Create activity"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm text-muted">
        {label}
      </label>
      <input
        id={name}
        name={name}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-card-border bg-background px-3 py-2"
      />
    </div>
  );
}

function TextArea({
  label,
  name,
  rows,
  placeholder,
}: {
  label: string;
  name: string;
  rows: number;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm text-muted">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-lg border border-card-border bg-background px-3 py-2"
      />
    </div>
  );
}
