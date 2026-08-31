import type { Metadata } from "next";
import { Palette, Upload, PackageCheck, Factory, Truck } from "lucide-react";
import { InquiryForm } from "@/components/inquiry-form";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Custom Orders — OEM & ODM Bags",
  description: "Our custom bag manufacturing process: pick a style, submit your design, approve a sample, produce, ship. Custom materials, hardware and private-label branding.",
  alternates: { canonical: "/custom-order" },
};

const STEPS = [
  { icon: Palette, title: "1. Pick a style", desc: "Start from our catalog of backpacks, crossbody, tote and handbags — or send your own design." },
  { icon: Upload, title: "2. Submit design", desc: "Send artwork, materials, colors, hardware and label specs — we build the tech pack." },
  { icon: PackageCheck, title: "3. Approve sample", desc: "We produce a pre-production sample for your sign-off before bulk." },
  { icon: Factory, title: "4. Bulk production", desc: "Cutting, sewing, edge-painting and QC at every stage — MOQ from 1,000 pcs." },
  { icon: Truck, title: "5. Ship worldwide", desc: "Door-to-door DDP logistics with tracking to your market." },
];

export default function CustomOrderPage() {
  return (
    <>
      <section className="section">
        <div className="container">
          <SectionHeading
            as="h1"
            center
            eyebrow="Custom Manufacturing"
            title="From idea to doorstep in five steps"
            subtitle="Our OEM/ODM workflow is built to lower the barrier to custom bag manufacturing — no jargon, no surprises."
          />
          <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map((s) => (
              <li key={s.title} className="card p-6">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-100 text-brand-700">
                  <s.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-semibold text-ink">{s.title}</h3>
                <p className="mt-1.5 text-sm text-ink-muted">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section bg-slate-50">
        <div className="container grid items-start gap-10 lg:grid-cols-2">
          <SectionHeading
            eyebrow="Start a project"
            title="Tell us what you want to make"
            subtitle="Fill in the form and we'll scope your custom bag project — pricing, lead time and sample plan included."
          />
          <InquiryForm defaultInterest="Private Label / OEM" />
        </div>
      </section>
    </>
  );
}
