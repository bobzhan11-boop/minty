// Mia — the apparel concierge. Shared persona + "skills" used by both the
// homepage hero concierge and the floating product-page widget.
//
// Front-end only: keyword-matched canned replies plus a real product-search
// skill backed by GET /api/v1/products?q=…  (no backend AI).

export const CLERK_NAME = "Mia";

/** Poster shown until the digital-human loop plays — also Mia's avatar. */
export const CLERK_POSTER = "/digital-clerk-poster.jpg";

export const WELCOME = `Hi! I'm ${CLERK_NAME}, your apparel concierge. 👋 Ask me anything — or type a keyword (e.g. “hoodie”) to search our products.`;

export const QUICK_REPLIES = [
  "Search hoodies",
  "MOQ & pricing",
  "Request a sample",
  "Shipping & lead time",
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
    return "Pricing depends on the style, fabric and quantity. Tell me the product and your target quantity — or tap “Get a Quote” and our team replies within 6 hours.";
  if (/(moq|minimum|how many|quantity)/.test(t))
    return "Our MOQ is flexible — as low as 50 pcs for many blanks, with better tiers as volume grows. Which style are you looking at?";
  if (/(sample|prototype|proof)/.test(t))
    return "Yes — we make pre-production samples so you approve fit and print before bulk. Share your design or a reference and we'll sample it.";
  if (/(ship|shipping|delivery|lead time|how long)/.test(t))
    return "We ship worldwide with DDP options. Typical lead time is 12–20 days after sample approval.";
  if (/(pod|print|custom|design|embroider|dtg|logo)/.test(t))
    return "We're a Print-On-Demand factory — DTG, screen print, embroidery and more. Upload your artwork on the quote form and we'll handle production end to end.";
  if (/(hoodie|t-?shirt|tee|cap|hat|activewear|apparel|clothing)/.test(t))
    return "Great choice — we produce that in-house with full customization. Want a quick quote, or to browse the catalog first?";
  if (/(hi|hello|hey|good (morning|afternoon|evening))/.test(t))
    return "Hi there! 😊 How can I help with your custom apparel today — or type a keyword to search our products.";
  return "Got it! I'll pass this to our team. For the fastest response, tap “Get a Quote” or chat on WhatsApp — we usually reply within 6 hours. You can also type a keyword to search our catalog.";
}

/** Decide whether a message should trigger a product search (skip greetings/thanks). */
export function looksSearchable(input: string): boolean {
  const s = input.toLowerCase().trim();
  if (s.length < 2) return false;
  if (/^(hi|hello|hey|thanks|thank you|thx|ok|okay|bye|yes|no)\b/.test(s)) return false;
  return true;
}

/** Strip filler words so "show me some hoodies please" → "hoodies". */
function toQuery(input: string): string {
  return input
    .toLowerCase()
    .replace(
      /\b(show|me|some|any|please|i|want|need|looking|for|do|you|have|got|the|a|an|search|find|browse|your|can|get)\b/g,
      " ",
    )
    .replace(/[?!.,]/g, " ")
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
