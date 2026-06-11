import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url.replace(/\/$/, "");
  const staticRoutes = ["", "/products", "/custom-order", "/about", "/showcase", "/contact", "/privacy", "/terms"];

  const [products, cases] = await Promise.all([
    prisma.product.findMany({ where: { status: "published" }, select: { slug: true, updatedAt: true } }),
    prisma.case.findMany({ where: { status: "published" }, select: { slug: true, updatedAt: true } }),
  ]);

  return [
    ...staticRoutes.map((r) => ({ url: `${base}${r}`, lastModified: new Date() })),
    ...products.map((p) => ({ url: `${base}/products/${p.slug}`, lastModified: p.updatedAt })),
    ...cases.map((c) => ({ url: `${base}/showcase/${c.slug}`, lastModified: c.updatedAt })),
  ];
}
