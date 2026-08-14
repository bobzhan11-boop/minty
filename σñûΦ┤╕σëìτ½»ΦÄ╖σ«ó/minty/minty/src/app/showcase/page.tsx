import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { SectionHeading } from "@/components/section-heading";
import { CUSTOMER_LOGOS } from "@/lib/factory-profile";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Customers — Brands We Manufacture For",
  description:
    "Global retail brands and importers we've produced bags and leather goods for — GAP, H&M, Zara, Mango, C&A, Calvin Klein and more, across Europe, North America and Asia.",
  alternates: { canonical: "/showcase" },
};

export default async function ShowcasePage() {
  const cases = await prisma.case.findMany({
    where: { status: "published" },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="container py-14">
      <SectionHeading
        as="h1"
        eyebrow="Our Customers"
        title="Brands we've manufactured for"
        subtitle="A selection of the retail brands and importers we've produced bags and leather goods for — from small-batch launches to repeat monthly programs across Europe, North America and Asia."
      />

      {/* Customer logo wall */}
      <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-3 lg:grid-cols-5">
        {CUSTOMER_LOGOS.map((c) => (
          <div key={c.src} className="flex items-center justify-center bg-white p-6">
            <Image
              src={c.src}
              alt={`${c.name} logo`}
              width={160}
              height={56}
              className="h-9 w-auto object-contain opacity-90 transition hover:opacity-100 sm:h-10"
            />
          </div>
        ))}
      </div>

      {/* Featured programs (case studies) */}
      {cases.length > 0 && (
        <div className="mt-16">
          <SectionHeading eyebrow="Featured programs" title="Selected collaborations" />
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {cases.map((c) => (
              <Link
                key={c.slug}
                href={`/showcase/${c.slug}`}
                className="card p-6 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex flex-wrap gap-2 text-xs text-ink-muted">
                  {c.industry && <span className="rounded-full bg-slate-100 px-2 py-0.5">{c.industry}</span>}
                  {c.region && <span className="rounded-full bg-slate-100 px-2 py-0.5">{c.region}</span>}
                </div>
                <h3 className="mt-3 font-semibold text-ink group-hover:text-brand-700">{c.title}</h3>
                {c.testimonial && (
                  <p className="mt-2 line-clamp-3 text-sm italic text-ink-soft">“{c.testimonial}”</p>
                )}
                <span className="mt-3 inline-block text-sm font-medium text-brand-600 hover:underline">
                  View case →
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
