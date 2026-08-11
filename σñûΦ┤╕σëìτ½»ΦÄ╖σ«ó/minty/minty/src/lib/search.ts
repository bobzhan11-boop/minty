// Shared product-search query builder.
//
// Turns a free-text query into a Prisma `where` fragment that:
//  - tokenizes on whitespace and strips apostrophes + LIKE wildcards (%, _, \)
//  - singularizes each token ("backpacks" -> "backpack", "clutches" -> "clutch")
//  - drops a redundant trailing "bag"/"bags" token when other tokens exist
//    ("tote bags" -> just "tote")
//  - requires ALL tokens to match (AND) across name/description/specs/keywords/category
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

/** Build the search portion of a Prisma product `where`. */
export function buildSearchWhere(raw: string | undefined | null): Where {
  const original = (raw ?? "").trim();
  if (!original) return {}; // no query -> no filter
  const tokens = tokenizeQuery(original);
  if (tokens.length === 0) return { id: -1 }; // e.g. "%" cleaned to nothing -> match none
  return {
    AND: tokens.map((tok) => ({
      OR: [
        { name: { contains: tok } },
        { description: { contains: tok } },
        { specs: { contains: tok } },
        { keywords: { contains: tok } },
        { category: { name: { contains: tok } } },
      ],
    })),
  };
}
