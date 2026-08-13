import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { getPublishedProducts, getCategories, getProductFacets, COLOR_FAMILIES } from "@/lib/queries";
import { suggestQuery } from "@/lib/search";
import { ProductCard } from "@/components/product-card";
import { ProductSearch } from "@/components/product-search";

export const dynamic = "force-dynamic";

/** Quick-search shortcuts for popular bag styles (drive the keyword search). */
const STYLE_CHIPS = ["Backpacks", "Crossbody", "Totes", "Handbags", "Clutches", "Belt Bags"];

type SearchParams = { category?: string; q?: string; color?: string; type?: string };

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const q = searchParams.q?.trim();
  const filtered = Boolean(q || searchParams.color || searchParams.type);
  const cat = searchParams.category
    ? await prisma.productCategory.findUnique({ where: { slug: searchParams.category } })
    : null;

  // Search / color / type views are thin & combinatorial — canonicalize to the catalog
  // (or category) and keep them out of the index to avoid duplicate-content dilution.
  if (filtered) {
    return {
      title: q ? `Search: ${q} — Bags` : `${cat?.name ?? "Bags"} — Filtered`,
      description: `Browse ${cat?.name ?? "bags"} in the ${SITE.name} wholesale catalog.`,
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

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const active = searchParams.category;
  const query = searchParams.q?.trim() || undefined;
  const color = searchParams.color || undefined;
  const type = searchParams.type || undefined;

  const [products, categories, facets] = await Promise.all([
    getPublishedProducts(active, query, color, type),
    getCategories(),
    getProductFacets(),
  ]);
  const activeCat = active ? categories.find((c) => c.slug === active) : null;
  const heading = activeCat ? activeCat.name : "Wholesale Bags Catalog";
  const suggestion = query && products.length === 0 ? suggestQuery(query) : null;
  const anyFilter = Boolean(query || color || type);

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
        <FilterChip label="All" href={buildHref({ q: query, color, type })} active={!active} />
        {categories.map((c) => (
          <FilterChip
            key={c.slug}
            label={c.name}
            href={buildHref({ category: c.slug, q: query, color, type })}
            active={active === c.slug}
          />
        ))}
      </div>

      {/* Color + type facets */}
      <div className="mt-6 space-y-3 border-t border-slate-100 pt-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-12 shrink-0 text-sm font-medium text-ink-muted">Color</span>
          {COLOR_FAMILIES.map((f) => {
            const on = color === f.value;
            return (
              <Link
                key={f.value}
                href={buildHref({ category: active, q: query, color: on ? undefined : f.value, type })}
                aria-pressed={on}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition",
                  on
                    ? "border-brand-600 bg-brand-50 text-brand-700"
                    : "border-slate-200 bg-white text-ink-soft hover:border-brand-400",
                )}
              >
                <span
                  className="h-3.5 w-3.5 rounded-full ring-1 ring-black/10"
                  style={{ backgroundColor: f.hex }}
                />
                {f.label}
              </Link>
            );
          })}
        </div>
        {facets.types.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-12 shrink-0 text-sm font-medium text-ink-muted">Type</span>
            {facets.types.map((t) => {
              const on = type === t;
              return (
                <Link
                  key={t}
                  href={buildHref({ category: active, q: query, color, type: on ? undefined : t })}
                  aria-pressed={on}
                  className={cn(
                    "rounded-full border px-3 py-1 text-sm capitalize transition",
                    on
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-slate-200 bg-white text-ink-soft hover:border-brand-400",
                  )}
                >
                  {t}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Result summary */}
      {anyFilter && (
        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-ink-muted">
          <span>
            {products.length} result{products.length === 1 ? "" : "s"}
            {query ? ` for “${query}”` : ""}
          </span>
          <Link href={buildHref({ category: active })} className="font-medium text-brand-700 hover:underline">
            Clear filters
          </Link>
        </div>
      )}

      {products.length === 0 ? (
        <div className="mt-12 text-center">
          {suggestion ? (
            <p className="text-ink-soft">
              No exact matches. Did you mean{" "}
              <Link
                href={buildHref({ category: active, q: suggestion })}
                className="font-semibold text-brand-700 hover:underline"
              >
                {suggestion}
              </Link>
              ?
            </p>
          ) : (
            <p className="text-ink-muted">
              {anyFilter
                ? "No bags match these filters. Try broadening your search."
                : "No products in this category yet."}
            </p>
          )}
          {anyFilter && (
            <Link href={buildHref({ category: active })} className="btn-secondary mt-4 inline-flex">
              Clear filters
            </Link>
          )}
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.slug} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Build a /products URL preserving whichever filters are set. */
function buildHref(o: { category?: string; q?: string; color?: string; type?: string }): string {
  const params = new URLSearchParams();
  if (o.category) params.set("category", o.category);
  if (o.q) params.set("q", o.q);
  if (o.color) params.set("color", o.color);
  if (o.type) params.set("type", o.type);
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
