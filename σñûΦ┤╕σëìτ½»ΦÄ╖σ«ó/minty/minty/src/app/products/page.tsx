import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  getPublishedProducts,
  getCategories,
  getProductFacets,
  COLOR_FAMILIES,
  MATERIAL_FAMILIES,
} from "@/lib/queries";
import { suggestQuery } from "@/lib/search";
import { ProductCard } from "@/components/product-card";
import { ProductSearch } from "@/components/product-search";

export const dynamic = "force-dynamic";

/** Quick-search shortcuts for popular styles (drive the keyword search). */
const STYLE_CHIPS = ["Backpacks", "Crossbody", "Totes", "Handbags", "Clutches", "Belts"];

type SearchParams = { category?: string; q?: string; color?: string; type?: string; material?: string };

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const q = searchParams.q?.trim();
  const filtered = Boolean(q || searchParams.color || searchParams.type || searchParams.material);
  const cat = searchParams.category
    ? await prisma.productCategory.findUnique({ where: { slug: searchParams.category } })
    : null;

  // Search / filter views are thin & combinatorial — canonicalize to the catalog (or
  // category) and keep them out of the index to avoid duplicate-content dilution.
  if (filtered) {
    return {
      title: q ? `Search: ${q} — Products` : `${cat?.name ?? "Products"} — Filtered`,
      description: `Browse ${cat?.name ?? "products"} in the ${SITE.name} wholesale catalog.`,
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
    title: "Products — Wholesale Catalog",
    description:
      "Browse our catalog of custom women's & kids' bags and genuine-leather belts: backpacks, crossbody, totes, clutches, belts and small leather goods. Factory-direct, wholesale MOQ.",
    alternates: { canonical: "/products" },
  };
}

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const active = searchParams.category;
  const query = searchParams.q?.trim() || undefined;
  const color = searchParams.color || undefined;
  const type = searchParams.type || undefined;
  const material = searchParams.material || undefined;

  const [products, categories, facets] = await Promise.all([
    getPublishedProducts(active, query, color, type, material),
    getCategories(),
    getProductFacets(),
  ]);
  const activeCat = active ? categories.find((c) => c.slug === active) : null;
  const heading = activeCat ? activeCat.name : "Wholesale Catalog";
  const suggestion = query && products.length === 0 ? suggestQuery(query) : null;
  const anyFilter = Boolean(query || color || type || material);
  const href = (o: Partial<SearchParams>) => buildHref({ category: active, q: query, color, type, material, ...o });

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
        <FilterChip label="All" href={href({ category: undefined })} active={!active} />
        {categories.map((c) => (
          <FilterChip
            key={c.slug}
            label={c.name}
            href={href({ category: c.slug })}
            active={active === c.slug}
          />
        ))}
      </div>

      {/* Color / material / type facets */}
      <div className="mt-6 space-y-3 border-t border-slate-100 pt-6">
        <FacetRow label="Color">
          {COLOR_FAMILIES.map((f) => {
            const on = color === f.value;
            return (
              <Link
                key={f.value}
                href={href({ color: on ? undefined : f.value })}
                aria-pressed={on}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition",
                  on ? "border-brand-600 bg-brand-50 text-brand-700" : "border-slate-200 bg-white text-ink-soft hover:border-brand-400",
                )}
              >
                <span className="h-3.5 w-3.5 rounded-full ring-1 ring-black/10" style={{ backgroundColor: f.hex }} />
                {f.label}
              </Link>
            );
          })}
        </FacetRow>

        {facets.materials.length > 0 && (
          <FacetRow label="Material">
            {MATERIAL_FAMILIES.filter((f) => facets.materials.includes(f.value)).map((f) => {
              const on = material === f.value;
              return (
                <Link
                  key={f.value}
                  href={href({ material: on ? undefined : f.value })}
                  aria-pressed={on}
                  className={cn(
                    "rounded-full border px-3 py-1 text-sm transition",
                    on ? "border-brand-600 bg-brand-600 text-white" : "border-slate-200 bg-white text-ink-soft hover:border-brand-400",
                  )}
                >
                  {f.label}
                </Link>
              );
            })}
          </FacetRow>
        )}

        {facets.types.length > 0 && (
          <FacetRow label="Type">
            {facets.types.map((t) => {
              const on = type === t;
              return (
                <Link
                  key={t}
                  href={href({ type: on ? undefined : t })}
                  aria-pressed={on}
                  className={cn(
                    "rounded-full border px-3 py-1 text-sm capitalize transition",
                    on ? "border-brand-600 bg-brand-600 text-white" : "border-slate-200 bg-white text-ink-soft hover:border-brand-400",
                  )}
                >
                  {t}
                </Link>
              );
            })}
          </FacetRow>
        )}
      </div>

      {/* Result summary */}
      {anyFilter && (
        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-ink-muted">
          <span>
            {products.length} result{products.length === 1 ? "" : "s"}
            {query ? ` for “${query}”` : ""}
          </span>
          <Link href={href({ q: undefined, color: undefined, type: undefined, material: undefined })} className="font-medium text-brand-700 hover:underline">
            Clear filters
          </Link>
        </div>
      )}

      {products.length === 0 ? (
        <div className="mt-12 text-center">
          {suggestion ? (
            <p className="text-ink-soft">
              No exact matches. Did you mean{" "}
              <Link href={buildHref({ category: active, q: suggestion })} className="font-semibold text-brand-700 hover:underline">
                {suggestion}
              </Link>
              ?
            </p>
          ) : (
            <p className="text-ink-muted">
              {anyFilter
                ? "No products match these filters. Try broadening your search."
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

function FacetRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-16 shrink-0 text-sm font-medium text-ink-muted">{label}</span>
      {children}
    </div>
  );
}

/** Build a /products URL preserving whichever filters are set. */
function buildHref(o: { category?: string; q?: string; color?: string; type?: string; material?: string }): string {
  const params = new URLSearchParams();
  if (o.category) params.set("category", o.category);
  if (o.q) params.set("q", o.q);
  if (o.color) params.set("color", o.color);
  if (o.type) params.set("type", o.type);
  if (o.material) params.set("material", o.material);
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
