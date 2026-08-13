import { SITE } from "@/lib/constants";

/** Absolute URL for a site-relative path (used in JSON-LD, which needs absolute URLs). */
export function abs(path: string): string {
  return new URL(path, SITE.url).toString();
}

/** Organization structured data for the home page. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    legalName: SITE.company,
    url: SITE.url,
    logo: abs("/products/HJ-BW100001.jpg"),
    description: SITE.description,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Wenzhou",
      addressRegion: "Zhejiang",
      addressCountry: "CN",
    },
  };
}

/** Product structured data for a detail page. Omits Offer (wholesale, contact-for-pricing). */
export function productJsonLd(p: {
  name: string;
  description?: string | null;
  sku?: string | null;
  image?: string | null;
  category?: string;
  moq?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    ...(p.description ? { description: p.description } : {}),
    ...(p.sku ? { sku: p.sku, mpn: p.sku } : {}),
    ...(p.image ? { image: abs(p.image) } : {}),
    ...(p.category ? { category: p.category } : {}),
    brand: { "@type": "Brand", name: SITE.name },
    ...(p.moq
      ? {
          additionalProperty: [
            { "@type": "PropertyValue", name: "Minimum Order Quantity", value: `${p.moq} pcs` },
          ],
        }
      : {}),
  };
}

/** BreadcrumbList structured data mirroring the visible breadcrumb trail. */
export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: abs(t.path),
    })),
  };
}
