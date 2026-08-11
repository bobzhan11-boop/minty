import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api";
import { parseJson } from "@/lib/utils";
import { buildSearchWhere } from "@/lib/search";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/v1/products — public product list with pagination + category filter +
 * keyword search (§5.2). Powers Mia's product-search skill and the catalog page.
 * Query: ?page=1&pageSize=12&category=womens-bags&q=pink+backpack
 *
 * Search is tokenized (whitespace), singularized (so "backpacks" matches
 * "backpack"), LIKE-wildcards are escaped, and all tokens must match (AND) across
 * name / description / specs / keywords / category name.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Math.floor(Number(searchParams.get("page")) || 1));
  const pageSize = Math.min(100, Math.max(1, Math.floor(Number(searchParams.get("pageSize")) || 12)));
  const category = searchParams.get("category") || undefined;
  const q = searchParams.get("q") ?? undefined;

  const where = {
    status: "published",
    ...(category ? { category: { slug: category } } : {}),
    ...buildSearchWhere(q),
  };

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { sortOrder: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { category: true, images: { where: { isPrimary: true }, take: 1 } },
    }),
  ]);

  const data = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.category.name,
    moq: p.moq,
    priceTiers: parseJson<{ qty: number; price: number }[]>(p.priceTiers, []),
    image: p.images[0]?.url ?? null,
  }));

  return ok({ items: data, page, pageSize, total });
}
