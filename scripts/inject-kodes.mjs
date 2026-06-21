/**
 * One-off: inject kode daftar ke Supabase production/dev (.env.local).
 * Usage: node scripts/inject-kodes.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, "..");

function loadEnvLocal() {
  const raw = readFileSync(join(root, ".env.local"), "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const ROWS = [
  { kode: "NF-SAMP-J21-A", batch: "BATCH-SAMPRIATNA-JUN26", produk: "NF Anglers Club Access" },
  { kode: "NF-SAMP-J21-B", batch: "BATCH-SAMPRIATNA-JUN26", produk: "NF Anglers Club Access" },
  { kode: "NF-FRESH-J21-01", batch: "BATCH-FRESH-JUN26", produk: "NF Anglers Club Access" },
  { kode: "NF-FRESH-J21-02", batch: "BATCH-FRESH-JUN26", produk: "NF Anglers Club Access" },
  { kode: "NF-FRESH-J21-03", batch: "BATCH-FRESH-JUN26", produk: "NF Anglers Club Access" },
];

const { data, error } = await supabase
  .from("kode_unik")
  .upsert(
    ROWS.map((r) => ({ ...r, status: "belum_dipakai" })),
    { onConflict: "kode", ignoreDuplicates: false }
  )
  .select("kode, status");

if (error) {
  // upsert might fail if we need different approach - try insert only
  console.error("Upsert error:", error.message);
  for (const row of ROWS) {
    const { error: insErr } = await supabase.from("kode_unik").insert({
      ...row,
      status: "belum_dipakai",
    });
    if (insErr && !insErr.message.includes("duplicate")) {
      console.error(`Insert ${row.kode}:`, insErr.message);
    } else if (insErr?.message.includes("duplicate")) {
      const { error: updErr } = await supabase
        .from("kode_unik")
        .update({
          status: "belum_dipakai",
          dipakai_oleh: null,
          dipakai_at: null,
          batch: row.batch,
          produk: row.produk,
        })
        .eq("kode", row.kode);
      if (updErr) console.error(`Reset ${row.kode}:`, updErr.message);
      else console.log(`Reset ${row.kode} -> belum_dipakai`);
    } else {
      console.log(`Inserted ${row.kode}`);
    }
  }
} else {
  console.log("Upserted:", data);
}

const check = await supabase
  .from("kode_unik")
  .select("kode, status")
  .in(
    "kode",
    ROWS.map((r) => r.kode)
  );

console.log("\nStatus kode:");
for (const row of check.data || []) {
  console.log(`  ${row.kode}: ${row.status}`);
}

const verify = await supabase
  .from("kode_unik")
  .select("kode")
  .eq("kode", "NF-SAMP-J21-A")
  .eq("status", "belum_dipakai")
  .maybeSingle();

console.log(
  verify.data ? "\n✓ NF-SAMP-J21-A siap dipakai daftar" : "\n✗ NF-SAMP-J21-A masih tidak valid"
);
