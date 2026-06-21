import { calcTierFromPoin } from "./tier";

export const POIN_STRIKE_NF = 500;
export const POIN_STRIKE_NON_NF = 75;
export const POIN_PER_RUPIAH = 10000;

export function poinFromHarga(produk_harga) {
  return Math.floor(produk_harga / POIN_PER_RUPIAH);
}

export async function fetchMember(supabase, member_id) {
  const { data, error } = await supabase
    .from("member")
    .select("*")
    .eq("id", member_id)
    .single();
  if (error || !data) throw new Error("Member tidak ditemukan.");
  return data;
}

export async function addBelanjaPoin(
  supabase,
  { member_id, poin, label, cs_id, produk_harga }
) {
  const member = await fetchMember(supabase, member_id);
  const tambah = poin;
  const newBelanja = (member.poin_belanja ?? 0) + tambah;
  const newTotal = newBelanja + (member.poin_aktivitas ?? 0);
  const tier = calcTierFromPoin(newTotal);
  const belanjaTambah = produk_harga ?? tambah * POIN_PER_RUPIAH;

  const { error: logErr } = await supabase.from("poin_log").insert({
    member_id,
    jenis: "belanja",
    label,
    poin: tambah,
    oleh: "CS",
    cs_id: cs_id || null,
  });
  if (logErr) throw logErr;

  const { error: updErr } = await supabase
    .from("member")
    .update({
      poin_belanja: newBelanja,
      tier,
      total_belanja: (member.total_belanja ?? 0) + belanjaTambah,
    })
    .eq("id", member_id);
  if (updErr) throw updErr;

  return { poin_ditambah: tambah, tier, total_poin: newTotal };
}

export async function addAktivitasPoin(
  supabase,
  { member_id, poin, label, cs_id }
) {
  const member = await fetchMember(supabase, member_id);
  const newAktivitas = (member.poin_aktivitas ?? 0) + poin;
  const newTotal = (member.poin_belanja ?? 0) + newAktivitas;
  const tier = calcTierFromPoin(newTotal);

  const { error: logErr } = await supabase.from("poin_log").insert({
    member_id,
    jenis: "aktivitas",
    label,
    poin,
    oleh: cs_id ? "CS" : "Sistem",
    cs_id: cs_id || null,
  });
  if (logErr) throw logErr;

  const { error: updErr } = await supabase
    .from("member")
    .update({ poin_aktivitas: newAktivitas, tier })
    .eq("id", member_id);
  if (updErr) throw updErr;

  return { poin_ditambah: poin, tier, total_poin: newTotal };
}

export async function bumpLegenda(supabase, member_id, poinBonus = 500) {
  const { data: existing } = await supabase
    .from("legenda")
    .select("*")
    .eq("member_id", member_id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("legenda")
      .update({
        gelar_kota: (existing.gelar_kota ?? 0) + 1,
        poin_legenda: (existing.poin_legenda ?? 0) + poinBonus,
        updated_at: new Date().toISOString(),
      })
      .eq("member_id", member_id);
  } else {
    await supabase.from("legenda").insert({
      member_id,
      gelar_kota: 1,
      gelar_provinsi: 0,
      gelar_nasional: 0,
      poin_legenda: poinBonus,
    });
  }
}
