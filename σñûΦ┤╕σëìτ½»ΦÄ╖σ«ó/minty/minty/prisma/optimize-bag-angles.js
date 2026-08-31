// Re-optimize each bag's gallery from the vision-curated different-angle selections
// (produced by the bag-angle-curation workflow) into public/products, overwriting the
// old color-variant images. Writes bag-angles-manifest.json for the DB re-seed.
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const TASK = process.env.TASK; // workflow output file
const BP = process.env.BP; // extracted bag archives
const PUB = path.join(process.cwd(), "public", "products");

async function main() {
  const top = JSON.parse(fs.readFileSync(TASK, "utf8"));
  const selections = (top.result || top).selections;
  const manifest = {};
  let bags = 0, files = 0, missing = 0;

  for (const sel of selections) {
    const sku = sel.sku;
    const dir = path.join(BP, sku);
    const picks = (sel.files || []).filter((f) => f && !/尺寸|size/i.test(f)).slice(0, 5);
    const urls = [];
    let idx = 0;
    for (const f of picks) {
      const src = path.join(dir, f);
      if (!fs.existsSync(src)) { missing++; continue; }
      idx++;
      const dest = idx === 1 ? `${sku}.jpg` : `${sku}-${idx}.jpg`;
      const buf = await sharp(src)
        .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
        .flatten({ background: "#ffffff" })
        .jpeg({ quality: 82, mozjpeg: true })
        .toBuffer();
      fs.writeFileSync(path.join(PUB, dest), buf);
      urls.push(`/products/${dest}`);
      files++;
    }
    // remove any leftover higher-index images from the previous (5-image) import
    for (let k = idx + 1; k <= 8; k++) {
      const stale = path.join(PUB, `${sku}-${k}.jpg`);
      if (fs.existsSync(stale)) fs.unlinkSync(stale);
    }
    if (urls.length) { manifest[sku] = urls; bags++; }
  }

  const out = path.join(process.cwd(), "product-catalog", "bag-angles-manifest.json");
  fs.writeFileSync(out, JSON.stringify(manifest, null, 2));
  console.log(`bags: ${bags}, files written: ${files}, missing sources: ${missing}`);
  console.log(`manifest -> ${out}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
