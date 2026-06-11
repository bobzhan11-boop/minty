import type { Metadata } from "next";
import { Palette, Upload, PackageCheck, Factory, Truck } from "lucide-react";
import { InquiryForm } from "@/components/inquiry-form";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Custom POD — How It Works",
  description: "Our Print-On-Demand customization process: pick a blank, submit your design, approve a sample, produce, ship.",
};

const STEPS = [
  { icon: Palette, title: "1. Pick a blank", desc: "Choose from our catalog of premium tees, hoodies, caps and activewear." },
  { icon: Upload, title: "2. Submit design", desc: "Send artwork, Pantone refs and label specs — we handle the tech pack." },
  { icon: PackageCheck, title: "3. Approve sample", desc: "We produce a pre-production sample for your sign-off before bulk." },
  { icon: Factory, title: "4. Bulk production", desc: "DTG, screen, sublimation or embroidery — with QC at every stage." },
  { icon: Truck, title: "5. Ship worldwide", desc: "Door-to-door logistics with tracking to 60+ countries." },
];

export default function CustomOrderPage() {
  return (
    <>
      <section className="section">
        <div className="container">
          <SectionHeading
            center
            eyebrow="Print-On-Demand"
            title="From idea to doorstep in five steps"
            subtitle="Our POD workflow is built to lower the barrier to custom manufacturing — no jargon, no surprises."
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
            subtitle="Fill in the form and we'll scope your POD project — pricing, lead time and sample plan included."
          />
          <InquiryForm defaultInterest="POD Customization" />
        </div>
      </section>
    </>
  );
}
