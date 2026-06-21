import { createServiceClient } from "@/lib/supabase-server";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { timeAgo } from "@/lib/time";

export const dynamic = "force-dynamic";

function mapPending(row) {
  const member = row.member || {};
  return {
    id: row.id,
    member_id: row.member_id,
    user: member.nama || "Angler",
    wa: member.wa_number,
    disc: row.disc,
    event: row.event_name,
    fish: row.fish,
    weight: row.weight,
    place: row.place,
    prize: row.prize,
    gear: row.gear,
    uses_nf: row.uses_nf,
    kota: row.kota,
    proof: {
      kolam: !!row.foto_kolam,
      juara: !!row.foto_juara,
      hadiah: !!row.foto_hadiah,
    },
    foto_kolam: row.foto_kolam,
    foto_juara: row.foto_juara,
    foto_hadiah: row.foto_hadiah,
    time: timeAgo(row.dibuat_at),
    status: row.status,
  };
}

export async function GET(req) {
  const auth = verifyAdminRequest(req);
  if (!auth.ok) {
    return Response.json({ ok: false, msg: auth.msg }, { status: auth.status });
  }

  try {
    const supabase = createServiceClient();
    const [{ data: pending }, { data: recentKodes }, { count: memberCount }] =
      await Promise.all([
        supabase
          .from("strike_juara")
          .select("*, member:member_id(nama, wa_number)")
          .eq("status", "pending")
          .order("dibuat_at", { ascending: true }),
        supabase
          .from("kode_unik")
          .select("kode, batch, produk, status, dibuat_at")
          .order("dibuat_at", { ascending: false })
          .limit(15),
        supabase.from("member").select("*", { count: "exact", head: true }),
      ]);

    const unusedKodes = (recentKodes || []).filter(
      (k) => k.status === "belum_dipakai"
    ).length;

    return Response.json({
      ok: true,
      pending_strikes: (pending || []).map(mapPending),
      recent_kodes: recentKodes || [],
      stats: {
        pending_strikes: pending?.length || 0,
        total_members: memberCount ?? 0,
        unused_kodes: unusedKodes,
      },
    });
  } catch (err) {
    console.error("[api/admin/overview]", err);
    return Response.json(
      { ok: false, msg: "Gagal memuat overview." },
      { status: 500 }
    );
  }
}
