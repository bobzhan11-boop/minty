import { prisma } from "@/lib/prisma";
import { parseJson } from "@/lib/utils";
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
  return {
    slug: p.slug,
    name: p.name,
    moq: p.moq,
    category: p.category.name,
    image: primary?.url ?? "",
    priceTiers: parseJson<{ qty: number; price: number }[]>(p.priceTiers, []),
  };
}

export async function getPublishedProducts(categorySlug?: string): Promise<ProductCardData[]> {
  const products = await prisma.product.findMany({
    where: {
      status: "published",
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    },
    orderBy: { sortOrder: "asc" },
    include: { category: true, images: true },
  });
  return products.map(toCard);
}

export async function getFeaturedProducts(limit = 6): Promise<ProductCardData[]> {
  return (await getPublishedProducts()).slice(0, limit);
}

export async function getCategories() {
  return prisma.productCategory.findMany({ orderBy: { sortOrder: "asc" } });
}
