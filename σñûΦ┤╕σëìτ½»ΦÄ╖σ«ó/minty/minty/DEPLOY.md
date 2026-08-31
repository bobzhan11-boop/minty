# Deploying Minty to Vercel + Turso (free)

The app is a Next.js 14 server app with a database, so it runs on **Vercel** (which
deploys from your GitHub repo) using **Turso** (a free, SQLite-compatible cloud database).
Local dev keeps using the local `dev.db` file — nothing changes there.

You do this **once**. After that, every `git push` to the branch auto-deploys.

---

## Part A — Create the cloud database (Turso)

> **Windows note:** Turso ships no native Windows CLI, so we do this from the **web
> dashboard** and then push the local database up with a script — no CLI needed.

1. **Create the database in the browser** (free):
   - Go to <https://turso.tech> and sign up (use your GitHub account).
   - **Create Database** → name it `minty` → pick the region nearest your customers.

2. **Get the two connection values** from the database's page (Overview / "Connect"):
   - **Database URL** — looks like `libsql://minty-<org>.turso.io` → this is `TURSO_DATABASE_URL`
   - **Create Token** (a.k.a. auth token) → this is `TURSO_AUTH_TOKEN`
   Copy both somewhere safe — the token is a secret.

3. **Put them in your local `.env`** (that file is gitignored, so the token never
   reaches GitHub). Add these two lines to `外贸前端获客/minty/minty/.env`:
   ```
   TURSO_DATABASE_URL="libsql://minty-<org>.turso.io"
   TURSO_AUTH_TOKEN="<your token>"
   ```

4. **Push your seeded local database up to Turso** — from the app folder:
   ```bash
   node prisma/push-to-turso.js
   ```
   It recreates the full schema and copies every row (products, images, categories,
   factory/case content…), then verifies the counts match. Safe to re-run anytime you
   change the local catalog and want to refresh production.

---

## Part B — Deploy on Vercel

> **Which branch?** All the current site is on the branch **`feat/seo-search-galleries`**.
> Either merge it into `main` first, or in Vercel set **Settings → Git → Production Branch**
> to `feat/seo-search-galleries` so the live site deploys from it.

1. Go to <https://vercel.com>, sign up **with your GitHub account** (free).
2. **Add New → Project**, and import the repo **`bobzhan11-boop/minty`**.
3. In the import screen, set **Root Directory** to:
   ```
   外贸前端获客/minty/minty
   ```
   (click "Edit" next to Root Directory and pick that folder). Framework should
   auto-detect as **Next.js**. Leave build/output settings as default.
4. Open **Environment Variables** and add these (Production + Preview):

   | Name | Value |
   | --- | --- |
   | `TURSO_DATABASE_URL` | the `libsql://...` url from Part A step 4 |
   | `TURSO_AUTH_TOKEN` | the token from Part A step 4 |
   | `JWT_SECRET` | any long random string |
   | `INQUIRY_NOTIFY_EMAIL` | `632500252@qq.com` |
   | `SMTP_HOST` | `smtp.qq.com` |
   | `SMTP_PORT` | `465` |
   | `SMTP_USER` | `632500252@qq.com` |
   | `SMTP_PASS` | your QQ 16-char authorization code |
   | `SMTP_FROM` | `Minty Inquiries <632500252@qq.com>` |
   | `NEXT_PUBLIC_WHATSAPP_NUMBER` | your WhatsApp number (digits only), optional |
   | `NEXT_PUBLIC_SITE_URL` | `https://minty.vercel.app` (put your real Vercel URL after the first deploy) |

5. Click **Deploy**. First build takes a couple of minutes.

6. When it's live, copy your real URL (e.g. `https://minty-xyz.vercel.app`), update the
   **`NEXT_PUBLIC_SITE_URL`** env var to that exact URL, and **Redeploy** once (so page
   titles, canonical tags, and social previews use the right domain).

---

## Part C — Verify

- Open the site → browse products (bags + belts + kids), search, filters, hover galleries.
- Submit an inquiry → you should get an email at `632500252@qq.com` (check 垃圾邮件/spam
  the first time and mark "not spam").

---

## Notes

- **Auto-deploy:** every push to `feat/seo-search-galleries` (or `main`, if you merge)
  triggers a new Vercel deploy automatically.
- **Custom domain later:** Vercel → Project → Settings → Domains → add your domain and
  follow the DNS steps; then set `NEXT_PUBLIC_SITE_URL` to it and redeploy.
- **Secrets:** these live only in Vercel's env settings and your local `.env` — never in git.
- **Updating catalog/products later:** change data locally (re-run seeds / add products),
  then refresh production by running `node prisma/push-to-turso.js` again — it drops and
  recopies everything, and re-verifies the counts.
