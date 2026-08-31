// Additive, idempotent seed for the 22 new kids bags (HJ-BK200042..063) into the
// existing dev database — same product/keyword logic as bag-data.ts. Existing data is
// untouched. Run: npx tsx prisma/seed-kids3.ts
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

const ZH_CATEGORY: Record<string, string[]> = { kids: ["童包", "儿童包", "宝宝包", "小孩包"] };
const ZH_BAGTYPE: Record<string, string[]> = {
  backpack: ["背包", "双肩包"],
  "tote bag": ["托特包", "手提包"],
  "shoulder bag": ["单肩包"],
  "crossbody bag": ["斜挎包", "斜跨包", "单肩斜挎包"],
  handbag: ["手提包", "手袋"],
  "coin purse": ["零钱包", "零钱袋"],
  "belt bag": ["腰包", "胸包"],
  "cosmetic pouch": ["化妆包"],
  "drawstring bag": ["束口袋", "抽绳包"],
  "mini bag": ["迷你包"],
  "phone bag": ["手机包"],
};

interface Rec {
  sku: string; category: string; status: string; name: string; bagType: string | null;
  primaryColor: string | null; colors: string[]; pattern: string | null; material: string | null;
  dimensionsCm: string | null; styleTags: string[]; occasion: string[]; description: string; keywords: string[];
}

async function main() {
  const root = process.cwd();
  const catalog = JSON.parse(readFileSync(join(root, "product-catalog", "minty-bag-catalog.json"), "utf8")) as Rec[];
  const manifest = JSON.parse(readFileSync(join(root, "product-catalog", "bag-angles-manifest.json"), "utf8")) as Record<string, string[]>;

  const newRecs = catalog.filter((r) => /^HJ-BK2000(4[2-9]|5[0-9]|6[0-3])$/.test(r.sku) && r.status === "labeled");
  const kidsCat = await prisma.productCategory.findUnique({ where: { slug: "kids-bags" } });
  if (!kidsCat) throw new Error("kids-bags category missing — run db:seed first");

  const maxSort = (await prisma.product.aggregate({ _max: { sortOrder: true } }))._max.sortOrder ?? 0;
  let sort = maxSort;
  let created = 0, skipped = 0, imgs = 0;

  for (const p of newRecs) {
    const slug = p.sku.toLowerCase();
    if (await prisma.product.findUnique({ where: { slug } })) { skipped++; continue; }

    const specs = [
      p.bagType ? `Type: ${p.bagType}` : null,
      p.material ? `Material: ${p.material}` : null,
      p.dimensionsCm ? `Dimensions: ${p.dimensionsCm} cm` : null,
      p.colors?.length ? `Colors: ${p.colors.join(", ")}` : null,
      `SKU: ${p.sku}`,
    ].filter(Boolean).join(" · ");

    const kw = new Set<string>(p.keywords || []);
    [p.bagType, p.primaryColor, p.pattern, ...(p.colors || []), ...(p.styleTags || []), ...(p.occasion || [])]
      .filter(Boolean).forEach((k) => kw.add(String(k).toLowerCase()));
    kw.add(slug);
    (ZH_CATEGORY[p.category] || []).forEach((z) => kw.add(z));
    (ZH_BAGTYPE[p.bagType || ""] || []).forEach((z) => kw.add(z));
    kw.add("包"); kw.add("包包");

    sort += 1;
    const product = await prisma.product.create({
      data: {
        name: p.name, slug, categoryId: kidsCat.id,
        description: p.description ?? "", specs, keywords: [...kw].join(", "),
        primaryColor: p.primaryColor ?? null, bagType: p.bagType ?? null, material: p.material ?? null,
        moq: 200, priceTiers: JSON.stringify([]), sortOrder: sort, status: "published",
      },
    });

    const urls = manifest[p.sku] || [];
    for (let i = 0; i < urls.length; i++) {
      await prisma.productImage.create({
        data: { productId: product.id, url: urls[i], altText: `${p.name} — view ${i + 1}`, isPrimary: i === 0, sortOrder: i },
      });
      imgs++;
    }
    created++;
  }
  console.log(`created: ${created}, skipped(existing): ${skipped}, image rows: ${imgs}`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
