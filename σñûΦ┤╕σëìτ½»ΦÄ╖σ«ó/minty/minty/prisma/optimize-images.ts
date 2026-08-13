// One-off: resize + re-encode every public/products/*.png as optimized JPEG (~1200px,
// q82 mozjpeg), delete the PNGs, and rewrite the DB references (.png -> .jpg) across
// product_images, case_images (showcase covers) and the hero home_module content.
// Run: PUB=<abs path to public/products> npx tsx prisma/optimize-images.ts
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const PUB = process.env.PUB;
  if (!PUB || !fs.existsSync(PUB)) throw new Error(`PUB not found: ${PUB}`);

  const files = fs.readdirSync(PUB).filter((f) => /\.png$/i.test(f));
  let done = 0;
  let before = 0;
  let after = 0;
  for (const f of files) {
    const src = path.join(PUB, f);
    const dst = path.join(PUB, f.replace(/\.png$/i, ".jpg"));
    before += fs.statSync(src).size;
    const buf = await sharp(src)
      .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
    fs.writeFileSync(dst, buf);
    fs.unlinkSync(src);
    after += buf.length;
    done += 1;
  }
  console.log(`converted ${done} files; ${(before / 1e6).toFixed(0)}MB -> ${(after / 1e6).toFixed(0)}MB`);

  const r1 = await prisma.$executeRawUnsafe(
    "UPDATE product_images SET url = REPLACE(url, '.png', '.jpg') WHERE url LIKE '/products/%.png'",
  );
  const r2 = await prisma.$executeRawUnsafe(
    "UPDATE case_images SET url = REPLACE(url, '.png', '.jpg') WHERE url LIKE '%/products/%.png'",
  );
  const r3 = await prisma.$executeRawUnsafe(
    "UPDATE home_modules SET content = REPLACE(content, '/products/HJ-BW100001.png', '/products/HJ-BW100001.jpg') WHERE module_type = 'hero'",
  );
  console.log(`db updated -> product_images:${r1} case_images:${r2} home_modules:${r3}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
