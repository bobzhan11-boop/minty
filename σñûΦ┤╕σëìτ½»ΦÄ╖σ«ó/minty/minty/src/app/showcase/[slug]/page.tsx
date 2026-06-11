import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Quote } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CtaLink } from "@/components/cta-link";

export const dynamic = "force-dynamic";

async function getCase(slug: string) {
  return prisma.case.findUnique({
    where: { slug },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const c = await getCase(params.slug);
  if (!c) return { title: "Case not found" };
  return { title: c.title, description: c.description?.slice(0, 160) ?? undefined };
}

export default async function CaseDetailPage({ params }: { params: { slug: string } }) {
  const c = await getCase(params.slug);
  if (!c || c.status !== "published") notFound();

  const cover = c.images.find((i) => i.type === "cover") ?? c.images[0];
  const gallery = c.images.filter((i) => i !== cover);

  return (
    <div className="container py-10">
      <nav className="mb-6 text-sm text-ink-muted">
        <Link href="/" className="hover:text-brand-700">Home</Link>
        <span className="px-2">/</span>
        <Link href="/showcase" className="hover:text-brand-700">Showcase</Link>
        <span className="px-2">/</span>
        <span className="text-ink">{c.title}</span>
      </nav>

      <div className="flex flex-wrap gap-2 text-xs text-ink-muted">
        {c.industry && <span className="rounded-full bg-slate-100 px-2.5 py-1">{c.industry}</span>}
        {c.region && <span className="rounded-full bg-slate-100 px-2.5 py-1">{c.region}</span>}
      </div>
      <h1 className="mt-3 max-w-3xl text-3xl font-bold text-ink sm:text-4xl">{c.title}</h1>

      {cover && (
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl bg-slate-100">
          <Image src={cover.url} alt={c.title} fill priority sizes="100vw" className="object-cover" />
        </div>
      )}

      <div className="mt-8 max-w-3xl text-ink-soft">{c.description}</div>

      {c.testimonial && (
        <blockquote className="mt-10 max-w-3xl rounded-2xl bg-brand-50 p-6">
          <Quote className="h-7 w-7 text-brand-400" />
          <p className="mt-3 text-lg text-ink">{c.testimonial}</p>
        </blockquote>
      )}

      {gallery.length > 0 && (
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {gallery.map((img) => (
            <div key={img.id} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
              <Image src={img.url} alt={img.caption ?? c.title} fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 rounded-2xl border border-brand-100 bg-brand-50 p-8 text-center">
        <h2 className="text-2xl font-bold text-ink">Start your project</h2>
        <p className="mt-2 text-ink-muted">Tell us your idea and get a quote within 6 hours.</p>
        <CtaLink href="/contact" event={{ button_text: "Start Your Project", position: "case_cta" }} className="btn-primary mt-5">
          Start Your Project
        </CtaLink>
      </div>
    </div>
  );
}
