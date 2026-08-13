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

/** Color families for the catalog filter — each maps to matching primaryColor substrings. */
export const COLOR_FAMILIES = [
  { label: "Black", value: "black", hex: "#1f2937", match: ["black"] },
  { label: "Grey", value: "grey", hex: "#9ca3af", match: ["grey", "gray"] },
  { label: "White", value: "white", hex: "#f1f0ec", match: ["white", "beige"] },
  { label: "Brown", value: "brown", hex: "#6b4423", match: ["brown"] },
  { label: "Pink", value: "pink", hex: "#f4a6c0", match: ["pink"] },
  { label: "Red", value: "red", hex: "#c0392b", match: ["red", "burgundy"] },
  { label: "Blue", value: "blue", hex: "#3b6fb0", match: ["blue", "navy"] },
  { label: "Green", value: "green", hex: "#3f7d54", match: ["green"] },
  { label: "Purple", value: "purple", hex: "#7d5ba6", match: ["purple"] },
  { label: "Silver", value: "silver", hex: "#cbd5e1", match: ["silver"] },
  { label: "Gold", value: "gold", hex: "#c9a24b", match: ["gold"] },
] as const;

type Where = Record<string, unknown>;

export async function getPublishedProducts(
  categorySlug?: string,
  query?: string,
  color?: string,
  type?: string,
): Promise<ProductCardData[]> {
  const family = color ? COLOR_FAMILIES.find((f) => f.value === color) : undefined;
  const opts = { orderBy: { sortOrder: "asc" as const }, include: { category: true, images: true } };

  // Combine category + color + type + search under a single AND (avoids key collisions
  // between the color OR-clause and the search OR/AND-clause).
  const whereWith = (searchWhere: Where): Where => {
    const and: Where[] = [];
    if (family) and.push({ OR: family.match.map((m) => ({ primaryColor: { contains: m } })) });
    if (type) and.push({ bagType: type });
    if (Object.keys(searchWhere).length) and.push(searchWhere);
    return {
      status: "published",
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      ...(and.length ? { AND: and } : {}),
    };
  };

  let products = await prisma.product.findMany({ where: whereWith(buildSearchWhere(query)), ...opts });
  // Zero exact (AND) matches for a multi-word query? Fall back to closest (OR) matches.
  if (query && products.length === 0 && meaningfulTokens(query).length > 1) {
    products = await prisma.product.findMany({ where: whereWith(buildSearchWhereLoose(query)), ...opts });
  }
  const ranked = query ? rankBySearch(products, query) : products;
  return ranked.map(toCard);
}

/** Distinct bag types present in the catalog (for the type filter chips). */
export async function getProductFacets(): Promise<{ types: string[] }> {
  const rows = await prisma.product.findMany({
    where: { status: "published", bagType: { not: null } },
    select: { bagType: true },
  });
  const types = Array.from(new Set(rows.map((r) => r.bagType!).filter(Boolean))).sort();
  return { types };
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
