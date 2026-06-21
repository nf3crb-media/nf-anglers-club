import { createServiceClient } from "@/lib/supabase-server";
import { verifyAdminAccess } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const auth = await verifyAdminAccess(req);
  if (!auth.ok) {
    return Response.json({ ok: false, msg: auth.msg }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();

    const supabase = createServiceClient();
    let query = supabase
      .from("member")
      .select("id, nama, wa_number, username, tier, customer_tier, poin_belanja, poin_aktivitas")
      .order("nama")
      .limit(20);

    if (q) {
      const digits = q.replace(/\D/g, "");
      if (digits.length >= 4) {
        query = query.or(
          `nama.ilike.%${q}%,username.ilike.%${q}%,wa_number.ilike.%${digits}%`
        );
      } else {
        query = query.or(`nama.ilike.%${q}%,username.ilike.%${q}%`);
      }
    } else {
      query = query.limit(10);
    }

    const { data, error } = await query;
    if (error) throw error;

    return Response.json({ ok: true, members: data || [] });
  } catch (err) {
    console.error("[api/admin/members]", err);
    return Response.json(
      { ok: false, msg: "Gagal memuat member." },
      { status: 500 }
    );
  }
}
