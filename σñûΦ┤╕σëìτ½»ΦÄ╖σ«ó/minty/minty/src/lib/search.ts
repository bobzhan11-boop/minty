// Shared product-search query builder.
//
// Turns a free-text query into a Prisma `where` fragment that:
//  - tokenizes on whitespace and strips apostrophes + LIKE wildcards (%, _, \)
//  - singularizes each token ("backpacks" -> "backpack", "clutches" -> "clutch")
//  - drops a redundant trailing "bag"/"bags" token when other tokens exist
//    ("tote bags" -> just "tote")
//  - requires ALL tokens to match (AND) across name/specs/keywords/category
//
// Results can then be relevance-ranked with rankBySearch() so exact name/category
// matches surface above keyword-only hits.
//
// Empty query -> {} (no filter). A query that cleans down to nothing (e.g. "%")
// -> an impossible filter so it returns zero, not everything.

/** Rough English singularizer good enough for bag/product nouns. */
function singularize(t: string): string {
  if (t.length <= 3) return t;
  if (/(ches|shes|sses|xes|zes)$/.test(t)) return t.slice(0, -2); // clutches->clutch, boxes->box
  if (/ies$/.test(t)) return t.slice(0, -3) + "y"; // categories->category
  if (/s$/.test(t) && !/(ss|us|is)$/.test(t)) return t.slice(0, -1); // backpacks->backpack, purses->purse
  return t;
}

/** Split a raw query into cleaned, singularized search tokens. */
export function tokenizeQuery(raw: string | undefined | null): string[] {
  const q = (raw ?? "").trim();
  if (!q) return [];
  let tokens = q
    .toLowerCase()
    .replace(/['’]/g, "")
    .split(/\s+/)
    .map((t) => t.replace(/[%_\\]/g, "")) // strip LIKE metacharacters (search-correctness)
    .map(singularize)
    .filter(Boolean);
  // "tote bag"/"crossbody bags" -> drop the generic trailing bag token
  if (tokens.length > 1 && tokens[tokens.length - 1] === "bag") {
    tokens = tokens.slice(0, -1);
  }
  return tokens;
}

type Where = Record<string, unknown>;

// Hyper-generic tokens that match most of the catalog, plus sales terms that aren't
// product attributes. They're dropped from matching; a query made up ONLY of these
// returns the whole catalog instead of a confusing near-everything or dead-end result
// (e.g. "everyday" -> all, "private label" / "wholesale" -> all, since every item is).
const STOPWORDS = new Set([
  "the", "and", "for", "with", "your", "our", "a", "an", "of", "in", "on", "to",
  "everyday", "premium", "quality", "custom", "wholesale", "bulk", "moq", "oem", "odm",
  "private", "label", "factory", "direct", "new", "bag",
]);

/** Per-token OR clause across the curated, higher-precision fields (not `description`). */
function fieldMatch(tok: string): { OR: Where[] } {
  return {
    OR: [
      { name: { contains: tok } },
      { specs: { contains: tok } },
      { keywords: { contains: tok } },
      { category: { name: { contains: tok } } },
    ],
  };
}

// Query aliases: common misspellings and theme words mapped to terms that actually
// exist in the catalog, so "bakpack" or "unicorn" resolve instead of dead-ending.
const SYNONYMS: Record<string, string[]> = {
  bakpack: ["backpack"], backpck: ["backpack"], bacpack: ["backpack"], bckpack: ["backpack"],
  crossbdy: ["crossbody"], crosbody: ["crossbody"], crossbdoy: ["crossbody"],
  hanbag: ["handbag"], handbg: ["handbag"], rucksack: ["backpack"],
  purse: ["clutch", "handbag"], pouch: ["coin", "cosmetic"], fanny: ["belt"], bumbag: ["belt"],
  // whimsical kids themes -> closest real attributes present in the catalog
  unicorn: ["rainbow", "star", "cute"], princess: ["glitter", "pink", "cute"],
  dinosaur: ["cute", "novelty"], butterfly: ["floral", "cute"],
  animal: ["cat", "bear", "fox", "bunny"],
};

/** A token plus any aliases (deduped). */
function expand(tok: string): string[] {
  const aliases = SYNONYMS[tok];
  return aliases ? Array.from(new Set([tok, ...aliases])) : [tok];
}

/** Tokens that carry real search intent (cleaned, singularized, minus stopwords). */
export function meaningfulTokens(raw: string | undefined | null): string[] {
  return tokenizeQuery(raw).filter((t) => !STOPWORDS.has(t));
}

/**
 * Strict search: ALL meaningful tokens must match (AND). `description` is excluded for
 * precision (substring matches in marketing prose caused false positives like "cat" in
 * "delicate"). Empty query -> {} (all); pure garbage e.g. "%" -> impossible filter;
 * only-stopwords e.g. "everyday" -> {} (all).
 */
export function buildSearchWhere(raw: string | undefined | null): Where {
  const original = (raw ?? "").trim();
  if (!original) return {};
  const rawTokens = tokenizeQuery(original);
  if (rawTokens.length === 0) return { id: -1 }; // e.g. "%" cleaned to nothing -> match none
  const tokens = rawTokens.filter((t) => !STOPWORDS.has(t));
  if (tokens.length === 0) return {}; // only generic/sales words -> show everything
  return { AND: tokens.map((tok) => ({ OR: expand(tok).flatMap((v) => fieldMatch(v).OR) })) };
}

/**
 * Loose fallback: ANY meaningful token may match (OR). Used when the strict AND query
 * returns nothing, so "purple backpack" or "genuine leather" degrade to the closest
 * matches instead of a dead end. Callers should relevance-rank the result.
 */
export function buildSearchWhereLoose(raw: string | undefined | null): Where {
  const tokens = meaningfulTokens(raw);
  if (tokens.length === 0) return {};
  return { OR: tokens.flatMap((tok) => expand(tok).flatMap((v) => fieldMatch(v).OR)) };
}

/** Product shape needed to compute a relevance score. */
export interface Rankable {
  name: string;
  category?: { name: string } | null;
  specs?: string | null;
  keywords?: string | null;
  sortOrder?: number;
}

// Fields scored for relevance, most precise first. A name/category hit outranks a
// keyword-only hit, so generic keyword tags (e.g. "school") no longer bury the
// products that actually *are* that thing.
const RANK_FIELDS: { get: (p: Rankable) => string; weight: number }[] = [
  { get: (p) => p.name, weight: 100 },
  { get: (p) => p.category?.name ?? "", weight: 40 },
  { get: (p) => p.specs ?? "", weight: 15 },
  { get: (p) => p.keywords ?? "", weight: 10 },
];

/** Relevance score of a product for already-tokenized query terms. */
export function scoreProduct(p: Rankable, tokens: string[]): number {
  let score = 0;
  for (const { get, weight } of RANK_FIELDS) {
    const hay = get(p).toLowerCase();
    for (const tok of tokens) {
      if (!hay.includes(tok)) continue;
      score += weight;
      // whole-word match is a stronger signal than a mere substring
      if (new RegExp(`\\b${tok.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(hay)) score += weight;
    }
  }
  return score;
}

/**
 * Sort products by search relevance (desc), then by sortOrder (asc) and original
 * position as stable tiebreakers. No-op when the query is empty.
 */
export function rankBySearch<T extends Rankable>(items: T[], raw: string | undefined | null): T[] {
  const tokens = tokenizeQuery(raw);
  if (tokens.length === 0) return items;
  return items
    .map((p, i) => ({ p, i, s: scoreProduct(p, tokens) }))
    .sort((a, b) => b.s - a.s || (a.p.sortOrder ?? 0) - (b.p.sortOrder ?? 0) || a.i - b.i)
    .map((x) => x.p);
}

// "Did you mean" ------------------------------------------------------------

/** Canonical vocabulary used to suggest a correction for a mistyped query. */
const VOCAB = [
  "backpack", "crossbody", "tote", "handbag", "clutch", "wallet", "satchel", "hobo",
  "shoulder", "baguette", "saddle", "wristlet", "pouch",
  "black", "white", "pink", "red", "blue", "navy", "green", "brown", "beige", "grey", "silver", "gold", "purple",
  "leather", "quilted", "chain", "glitter", "sequin", "floral", "studded", "woven",
  "kids", "girls", "women", "cute", "party", "school", "travel",
];

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
    }
    prev = cur;
  }
  return prev[n];
}

/**
 * Suggest a corrected query when the user's terms are close to (but not) known
 * vocabulary — e.g. "bakpack" -> "backpack". Returns the corrected string, or null.
 */
export function suggestQuery(raw: string | undefined | null): string | null {
  const tokens = tokenizeQuery(raw);
  if (tokens.length === 0) return null;
  let changed = false;
  const fixed = tokens.map((t) => {
    if (t.length < 4 || VOCAB.includes(t) || SYNONYMS[t]) return t; // already resolvable
    let best: string | null = null;
    let bestD = 3;
    for (const w of VOCAB) {
      if (Math.abs(w.length - t.length) > 2) continue;
      const d = levenshtein(t, w);
      if (d < bestD) {
        bestD = d;
        best = w;
      }
    }
    if (best && bestD <= 2) {
      changed = true;
      return best;
    }
    return t;
  });
  return changed ? fixed.join(" ") : null;
}
