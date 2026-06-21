import { createServiceClient } from "@/lib/supabase-server";
import { verifyAdminRequest } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const auth = verifyAdminRequest(req);
  if (!auth.ok) {
    return Response.json({ ok: false, msg: auth.msg }, { status: auth.status });
  }

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("tangkapan")
      .select(
        "id, fish, weight, disc, uses_nf, verification_status, status, dibuat_at, photo_url, member:member_id(nama, wa_number), fish_card(id, rarity, serial_number, from_comp)"
      )
      .eq("verification_status", "pending")
      .order("dibuat_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    return Response.json({ ok: true, pending: data || [] });
  } catch (err) {
    console.error("[api/admin/tangkapan GET]", err);
    return Response.json({ ok: false, msg: "Gagal memuat antrian verifikasi." }, { status: 500 });
  }
}
