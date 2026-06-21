/**
 * Cek story chapter yang sudah/belum di-seed + petunjuk SQL.
 * Usage: node scripts/seed-story.mjs
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
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const SEED_FILES = [
  "supabase/seed/badges.sql",
  "supabase/seed/story_chapter1.sql",
  "supabase/seed/story_chapter2.sql",
  "supabase/seed/story_chapter3.sql",
  "supabase/seed/story_chapter4.sql",
  "supabase/seed/story_chapter5.sql",
  "supabase/seed/story_chapter6.sql",
];

const { data: chapters, error } = await supabase
  .from("story_chapter")
  .select("chapter_number, slug, judul, aktif")
  .order("chapter_number");

if (error) {
  console.error("Query error:", error.message);
  console.log("\nJalankan manual di Supabase SQL Editor (urutan):");
  for (const f of SEED_FILES) console.log(`  ${f}`);
  process.exit(1);
}

console.log("Story chapters di database:");
for (const ch of chapters || []) {
  console.log(`  ✓ Bab ${ch.chapter_number}: ${ch.judul} (${ch.slug})`);
}

const existing = new Set((chapters || []).map((c) => c.chapter_number));
const expected = [1, 2, 3, 4, 5, 6];
const missing = expected.filter((n) => !existing.has(n));

if (missing.length === 0) {
  console.log("\n✓ Semua bab 1–6 sudah di-seed.");
} else {
  console.log(`\n✗ Belum di-seed: Bab ${missing.join(", ")}`);
  console.log("\nJalankan di Supabase SQL Editor:");
  if (missing.some((n) => n >= 1)) console.log("  supabase/seed/badges.sql");
  for (const n of missing) {
    console.log(`  supabase/seed/story_chapter${n}.sql`);
  }
}

const { data: rewards } = await supabase
  .from("reward_catalog")
  .select("slug, nama, cost_poin")
  .eq("aktif", true);

if (!rewards?.length) {
  console.log("\n✗ reward_catalog kosong — jalankan:");
  console.log("  supabase/migrations/005_rewards.sql");
  console.log("  supabase/seed/rewards.sql");
} else {
  console.log(`\n✓ ${rewards.length} hadiah tukar poin aktif.`);
}
