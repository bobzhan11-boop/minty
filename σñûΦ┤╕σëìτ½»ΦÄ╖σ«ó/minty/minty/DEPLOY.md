# Deploying Minty to Vercel + Turso (free)

The app is a Next.js 14 server app with a database, so it runs on **Vercel** (which
deploys from your GitHub repo) using **Turso** (a free, SQLite-compatible cloud database).
Local dev keeps using the local `dev.db` file — nothing changes there.

You do this **once**. After that, every `git push` to the branch auto-deploys.

---

## Part A — Create the cloud database (Turso)

You'll upload your already-seeded local database, so no re-seeding is needed.

1. **Install the Turso CLI** (on the machine that has this repo):
   - macOS/Linux/Git-Bash: `curl -sSfL https://get.tur.so/install.sh | bash`
   - Windows (PowerShell): `irm https://get.tur.so/install.ps1 | iex`
   - Then restart the terminal. Docs: <https://docs.turso.tech/cli/installation>

2. **Sign up / log in** (free): `turso auth signup`  (or `turso auth login`)

3. **Create the database from your local file** — run this from the app folder
   (`外贸前端获客/minty/minty`, where `prisma/dev.db` lives):
   ```bash
   turso db create minty --from-file prisma/dev.db
   ```
   *(If your CLI version doesn't have `--from-file`, see the fallback at the bottom.)*

4. **Get the two connection values** (copy them somewhere safe — they are secrets):
   ```bash
   turso db show minty --url            # -> TURSO_DATABASE_URL  (starts with libsql://)
   turso db tokens create minty         # -> TURSO_AUTH_TOKEN    (long token)
   ```

---

## Part B — Deploy on Vercel

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
- **Updating catalog/products later:** change data locally, then re-import to Turso:
  `turso db create minty2 --from-file prisma/dev.db` and swap the env vars, **or** push
  individual changes with `turso db shell minty < changes.sql`.

### Fallback if `turso db create --from-file` isn't available
```bash
# needs the sqlite3 CLI
sqlite3 prisma/dev.db .dump > minty-dump.sql
turso db create minty
turso db shell minty < minty-dump.sql
```
