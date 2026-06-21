/** Read-only: cek member vs auth.users untuk nomor WA */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
for (const line of readFileSync(join(root, ".env.local"), "utf8").split("\n")) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const i = t.indexOf("=");
  if (i > 0) process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
}

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const wa = "6281286660880";
const { data: members } = await sb
  .from("member")
  .select("id, nama, email, wa_number, is_admin, is_cs, joined_at")
  .or(`wa_number.eq.${wa},wa_number.eq.081286660880`);

console.log("=== MEMBER ===");
for (const m of members || []) {
  const { data: auth } = await sb.auth.admin.getUserById(m.id);
  console.log({
    ...m,
    auth_email: auth?.user?.email ?? null,
    auth_exists: !!auth?.user,
  });
}

if (!members?.length) console.log("(tidak ada member dengan WA ini)");
