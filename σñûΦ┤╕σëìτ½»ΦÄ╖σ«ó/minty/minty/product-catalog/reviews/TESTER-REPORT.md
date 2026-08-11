# Website Tester Report — Minty Leather Bags Catalog (Technical QA)

## Executive Summary

The site is **structurally and operationally healthy**: all 9 target pages return HTTP 200 with no error banners, routing/404/redirect handling is correct, all nav and footer links resolve, and the write/read APIs (inquiries, events) are well-validated with a working per-IP rate limit and a consistent `{code,message,data}` envelope. Product **data integrity is strong** — 96/96 images load as genuine high-res photos matching their catalog entries, specs are per-product accurate, and there are no duplicate slugs or image paths.

The problems cluster into two themes:

1. **Pervasive apparel/POD placeholder content on a leather-bags catalog.** Nearly every `<title>`, meta description, the homepage H1, nav labels ("Custom POD"), `/about`, `/showcase`, the 404 title, and the Mia concierge persona still describe "Minty Apparel", "Print-On-Demand", "hoodies/tees/caps". This is user-visible in browser tabs, search snippets, and social shares, and directly contradicts the actual products. The real business is a leather/belt factory (Pingyang Jinweilong / HOKA GROUP).

2. **Search is not usable by humans and is brittle.** The API search is solid, but the `/products` catalog page ignores `?q=` entirely and there is **no search box in the site UI** (only in the Mia chat widget). The concierge itself is broken on first impression: **all four default quick-reply buttons return zero results**, and **plural queries never match** (`backpacks`→0 vs `backpack`→22), silently converting real intent into canned fallbacks.

Two data-vs-copy inconsistencies compound the impression: the **MOQ (1000) is shown on listing cards but dropped from detail pages**, and a **canned Mia reply states MOQ "as low as 50 pcs"** while every product is actually MOQ 1000.

Ratings by area: pages-nav 4/5, product-data 4/5, forms-apis 4/5, search-catalog 3/5, mia-concierge 3/5.

## Issues by Severity

| Sev | Area | Issue | Suggested fix |
|-----|------|-------|---------------|
| **High** | search-catalog | `/products` page ignores `?q=` entirely; no search box anywhere in the site UI (only Mia chat). `?q=fox`, `?q=xyzzy123`, `?q=backpack` all return the identical full ~340KB page (all 96 SKUs). `page.tsx` only reads `searchParams.category`. | Read `searchParams.q` in `ProductsPage`, pass it to the product query, add a visible search input in the catalog header/nav, and render an empty-search state. |
| **High** | mia-concierge | All four default quick-reply buttons return zero product results (`hoodies`→0, `moq & pricing`→0, `request sample`→0, `shipping & lead time`→0). The most prominent guided entry point never surfaces a product; "Search hoodies" also offers to make non-existent hoodies. | Replace `QUICK_REPLIES` with real, singular bag intents ("Search backpacks", "Kids bags", "Crossbody bags") and verify each chip against the API before shipping. |
| **High** | mia-concierge | Plural search terms never match (`backpacks`=0 vs `backpack`=22; `totes`=0/`tote`=8; `purses`=0/`purse`=45; `wallets`=0/`wallet`=1). Most natural user queries silently fall to canned replies. | Singularize query tokens in `toQuery()` (strip trailing s/es) or stem-match in the API; retry with singular form when a plural returns 0 before falling back. |
| **High** | pages-nav | All page `<title>`/`<meta description>` are apparel/POD placeholder (homepage "Minty Apparel — Custom Apparel Manufacturer…"; `/products` mentions "tees, hoodies, caps"; `/privacy`+`/terms` reuse the generic POD description). SEO/branding-visible and contradicts the real products. | Update site-wide metadata (title-template suffix, default description) and per-page metadata to leather-goods copy for the real company; purge "Apparel/Custom Apparel/Print-On-Demand/tees/hoodies/caps". |
| **High** | pages-nav | Homepage hero H1 is "Custom Apparel, Factory-Direct"; body copy mixes apparel and bags (Apparel×25, Print-On-Demand×22, hoodie×14 alongside Bag×24). First-time visitors see an apparel hero on a bag store. | Rewrite hero H1 and homepage sections to lead with leather bags (women's/kids' bags, MOQ 1000, factory-direct); remove hoodie/tee/POD copy. |
| **Medium** | search-catalog | Chinese-language search returns 0 (`女包`/`包`/`儿童`/`背包`/`手提` all total=0) despite a Chinese-factory market; keyword/name/description fields are English-only (not an encoding bug). | Add Chinese keywords/aliases to the product keyword field (at minimum category terms: 女包/童包/背包/手提包/斜挎包/钱包). |
| **Medium** | search-catalog | Unescaped SQL LIKE wildcards: a literal `%` or `_` query matches all 96 products (`%`→96, `_`→96, `a%b`→96). Search-correctness bug, not a security hole (Prisma still parameterizes). | Escape LIKE metacharacters (`%`, `_`, escape char) before passing to Prisma `contains`, or use a raw query with an `ESCAPE` clause. |
| **Medium** | search-catalog | `/products` page copy/metadata still apparel: title "Products — Custom Apparel Catalog", heading "Custom apparel, built for your brand", "premium blanks: tees, hoodies, caps". | Update products page metadata/heading/subtitle to bag-focused copy and sweep remaining apparel/POD strings. |
| **Medium** | product-data | MOQ (1000) is shown on listing cards (96 matches) and returned by the API, but is absent from every product **detail** page (only "Contact for pricing" + specs render). Data/detail-view inconsistency. | Render the product MOQ (e.g. "MOQ: 1,000 units") on the detail page near "Contact for pricing". |
| **Medium** | product-data | Detail-page `<title>` and body still say "Minty Apparel"/POD on bag products ("…Backpack — Minty Apparel", "full POD customization", filter chips "Hoodies/T-Shirts", nav "Custom POD", footer "Minty Apparel"). | Replace Apparel/POD branding site-wide; fix the title template, meta, footer, nav "Custom POD", and Mia/filter chips (Hoodies/T-Shirts → Backpacks/Crossbody/Totes). |
| **Medium** | pages-nav | Nav label "Custom POD" (→`/custom-order`, title "Custom POD — How It Works") is placeholder for a bag factory. | Rename nav item and `/custom-order` title/H1 to a bag-appropriate label (e.g. "Custom Orders"). |
| **Medium** | pages-nav | `/about` and `/showcase` narrative is apparel/streetwear-themed (`/about`: Apparel×17, leather×2; `/showcase`: Apparel/apparel×28, Streetwear×11). | Replace `/about` and `/showcase` narrative and case studies with leather-goods content; verify factory stats (20 years, 12,000m²) are real. |
| **Medium** | mia-concierge | Token "bags" breaks multi-word searches: AND-semantics + no plural match means `tote bags`→0 (vs `tote bag`→8), `backpack bag`→0. | Drop/singularize a trailing "bag/bags" token, or switch multi-word matching to OR/best-effort ranking. |
| **Medium** | mia-concierge | Concierge copy entirely apparel-themed (WELCOME "your apparel concierge … e.g. 'hoodie'", getReply "Print-On-Demand factory — DTG, screen print, embroidery", marquee "tees, hoodies, caps"). Served in SSR HTML. | Rewrite WELCOME, QUICK_REPLIES, getReply branches, marquee, and aria-labels for leather bags (custom PU/leather, embossing, hardware, private label). |
| **Medium** | mia-concierge | MOQ canned reply contradicts real data: says "as low as 50 pcs" while every product is `moq:1000`. Sets wrong buyer expectations. | Update the MOQ reply to the real MOQ (1000 pcs) or read it dynamically. |
| **Medium** | mia-concierge | Accessibility: hover-to-expand with weak keyboard/touch parity (panel `pointer-events-none/opacity-0` until avatar tapped; hero clerk is a `role='button'` div), no `aria-live` on the chat thread, autoplaying video with no reduced-motion guard. | Make click/tap reliably toggle both surfaces; add `role='log' aria-live='polite'` to `MiaThread`; add a `prefers-reduced-motion` guard; make the hero clerk a real `<button>`. |
| **Low** | pages-nav | 404 page reuses the apparel homepage `<title>` ("Minty Apparel — Custom Apparel Manufacturer…") instead of a 404 title. Body content is correct. | Add a dedicated not-found metadata title ("404 — Page Not Found — <brand>"). |
| **Low** | pages-nav | Missing `og:image` and `<link rel="canonical">` on homepage (only og:title/description + twitter:description present). No social preview image; minor SEO gap. | Add a default `og:image` (hero bag photo) and canonical URLs to the metadata config. |
| **Low** | pages-nav | Placeholder WhatsApp number `8613800000000` with apparel prefill text ("interested in custom apparel"), on homepage and `/contact`. | Replace with the real WhatsApp number and bag-appropriate prefill before launch. |
| **Low** | product-data | Detail-page routing is case-sensitive: `/products/hj-bw100001`→200 but `/products/HJ-BW100001`→404, though the on-page SKU label and image path use uppercase. | Lowercase the incoming slug before lookup, or 301-redirect uppercase SKU to the canonical lowercase slug. |
| **Low** | product-data / search-catalog | Keyword search over-inclusive / low precision: `q=school`→46 (incl. non-school bags), `q=cat`→22 (incl. clutch, airplane bag). Noisy results. | Tighten keyword tagging so generic terms only apply to relevant items, or rank exact name/spec matches above keyword-only matches. |
| **Low** | search-catalog | No tokenization: `tote bag`→8 but `tote  bag` (2 spaces)→0; reordered phrases miss. | Split `q` on whitespace into AND-matched tokens, or collapse repeated whitespace. |
| **Low** | search-catalog / product-data | `pageSize` handling: values >50 silently capped at 50 (documented example uses 100, so 46 products are missed without pagination); `pageSize=5.7` echoed unfloored as `5.7` while 5 items returned; `pageSize=0`→default 12. | `Math.floor` the parsed `pageSize`/`page`; either honor larger sizes or clamp-and-document max=50 in the response. |
| **Low** | forms-apis | Wrong-method requests return HTTP 405 with an **empty body**, breaking the `{code,message,data}` envelope (GET `/inquiries`, GET `/newsletter/subscribe`, POST `/promotions`). Not user-facing (UI uses correct verbs). | Add explicit method handlers / a shared 405 wrapper returning `fail(405, "Method Not Allowed")`. |
| **Low** | forms-apis | `POST /api/v1/newsletter/subscribe` is a hardcoded 501 stub; `GET /api/v1/promotions` is a hardcoded 501 stub. Neither is referenced in any UI — genuinely dormant, no user can reach them. | Fine as Phase-2 stubs. If a footer signup is added, implement validation/persistence first; consider `200 {items:[]}` for promotions so future consumers degrade gracefully. |
| **Low** | forms-apis | Inquiry `message` field optional server-side and in the form — consistent, but a lead can submit with zero project detail (low-value CRM records). | Product decision, not a defect: if project detail should be required, add it to both the zod schema and the form's `validate()`. |
| **Low** | mia-concierge | Filler-strip regex corrupts contractions: "I'm looking…" → query `'m looking…` (stray `'m` token) which can zero out matching. | Strip apostrophes/contraction remnants (`['’]`, standalone `'m/'re/'s`) in `toQuery()` before building the query. |

## Notable Positives

**Routing, structure & availability (pages-nav)**
- All 9 pages return HTTP 200; zero error/exception banners across all pages.
- 404 handling correct for bad slug, bad top-level, bad nested, and uppercase slug; the 404 body renders real content (18KB), not a blank error.
- Trailing-slash normalization works (`/products/`→308). All nav+footer internal links and featured product links resolve to 200.
- Category filter links work end-to-end and map correctly (`kids-bags`→"Kids' Bags", `womens-bags`→"Women's Bags").
- Clean structural integrity everywhere: exactly one `<main>`, closing `</html>`, header/nav present; `<html lang="en">`, robots/viewport/charset meta present.

**Search API robustness (search-catalog)**
- Keyword search is relevant and case-insensitive (`Backpack`=`BACKPACK`=`backpack`=22); rich keyword field matches synonyms (`handbag`=42, `purse`=45, `shoulder`=59).
- Empty/whitespace queries fall back to all 96 via `.trim()`; non-existent terms return a clean `200 total=0` (no crash).
- Injection/XSS attempts (`<script>…`, `' OR '1'='1`) return `total=0` — Prisma parameterizes correctly.
- Pagination correct with **no overlap** (55 unique women's-bag IDs across pages, page 4 empty); params robustly clamped (page 0/-5/abc→1, pageSize>50→50).

**Product data integrity (product-data)**
- All 96 images load (HTTP 200, `image/png`, 188KB–2.1MB) — no zero-byte/placeholder files; 3 visually inspected images match their names/spec colors exactly.
- API data uniform: total=96 (55 women's + 41 kids'), all `moq:1000`, all `priceTiers:[]` (consistent with "Contact for pricing"); no duplicate slugs or image paths.
- Detail pages carry accurate per-product specs (e.g. velvet bag correctly shows "100% polyester", not copy-pasted PU leather).

**Forms & APIs (forms-apis)**
- `POST /api/v1/inquiries` validation is robust (field-level zod errors, "Invalid JSON body" on malformed input) and correctly wired to the visible inquiry form, which surfaces server messages gracefully.
- Per-IP rate limit works and is reachable (5/hour → 429), envelope stays consistent even on 429.
- `POST /api/v1/events` works, accepts both `application/json` and `text/plain` (for `sendBeacon`), and is intentionally fail-safe (always 200 so analytics can't break page loads).
- Consistent `{code,message,data}` envelope across all JSON responses via shared `ok()/fail()` helpers.

**Concierge (mia-concierge)**
- Search skill returns real product hits in the exact `ProductHit` shape Mia consumes; hit cards are wired end-to-end (thumbnail 200, detail link 200).
- WhatsApp funnel link is correctly encoded in SSR HTML with `target=_blank rel=noopener noreferrer` and fires `trackEvent`.
- Good baseline a11y touches (aria-labels on send/close/inputs, `aria-expanded` on avatar/clerk, marquee `aria-hidden`); `looksSearchable()` skips greetings and `toQuery()` strips filler words.

## Prioritized Fix List

1. **Purge apparel/POD placeholder content site-wide (metadata + copy).** This is the single highest-impact, cross-cutting issue: page titles, meta descriptions, homepage H1, `/about`, `/showcase`, nav "Custom POD", 404 title, footer, and the Mia persona all still say "Apparel/Print-On-Demand/hoodies". Directly visible in tabs, search snippets, and social; contradicts the actual products. (Resolves multiple High/Medium items across all areas.)
2. **Make search usable by humans.** Wire `?q=` into `/products` (server-side filter + empty state) and add a visible search box in the catalog header/nav. Without this, the strong search API is unreachable by users.
3. **Fix the concierge first-impression + matching.** Replace the four dead quick-reply buttons with real bag intents, and singularize query tokens so plurals ("backpacks", "totes", "tote bags") match. These break the most prominent guided entry point on every visit.
4. **Reconcile MOQ everywhere.** Render MOQ 1000 on detail pages, and correct the Mia "50 pcs" canned reply to 1000 — the data says 1000 in three places but the UI/chatbot contradict it.
5. **Search-correctness hardening.** Escape LIKE `%`/`_` wildcards, add Chinese keyword aliases, tokenize on whitespace, and `Math.floor` `pageSize`/`page` (and reconcile the pageSize=100 vs max=50 contract).
6. **Case-insensitive product slug lookup** (or 301 uppercase→lowercase) so the on-page SKU form resolves.
7. **Launch-blocker data & SEO polish.** Replace the dummy WhatsApp number `8613800000000` and prefill text; add `og:image` + canonical; add a dedicated 404 title.
8. **API envelope consistency (low priority).** Add a shared 405 handler returning `fail(405, …)`; decide the Phase-2 fate of the newsletter/promotions 501 stubs (currently dormant/unreachable).