import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, methodNotAllowed } from "@/lib/api";
import { parseJson } from "@/lib/utils";
import { buildSearchWhere, buildSearchWhereLoose, meaningfulTokens } from "@/lib/search";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Largest page the API will serve; larger requests are clamped (echoed as `maxPageSize`). */
const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 12;

/**
 * GET /api/v1/products — public product list with pagination + category filter +
 * keyword search (§5.2). Powers Mia's product-search skill and the catalog page.
 * Query: ?page=1&pageSize=12&category=womens-bags&q=pink+backpack
 *
 * Search is tokenized (whitespace), singularized (so "backpacks" matches
 * "backpack"), LIKE-wildcards are escaped, and all tokens must match (AND) across
 * name / specs / keywords / category name (description excluded for precision).
 * Results are ordered by sortOrder; the catalog page additionally relevance-ranks.
 *
 * `page` and `pageSize` are floored; `pageSize` is clamped to [1, MAX_PAGE_SIZE]
 * and the effective cap is returned as `maxPageSize` so consumers can detect it.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Math.floor(Number(searchParams.get("page")) || 1));
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Math.floor(Number(searchParams.get("pageSize")) || DEFAULT_PAGE_SIZE)),
  );
  const category = searchParams.get("category") || undefined;
  const q = searchParams.get("q") ?? undefined;

  const base = { status: "published", ...(category ? { category: { slug: category } } : {}) };
  const listOpts = {
    orderBy: { sortOrder: "asc" as const },
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: { category: true, images: { where: { isPrimary: true }, take: 1 } },
  };

  let where = { ...base, ...buildSearchWhere(q) };
  let [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({ where, ...listOpts }),
  ]);
  // No exact (AND) matches for a multi-word query -> fall back to closest (OR) matches.
  if (q && total === 0 && meaningfulTokens(q).length > 1) {
    where = { ...base, ...buildSearchWhereLoose(q) };
    [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({ where, ...listOpts }),
    ]);
  }

  const data = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.category.name,
    moq: p.moq,
    priceTiers: parseJson<{ qty: number; price: number }[]>(p.priceTiers, []),
    image: p.images[0]?.url ?? null,
  }));

  return ok({ items: data, page, pageSize, total, maxPageSize: MAX_PAGE_SIZE });
}

// Wrong-method requests get the { code, message, data } envelope, not an empty 405.
export const POST = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
