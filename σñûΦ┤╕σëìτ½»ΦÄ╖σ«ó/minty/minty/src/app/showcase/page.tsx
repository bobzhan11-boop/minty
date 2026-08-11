import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { SectionHeading } from "@/components/section-heading";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Showcase — Client Projects",
  description: "Real custom bag & leather-goods projects we've delivered for retail brands and importers across Europe, North America and Asia.",
};

export default async function ShowcasePage() {
  const cases = await prisma.case.findMany({
    where: { status: "published" },
    orderBy: { sortOrder: "asc" },
    include: { images: { where: { type: "cover" }, take: 1 } },
  });

  return (
    <div className="container py-14">
      <SectionHeading
        eyebrow="Showcase"
        title="Brands we've helped bring to market"
        subtitle="From small-batch launches to repeat monthly programs — a sample of recent work."
      />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cases.map((c) => {
          const cover = c.images[0]?.url;
          return (
            <Link key={c.slug} href={`/showcase/${c.slug}`} className="card group overflow-hidden transition hover:shadow-md">
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                {cover && <Image src={cover} alt={c.title} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />}
              </div>
              <div className="p-5">
                <div className="flex flex-wrap gap-2 text-xs text-ink-muted">
                  {c.industry && <span className="rounded-full bg-slate-100 px-2 py-0.5">{c.industry}</span>}
                  {c.region && <span className="rounded-full bg-slate-100 px-2 py-0.5">{c.region}</span>}
                </div>
                <h3 className="mt-3 font-semibold text-ink group-hover:text-brand-700">{c.title}</h3>
                <span className="mt-2 inline-block text-sm font-medium text-brand-600 group-hover:underline">View case →</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
