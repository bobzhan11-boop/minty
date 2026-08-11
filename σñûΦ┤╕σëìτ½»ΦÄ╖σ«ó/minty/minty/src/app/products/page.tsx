import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedProducts, getCategories } from "@/lib/queries";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import { ProductSearch } from "@/components/product-search";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bags — Wholesale Catalog",
  description:
    "Browse our catalog of custom women's & kids' bags: backpacks, crossbody bags, totes, handbags, clutches and small leather goods. Factory-direct, wholesale MOQ.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string };
}) {
  const active = searchParams.category;
  const query = searchParams.q?.trim() || undefined;
  const [products, categories] = await Promise.all([
    getPublishedProducts(active, query),
    getCategories(),
  ]);

  return (
    <div className="container py-14">
      <SectionHeading
        eyebrow="Catalog"
        title="Custom bags, built for your brand"
        subtitle="Every style below is fully customizable — your materials, colors, hardware, linings and private-label branding. Search or filter to narrow down."
      />

      {/* Search */}
      <div className="mt-8">
        <ProductSearch initialQuery={query ?? ""} category={active} />
      </div>

      {/* Category filter */}
      <div className="mt-6 flex flex-wrap gap-2">
        <FilterChip label="All" href={hrefFor(undefined, query)} active={!active} />
        {categories.map((c) => (
          <FilterChip
            key={c.slug}
            label={c.name}
            href={hrefFor(c.slug, query)}
            active={active === c.slug}
          />
        ))}
      </div>

      {query && (
        <p className="mt-6 text-sm text-ink-muted">
          {products.length > 0
            ? `${products.length} result${products.length === 1 ? "" : "s"} for “${query}”`
            : `No bags match “${query}”.`}
        </p>
      )}

      {products.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-ink-muted">
            {query
              ? "Try a different keyword — e.g. “backpack”, “crossbody”, “pink”, or a SKU."
              : "No products in this category yet."}
          </p>
          {query && (
            <Link href={hrefFor(active, undefined)} className="btn-secondary mt-4 inline-flex">
              Clear search
            </Link>
          )}
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => <ProductCard key={p.slug} p={p} />)}
        </div>
      )}
    </div>
  );
}

/** Build a /products URL preserving whichever of category / q are set. */
function hrefFor(category?: string, q?: string): string {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (q) params.set("q", q);
  const qs = params.toString();
  return qs ? `/products?${qs}` : "/products";
}

function FilterChip({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={
        "rounded-full border px-4 py-2 text-sm font-medium transition " +
        (active
          ? "border-brand-600 bg-brand-600 text-white"
          : "border-slate-300 bg-white text-ink-soft hover:border-brand-400")
      }
    >
      {label}
    </Link>
  );
}
