import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { parseJson, fromPrice } from "@/lib/utils";
import { InquiryForm } from "@/components/inquiry-form";
import { ProductView } from "@/components/product-view";
import { WhatsAppInline } from "@/components/whatsapp-inline";
import { JsonLd } from "@/components/json-ld";
import { productJsonLd, breadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug: slug.toLowerCase() }, // slugs are stored lowercase; accept any case
    include: { category: true, images: { orderBy: { sortOrder: "asc" } }, videos: true },
  });
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return { title: "Product not found" };
  const image = product.images.find((i) => i.isPrimary)?.url ?? product.images[0]?.url;
  const images = image ? [image] : undefined;
  const description = product.description?.slice(0, 160) ?? undefined;
  return {
    title: product.name,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      url: `/products/${product.slug}`,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images,
    },
  };
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  if (!product || product.status !== "published") notFound();

  const tiers = parseJson<{ qty: number; price: number }[]>(product.priceTiers, []);
  const primary = product.images.find((i) => i.isPrimary) ?? product.images[0];

  return (
    <div className="container py-10">
      <JsonLd
        data={[
          productJsonLd({
            name: product.name,
            description: product.description,
            sku: product.slug.toUpperCase(),
            image: primary?.url,
            category: product.category.name,
            moq: product.moq,
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Products", path: "/products" },
            { name: product.name, path: `/products/${product.slug}` },
          ]),
        ]}
      />

      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-ink-muted">
        <Link href="/" className="hover:text-brand-700">Home</Link>
        <span className="px-2">/</span>
        <Link href="/products" className="hover:text-brand-700">Products</Link>
        <span className="px-2">/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      {/* Fire product_view + gallery (client) */}
      <ProductView
        productId={product.id}
        productName={product.name}
        category={product.category.name}
        images={product.images.map((i) => ({ url: i.url, alt: i.altText ?? product.name }))}
        primaryUrl={primary?.url ?? ""}
      />

      <div className="mt-12 grid gap-12 lg:grid-cols-2">
        {/* Left: details */}
        <div>
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
            {product.category.name}
          </span>
          <h1 className="mt-3 text-3xl font-bold text-ink">{product.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            <p className="text-lg font-semibold text-brand-700">{fromPrice(tiers)}</p>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-ink-soft">
              Wholesale · MOQ {product.moq.toLocaleString()} pcs
            </span>
          </div>
          <p className="mt-4 text-ink-soft">{product.description}</p>

          {product.specs && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Specifications</h3>
              <p className="mt-2 text-sm text-ink-soft">{product.specs}</p>
            </div>
          )}

          {tiers.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Price tiers</h3>
              <table className="mt-2 w-full max-w-sm text-sm">
                <thead>
                  <tr className="text-left text-ink-muted">
                    <th className="pb-1 font-medium">Quantity</th>
                    <th className="pb-1 font-medium">Unit price</th>
                  </tr>
                </thead>
                <tbody>
                  {tiers.map((t) => (
                    <tr key={t.qty} className="border-t border-slate-100">
                      <td className="py-1.5">{t.qty.toLocaleString()}+ pcs</td>
                      <td className="py-1.5 font-medium text-ink">${t.price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2 text-xs text-ink-muted">MOQ: {product.moq} pcs. Contact us for exact pricing.</p>
            </div>
          )}

          <div className="mt-8">
            <WhatsAppInline
              productName={product.name}
              text={`Hi Minty! I'd like a quote for "${product.name}".`}
            />
          </div>
        </div>

        {/* Right: prefilled inquiry */}
        <div>
          <h2 className="mb-4 text-xl font-bold text-ink">Send an inquiry</h2>
          <InquiryForm productId={product.id} productName={product.name} compact />
        </div>
      </div>
    </div>
  );
}
