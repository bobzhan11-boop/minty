// Customer-facing factory profile.
//
// Source of truth: the documents in `/factory information` on the repo —
//   - ICS / ITC online Factory Profile (Pingyang Jinweilong Leather Product Co., Ltd)
//   - amfori-BSCI monitoring summary (SGS, ID 25-0332989)
//   - SMETA audit (ZAA600177686)
//
// Keep these facts in sync with those documents.

/** Regions we currently ship to. (Areas, not individual countries.) */
export const FACTORY_AREAS: { name: string; note?: string }[] = [
  { name: "Europe", note: "Long-term retail brand partners" },
  { name: "North America" },
  { name: "South Asia" },
  { name: "Japan" },
];

/**
 * Materials we manufacture in. Intentionally left blank for now —
 * populate from the factory documents when ready.
 */
export const FACTORY_MATERIALS: { name: string; note?: string }[] = [];

/** Audits & certifications — our independent proof of quality and compliance. */
export const FACTORY_CREDENTIALS: { name: string; detail: string }[] = [
  { name: "amfori BSCI", detail: "Full social audit by SGS — valid to Aug 2026" },
  { name: "SMETA", detail: "Sedex Members Ethical Trade Audit" },
  { name: "ICS Audited", detail: "Initiative for Compliance & Sustainability" },
];

/** Global retail brands that source from our factory. */
export const FACTORY_TRUSTED_BY: string[] = ["C&A", "TAKKO", "Tally Weijl"];

/** Headline facts that show our scale and track record. */
export const FACTORY_FACTS: { value: string; label: string }[] = [
  { value: "Since 2005", label: "20 years of manufacturing" },
  { value: "3M+ pcs / yr", label: "annual production capacity" },
  { value: "16 steps", label: "fully in-house production" },
  { value: "3", label: "global retail brands served" },
];
