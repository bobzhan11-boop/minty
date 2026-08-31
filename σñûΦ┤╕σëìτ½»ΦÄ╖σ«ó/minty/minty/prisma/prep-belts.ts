// One-off prep for the belt catalog:
//  - parse product-catalog/belt-keywords-table.md into records
//  - optimize each SKU's photos (primary + up to 4 angles) to JPEG in public/products
//  - write product-catalog/belt-catalog.json (records + image urls) for the seed
// Run: BELTS="<abs path to .../scratchpad/belts/真皮腰带>" npx tsx prisma/prep-belts.ts
import sharp from "sharp";
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "fs";
import { join } from "path";

const BELTS = process.env.BELTS;
const PUB = join(process.cwd(), "public", "products");
const MD = join(process.cwd(), "product-catalog", "belt-keywords-table.md");
const OUT = join(process.cwd(), "product-catalog", "belt-catalog.json");
const MAX_EXTRA = 4;

interface Rec {
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

function parseMd(): Omit<Rec, "images">[] {
  const recs: Omit<Rec, "images">[] = [];
  for (const line of readFileSync(MD, "utf8").split("\n")) {
    if (!/^\|\s*\d+\s*\*?\s*\|/.test(line)) continue; // data rows: | <num> | ...
    const c = line.split("|").map((x) => x.trim());
    const sku = c[2];
    if (!/^HJ-P[WM]/.test(sku)) continue;
    recs.push({
      sku,
      category: c[4] === "men" ? "men" : "women",
      name: c[3],
      bagType: c[5],
      primaryColor: c[6] === "—" ? "" : c[6],
      material: c[7],
      dimensionsCm: c[8] && c[8] !== "—" ? c[8].replace("×", "*") : null,
      keywords: c[9] ? c[9].split(",").map((k) => k.trim()).filter(Boolean) : [],
    });
  }
  return recs;
}

async function optimize(dir: string, sku: string): Promise<string[]> {
  const seen = new Set<number>();
  const picks: string[] = [];
  for (const x of readdirSync(dir)
    .filter((f) => /\.png$/i.test(f) && !/尺寸|size/i.test(f))
    .map((f) => ({ f, s: statSync(join(dir, f)).size }))
    .filter((x) => x.s > 150 * 1024)
    .sort((a, b) => a.f.localeCompare(b.f))) {
    if (seen.has(x.s)) continue;
    seen.add(x.s);
    picks.push(x.f);
    if (picks.length >= 1 + MAX_EXTRA) break;
  }
  const urls: string[] = [];
  for (let i = 0; i < picks.length; i++) {
    const dest = i === 0 ? `${sku}.jpg` : `${sku}-${i + 1}.jpg`;
    const buf = await sharp(join(dir, picks[i]))
      .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
    writeFileSync(join(PUB, dest), buf);
    urls.push(`/products/${dest}`);
  }
  return urls;
}

async function main() {
  if (!BELTS || !existsSync(BELTS)) throw new Error(`BELTS path not found: ${BELTS}`);
  const out: Rec[] = [];
  let skipped = 0;
  for (const r of parseMd()) {
    const sub = r.sku.startsWith("HJ-PW") ? "真皮女带" : "真皮男带";
    const dir = join(BELTS, sub, r.sku);
    if (!existsSync(dir)) {
      skipped++;
      continue;
    }
    const images = await optimize(dir, r.sku);
    if (images.length === 0) {
      skipped++;
      continue;
    }
    out.push({ ...r, images });
  }
  writeFileSync(OUT, JSON.stringify(out, null, 2));
  console.log(`belts with images: ${out.length} (skipped ${skipped}); catalog -> ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
