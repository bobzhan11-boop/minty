// One-off, idempotent importer: adds the extra angle/variant photos (already copied into
// public/products by copy-gallery.js) as ProductImage rows so detail pages show a gallery.
// Run: MANIFEST=<path to gallery-manifest.json> npx tsx prisma/seed-gallery.ts
import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

async function main() {
  const manifestPath = process.env.MANIFEST;
  if (!manifestPath || !fs.existsSync(manifestPath)) {
    throw new Error(`MANIFEST not found: ${manifestPath}`);
  }
  const manifest: Record<string, string[]> = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

  let productsUpdated = 0;
  let rowsAdded = 0;

  for (const [sku, urls] of Object.entries(manifest)) {
    const product = await prisma.product.findUnique({
      where: { slug: sku.toLowerCase() },
      include: { images: true },
    });
    if (!product) continue;

    const have = new Set(product.images.map((i) => i.url));
    let order = product.images.reduce((m, i) => Math.max(m, i.sortOrder), 0);
    let added = 0;

    for (const url of urls) {
      if (have.has(url)) continue; // idempotent — don't duplicate on re-run
      order += 1;
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url,
          altText: `${product.name} — view ${order}`,
          isPrimary: false,
          sortOrder: order,
        },
      });
      added += 1;
      rowsAdded += 1;
    }
    if (added) productsUpdated += 1;
  }

  console.log(`Products updated: ${productsUpdated}, image rows added: ${rowsAdded}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
