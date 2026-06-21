import { createServiceClient } from "@/lib/supabase-server";
import { requireMember, mapMemberPublic } from "@/lib/session";
import { onboardMember } from "@/lib/services/onboard";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireMember();
    if (!auth.ok) {
      return Response.json({ ok: false, msg: auth.msg }, { status: auth.status });
    }
    return Response.json({ ok: true, member: mapMemberPublic(auth.member) });
  } catch (err) {
    console.error("[api/member/me]", err);
    return Response.json({ ok: false, msg: "Gagal memuat profil." }, { status: 500 });
  }
}

/** Sinkronkan member setelah magic link (jika callback belum sempat onboard) */
export async function POST() {
  try {
    const auth = await requireMember();
    if (!auth.ok) {
      return Response.json({ ok: false, msg: auth.msg }, { status: auth.status });
    }

    const service = createServiceClient();
    const result = await onboardMember(service, auth.user);
    return Response.json({
      ok: true,
      member: mapMemberPublic(result.member),
      welcome_bonus: result.welcome_bonus,
      is_new: result.is_new,
    });
  } catch (err) {
    if (err.message === "SIGNUP_INCOMPLETE") {
      return Response.json(
        { ok: false, msg: "Lengkapi pendaftaran dengan kode NF.", code: "SIGNUP_INCOMPLETE" },
        { status: 403 }
      );
    }
    console.error("[api/member/me POST]", err);
    return Response.json({ ok: false, msg: "Gagal sinkron profil." }, { status: 500 });
  }
}
