// Mia — the apparel concierge. Shared persona + "skills" used by both the
// homepage hero concierge and the floating product-page widget.
//
// Front-end only: keyword-matched canned replies plus a real product-search
// skill backed by GET /api/v1/products?q=…  (no backend AI).

export const CLERK_NAME = "Mia";

/** Poster shown until the digital-human loop plays — also Mia's avatar. */
export const CLERK_POSTER = "/digital-clerk-poster.jpg";

export const WELCOME = `Hi! I'm ${CLERK_NAME}, your bag concierge. 👋 Ask me anything — or type a keyword (e.g. “backpack”, “crossbody”, “pink”) to search our bags.`;

export const QUICK_REPLIES = [
  "Backpacks",
  "Crossbody bags",
  "Kids' bags",
  "MOQ & pricing",
];

/** A product match returned by Mia's search skill (mirrors /api/v1/products items). */
export interface ProductHit {
  slug: string;
  name: string;
  category: string;
  moq: number;
  image: string | null;
  priceTiers: { qty: number; price: number }[];
}

/** A single chat bubble. May carry product hits when Mia ran a search. */
export interface ChatMessage {
  from: "clerk" | "user";
  text: string;
  products?: ProductHit[];
}

/** Lightweight keyword-matched canned replies — used when no product matched. */
export function getReply(input: string): string {
  const t = input.toLowerCase();
  if (/(price|pricing|cost|quote|quotation)/.test(t))
    return "Pricing depends on the style, material and quantity. Tell me the bag and your target quantity — or tap “Get a Quote” and our team replies within 6 hours.";
  if (/(moq|minimum|how many|quantity|wholesale)/.test(t))
    return "We're a wholesale bag factory — our standard MOQ is 1,000 pcs per style, with better unit pricing as volume grows. Which style are you looking at?";
  if (/(sample|prototype|proof)/.test(t))
    return "Yes — we make pre-production samples so you approve materials, color and hardware before bulk. Share your design or a reference and we'll sample it.";
  if (/(ship|shipping|delivery|lead time|how long)/.test(t))
    return "We ship worldwide with DDP options. Typical lead time is 25–35 days after sample approval.";
  if (/(custom|design|oem|odm|private label|logo|emboss|hardware|material)/.test(t))
    return "We do full custom / OEM & ODM — PU and genuine leather, custom hardware, embossing, linings, zippers and private-label branding. Upload your artwork on the quote form and we'll handle production end to end.";
  if (/(backpack|crossbody|tote|handbag|clutch|purse|wallet|shoulder|bag|leather)/.test(t))
    return "Great choice — we produce that in-house with full customization. Want a quick quote, or to browse the catalog first? Try typing a style like “backpack” or “crossbody”.";
  if (/(hi|hello|hey|good (morning|afternoon|evening))/.test(t))
    return "Hi there! 😊 How can I help with your custom bags today — or type a keyword like “backpack” or “pink” to search our catalog.";
  return "Got it! I'll pass this to our team. For the fastest response, tap “Get a Quote” or chat on WhatsApp — we usually reply within 6 hours. You can also type a keyword (e.g. “crossbody”, “kids”) to search our bags.";
}

/** Decide whether a message should trigger a product search (skip greetings/thanks). */
export function looksSearchable(input: string): boolean {
  const s = input.toLowerCase().trim();
  if (s.length < 2) return false;
  if (/^(hi|hello|hey|thanks|thank you|thx|ok|okay|bye|yes|no)\b/.test(s)) return false;
  return true;
}

/** Strip filler words + punctuation so "show me some backpacks please" → "backpacks".
 * (The API tokenizes/singularizes, so plurals like "backpacks" still match.) */
function toQuery(input: string): string {
  return input
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(
      /\b(show|me|some|any|please|i|want|need|looking|for|do|you|have|got|the|a|an|search|find|browse|your|can|get)\b/g,
      " ",
    )
    .replace(/[?!.,&]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Mia's search skill: query the public product API for keyword matches. */
export async function searchProducts(input: string, limit = 4): Promise<ProductHit[]> {
  const q = toQuery(input) || input.trim();
  if (!q) return [];
  try {
    const res = await fetch(`/api/v1/products?q=${encodeURIComponent(q)}&pageSize=${limit}`);
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: { items?: ProductHit[] } };
    return json?.data?.items ?? [];
  } catch {
    return [];
  }
}

/** Short intro line shown above a set of search hits. */
export function searchReply(input: string, count: number): string {
  const q = toQuery(input) || input.trim();
  if (count === 1) return `Found 1 match for “${q}”. Tap it for details — or tell me your target quantity for a quote.`;
  return `Found ${count} matches for “${q}”. Tap any to view details, or tell me your target quantity for a quote.`;
}
