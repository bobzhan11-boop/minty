import type { Metadata } from "next";
import Image from "next/image";
import { BadgeCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SectionHeading } from "@/components/section-heading";
import { CtaLink } from "@/components/cta-link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About & Factory",
  description: "Our brand story and a look inside the Minty factory — capacity, capabilities and certifications.",
};

export default async function AboutPage() {
  const [brand, factory, images, certs] = await Promise.all([
    prisma.brandContent.findFirst(),
    prisma.factoryInfo.findFirst(),
    prisma.factoryImage.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.factoryCertification.findMany(),
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

      {/* Certifications */}
      {certs.length > 0 && (
        <section className="bg-slate-50 py-14">
          <div className="container">
            <SectionHeading center eyebrow="Compliance" title="Certified & audited" />
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              {certs.map((c) => (
                <span key={c.id} className="card flex items-center gap-2 px-5 py-3 text-sm font-medium text-ink">
                  <BadgeCheck className="h-5 w-5 text-brand-600" />
                  {c.name}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

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
