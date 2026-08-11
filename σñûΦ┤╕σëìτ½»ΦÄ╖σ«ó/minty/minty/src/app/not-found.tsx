import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "404 — Page Not Found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-7xl font-bold text-brand-600">404</p>
      <h1 className="mt-4 text-2xl font-bold text-ink">Page not found</h1>
      <p className="mt-2 text-ink-muted">The page you're looking for doesn't exist or has moved.</p>
      <Link href="/" className="btn-primary mt-6">Back to home</Link>
    </div>
  );
}
