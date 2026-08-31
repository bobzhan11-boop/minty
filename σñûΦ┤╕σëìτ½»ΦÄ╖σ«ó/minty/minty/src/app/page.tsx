import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Factory, Layers, Globe, Sparkles, ArrowRight, Quote, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { parseJson } from "@/lib/utils";
import { getFeaturedProducts, getPublishedProducts } from "@/lib/queries";
import { CUSTOMER_LOGOS, FACTORY_CREDENTIALS } from "@/lib/factory-profile";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import { CtaLink } from "@/components/cta-link";
import { HeroConcierge, type HeroData } from "@/components/hero-concierge";
import { JsonLd } from "@/components/json-ld";
import { organizationJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Factory, Layers, Globe, Sparkles,
};

interface Advantage { icon: string; title: string; desc: string }

export default async function HomePage() {
  const [heroMod, advMod, featured, factory, kidsAll, testimonials, womensBelts, mensBelts] =
    await Promise.all([
    prisma.homeModule.findFirst({ where: { moduleType: "hero", isActive: true } }),
    prisma.homeModule.findFirst({ where: { moduleType: "advantages", isActive: true } }),
    getFeaturedProducts(6),
    prisma.factoryInfo.findFirst(),
    getPublishedProducts("kids-bags"),
    prisma.case.findMany({
      where: { status: "published", testimonial: { not: null } },
      orderBy: { sortOrder: "asc" },
      take: 3,
    }),
    getPublishedProducts("womens-belts"),
    getPublishedProducts("mens-belts"),
  ]);

  const hero = parseJson<HeroData | null>(heroMod?.content, null);
  const advantages = parseJson<Advantage[]>(advMod?.content, []);
  const kids = kidsAll.slice(0, 3);
  const belts = [...womensBelts.slice(0, 3), ...mensBelts.slice(0, 3)];

  return (
    <>
      <JsonLd data={organizationJsonLd()} />

      {/* ===== Hero: digital-clerk reception desk ===== */}
      <HeroConcierge hero={hero} />

      {/* ===== Advantages ===== */}
      <section className="section">
        <div className="container">
          <SectionHeading
            center
            eyebrow="Why Minty"
            title="A manufacturing partner that scales with you"
            subtitle="From first sample to six-figure runs — own factory, transparent pricing, and a team that replies."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {advantages.map((a) => {
              const Icon = ICONS[a.icon] ?? Sparkles;
              return (
                <div key={a.title} className="card p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-100 text-brand-700">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 font-semibold text-ink">{a.title}</h3>
                  <p className="mt-1.5 text-sm text-ink-muted">{a.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== Featured products ===== */}
      <section className="section bg-slate-50">
        <div className="container">
          <div className="flex items-end justify-between gap-4">
            <SectionHeading eyebrow="Catalog" title="Featured bags" />
            <Link href="/products" className="hidden shrink-0 font-medium text-brand-700 hover:underline sm:block">
              View all products →
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => <ProductCard key={p.slug} p={p} />)}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link href="/products" className="btn-secondary">View all products</Link>
          </div>
        </div>
      </section>

      {/* ===== Kids' bags (surface the kids range on the homepage) ===== */}
      {kids.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="flex items-end justify-between gap-4">
              <SectionHeading eyebrow="For little ones" title="Kids' bags" />
              <Link
                href="/products?category=kids-bags"
                className="hidden shrink-0 font-medium text-brand-700 hover:underline sm:block"
              >
                Shop all kids&apos; bags →
              </Link>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {kids.map((p) => <ProductCard key={p.slug} p={p} />)}
            </div>
            <div className="mt-8 text-center sm:hidden">
              <Link href="/products?category=kids-bags" className="btn-secondary">
                Shop all kids&apos; bags
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ===== Belts ===== */}
      {belts.length > 0 && (
        <section className="section bg-slate-50">
          <div className="container">
            <div className="flex items-end justify-between gap-4">
              <SectionHeading eyebrow="New — genuine leather" title="Leather belts" />
              <div className="hidden shrink-0 items-center gap-4 text-sm sm:flex">
                <Link href="/products?category=womens-belts" className="font-medium text-brand-700 hover:underline">
                  Women&apos;s belts →
                </Link>
                <Link href="/products?category=mens-belts" className="font-medium text-brand-700 hover:underline">
                  Men&apos;s belts →
                </Link>
              </div>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {belts.map((p) => <ProductCard key={p.slug} p={p} />)}
            </div>
            <div className="mt-8 text-center sm:hidden">
              <Link href="/products?category=mens-belts" className="btn-secondary">Shop belts</Link>
            </div>
          </div>
        </section>
      )}

      {/* ===== Trust band ===== */}
      <section className="border-y border-slate-100 bg-white py-12">
        <div className="container">
          <p className="text-center text-sm font-medium uppercase tracking-[0.2em] text-ink-muted">
            Trusted by leading retail brands
          </p>
          <div className="mt-8 grid grid-cols-3 items-center gap-x-8 gap-y-6 sm:grid-cols-4 lg:grid-cols-6">
            {CUSTOMER_LOGOS.slice(0, 12).map((c) => (
              <div key={c.src} className="flex items-center justify-center">
                <Image
                  src={c.src}
                  alt={`${c.name} logo`}
                  width={130}
                  height={44}
                  className="h-8 w-auto object-contain opacity-70 transition hover:opacity-100"
                />
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {FACTORY_CREDENTIALS.map((c) => (
              <span
                key={c.name}
                title={c.detail}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-ink-soft"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-brand-600" /> {c.name}
              </span>
            ))}
            <Link href="/showcase" className="text-xs font-medium text-brand-700 hover:underline">
              See all customers →
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Factory preview ===== */}
      {factory && (
        <section className="section">
          <div className="container grid items-center gap-10 lg:grid-cols-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image
                src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1000&q=70"
                alt="Minty production floor"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div>
              <SectionHeading eyebrow="Our Factory" title="Vertically integrated, end to end" />
              <p className="mt-4 text-ink-muted">{factory.description}</p>
              <dl className="mt-8 grid grid-cols-3 gap-6">
                <div>
                  <dt className="text-3xl font-bold text-brand-700">{(factory.monthlyCapacity ?? 0).toLocaleString()}</dt>
                  <dd className="text-sm text-ink-muted">pcs / month</dd>
                </div>
                <div>
                  <dt className="text-3xl font-bold text-brand-700">{factory.equipmentCount}</dt>
                  <dd className="text-sm text-ink-muted">machines</dd>
                </div>
                <div>
                  <dt className="text-3xl font-bold text-brand-700">{factory.employeeCount}</dt>
                  <dd className="text-sm text-ink-muted">team members</dd>
                </div>
              </dl>
              <Link href="/about" className="btn-secondary mt-8">Go deeper into the factory</Link>
            </div>
          </div>
        </section>
      )}

      {/* ===== Testimonials ===== */}
      {testimonials.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionHeading center eyebrow="What buyers say" title="Sourcing teams keep coming back" />
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {testimonials.map((t) => (
                <figure key={t.id} className="card p-6">
                  <Quote className="h-6 w-6 text-brand-300" />
                  <blockquote className="mt-3 text-ink-soft">{t.testimonial}</blockquote>
                  <figcaption className="mt-4 text-sm font-semibold text-ink">{t.title}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== Bottom CTA ===== */}
      <section className="bg-brand-600">
        <div className="container flex flex-col items-center gap-6 py-16 text-center text-white">
          <Quote className="h-8 w-8 opacity-70" />
          <h2 className="max-w-2xl text-3xl font-bold sm:text-4xl">
            Ready to bring your bag line to life?
          </h2>
          <p className="max-w-xl text-brand-50">
            Send us your specs and get a quote within 6 hours. Wholesale MOQ from 1,000 pcs, no runaround.
          </p>
          <CtaLink
            href="/contact"
            event={{ button_text: "Get a Quote", position: "bottom_cta" }}
            className="btn bg-white text-brand-700 hover:bg-brand-50"
          >
            Get a Quote <ArrowRight className="h-4 w-4" />
          </CtaLink>
        </div>
      </section>
    </>
  );
}
