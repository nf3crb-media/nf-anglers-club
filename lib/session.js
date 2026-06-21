import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase-server";

export async function getAuthUser() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function getMemberById(memberId) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("member")
    .select("*")
    .eq("id", memberId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function requireMember() {
  const user = await getAuthUser();
  if (!user) {
    return { ok: false, status: 401, msg: "Sesi tidak valid." };
  }
  const member = await getMemberById(user.id);
  if (!member) {
    return { ok: false, status: 403, msg: "Profil member belum lengkap." };
  }
  return { ok: true, user, member };
}

export function mapMemberPublic(row) {
  if (!row) return null;
  const poinBelanja = row.poin_belanja ?? 0;
  const poinAktivitas = row.poin_aktivitas ?? 0;
  return {
    id: row.id,
    nama: row.nama,
    email: row.email,
    wa_number: row.wa_number,
    username: row.username,
    tier: row.customer_tier || row.tier || "Bronze",
    customer_tier: row.customer_tier || row.tier || "Bronze",
    poin_belanja: poinBelanja,
    poin_aktivitas: poinAktivitas,
    total_poin: poinBelanja + poinAktivitas,
    total_belanja: row.total_belanja ?? 0,
    kota: row.kota,
    provinsi: row.provinsi,
    is_admin: row.is_admin ?? false,
    is_cs: row.is_cs ?? false,
    wa_verified: row.wa_verified ?? false,
  };
}
