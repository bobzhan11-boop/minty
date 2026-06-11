"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { INTEREST_OPTIONS } from "@/lib/constants";
import { trackEvent, getUtm } from "@/lib/track";

interface Props {
  /** Pre-select an interest tag (e.g. from the POD page). */
  defaultInterest?: string;
  /** Associate the inquiry with a product (product detail page). */
  productId?: number;
  productName?: string;
  compact?: boolean;
}

const COUNTRIES = [
  "United States", "United Kingdom", "Germany", "France", "Canada", "Australia",
  "Netherlands", "Spain", "Italy", "Japan", "United Arab Emirates", "Other",
];

export function InquiryForm({ defaultInterest, productId, productName, compact }: Props) {
  const pathname = usePathname();
  const formRef = useRef<HTMLFormElement>(null);
  const [interests, setInterests] = useState<string[]>(
    defaultInterest ? [defaultInterest] : [],
  );
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // Fire form-view event once when mounted (§3.4.1 inquiry_form_view).
  useEffect(() => {
    trackEvent("inquiry_form_view", { page_path: pathname });
  }, [pathname]);

  function toggleInterest(tag: string) {
    setInterests((cur) =>
      cur.includes(tag) ? cur.filter((t) => t !== tag) : [...cur, tag],
    );
  }

  function validate(data: Record<string, string>): boolean {
    const e: Record<string, string> = {};
    if (!data.name?.trim()) e.name = "Please enter your name";
    if (!data.email?.trim()) e.email = "Please enter your email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = "Invalid email format";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setServerError(null);
    const fd = new FormData(ev.currentTarget);
    const data = Object.fromEntries(fd.entries()) as Record<string, string>;

    if (!validate(data)) return;

    setStatus("submitting");
    const utm = getUtm();
    const payload = {
      name: data.name,
      email: data.email,
      company: data.company || undefined,
      country: data.country || undefined,
      phone: data.phone || undefined,
      estimatedQuantity: data.estimatedQuantity || undefined,
      message: data.message || undefined,
      interestedProducts: interests,
      productId,
      sourcePage: pathname,
      ...utm,
    };

    try {
      const res = await fetch("/api/v1/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok) {
        setStatus("error");
        setServerError(json?.message ?? "Submission failed. Please try again.");
        return;
      }

      // Conversion events (§3.4.1)
      trackEvent("inquiry_form_submit", {
        page_path: pathname,
        source_page: pathname,
        has_attachment: false,
      });
      if (productId) {
        trackEvent("product_inquiry", { product_id: productId, product_name: productName });
      }
      setStatus("success");
      formRef.current?.reset();
    } catch {
      setStatus("error");
      setServerError("Network error. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="card flex flex-col items-center p-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-brand-600" />
        <h3 className="mt-4 text-xl font-bold text-ink">Thank you — request received!</h3>
        <p className="mt-2 max-w-sm text-ink-muted">
          Our team will get back to you within <strong>6 hours</strong>. For an instant
          reply, reach us on WhatsApp using the button below.
        </p>
        <button className="btn-secondary mt-6" onClick={() => setStatus("idle")}>
          Submit another inquiry
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="card p-6 sm:p-8" noValidate>
      {productName && (
        <div className="mb-5 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-800">
          Inquiring about: <strong>{productName}</strong>
        </div>
      )}

      <div className={compact ? "grid gap-4" : "grid gap-4 sm:grid-cols-2"}>
        <div>
          <label className="label" htmlFor="name">Name *</label>
          <input id="name" name="name" className="field" placeholder="Your full name" />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
        </div>
        <div>
          <label className="label" htmlFor="email">Email *</label>
          <input id="email" name="email" type="email" className="field" placeholder="you@company.com" />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>
        <div>
          <label className="label" htmlFor="company">Company</label>
          <input id="company" name="company" className="field" placeholder="Company name" />
        </div>
        <div>
          <label className="label" htmlFor="country">Country / Region</label>
          <select id="country" name="country" className="field" defaultValue="">
            <option value="" disabled>Select…</option>
            {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="phone">Phone</label>
          <input id="phone" name="phone" className="field" placeholder="+1 555 000 0000" />
        </div>
        <div>
          <label className="label" htmlFor="estimatedQuantity">Estimated quantity</label>
          <input id="estimatedQuantity" name="estimatedQuantity" className="field" placeholder="e.g. 500-1000" />
        </div>
      </div>

      <div className="mt-4">
        <span className="label">Interested in</span>
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((tag) => {
            const active = interests.includes(tag);
            return (
              <button
                type="button"
                key={tag}
                onClick={() => toggleInterest(tag)}
                className={
                  "rounded-full border px-3 py-1.5 text-sm transition " +
                  (active
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-slate-300 bg-white text-ink-soft hover:border-brand-400")
                }
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4">
        <label className="label" htmlFor="message">Project details</label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className="field"
          placeholder="Tell us about your products, customization, target quantity and timeline…"
        />
      </div>

      {serverError && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p>
      )}

      <button type="submit" disabled={status === "submitting"} className="btn-primary mt-6 w-full sm:w-auto">
        {status === "submitting" ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
        ) : (
          "Send Inquiry"
        )}
      </button>
      <p className="mt-3 text-xs text-ink-muted">
        We typically respond within 6 hours. Your details are kept confidential.
      </p>
    </form>
  );
}
