export const SITE = {
  name: "Minty Bags",
  // Kept short so the homepage <title> ("Minty Bags — <tagline>") stays under ~60 chars.
  tagline: "Custom Bag & Leather-Goods Manufacturer",
  // ~155 chars — fits the SERP meta-description window without truncation.
  description:
    "Factory-direct custom handbags, backpacks & leather goods — women's & kids' bags. Wholesale MOQ, worldwide shipping, full OEM & private-label customization.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  /** Real manufacturer behind the brand. */
  company: "Pingyang Jinweilong Leather Product Co., Ltd (HOKA GROUP)",
  addressShort: "Shuitou Town, Pingyang County, Wenzhou, Zhejiang, China",
};

export const WHATSAPP_NUMBER =
  // NOTE: default is the factory's business contact (GM) from the company docs;
  // override with NEXT_PUBLIC_WHATSAPP_NUMBER for the preferred sales line.
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "8613906679122";

/** Build a WhatsApp click-to-chat URL with a tracking-friendly prefilled text. */
export function whatsappUrl(text?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  if (!text) return base;
  return `${base}?text=${encodeURIComponent(text)}`;
}

export const NAV_LINKS = [
  { href: "/products", label: "Bags" },
  { href: "/custom-order", label: "Custom Orders" },
  { href: "/about", label: "Factory" },
  { href: "/showcase", label: "Showcase" },
  { href: "/contact", label: "Contact" },
];

/** Interest tags offered on the inquiry form (bag categories). */
export const INTEREST_OPTIONS = [
  "Women's Bags",
  "Kids' Bags",
  "Backpacks",
  "Crossbody Bags",
  "Tote & Shoulder Bags",
  "Handbags & Clutches",
  "Wallets & Small Leather Goods",
  "Private Label / OEM",
  "Bulk Wholesale",
];
