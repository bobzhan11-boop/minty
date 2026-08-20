// One-off: process the 22 new kids bags (童包-3).
//  - optimize each SKU's chosen different-angle photos -> public/products JPEG
//  - build catalog records and MERGE into product-catalog/minty-bag-catalog.json
//  - MERGE the gallery image urls into product-catalog/bag-angles-manifest.json
// Run: RECS=<kids3-records.json> K=<extracted kids3 dir> node prisma/process-kids3.js
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const RECS = process.env.RECS;
const K = process.env.K;
const ROOT = process.cwd();
const PUB = path.join(ROOT, "public", "products");
const CATALOG = path.join(ROOT, "product-catalog", "minty-bag-catalog.json");
const MANIFEST = path.join(ROOT, "product-catalog", "bag-angles-manifest.json");

function sizeClass(dims) {
  if (!dims) return "small";
  const n = (dims.match(/[\d.]+/g) || []).map(Number);
  const h = n[1] || n[0] || 0;
  return h >= 28 ? "large" : h >= 18 ? "medium" : "small";
}

async function main() {
  const recs = JSON.parse(fs.readFileSync(RECS, "utf8"));
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  const catalogRecs = [];
  let filesWritten = 0, missing = 0;

  for (const r of recs) {
    const dir = path.join(K, r.sku);
    const picks = (r.images || []).filter((f) => f && !/尺寸|size/i.test(f)).slice(0, 5);
    const urls = [];
    let idx = 0;
    for (const f of picks) {
      const src = path.join(dir, f);
      if (!fs.existsSync(src)) { console.log("  missing source:", r.sku, "/", f); missing++; continue; }
      idx++;
      const dest = idx === 1 ? `${r.sku}.jpg` : `${r.sku}-${idx}.jpg`;
      const buf = await sharp(src)
        .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
        .flatten({ background: "#ffffff" })
        .jpeg({ quality: 82, mozjpeg: true })
        .toBuffer();
      fs.writeFileSync(path.join(PUB, dest), buf);
      urls.push(`/products/${dest}`);
      filesWritten++;
    }
    for (let k = idx + 1; k <= 8; k++) {
      const st = path.join(PUB, `${r.sku}-${k}.jpg`);
      if (fs.existsSync(st)) fs.unlinkSync(st);
    }
    manifest[r.sku] = urls;
    catalogRecs.push({
      sku: r.sku, category: "kids", audience: "kids", status: "labeled",
      hasPhoto: true, photoSource: "1688",
      dimensionsCm: r.dimensionsCm || null, sizeClass: sizeClass(r.dimensionsCm),
      material: r.material, moq: 200, name: r.name, bagType: r.bagType,
      primaryColor: r.primaryColor, colors: r.colors || [], pattern: r.pattern || null,
      styleTags: r.styleTags || [], features: [], occasion: r.occasion || [],
      description: r.description, keywords: r.keywords || [],
    });
  }

  // merge into the catalog: drop any existing 042-063 (placeholders), append the new set
  const catalog = JSON.parse(fs.readFileSync(CATALOG, "utf8"));
  const newSkus = new Set(catalogRecs.map((r) => r.sku));
  const merged = catalog.filter((r) => !newSkus.has(r.sku)).concat(catalogRecs);
  fs.writeFileSync(CATALOG, JSON.stringify(merged, null, 1));
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));

  console.log(`new records: ${catalogRecs.length}, images written: ${filesWritten}, missing sources: ${missing}`);
  console.log(`catalog now: ${merged.length} products`);
}

main().catch((e) => { console.error(e); process.exit(1); });
