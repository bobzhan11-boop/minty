# Minty — 服装独立站出海 · 一期

Phase-1 build of the apparel POD B2B independent site, implemented from
`服装独立站出海_一期需求开发文档.md`. This pass delivers the **inquiry-driven
funnel end-to-end** (M0 + M1 + M2): a runnable public site with a working
inquiry form → API → database flow, WhatsApp integration, and the self-hosted
event-tracking pipeline.

## Stack

- **Next.js 14** (App Router, SSR/SSG) + **TypeScript**
- **Tailwind CSS** design system (`globals.css` component layer)
- **Prisma ORM** — full ER schema from `架构图_数据库ER.mermaid`
- **SQLite** for local dev (zero-setup). Swap to **PostgreSQL** for production.
- **Zod** validation, in-memory rate limiting, Resend-ready email notifications

## Quick start

```bash
npm install
npm run db:push     # create the SQLite schema (prisma/dev.db)
npm run db:seed     # load demo products, cases, factory, home modules
npm run dev         # http://localhost:3000
```

Production build:

```bash
npm run build && npm start
```

## What works in this pass

| Area | Status |
|------|--------|
| Homepage (hero / advantages / featured / factory / CTA — DB-driven) | ✅ |
| Products list + category filter | ✅ |
| Product detail (gallery, price tiers, prefilled inquiry, WhatsApp CTA) | ✅ |
| POD / Custom Order page | ✅ |
| About & Factory (story, stats, gallery, certifications, YouTube embed) | ✅ |
| Showcase list + case detail | ✅ |
| Contact + inquiry form (validation, success state) | ✅ |
| Inquiry API → customer upsert + inquiry + email notify | ✅ |
| Tracking: `trackEvent()` → GA4 + `POST /api/v1/events` → DB | ✅ |
| WhatsApp float button (fires `whatsapp_click`, no inquiry record per spec) | ✅ |
| SEO: per-page metadata, OG tags, dynamic sitemap, robots | ✅ |
| Rate limiting (5 inquiries/hr/IP), 404 page, privacy/terms | ✅ |
| Reserved marketing endpoints return `501` (§3.5) | ✅ |

## API (implemented subset of §5.2)

| Method | Path | Notes |
|--------|------|-------|
| GET  | `/api/v1/products` | paginated, `?category=&page=&pageSize=` |
| POST | `/api/v1/inquiries` | zod-validated, rate-limited, upserts customer |
| POST | `/api/v1/events` | self-hosted event log (accepts `sendBeacon`) |
| POST | `/api/v1/newsletter/subscribe` | reserved → 501 |
| GET  | `/api/v1/promotions` | reserved → 501 |

Unified response envelope: `{ code, message, data }`.

## Project layout

```
prisma/
  schema.prisma     # full ER (all tables); SQLite-adapted (see notes below)
  seed.ts           # demo data + admin/ops users
src/
  app/              # App Router pages + /api/v1 routes + sitemap/robots
  components/       # navbar, footer, inquiry-form, product-card, tracking, …
  lib/              # prisma, queries, validation, tracking, ratelimit, email
```

## SQLite vs production Postgres

The schema mirrors the ER diagram, with two dev-only adaptations (documented
inline in `schema.prisma`):

- **Enums** → `String` (SQLite has no native enum). Allowed values are noted in
  comments; on Postgres these can become real `enum` types.
- **JSON columns** (`price_tiers`, `home_modules.content`, `interested_products`,
  event `params`, …) → `String` holding JSON. On Postgres → native `Json`.
- **`tracking_events.id`** → `Int` (SQLite can't autoincrement `BigInt`). On
  Postgres → `BigInt`, partitioned by month per §4.2.

To target Postgres: set `provider = "postgresql"` + a Postgres `DATABASE_URL`,
restore the enum/Json/BigInt types, and run `prisma migrate`.

## Configuration (`.env`)

| Var | Purpose |
|-----|---------|
| `DATABASE_URL` | `file:./dev.db` (dev) or Postgres URL |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp click-to-chat number |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | enables gtag.js when set |
| `RESEND_API_KEY` / `INQUIRY_NOTIFY_EMAIL` | inquiry email alerts (logs to console if unset) |
| `JWT_SECRET` | reserved for auth in later milestones |

Seeded admin (for upcoming admin milestones): `admin@minty.dev` / `minty1234`.

## Not in this pass (next milestones)

Per the doc, the following are scoped for later and **not** built yet:
**M3** admin content CMS (`/admin`), **M4** customer CRM + tags + export,
**M5** operations dashboard + charts, user accounts/auth (`/account`),
file/attachment upload to object storage, reCAPTCHA v3. The Prisma schema and
the reserved API surface already account for all of these.
