import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Use stable Unsplash source URLs so the demo renders real imagery without
// shipping binary assets.
const img = (id: string, w = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;

async function main() {
  console.log("→ Seeding Minty demo data…");

  // ---- Wipe (idempotent re-seed) ----
  await prisma.inquiryNote.deleteMany();
  await prisma.inquiryAttachment.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVideo.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.caseImage.deleteMany();
  await prisma.case.deleteMany();
  await prisma.factoryImage.deleteMany();
  await prisma.factoryCertification.deleteMany();
  await prisma.factoryInfo.deleteMany();
  await prisma.brandContent.deleteMany();
  await prisma.homeModule.deleteMany();
  await prisma.customerTagRelation.deleteMany();
  await prisma.customerNote.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.customerTag.deleteMany();
  await prisma.user.deleteMany();

  // ---- Admin / operator users ----
  const passwordHash = await bcrypt.hash("minty1234", 10);
  await prisma.user.createMany({
    data: [
      { email: "admin@minty.dev", passwordHash, name: "Admin", role: "admin" },
      { email: "ops@minty.dev", passwordHash, name: "Operator", role: "operator" },
    ],
  });

  // ---- Customer tags ----
  await prisma.customerTag.createMany({
    data: [
      { name: "VIP", color: "#059669" },
      { name: "待跟进", color: "#f59e0b" },
      { name: "已报价", color: "#3b82f6" },
      { name: "POD客户", color: "#8b5cf6" },
    ],
  });

  // ---- Categories ----
  const categories = [
    { name: "T-Shirts", slug: "t-shirts", sortOrder: 1 },
    { name: "Hoodies", slug: "hoodies", sortOrder: 2 },
    { name: "Caps & Hats", slug: "caps", sortOrder: 3 },
    { name: "Activewear", slug: "activewear", sortOrder: 4 },
  ];
  for (const c of categories) await prisma.productCategory.create({ data: c });
  const catMap = Object.fromEntries(
    (await prisma.productCategory.findMany()).map((c) => [c.slug, c.id]),
  );

  // ---- Products ----
  const products = [
    {
      name: "Premium Heavyweight Cotton Tee",
      slug: "premium-heavyweight-cotton-tee",
      category: "t-shirts",
      moq: 50,
      description:
        "240gsm combed ring-spun cotton with a structured, boxy fit. Pre-shrunk and color-locked for vivid DTG and screen prints.",
      specs: "Fabric: 100% combed cotton 240gsm · Sizes XS–4XL · Colors: 18 stock",
      priceTiers: [
        { qty: 50, price: 6.8 },
        { qty: 200, price: 5.4 },
        { qty: 1000, price: 4.2 },
      ],
      image: "photo-1521572163474-6864f9cf17ab",
    },
    {
      name: "Oversized French Terry Hoodie",
      slug: "oversized-french-terry-hoodie",
      category: "hoodies",
      moq: 50,
      description:
        "400gsm brushed French terry with double-needle stitching, kangaroo pocket, and matching flat drawcords. A street-ready blank for premium drops.",
      specs: "Fabric: 80/20 cotton-poly 400gsm · Sizes S–3XL · Colors: 12 stock",
      priceTiers: [
        { qty: 50, price: 17.5 },
        { qty: 200, price: 14.2 },
        { qty: 1000, price: 11.8 },
      ],
      image: "photo-1556821840-3a63f95609a7",
    },
    {
      name: "Structured 6-Panel Dad Cap",
      slug: "structured-6-panel-dad-cap",
      category: "caps",
      moq: 100,
      description:
        "Mid-profile brushed cotton twill cap with antique brass buckle. Ideal for 3D embroidery and woven-label branding.",
      specs: "Material: 100% brushed cotton twill · Adjustable strap · 8 colors",
      priceTiers: [
        { qty: 100, price: 3.9 },
        { qty: 500, price: 3.1 },
        { qty: 2000, price: 2.4 },
      ],
      image: "photo-1588850561407-ed78c282e89b",
    },
    {
      name: "Performance Training Tee",
      slug: "performance-training-tee",
      category: "activewear",
      moq: 100,
      description:
        "Moisture-wicking recycled poly piqué with four-way stretch and anti-odor finish. Built for sublimation printing.",
      specs: "Fabric: 92/8 recycled poly-spandex 160gsm · Sizes XS–3XL",
      priceTiers: [
        { qty: 100, price: 7.2 },
        { qty: 500, price: 5.9 },
        { qty: 2000, price: 4.8 },
      ],
      image: "photo-1581655353564-df123a1eb820",
    },
    {
      name: "Garment-Dyed Vintage Tee",
      slug: "garment-dyed-vintage-tee",
      category: "t-shirts",
      moq: 100,
      description:
        "Pigment garment-dyed for a soft, lived-in hand feel and unique fade. A favorite for heritage and lifestyle brands.",
      specs: "Fabric: 100% ring-spun cotton 190gsm · Garment-dyed · 10 colors",
      priceTiers: [
        { qty: 100, price: 7.6 },
        { qty: 500, price: 6.3 },
        { qty: 2000, price: 5.1 },
      ],
      image: "photo-1576566588028-4147f3842f27",
    },
    {
      name: "Heavy Fleece Zip Hoodie",
      slug: "heavy-fleece-zip-hoodie",
      category: "hoodies",
      moq: 50,
      description:
        "450gsm loop-back fleece full-zip with YKK hardware, ribbed cuffs, and a clean two-piece hood for embroidery.",
      specs: "Fabric: 100% cotton fleece 450gsm · YKK zip · Sizes S–3XL",
      priceTiers: [
        { qty: 50, price: 21.0 },
        { qty: 200, price: 17.4 },
        { qty: 1000, price: 14.0 },
      ],
      image: "photo-1620799140408-edc6dcb6d633",
    },
  ];

  let sort = 0;
  for (const p of products) {
    const created = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        categoryId: catMap[p.category]!,
        description: p.description,
        specs: p.specs,
        moq: p.moq,
        priceTiers: JSON.stringify(p.priceTiers),
        sortOrder: sort++,
        status: "published",
      },
    });
    await prisma.productImage.createMany({
      data: [
        { productId: created.id, url: img(p.image), altText: p.name, isPrimary: true, sortOrder: 0 },
        { productId: created.id, url: img(p.image, 1200), altText: `${p.name} detail`, sortOrder: 1 },
      ],
    });
  }

  // ---- Cases ----
  const cases = [
    {
      title: "Berlin Streetwear Label — 5,000pc Drop",
      slug: "berlin-streetwear-drop",
      industry: "Streetwear / Fashion",
      region: "Germany",
      description:
        "Partnered on a four-style capsule (heavyweight tees + fleece hoodies) with custom woven labels and recycled poly mailers. Delivered in 28 days.",
      testimonial: "Minty matched our sample within two rounds and held quality across 5,000 units. — Founder, Berlin",
      cover: "photo-1441984904996-e0b6ba687e04",
    },
    {
      title: "US Fitness Brand — Sublimated Activewear",
      slug: "us-fitness-activewear",
      industry: "Sports & Fitness",
      region: "United States",
      description:
        "All-over sublimation training tees and shorts with private-label hangtags. Repeat program now at 2,000pc/month.",
      testimonial: "Consistent fabric and fast reorders. They feel like an extension of our team. — Ops Lead",
      cover: "photo-1517836357463-d25dfeac3438",
    },
    {
      title: "AU Lifestyle Startup — Garment-Dyed Capsule",
      slug: "au-lifestyle-capsule",
      industry: "Lifestyle / DTC",
      region: "Australia",
      description:
        "Low-MOQ launch collection of garment-dyed tees in six earth tones, with embroidered chest logo and custom neck print.",
      testimonial: "Flexible MOQ let us test the market without overcommitting. — Co-founder",
      cover: "photo-1489987707025-afc232f7ea0f",
    },
  ];
  let csort = 0;
  for (const c of cases) {
    const created = await prisma.case.create({
      data: {
        title: c.title,
        slug: c.slug,
        industry: c.industry,
        region: c.region,
        description: c.description,
        testimonial: c.testimonial,
        status: "published",
        sortOrder: csort++,
      },
    });
    await prisma.caseImage.createMany({
      data: [
        { caseId: created.id, type: "cover", url: img(c.cover), caption: c.title, sortOrder: 0 },
        { caseId: created.id, type: "result", url: img(c.cover, 1200), caption: "Finished goods", sortOrder: 1 },
      ],
    });
  }

  // ---- Factory ----
  await prisma.factoryInfo.create({
    data: {
      description:
        "A vertically-integrated 12,000m² facility combining cut-and-sew, DTG, screen printing, sublimation, and embroidery under one roof. In-house QC at every stage keeps defect rates below 1.5%.",
      monthlyCapacity: 300000,
      equipmentCount: 420,
      employeeCount: 260,
    },
  });
  await prisma.factoryImage.createMany({
    data: [
      { type: "panorama", url: img("photo-1581094794329-c8112a89af12"), caption: "Production floor", sortOrder: 0 },
      { type: "production", url: img("photo-1565793298595-6a879b1d9492"), caption: "Sewing line", sortOrder: 1 },
      { type: "warehouse", url: img("photo-1553413077-190dd305871c"), caption: "Finished goods warehouse", sortOrder: 2 },
      { type: "quality", url: img("photo-1560472354-b33ff0c44a43"), caption: "QC inspection", sortOrder: 3 },
    ],
  });
  await prisma.factoryCertification.createMany({
    data: [
      { name: "ISO 9001:2015", issuedDate: new Date("2023-01-15") },
      { name: "OEKO-TEX Standard 100", issuedDate: new Date("2024-03-10") },
      { name: "BSCI Audited", issuedDate: new Date("2024-06-01") },
    ],
  });

  // ---- Brand ----
  await prisma.brandContent.create({
    data: {
      story:
        "Minty was founded to give growing brands factory-direct access to premium custom apparel — without the bloated MOQs and slow lead times of legacy manufacturing. We bridge design and production with transparent pricing and a team that actually replies.",
      videoUrl: "https://www.youtube.com/embed/ScMzIvxBSi4",
    },
  });

  // ---- Home modules ----
  await prisma.homeModule.create({
    data: {
      moduleType: "hero",
      sortOrder: 0,
      content: JSON.stringify({
        slogan: "Custom Apparel, Factory-Direct",
        subtitle:
          "Premium Print-On-Demand manufacturing for global brands. Flexible MOQ · Worldwide shipping · Full customization.",
        primaryCta: { label: "Get a Quote", href: "/contact" },
        secondaryCta: { label: "View Products", href: "/products" },
        bgImage: img("photo-1489987707025-afc232f7ea0f", 1600),
      }),
    },
  });
  await prisma.homeModule.create({
    data: {
      moduleType: "advantages",
      sortOrder: 1,
      content: JSON.stringify([
        { icon: "Factory", title: "Own Factory", desc: "Vertically integrated 12,000m² facility — no middlemen." },
        { icon: "Layers", title: "Flexible MOQ", desc: "Start from 50 pcs and scale to 100k+ with tiered pricing." },
        { icon: "Globe", title: "Global Shipping", desc: "Door-to-door logistics to 60+ countries." },
        { icon: "Sparkles", title: "Full POD", desc: "DTG, screen, sublimation, embroidery, private label." },
      ]),
    },
  });

  // ---- A couple of demo inquiries (so the funnel isn't empty) ----
  const tee = await prisma.product.findFirst({ where: { slug: "premium-heavyweight-cotton-tee" } });
  const cust = await prisma.customer.create({
    data: {
      email: "buyer@examplebrand.com",
      name: "Jordan Lee",
      company: "Example Brand Co.",
      country: "United States",
      sourceChannel: "/products/premium-heavyweight-cotton-tee",
      status: "contacted",
    },
  });
  await prisma.inquiry.create({
    data: {
      customerId: cust.id,
      productId: tee?.id,
      name: "Jordan Lee",
      email: "buyer@examplebrand.com",
      company: "Example Brand Co.",
      country: "United States",
      interestedProducts: JSON.stringify(["T-Shirts", "POD Customization"]),
      estimatedQuantity: "500-1000",
      message: "Interested in heavyweight tees with custom neck label. Can you send a sample pack?",
      sourcePage: "/products/premium-heavyweight-cotton-tee",
      status: "replied",
    },
  });

  console.log("✓ Seed complete.");
  console.log("  Admin login (for later milestones): admin@minty.dev / minty1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
