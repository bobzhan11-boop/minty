# Minty — Local Setup

Minty is a custom **bag & leather-goods** manufacturer site (Next.js 14 + Prisma/SQLite).

> **Where is the app?** After cloning `bobzhan11-boop/minty`, the Next.js app lives a few
> folders deep. `cd` into `外贸前端获客/minty/minty/` (the folder that contains
> `package.json`) and run **all** commands from there.

## 1. Prerequisites
- Node.js 18+ and npm

## 2. Install
```bash
cd 外贸前端获客/minty/minty
npm install
```

## 3. Environment file (`.env`)

`.env` is **gitignored** (it holds secrets), so it is **not** in the repo — every machine
needs its own. Create it from the template:

```bash
cp .env.example .env
```

Then fill in the values:

| Key | What to put |
| --- | --- |
| `DATABASE_URL` | `file:./dev.db` |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` (or the real domain in production) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp number, digits only, no `+` (optional) |
| `JWT_SECRET` | any long random string |
| `INQUIRY_NOTIFY_EMAIL` | where order/inquiry emails are sent, e.g. `632500252@qq.com` |
| `SMTP_HOST` | `smtp.qq.com` |
| `SMTP_PORT` | `465` |
| `SMTP_USER` | the sending mailbox, e.g. `632500252@qq.com` |
| `SMTP_PASS` | **QQ authorization code** (16 chars) — see below. **Not** your login password. |
| `SMTP_FROM` | `Minty Inquiries <632500252@qq.com>` (optional; defaults to `SMTP_USER`) |
| `RESEND_API_KEY` | leave empty (only if you use Resend instead of SMTP) |

**Order emails need `SMTP_USER` + `SMTP_PASS`.** Without them, inquiries are still saved to
the database but no email is sent (it just logs to the console).

### Getting the QQ authorization code
1. Log into <https://mail.qq.com> with the sending account.
2. **设置 (Settings) → 账户 (Account)**.
3. Find **"POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV 服务"** and enable **IMAP/SMTP 服务**
   (it asks you to send a verification SMS).
4. It generates a **16-character 授权码 (authorization code)** — that is `SMTP_PASS`.

The code is account-level: the **same** code works on any machine (each teammate's laptop,
production, etc.).

> Restart `npm run dev` after any change to `.env` — Next.js only reads env vars at startup.

## 4. Database + seed

Product photos, customer logos, and the bag/belt catalogs are committed, so seeding runs
fully offline.

```bash
npm run db:push                      # create the SQLite schema (dev.db)
npm run db:seed                      # categories + 96 bags + 46 belts + factory/showcase content
npx tsx prisma/reseed-bag-images.ts  # add the curated multi-angle bag galleries
```

To wipe and start fresh: `npm run db:reset` then re-run the `reseed-bag-images` step.

## 5. Run

```bash
npm run dev        # http://localhost:3000
```

## Testing order emails
- Submit an inquiry from any product page, `/contact`, or `/custom-order`.
- You should receive an email at `INQUIRY_NOTIFY_EMAIL`. **First-time QQ emails frequently
  land in 垃圾邮件 (spam)** — open that folder, mark them "not spam", and whitelist the sender.
- Anti-spam rate limit: **20 inquiry submissions per hour per IP**.

## Notes
- Never commit `.env`.
- For high-volume production email, switch to a transactional provider (Resend / SendGrid)
  with your own verified domain, and set `RESEND_API_KEY`.
- Reusable maintenance scripts live in `prisma/` (image optimization, gallery import, belt
  seed, facet backfill).
