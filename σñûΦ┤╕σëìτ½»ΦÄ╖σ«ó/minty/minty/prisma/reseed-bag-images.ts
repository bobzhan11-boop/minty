// Replace each bag's ProductImage rows with the curated different-angle set
// (from bag-angles-manifest.json). Run: npx tsx prisma/reseed-bag-images.ts
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

async function main() {
  const manifest = JSON.parse(
    readFileSync(join(process.cwd(), "product-catalog", "bag-angles-manifest.json"), "utf8"),
  ) as Record<string, string[]>;

  let bags = 0;
  let rows = 0;
  for (const [sku, urls] of Object.entries(manifest)) {
    const product = await prisma.product.findUnique({ where: { slug: sku.toLowerCase() } });
    if (!product) continue;
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    for (let i = 0; i < urls.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: urls[i],
          altText: `${product.name} — view ${i + 1}`,
          isPrimary: i === 0,
          sortOrder: i,
        },
      });
      rows++;
    }
    bags++;
  }
  console.log(`bags updated: ${bags}, image rows: ${rows}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
