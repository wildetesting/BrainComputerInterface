import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "@/lib/init-db";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flipper Activity Dashboard",
  description: "Track Flipper Zero projects, steps, and outcomes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="min-h-screen">
          <header className="border-b border-card-border bg-card/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent font-mono text-sm font-bold text-black">
                  FZ
                </div>
                <div>
                  <p className="text-sm font-semibold tracking-wide">Flipper Dashboard</p>
                  <p className="text-xs text-muted">Activity tracker</p>
                </div>
              </Link>
              <Link
                href="/activities/new"
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-black transition hover:brightness-110"
              >
                New activity
              </Link>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
