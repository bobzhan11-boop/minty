// Standalone, idempotent belt seed for the existing dev database.
// Clears any existing belt products/categories, then re-seeds from belt-catalog.json.
// Run: npx tsx prisma/seed-belts-run.ts
import { PrismaClient } from "@prisma/client";
import { seedBeltCatalog } from "./belt-data";

const prisma = new PrismaClient();

async function main() {
  await prisma.product.deleteMany({ where: { slug: { startsWith: "hj-pw" } } });
  await prisma.product.deleteMany({ where: { slug: { startsWith: "hj-pm" } } });
  await prisma.productCategory.deleteMany({ where: { slug: { in: ["womens-belts", "mens-belts"] } } });
  const n = await seedBeltCatalog(prisma);
  console.log(`seeded ${n} belt products`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
