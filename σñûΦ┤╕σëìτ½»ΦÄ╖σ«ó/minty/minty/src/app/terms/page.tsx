import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <article className="container max-w-3xl py-14">
      <h1 className="text-3xl font-bold text-ink">Terms of Service</h1>
      <p className="mt-2 text-sm text-ink-muted">Last updated: June 2026</p>
      <div className="mt-6 space-y-4 text-ink-soft">
        <p>By using this website you agree to use it for lawful purposes only. Product images and specifications are indicative; final terms are confirmed in writing during the quotation process.</p>
        <p>Quotes, lead times and pricing are subject to confirmation and may vary with order volume, materials and customization.</p>
        <p className="text-sm text-ink-muted">This is placeholder copy for the Phase-1 build and should be replaced with legally reviewed text before launch.</p>
      </div>
    </article>
  );
}
