import type { Metadata } from "next";
import { Clock, Mail, MessageCircle, ShieldCheck } from "lucide-react";
import { InquiryForm } from "@/components/inquiry-form";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Contact — Request a Quote",
  description: "Tell us about your custom bag project and get a quote within 6 hours. Inquiry form or WhatsApp.",
  alternates: { canonical: "/contact" },
};

const PERKS = [
  { icon: Clock, title: "6-hour response", desc: "Real humans reply within 6 working hours." },
  { icon: ShieldCheck, title: "Confidential", desc: "Your designs and details stay private." },
  { icon: MessageCircle, title: "WhatsApp ready", desc: "Prefer chat? Use the floating button anytime." },
];

export default function ContactPage() {
  return (
    <div className="bg-slate-50">
      <div className="container grid gap-12 py-14 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <SectionHeading
            as="h1"
            eyebrow="Contact"
            title="Let's build your bag line"
            subtitle="Share your specs, materials, target quantity and timeline. We'll come back with pricing and next steps."
          />
          <ul className="mt-8 space-y-5">
            {PERKS.map((p) => (
              <li key={p.title} className="flex gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-700">
                  <p.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-ink">{p.title}</p>
                  <p className="text-sm text-ink-muted">{p.desc}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex items-center gap-2 text-sm text-ink-muted">
            <Mail className="h-4 w-4" />
            {process.env.INQUIRY_NOTIFY_EMAIL ?? "sales@amaxleather.com"}
          </div>
        </div>

        <div id="inquiry">
          <InquiryForm />
        </div>
      </div>
    </div>
  );
}
