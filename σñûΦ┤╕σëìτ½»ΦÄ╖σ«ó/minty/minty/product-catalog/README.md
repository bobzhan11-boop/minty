# Product Catalog — Bags (labeled & keyworded)

Machine-analyzed export of the factory's bag catalog, ready to power product
search on the minty website (Mia search + product pages).

## Source

Extracted from `Downloads/products/产品介绍.xlsx` — the factory's bag & belt
quotation workbook (6 sheets: 女包 women / 童包 kids / 男包 men, each P & Z).
173 rows parsed; 96 product photos were embedded in the workbook (94 usable),
which were classified by vision to generate labels and keywords.

## Files

| File | Use |
| --- | --- |
| `minty-bag-catalog.json` | Full structured catalog (173 records). Load into the site DB / search index. |
| `minty-bag-catalog.csv` | Same data, spreadsheet-friendly (UTF-8 BOM, opens in Excel). For human review/edits. |
| `LABELING-REPORT.md` | Summary: bag-type distribution, top colors, top keywords. |

## Record status

Each record has a `status`:

- **`labeled`** (94) — real product **with a photo**; has full `name`, `bagType`,
  `colors`, `pattern`, `styleTags`, `features`, `occasion`, `description`, and a
  rich `keywords` array (avg ~33 terms) for search.
- **`needs_photo`** (33) — real SKU (women's Z-series + a few P) with **no photo**
  in the Excel; only coarse keywords from category/material/size. Full images
  are in the `女包-*.rar` / `童包-*.rar` libraries — extract to label these fully.
- **`placeholder`** (46) — **dummy template rows** (the entire 男包/men section and
  童包Z), identifiable by sequential fake data (`101%–114% PU`, dims
  `15*5*12.5…12.19`, MOQ `1000…1014`). **Not real products** — excluded from search.

## Fields

`sku` · `category` (women/kids/men) · `series` (P/Z) · `dimensionsCm` ·
`sizeClass` (mini/small/medium/large) · `material` · `moq` · `hasPhoto` ·
`status` · `name` · `bagType` · `primaryColor` · `colors[]` · `pattern` ·
`styleTags[]` · `features[]` · `occasion[]` · `description` · `keywords[]`

## Notes

- Materials are real: `100% PU` (vegan/PU leather), `100% polyester`, `100% cotton`.
- The 94 product images (named `<SKU>.png`) are kept in the analysis working dir
  (`Downloads/_minty_products_work/images/`), not committed here to keep the repo
  light. Wire them in when building the bag product pages.
- Factory price column was empty in the source; `moq` is 1000 for real rows.
