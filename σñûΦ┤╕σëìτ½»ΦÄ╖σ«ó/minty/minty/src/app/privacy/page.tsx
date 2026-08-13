import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Minty Bags collects, uses, and protects the information you share through our inquiry forms.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <article className="container max-w-3xl py-14 prose-sm">
      <h1 className="text-3xl font-bold text-ink">Privacy Policy</h1>
      <p className="mt-2 text-sm text-ink-muted">Last updated: June 2026</p>
      <div className="mt-6 space-y-4 text-ink-soft">
        <p>We collect the information you provide through our inquiry forms (name, email, company, and project details) solely to respond to your request and provide quotes.</p>
        <p>We use analytics (Google Analytics 4 and first-party event logs) to understand site usage and improve our service. No data is sold to third parties.</p>
        <p>To request access to or deletion of your data, contact us via the email on our Contact page.</p>
        <p className="text-sm text-ink-muted">This is placeholder copy for the Phase-1 build and should be replaced with legally reviewed text before launch.</p>
      </div>
    </article>
  );
}
