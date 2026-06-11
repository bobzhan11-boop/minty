import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedProducts, getCategories } from "@/lib/queries";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Products — Custom Apparel Catalog",
  description: "Browse our catalog of premium blanks: tees, hoodies, caps and activewear, ready for custom POD.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const active = searchParams.category;
  const [products, categories] = await Promise.all([
    getPublishedProducts(active),
    getCategories(),
  ]);

  return (
    <div className="container py-14">
      <SectionHeading
        eyebrow="Catalog"
        title="Custom apparel, built for your brand"
        subtitle="Every style below is a customizable blank — add your prints, labels and packaging. Filter by category to narrow down."
      />

      {/* Category filter */}
      <div className="mt-8 flex flex-wrap gap-2">
        <FilterChip label="All" href="/products" active={!active} />
        {categories.map((c) => (
          <FilterChip
            key={c.slug}
            label={c.name}
            href={`/products?category=${c.slug}`}
            active={active === c.slug}
          />
        ))}
      </div>

      {products.length === 0 ? (
        <p className="mt-16 text-center text-ink-muted">No products in this category yet.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => <ProductCard key={p.slug} p={p} />)}
        </div>
      )}
    </div>
  );
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
