import { NewActivityForm } from "@/components/NewActivityForm";

export default function NewActivityPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="text-sm text-muted">Create</p>
        <h1 className="text-3xl font-semibold">New activity</h1>
      </div>
      <NewActivityForm />
    </div>
  );
}
