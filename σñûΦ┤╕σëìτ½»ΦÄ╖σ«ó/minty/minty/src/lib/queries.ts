import { prisma } from "@/lib/prisma";
import { parseJson } from "@/lib/utils";
import { buildSearchWhere, buildSearchWhereLoose, meaningfulTokens, rankBySearch } from "@/lib/search";
import type { ProductCardData } from "@/components/product-card";

function toCard(p: {
  slug: string;
  name: string;
  moq: number;
  category: { name: string };
  images: { url: string; isPrimary: boolean }[];
  priceTiers: string | null;
}): ProductCardData {
  const primary = p.images.find((i) => i.isPrimary) ?? p.images[0];
  const hover = p.images.find((i) => i.url !== primary?.url);
  return {
    slug: p.slug,
    name: p.name,
    moq: p.moq,
    category: p.category.name,
    image: primary?.url ?? "",
    hoverImage: hover?.url,
    priceTiers: parseJson<{ qty: number; price: number }[]>(p.priceTiers, []),
  };
}

export async function getPublishedProducts(
  categorySlug?: string,
  query?: string,
): Promise<ProductCardData[]> {
  const base = { status: "published", ...(categorySlug ? { category: { slug: categorySlug } } : {}) };
  const opts = { orderBy: { sortOrder: "asc" as const }, include: { category: true, images: true } };

  let products = await prisma.product.findMany({ where: { ...base, ...buildSearchWhere(query) }, ...opts });
  // Zero exact (AND) matches for a multi-word query? Fall back to closest (OR) matches
  // so "purple backpack" / "genuine leather" show something instead of an empty page.
  if (query && products.length === 0 && meaningfulTokens(query).length > 1) {
    products = await prisma.product.findMany({ where: { ...base, ...buildSearchWhereLoose(query) }, ...opts });
  }
  // When searching, relevance-rank so exact name/category matches beat keyword-only
  // hits; otherwise keep the DB's sortOrder.
  const ranked = query ? rankBySearch(products, query) : products;
  return ranked.map(toCard);
}

export async function getFeaturedProducts(limit = 6): Promise<ProductCardData[]> {
  return (await getPublishedProducts()).slice(0, limit);
}

/** Other products in the same category (for "you may also like" on detail pages). */
export async function getRelatedProducts(
  categoryId: number,
  excludeSlug: string,
  limit = 4,
): Promise<ProductCardData[]> {
  const products = await prisma.product.findMany({
    where: { status: "published", categoryId, slug: { not: excludeSlug } },
    orderBy: { sortOrder: "asc" },
    take: limit,
    include: { category: true, images: true },
  });
  return products.map(toCard);
}

export async function getCategories() {
  return prisma.productCategory.findMany({ orderBy: { sortOrder: "asc" } });
}
