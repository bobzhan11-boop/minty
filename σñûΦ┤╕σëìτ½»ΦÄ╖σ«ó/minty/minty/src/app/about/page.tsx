import type { Metadata } from "next";
import Image from "next/image";
import { Award, Globe2, Layers } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SectionHeading } from "@/components/section-heading";
import { CtaLink } from "@/components/cta-link";
import {
  FACTORY_AREAS,
  FACTORY_MATERIALS,
  FACTORY_CREDENTIALS,
  FACTORY_TRUSTED_BY,
  FACTORY_FACTS,
} from "@/lib/factory-profile";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About & Factory",
  description: "Our brand story and a look inside the Minty factory — capacity, capabilities and certifications.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const [brand, factory, images] = await Promise.all([
    prisma.brandContent.findFirst(),
    prisma.factoryInfo.findFirst(),
    prisma.factoryImage.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <>
      {/* Brand story */}
      <section className="section">
        <div className="container grid items-center gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Our Story" title="Manufacturing, minus the friction" />
            <p className="mt-4 text-ink-soft">{brand?.story}</p>
          </div>
          {brand?.videoUrl && (
            <div className="aspect-video overflow-hidden rounded-2xl bg-slate-900">
              <iframe
                src={brand.videoUrl}
                title="Brand video"
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </div>
      </section>

      {/* Factory stats */}
      {factory && (
        <section className="bg-slate-50 py-14">
          <div className="container">
            <SectionHeading center eyebrow="Inside the Factory" title="Built to scale, run with care" />
            <p className="mx-auto mt-4 max-w-3xl text-center text-ink-muted">{factory.description}</p>
            <dl className="mx-auto mt-10 grid max-w-3xl grid-cols-3 gap-6 text-center">
              <Stat value={`${(factory.monthlyCapacity ?? 0).toLocaleString()}`} label="pcs / month" />
              <Stat value={`${factory.equipmentCount}`} label="machines" />
              <Stat value={`${factory.employeeCount}`} label="team members" />
            </dl>
          </div>
        </section>
      )}

      {/* Global reach — areas we ship to */}
      <section className="section">
        <div className="container">
          <SectionHeading
            center
            eyebrow="Global Reach"
            title="Where we ship"
            subtitle={`We currently supply ${FACTORY_AREAS.length} key regions, delivering to retail brands and importers worldwide.`}
          />
          <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FACTORY_AREAS.map((a) => (
              <div key={a.name} className="card flex flex-col items-center gap-2 px-5 py-6 text-center">
                <Globe2 className="h-7 w-7 text-brand-600" />
                <p className="font-semibold text-ink">{a.name}</p>
                {a.note && <p className="text-xs text-ink-muted">{a.note}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Materials we work with (content coming soon) */}
      <section className="bg-slate-50 py-14">
        <div className="container">
          <SectionHeading center eyebrow="Materials" title="Materials we work with" />
          {FACTORY_MATERIALS.length > 0 ? (
            <div className="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-3">
              {FACTORY_MATERIALS.map((m) => (
                <span key={m.name} className="card flex items-center gap-2 px-4 py-2 text-sm font-medium text-ink">
                  <Layers className="h-4 w-4 text-brand-600" /> {m.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="mx-auto mt-6 max-w-2xl text-center text-ink-muted">
              Detailed material specifications are coming soon. Contact us for the full list of
              materials and finishes we offer.
            </p>
          )}
        </div>
      </section>

      {/* Gallery */}
      {images.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionHeading eyebrow="Gallery" title="A look around" />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {images.map((img) => (
                <figure key={img.id} className="overflow-hidden rounded-xl">
                  <div className="relative aspect-[4/3] bg-slate-100">
                    <Image src={img.url} alt={img.caption ?? "Factory"} fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover" />
                  </div>
                  {img.caption && <figcaption className="mt-2 text-sm text-ink-muted">{img.caption}</figcaption>}
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why brands trust us — track record, audits & clients (how good are we) */}
      <section className="bg-slate-50 py-14">
        <div className="container">
          <SectionHeading
            center
            eyebrow="Why Brands Trust Us"
            title="Audited, certified & proven"
            subtitle="Independent third-party audits and two decades of production for global retailers back every order."
          />

          {/* headline facts */}
          <dl className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-6 text-center lg:grid-cols-4">
            {FACTORY_FACTS.map((f) => (
              <div key={f.label}>
                <dt className="text-3xl font-bold text-brand-700">{f.value}</dt>
                <dd className="mt-1 text-sm text-ink-muted">{f.label}</dd>
              </div>
            ))}
          </dl>

          {/* certifications & audits */}
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            {FACTORY_CREDENTIALS.map((c) => (
              <span key={c.name} className="card flex items-center gap-3 px-5 py-3 text-left">
                <Award className="h-6 w-6 shrink-0 text-brand-600" />
                <span>
                  <span className="block text-sm font-semibold text-ink">{c.name}</span>
                  <span className="block text-xs text-ink-muted">{c.detail}</span>
                </span>
              </span>
            ))}
          </div>

          {/* trusted by */}
          {FACTORY_TRUSTED_BY.length > 0 && (
            <div className="mt-12 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink-muted">
                Trusted by leading retailers
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
                {FACTORY_TRUSTED_BY.map((b) => (
                  <span key={b} className="text-2xl font-bold tracking-tight text-ink/70">
                    {b}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-600 py-14">
        <div className="container flex flex-col items-center gap-5 text-center text-white">
          <h2 className="text-3xl font-bold">Want to visit or video-tour the factory?</h2>
          <CtaLink href="/contact" event={{ button_text: "Talk to us", position: "about_cta" }} className="btn bg-white text-brand-700 hover:bg-brand-50">
            Talk to us
          </CtaLink>
        </div>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="text-4xl font-bold text-brand-700">{value}</dt>
      <dd className="mt-1 text-sm text-ink-muted">{label}</dd>
    </div>
  );
}
