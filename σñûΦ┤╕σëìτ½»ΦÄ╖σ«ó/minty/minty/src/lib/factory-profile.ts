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

/** Real historical customers (logos in /public/customers), from the company deck. */
export const CUSTOMER_LOGOS: { name: string; src: string }[] = [
  { name: "GAP", src: "/customers/gap.png" },
  { name: "H&M", src: "/customers/hm.png" },
  { name: "Zara", src: "/customers/zara.png" },
  { name: "Mango", src: "/customers/mango.png" },
  { name: "Pull&Bear", src: "/customers/pull-bear.png" },
  { name: "C&A", src: "/customers/cea.png" },
  { name: "Calvin Klein", src: "/customers/calvin-klein.png" },
  { name: "Target", src: "/customers/target.png" },
  { name: "Old Navy", src: "/customers/old-navy.png" },
  { name: "Jack & Jones", src: "/customers/jack-jones.png" },
  { name: "Only", src: "/customers/only.png" },
  { name: "s.Oliver", src: "/customers/s-oliver.png" },
  { name: "Tally Weijl", src: "/customers/tally-weijl.png" },
  { name: "Pieces", src: "/customers/pieces.png" },
  { name: "Esmara", src: "/customers/esmara.png" },
  { name: "Suiteblanco", src: "/customers/suiteblanco.png" },
  { name: "Hering", src: "/customers/hering.png" },
  { name: "Calliope", src: "/customers/calliope.png" },
  { name: "Top Secret", src: "/customers/top-secret.png" },
  { name: "Görtz", src: "/customers/gortz.png" },
  { name: "Terranova", src: "/customers/terranova.png" },
  { name: "Country Road", src: "/customers/country-road.png" },
  { name: "Okaïdi", src: "/customers/okaidi.png" },
  { name: "Orsay", src: "/customers/orsay.png" },
  { name: "HBC", src: "/customers/hbc.png" },
  { name: "Umbro", src: "/customers/umbro.png" },
  { name: "Erke", src: "/customers/erke.png" },
  { name: "FILA", src: "/customers/fila.png" },
  { name: "Anta", src: "/customers/anta.png" },
  { name: "Accessories", src: "/customers/accessories.png" },
];

/** Headline facts that show our scale and track record. */
export const FACTORY_FACTS: { value: string; label: string }[] = [
  { value: "Since 2005", label: "20 years of manufacturing" },
  { value: "3M+ pcs / yr", label: "annual production capacity" },
  { value: "16 steps", label: "fully in-house production" },
  { value: "3", label: "global retail brands served" },
];
