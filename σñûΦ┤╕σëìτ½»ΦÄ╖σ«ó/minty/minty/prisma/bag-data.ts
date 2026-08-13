import type { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * Shared bag-catalog seeding used by both `seed.ts` (full seed) and
 * `seed-bags.ts` (products-only refresh). Reads the vision-labeled catalog and
 * loads the real women's + kids' bags with rich, bilingual search keywords.
 */

export interface CatalogRecord {
  sku: string;
  category: "women" | "kids" | "men";
  status: string;
  dimensionsCm: string | null;
  material: string | null;
  moq: number | null;
  name: string | null;
  bagType: string | null;
  primaryColor: string | null;
  colors: string[];
  pattern: string | null;
  styleTags: string[];
  features: string[];
  occasion: string[];
  description: string | null;
  keywords: string[];
}

export const BAG_CATEGORIES = [
  { name: "Women's Bags", slug: "womens-bags", sortOrder: 1 },
  { name: "Kids' Bags", slug: "kids-bags", sortOrder: 2 },
];

/** Chinese aliases so 中文 searches (女包/背包/斜挎包…) also return results. */
const ZH_CATEGORY: Record<string, string[]> = {
  women: ["女包", "女士包", "女生包"],
  kids: ["童包", "儿童包", "宝宝包", "小孩包"],
  men: ["男包"],
};
const ZH_BAGTYPE: Record<string, string[]> = {
  backpack: ["背包", "双肩包"],
  "tote bag": ["托特包", "手提包"],
  "shoulder bag": ["单肩包"],
  "crossbody bag": ["斜挎包", "斜跨包", "单肩斜挎包"],
  handbag: ["手提包", "手袋"],
  clutch: ["手拿包", "手抓包"],
  "bucket bag": ["水桶包"],
  satchel: ["邮差包", "书包"],
  "coin purse": ["零钱包", "零钱袋"],
  "card holder": ["卡包"],
  wallet: ["钱包"],
  "belt bag": ["腰包", "胸包"],
  "cosmetic pouch": ["化妆包"],
  "drawstring bag": ["束口袋", "抽绳包"],
  "messenger bag": ["邮差包"],
  "mini bag": ["迷你包"],
  "phone bag": ["手机包"],
  "hobo bag": ["月牙包"],
};

function loadCatalog(): CatalogRecord[] {
  const path = join(process.cwd(), "product-catalog", "minty-bag-catalog.json");
  return JSON.parse(readFileSync(path, "utf8")) as CatalogRecord[];
}

/** Create the two bag categories and all `labeled` products (women's + kids'). */
export async function seedBagCatalog(prisma: PrismaClient) {
  const products = loadCatalog().filter((p) => p.status === "labeled" && p.category !== "men");

  for (const c of BAG_CATEGORIES) {
    await prisma.productCategory.create({ data: c });
  }
  const catMap = Object.fromEntries(
    (await prisma.productCategory.findMany()).map((c) => [c.slug, c.id]),
  );
  const catSlug = (from: string) => (from === "women" ? "womens-bags" : "kids-bags");

  let sort = 0;
  for (const p of products) {
    const specs = [
      p.bagType ? `Type: ${p.bagType}` : null,
      p.material ? `Material: ${p.material}` : null,
      p.dimensionsCm ? `Dimensions: ${p.dimensionsCm} cm` : null,
      p.colors?.length ? `Colors: ${p.colors.join(", ")}` : null,
      `SKU: ${p.sku}`,
    ].filter(Boolean).join(" · ");

    const kw = new Set<string>();
    (p.keywords || []).forEach((k) => kw.add(k));
    [p.bagType, p.primaryColor, p.pattern, ...(p.colors || []), ...(p.styleTags || []), ...(p.occasion || [])]
      .filter(Boolean)
      .forEach((k) => kw.add(String(k).toLowerCase()));
    kw.add(p.sku.toLowerCase());
    // Chinese aliases (category + bag type + generic)
    (ZH_CATEGORY[p.category] || []).forEach((z) => kw.add(z));
    (ZH_BAGTYPE[p.bagType || ""] || []).forEach((z) => kw.add(z));
    kw.add("包"); kw.add("包包");

    const created = await prisma.product.create({
      data: {
        name: p.name ?? p.sku,
        slug: p.sku.toLowerCase(),
        categoryId: catMap[catSlug(p.category)]!,
        description: p.description ?? "",
        specs,
        keywords: [...kw].join(", "),
        moq: p.moq ?? 1000,
        priceTiers: JSON.stringify([]),
        sortOrder: sort++,
        status: "published",
      },
    });
    await prisma.productImage.create({
      data: {
        productId: created.id,
        url: `/products/${p.sku}.jpg`,
        altText: p.name ?? p.sku,
        isPrimary: true,
        sortOrder: 0,
      },
    });
  }
  return products.length;
}
