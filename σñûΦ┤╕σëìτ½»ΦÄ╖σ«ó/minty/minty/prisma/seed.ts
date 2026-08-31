import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { seedBagCatalog } from "./bag-data";
import { seedBeltCatalog } from "./belt-data";

const prisma = new PrismaClient();

// Stable Unsplash URLs for factory imagery (no binary assets shipped). Product
// and case imagery use the real bag photos in /public/products.
const img = (id: string, w = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;

async function main() {
  console.log("→ Seeding Minty data…");

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
      { name: "OEM客户", color: "#8b5cf6" },
    ],
  });

  // ---- Categories + real bag products (from product-catalog) ----
  const productCount = await seedBagCatalog(prisma);
  console.log(`  loaded ${productCount} bag products`);
  const beltCount = await seedBeltCatalog(prisma);
  console.log(`  loaded ${beltCount} belt products`);

  // ---- Cases (real retail clients; covers use real product photos) ----
  const cases = [
    {
      title: "C&A (Germany) — Seasonal Women's Bag Program",
      slug: "cea-womens-bag-program",
      industry: "Retail Fashion",
      region: "Germany",
      description:
        "Ongoing seasonal program of quilted and PU crossbody bags with custom hardware and private-label branding. Repeat monthly production.",
      testimonial: "Consistent quality across large runs and reliable lead times. — Sourcing, DE",
      cover: "/products/HJ-BW100004.jpg",
    },
    {
      title: "TAKKO Fashion (Germany) — Kids' Bag Collection",
      slug: "takko-kids-bags",
      industry: "Value Retail",
      region: "Germany",
      description:
        "Playful kids' crossbody and coin-purse collection (animal faces, glitter, pom-poms) produced to strict EN71 safety and QC standards.",
      testimonial: "They nailed the fun details while keeping compliance tight. — Buyer, DE",
      cover: "/products/HJ-BK200001.jpg",
    },
    {
      title: "Tally Weijl (France) — Trend Crossbody Drop",
      slug: "tally-weijl-crossbody",
      industry: "Fast Fashion",
      region: "France",
      description:
        "On-trend chain crossbody and mini bags for a fast-fashion capsule, sampled in two rounds and delivered on a tight calendar.",
      testimonial: "Fast sampling and on-trend execution let us hit the season. — Product, FR",
      cover: "/products/HJ-BW100003.jpg",
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
        { caseId: created.id, type: "cover", url: c.cover, caption: c.title, sortOrder: 0 },
        { caseId: created.id, type: "result", url: c.cover, caption: "Finished goods", sortOrder: 1 },
      ],
    });
  }

  // ---- Factory (real: Pingyang Jinweilong Leather / HOKA GROUP) ----
  await prisma.factoryInfo.create({
    data: {
      description:
        "Pingyang Jinweilong Leather Product Co., Ltd (HOKA GROUP) is a vertically-integrated leather-goods factory established in 2005 in Wenzhou, Zhejiang. Cutting, sewing, edge-painting, hardware assembly and QC run under one roof — producing 3M+ bags and belts a year for global retail brands.",
      monthlyCapacity: 250000,
      equipmentCount: 60,
      employeeCount: 30,
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
      { name: "amfori BSCI (SGS, valid to Aug 2026)", issuedDate: new Date("2025-08-29") },
      { name: "SMETA (Sedex)", issuedDate: new Date("2024-06-01") },
      { name: "ICS Audited", issuedDate: new Date("2022-07-04") },
    ],
  });

  // ---- Brand ----
  await prisma.brandContent.create({
    data: {
      story:
        "Minty is the export brand of Pingyang Jinweilong Leather (HOKA GROUP), giving growing brands factory-direct access to premium custom bags — women's and kids' backpacks, crossbody bags, totes, handbags and small leather goods. Two decades of leather-goods manufacturing, transparent pricing, and a team that actually replies.",
      videoUrl: "https://www.youtube.com/embed/ScMzIvxBSi4",
    },
  });

  // ---- Home modules ----
  await prisma.homeModule.create({
    data: {
      moduleType: "hero",
      sortOrder: 0,
      content: JSON.stringify({
        slogan: "Custom Bags & Leather Goods, Factory-Direct",
        subtitle:
          "Women's & kids' bags for global brands. Wholesale MOQ · Worldwide shipping · Full OEM/ODM customization.",
        primaryCta: { label: "Get a Quote", href: "/contact" },
        secondaryCta: { label: "Browse Bags", href: "/products" },
        bgImage: "/products/HJ-BW100001.jpg",
      }),
    },
  });
  await prisma.homeModule.create({
    data: {
      moduleType: "advantages",
      sortOrder: 1,
      content: JSON.stringify([
        { icon: "Factory", title: "Own Factory", desc: "Vertically-integrated leather-goods factory since 2005 — no middlemen." },
        { icon: "Layers", title: "Wholesale MOQ", desc: "From 1,000 pcs per style with better pricing as volume grows." },
        { icon: "Globe", title: "Global Shipping", desc: "DDP door-to-door logistics to Europe, North America, South Asia & Japan." },
        { icon: "Sparkles", title: "Full Customization", desc: "PU & genuine leather, custom hardware, embossing, linings, private label." },
      ]),
    },
  });

  // ---- A demo inquiry (so the funnel isn't empty) ----
  const firstBag = await prisma.product.findFirst({ orderBy: { sortOrder: "asc" } });
  const cust = await prisma.customer.create({
    data: {
      email: "buyer@examplebrand.com",
      name: "Jordan Lee",
      company: "Example Brand Co.",
      country: "United States",
      sourceChannel: firstBag ? `/products/${firstBag.slug}` : "/products",
      status: "contacted",
    },
  });
  await prisma.inquiry.create({
    data: {
      customerId: cust.id,
      productId: firstBag?.id,
      name: "Jordan Lee",
      email: "buyer@examplebrand.com",
      company: "Example Brand Co.",
      country: "United States",
      interestedProducts: JSON.stringify(["Women's Bags", "Private Label / OEM"]),
      estimatedQuantity: "1000-3000",
      message: "Interested in quilted PU crossbody bags with custom hardware and our logo. Can you send a sample?",
      sourcePage: firstBag ? `/products/${firstBag.slug}` : "/products",
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
