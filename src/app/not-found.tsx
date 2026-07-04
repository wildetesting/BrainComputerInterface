import Link from "next/link";

export default function NotFound() {
  return (
    <div className="space-y-4 py-20 text-center">
      <h1 className="text-2xl font-semibold">Not found</h1>
      <p className="text-muted">That activity or page does not exist.</p>
      <Link href="/" className="text-accent hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}
