import { PrismaClient } from "@prisma/client";
import { seedBagCatalog } from "./bag-data";

const prisma = new PrismaClient();

/**
 * Products-only refresh: wipe products + categories and reload the real bag
 * catalog from product-catalog/minty-bag-catalog.json. Use `npm run db:seed`
 * for the full site seed (content + products).
 *
 * Run: npm run db:seed:bags   (after `npm run db:push`)
 */
async function main() {
  console.log("→ Reloading real bag catalog…");
  await prisma.productImage.deleteMany();
  await prisma.productVideo.deleteMany();
  await prisma.inquiry.updateMany({ data: { productId: null } });
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();

  const count = await seedBagCatalog(prisma);
  console.log(`✓ Loaded ${count} bag products (women's + kids').`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
