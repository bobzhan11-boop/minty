import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

/**
 * Seed the REAL bag catalog (women's + kids') produced by the vision-labeling
 * pipeline. Reads product-catalog/minty-bag-catalog.json and loads every
 * `labeled` product with search keywords. Images are served from
 * /public/products/<SKU>.png.
 *
 * Run: npm run db:seed:bags   (after `npm run db:push`)
 */

interface CatalogRecord {
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

const CATEGORIES = [
  { name: "Women's Bags", slug: "womens-bags", sortOrder: 1, from: "women" },
  { name: "Kids' Bags", slug: "kids-bags", sortOrder: 2, from: "kids" },
];

async function main() {
  console.log("→ Seeding real bag catalog…");

  const path = join(process.cwd(), "product-catalog", "minty-bag-catalog.json");
  const all = JSON.parse(readFileSync(path, "utf8")) as CatalogRecord[];
  const products = all.filter((p) => p.status === "labeled" && p.category !== "men");
  console.log(`  ${products.length} labeled products to load`);

  // Wipe product-related tables only (keep users, factory, cases, home modules).
  await prisma.productImage.deleteMany();
  await prisma.productVideo.deleteMany();
  // detach inquiries from products so we can clear the catalog safely
  await prisma.inquiry.updateMany({ data: { productId: null } });
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();

  // Categories
  for (const c of CATEGORIES) {
    await prisma.productCategory.create({
      data: { name: c.name, slug: c.slug, sortOrder: c.sortOrder },
    });
  }
  const catMap = Object.fromEntries(
    (await prisma.productCategory.findMany()).map((c) => [c.slug, c.id]),
  );
  const catSlug = (from: string) => (from === "women" ? "womens-bags" : "kids-bags");

  let sort = 0;
  for (const p of products) {
    const specsParts = [
      p.bagType ? `Type: ${p.bagType}` : null,
      p.material ? `Material: ${p.material}` : null,
      p.dimensionsCm ? `Dimensions: ${p.dimensionsCm} cm` : null,
      p.colors?.length ? `Colors: ${p.colors.join(", ")}` : null,
      `SKU: ${p.sku}`,
    ].filter(Boolean);

    // Keyword blob (searched): labeled keywords + type/colors/pattern/style + sku.
    const kw = new Set<string>();
    (p.keywords || []).forEach((k) => kw.add(k));
    [p.bagType, p.primaryColor, p.pattern, ...(p.colors || []), ...(p.styleTags || []), ...(p.occasion || [])]
      .filter(Boolean)
      .forEach((k) => kw.add(String(k).toLowerCase()));
    kw.add(p.sku.toLowerCase());

    const created = await prisma.product.create({
      data: {
        name: p.name ?? p.sku,
        slug: p.sku.toLowerCase(),
        categoryId: catMap[catSlug(p.category)]!,
        description: p.description ?? "",
        specs: specsParts.join(" · "),
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
        url: `/products/${p.sku}.png`,
        altText: p.name ?? p.sku,
        isPrimary: true,
        sortOrder: 0,
      },
    });
  }

  const counts = await prisma.product.groupBy({ by: ["categoryId"], _count: true });
  console.log("  seeded products by category:", JSON.stringify(counts));
  console.log("✓ Bag catalog seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
