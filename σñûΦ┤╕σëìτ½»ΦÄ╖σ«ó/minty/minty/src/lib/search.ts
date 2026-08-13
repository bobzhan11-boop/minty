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
  return { AND: tokens.map(fieldMatch) };
}

/**
 * Loose fallback: ANY meaningful token may match (OR). Used when the strict AND query
 * returns nothing, so "purple backpack" or "genuine leather" degrade to the closest
 * matches instead of a dead end. Callers should relevance-rank the result.
 */
export function buildSearchWhereLoose(raw: string | undefined | null): Where {
  const tokens = meaningfulTokens(raw);
  if (tokens.length === 0) return {};
  return { OR: tokens.flatMap((tok) => fieldMatch(tok).OR) };
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
