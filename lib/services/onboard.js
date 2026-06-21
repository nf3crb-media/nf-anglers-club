import { isSuperAdminEmail } from "@/lib/env";
import { isWaVerifiedForOnboard } from "@/lib/services/wa-otp";

const WELCOME_POIN = 200;

export function normalizeWa(wa) {
  return wa.replace(/\D/g, "").replace(/^0/, "62").replace(/^8/, "628");
}

export async function onboardMember(supabase, user) {
  const email = user.email?.trim().toLowerCase();
  const meta = user.user_metadata || {};
  const superAdmin = isSuperAdminEmail(email);

  const { data: existing } = await supabase
    .from("member")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) {
    const patch = {
      email,
      last_active: new Date().toISOString(),
    };
    if (superAdmin) {
      patch.is_admin = true;
      patch.is_cs = true;
    }
    const { data: updated, error } = await supabase
      .from("member")
      .update(patch)
      .eq("id", user.id)
      .select()
      .single();
    if (error) throw error;
    return { member: updated, welcome_bonus: 0, is_new: false };
  }

  const kode = meta.kode?.toUpperCase?.()?.trim();
  const waNorm = meta.wa_number ? normalizeWa(String(meta.wa_number)) : null;
  const nama = meta.nama?.trim();

  if (!kode || !waNorm || !nama) {
    throw new Error("SIGNUP_INCOMPLETE");
  }

  const { data: kodeData, error: kodeErr } = await supabase
    .from("kode_unik")
    .select("*")
    .eq("kode", kode)
    .eq("status", "belum_dipakai")
    .single();

  if (kodeErr || !kodeData) {
    throw new Error("KODE_INVALID");
  }

  const { data: waTaken } = await supabase
    .from("member")
    .select("id")
    .eq("wa_number", waNorm)
    .maybeSingle();

  if (waTaken && waTaken.id !== user.id) {
    throw new Error("WA_TAKEN");
  }

  const waVerified = await isWaVerifiedForOnboard(supabase, waNorm);
  if (!waVerified) {
    throw new Error("WA_NOT_VERIFIED");
  }

  const { data: member, error: memberErr } = await supabase
    .from("member")
    .insert({
      id: user.id,
      email,
      wa_number: waNorm,
      nama,
      customer_tier: "Bronze",
      tier: "Bronze",
      poin_belanja: WELCOME_POIN,
      wa_verified: true,
      is_admin: superAdmin,
      is_cs: superAdmin,
      status: "active",
    })
    .select()
    .single();

  if (memberErr) throw memberErr;

  const { error: kodeUpdErr } = await supabase
    .from("kode_unik")
    .update({
      status: "terpakai",
      dipakai_oleh: user.id,
      dipakai_at: new Date().toISOString(),
    })
    .eq("id", kodeData.id)
    .eq("status", "belum_dipakai");

  if (kodeUpdErr) throw kodeUpdErr;

  await supabase.from("poin_log").insert({
    member_id: user.id,
    jenis: "belanja",
    label: `Kode perdana: ${kodeData.produk || kode}`,
    poin: WELCOME_POIN,
    oleh: "Sistem",
  });

  await supabase.from("member_game_progress").upsert(
    { member_id: user.id },
    { onConflict: "member_id" }
  ).then(({ error }) => {
    if (error) console.warn("[onboard] member_game_progress:", error.message);
  });

  return { member, welcome_bonus: WELCOME_POIN, is_new: true };
}
