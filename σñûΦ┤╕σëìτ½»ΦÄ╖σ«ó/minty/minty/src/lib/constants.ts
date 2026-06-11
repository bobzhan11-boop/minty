export const SITE = {
  name: "Minty Apparel",
  tagline: "Custom Apparel Manufacturer for Global Brands",
  description:
    "Your factory-direct partner for custom Print-On-Demand apparel. Flexible MOQ, worldwide shipping, full POD customization.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "8613800000000";

/** Build a WhatsApp click-to-chat URL with a tracking-friendly prefilled text. */
export function whatsappUrl(text?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  if (!text) return base;
  return `${base}?text=${encodeURIComponent(text)}`;
}

export const NAV_LINKS = [
  { href: "/products", label: "Products" },
  { href: "/custom-order", label: "Custom POD" },
  { href: "/about", label: "Factory" },
  { href: "/showcase", label: "Showcase" },
  { href: "/contact", label: "Contact" },
];

/** Interest tags offered on the inquiry form. */
export const INTEREST_OPTIONS = [
  "T-Shirts",
  "Hoodies",
  "Caps & Hats",
  "Activewear",
  "POD Customization",
  "Private Label",
  "Bulk Wholesale",
];
