import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SITE } from "@/lib/constants";
import { getPublishedProducts, getCategories } from "@/lib/queries";
import { suggestQuery } from "@/lib/search";
import { ProductCard } from "@/components/product-card";
import { ProductSearch } from "@/components/product-search";

export const dynamic = "force-dynamic";

/** Quick-search shortcuts for popular bag styles (drive the keyword search). */
const STYLE_CHIPS = ["Backpacks", "Crossbody", "Totes", "Handbags", "Clutches", "Belt Bags"];

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { category?: string; q?: string };
}): Promise<Metadata> {
  const q = searchParams.q?.trim();
  const cat = searchParams.category
    ? await prisma.productCategory.findUnique({ where: { slug: searchParams.category } })
    : null;

  // Search-result pages are thin/near-duplicate — canonicalize to the catalog and keep them
  // out of the index (still followable) to avoid duplicate-content dilution.
  if (q) {
    return {
      title: `Search: ${q} — Bags`,
      description: `Search results for “${q}” in the ${SITE.name} wholesale bag catalog.`,
      alternates: { canonical: cat ? `/products?category=${cat.slug}` : "/products" },
      robots: { index: false, follow: true },
    };
  }

  if (cat) {
    const lower = cat.name.toLowerCase();
    return {
      title: `${cat.name} — Wholesale Catalog`,
      description: `Custom ${lower}, factory-direct and fully customizable at wholesale MOQ. ${SITE.name} manufactures ${lower} for global brands.`,
      alternates: { canonical: `/products?category=${cat.slug}` },
      openGraph: { title: `${cat.name} — Wholesale Catalog`, url: `/products?category=${cat.slug}` },
    };
  }

  return {
    title: "Bags — Wholesale Catalog",
    description:
      "Browse our catalog of custom women's & kids' bags: backpacks, crossbody bags, totes, handbags, clutches and small leather goods. Factory-direct, wholesale MOQ.",
    alternates: { canonical: "/products" },
  };
}

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
  const activeCat = active ? categories.find((c) => c.slug === active) : null;
  const heading = activeCat ? activeCat.name : "Wholesale Bags Catalog";
  const suggestion = query && products.length === 0 ? suggestQuery(query) : null;

  return (
    <div className="container py-14">
      <div className="max-w-2xl">
        <p className="eyebrow">Catalog</p>
        <h1 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">{heading}</h1>
        <p className="mt-3 text-ink-muted">
          Every style below is fully customizable — your materials, colors, hardware, linings and
          private-label branding. Search or filter to narrow down.
        </p>
      </div>

      {/* Search */}
      <div className="mt-8">
        <ProductSearch initialQuery={query ?? ""} category={active} />
      </div>

      {/* Quick style shortcuts */}
      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-ink-muted">Popular:</span>
        {STYLE_CHIPS.map((s) => (
          <Link
            key={s}
            href={`/products?q=${encodeURIComponent(s.toLowerCase())}`}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 font-medium text-ink-soft transition hover:border-brand-400 hover:text-brand-700"
          >
            {s}
          </Link>
        ))}
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
          {suggestion ? (
            <p className="text-ink-soft">
              No exact matches. Did you mean{" "}
              <Link
                href={hrefFor(active, suggestion)}
                className="font-semibold text-brand-700 hover:underline"
              >
                {suggestion}
              </Link>
              ?
            </p>
          ) : (
            <p className="text-ink-muted">
              {query
                ? "Try a different keyword — e.g. “backpack”, “crossbody”, “pink”, or a SKU."
                : "No products in this category yet."}
            </p>
          )}
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
