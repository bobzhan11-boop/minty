import type { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * Seeds the genuine-leather belt catalog (women's + men's) from
 * product-catalog/belt-catalog.json (produced by prep-belts.ts). Used by seed.ts
 * and the standalone seed-belts-run.ts.
 */

interface BeltRec {
  sku: string;
  category: "women" | "men";
  name: string;
  bagType: string;
  primaryColor: string;
  material: string;
  dimensionsCm: string | null;
  keywords: string[];
  images: string[];
}

export const BELT_CATEGORIES = [
  { name: "Women's Belts", slug: "womens-belts", sortOrder: 3 },
  { name: "Men's Belts", slug: "mens-belts", sortOrder: 4 },
];

export async function seedBeltCatalog(prisma: PrismaClient): Promise<number> {
  const path = join(process.cwd(), "product-catalog", "belt-catalog.json");
  const belts = JSON.parse(readFileSync(path, "utf8")) as BeltRec[];

  for (const c of BELT_CATEGORIES) {
    await prisma.productCategory.upsert({ where: { slug: c.slug }, update: {}, create: c });
  }
  const catMap = Object.fromEntries(
    (await prisma.productCategory.findMany()).map((c) => [c.slug, c.id]),
  );
  const catSlug = (cat: string) => (cat === "men" ? "mens-belts" : "womens-belts");

  let sort = 100;
  for (const p of belts) {
    const specs = [
      p.bagType ? `Type: ${p.bagType}` : null,
      p.material ? `Material: ${p.material}` : null,
      p.dimensionsCm ? `Size: ${p.dimensionsCm} cm (width × length)` : null,
      p.primaryColor ? `Color: ${p.primaryColor}` : null,
      `SKU: ${p.sku}`,
    ]
      .filter(Boolean)
      .join(" · ");

    const kw = new Set<string>(p.keywords.map((k) => k.toLowerCase()));
    [p.bagType, p.primaryColor, p.material].filter(Boolean).forEach((k) => kw.add(String(k).toLowerCase()));
    kw.add(p.sku.toLowerCase());
    // Chinese + generic belt terms
    kw.add(p.category === "men" ? "男士皮带" : "女士皮带");
    ["腰带", "皮带", "真皮", "belt", "leather belt", "genuine leather belt", "real leather belt"].forEach((k) =>
      kw.add(k),
    );

    const created = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.sku.toLowerCase(),
        categoryId: catMap[catSlug(p.category)]!,
        description: `${p.name}. Genuine cowhide leather, factory-direct with wholesale MOQ and full private-label customization (buckle, finish, embossing, packaging).`,
        specs,
        keywords: [...kw].join(", "),
        primaryColor: p.primaryColor || null,
        bagType: p.bagType || null,
        material: p.material || null,
        moq: 200,
        priceTiers: JSON.stringify([]),
        sortOrder: sort++,
        status: "published",
      },
    });

    for (let i = 0; i < p.images.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: created.id,
          url: p.images[i],
          altText: `${p.name} — view ${i + 1}`,
          isPrimary: i === 0,
          sortOrder: i,
        },
      });
    }
  }
  return belts.length;
}
