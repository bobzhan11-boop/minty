// Copy the local prisma/dev.db into a Turso database WITHOUT the Turso CLI
// (Turso ships no native Windows binary). Recreates the full schema + all data
// over the libSQL network protocol. Safe to re-run (drops + recreates tables).
//
// Provide credentials in .env (gitignored) OR as environment variables:
//   TURSO_DATABASE_URL="libsql://<your-db>-<org>.turso.io"
//   TURSO_AUTH_TOKEN="<token>"
// Then, from the app folder:  node prisma/push-to-turso.js
const fs = require("fs");
const path = require("path");
const { createClient } = require("@libsql/client");

function loadCreds() {
  const out = { url: process.env.TURSO_DATABASE_URL, token: process.env.TURSO_AUTH_TOKEN };
  const envPath = path.join(process.cwd(), ".env");
  if ((!out.url || !out.token) && fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (!m) continue;
      const k = m[1];
      const v = m[2].replace(/^["']|["']$/g, "");
      if (k === "TURSO_DATABASE_URL" && !out.url) out.url = v;
      if (k === "TURSO_AUTH_TOKEN" && !out.token) out.token = v;
    }
  }
  return out;
}

// parents before children, so data inserts satisfy foreign keys even if enforced
const ORDER = [
  "users", "customers", "customer_tags", "customer_tag_relations", "customer_notes",
  "product_categories", "products", "product_images", "product_videos",
  "cases", "case_images",
  "factory_info", "factory_images", "factory_certifications",
  "brand_content", "home_modules",
  "inquiries", "inquiry_attachments", "inquiry_notes",
  "user_favorites", "user_designs", "tracking_events", "admin_logs",
];
const rank = (name) => { const i = ORDER.indexOf(name); return i === -1 ? 999 : i; };

async function main() {
  const { url, token } = loadCreds();
  if (!url || !token) {
    console.error("Missing TURSO_DATABASE_URL / TURSO_AUTH_TOKEN. Put them in .env or the environment.");
    process.exit(1);
  }
  if (url.startsWith("file:")) {
    console.error("Refusing to run: TURSO_DATABASE_URL points at a local file, not a Turso database.");
    process.exit(1);
  }

  const src = createClient({ url: "file:./prisma/dev.db" });
  const dst = createClient({ url, authToken: token });
  console.log(`Source: local prisma/dev.db\nTarget: ${url}\n`);

  // 1. read schema (skip sqlite internals + prisma's migration bookkeeping)
  const schema = await src.execute(
    "SELECT type, name, sql FROM sqlite_master WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma%'",
  );
  const tables = schema.rows.filter((r) => r.type === "table");
  const indexes = schema.rows.filter((r) => r.type === "index");

  // 2. drop any existing objects (children first) so re-runs start clean
  try { await dst.execute("PRAGMA foreign_keys=OFF"); } catch { /* not fatal */ }
  for (const t of [...tables].sort((a, b) => rank(b.name) - rank(a.name))) {
    await dst.execute(`DROP TABLE IF EXISTS "${t.name}"`);
  }

  // 3. recreate schema
  for (const t of tables) await dst.execute(t.sql);
  for (const ix of indexes) {
    try { await dst.execute(ix.sql); } catch { console.log(`  (index skipped: ${ix.name})`); }
  }
  console.log(`Schema created: ${tables.length} tables, ${indexes.length} indexes\n`);

  // 4. copy data, parents first
  const ordered = [...tables].sort((a, b) => rank(a.name) - rank(b.name));
  let grand = 0;
  for (const t of ordered) {
    const res = await src.execute(`SELECT * FROM "${t.name}"`);
    if (res.rows.length === 0) continue;
    const cols = res.columns;
    const sql = `INSERT INTO "${t.name}" (${cols.map((c) => `"${c}"`).join(", ")}) VALUES (${cols.map(() => "?").join(", ")})`;
    const CHUNK = 100;
    for (let i = 0; i < res.rows.length; i += CHUNK) {
      const stmts = res.rows.slice(i, i + CHUNK).map((row) => ({ sql, args: cols.map((_, j) => row[j]) }));
      await dst.batch(stmts, "write");
    }
    grand += res.rows.length;
    console.log(`  ${t.name}: ${res.rows.length}`);
  }

  // 5. verify counts match
  let ok = true;
  for (const t of ordered) {
    const a = Number((await src.execute(`SELECT COUNT(*) n FROM "${t.name}"`)).rows[0].n);
    const b = Number((await dst.execute(`SELECT COUNT(*) n FROM "${t.name}"`)).rows[0].n);
    if (a !== b) { ok = false; console.log(`  MISMATCH ${t.name}: local ${a} vs turso ${b}`); }
  }
  console.log(ok ? `\n✅ DONE — ${grand} rows copied; every table matches.` : "\n⚠️  Mismatches above — re-run or investigate.");
}
main().catch((e) => { console.error(e); process.exit(1); });
