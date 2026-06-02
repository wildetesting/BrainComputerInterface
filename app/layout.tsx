import type { Metadata } from "next";
import Link from "next/link";

import "./globals.css";

export const metadata: Metadata = {
  title: "Private Screenshot Feed",
  description: "Turn private phone screenshots into a factual dashboard and RSS feed."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
          <header className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/70 bg-white/80 px-5 py-4 shadow-sm backdrop-blur">
            <Link href="/dashboard" className="group">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-700">
                Private
              </p>
              <h1 className="text-xl font-bold tracking-tight text-slate-950 group-hover:text-blue-700">
                Screenshot Feed
              </h1>
            </Link>
            <nav className="flex flex-wrap items-center gap-2 text-sm font-medium">
              <Link
                href="/dashboard"
                className="rounded-full px-4 py-2 text-slate-700 hover:bg-slate-100"
              >
                Dashboard
              </Link>
              <Link
                href="/upload"
                className="rounded-full bg-slate-950 px-4 py-2 text-white shadow-sm hover:bg-slate-800"
              >
                Upload
              </Link>
              <Link href="/logout" className="rounded-full px-4 py-2 text-slate-500 hover:bg-slate-100">
                Sign out
              </Link>
            </nav>
          </header>

          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
