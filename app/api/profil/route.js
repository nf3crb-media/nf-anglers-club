import { requireMember, mapMemberPublic } from "@/lib/session";
import { createServiceClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireMember();
    if (!auth.ok) {
      return Response.json({ ok: false, msg: auth.msg }, { status: auth.status });
    }

    const supabase = createServiceClient();
    const member_id = auth.member.id;

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

    return Response.json({
      ok: true,
      member: mapMemberPublic(member),
      poin_log: poinLog || [],
      fish_cards: fishCards || [],
    });
  } catch (err) {
    console.error("[api/profil]", err);
    return Response.json({ ok: false, msg: "Gagal memuat profil." }, { status: 500 });
  }
}
