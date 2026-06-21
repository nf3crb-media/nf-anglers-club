import { createServiceClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const member_id = searchParams.get("member_id");

    if (!member_id) {
      return Response.json({ ok: false, msg: "member_id wajib." }, { status: 400 });
    }

    const supabase = createServiceClient();

    const [{ data: member }, { data: poinLog }, { data: fishCards }] =
      await Promise.all([
        supabase.from("member").select("*").eq("id", member_id).single(),
        supabase
          .from("poin_log")
          .select("*")
          .eq("member_id", member_id)
          .order("dibuat_at", { ascending: false })
          .limit(20),
        supabase
          .from("fish_card")
          .select("*")
          .eq("member_id", member_id)
          .eq("status", "tayang")
          .order("dibuat_at", { ascending: false }),
      ]);

    if (!member) {
      return Response.json({ ok: false, msg: "Member tidak ditemukan." }, { status: 404 });
    }

    return Response.json({
      ok: true,
      member,
      poin_log: poinLog || [],
      fish_cards: fishCards || [],
    });
  } catch (err) {
    console.error("[api/profil]", err);
    return Response.json({ ok: false, msg: "Gagal memuat profil." }, { status: 500 });
  }
}
