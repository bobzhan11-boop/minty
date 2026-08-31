// Backfill Product.primaryColor + Product.bagType from the labeled catalog JSON,
// so the new faceted color/type filters work on the existing dev database.
// Run: npx tsx prisma/backfill-facets.ts
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

interface Rec {
  sku: string;
  primaryColor: string | null;
  bagType: string | null;
  material: string | null;
}

async function main() {
  const path = join(process.cwd(), "product-catalog", "minty-bag-catalog.json");
  const catalog = JSON.parse(readFileSync(path, "utf8")) as Rec[];
  let n = 0;
  for (const r of catalog) {
    if (!r.sku) continue;
    const res = await prisma.product.updateMany({
      where: { slug: r.sku.toLowerCase() },
      data: { primaryColor: r.primaryColor ?? null, bagType: r.bagType ?? null, material: r.material ?? null },
    });
    n += res.count;
  }
  console.log(`backfilled facets on ${n} products`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
