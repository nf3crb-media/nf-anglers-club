import { requireMember } from "@/lib/session";
import { createServiceClient } from "@/lib/supabase-server";
import { redeemReward } from "@/lib/services/reward";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const auth = await requireMember();
    if (!auth.ok) {
      return Response.json({ ok: false, msg: auth.msg }, { status: auth.status });
    }

    const body = await req.json();
    const reward_slug = body?.reward_slug?.trim();

    if (!reward_slug) {
      return Response.json(
        { ok: false, msg: "reward_slug wajib." },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const result = await redeemReward(supabase, auth.member.id, reward_slug);

    if (!result.ok) {
      return Response.json(
        { ok: false, msg: result.msg },
        { status: result.status || 400 }
      );
    }

    return Response.json(result);
  } catch (err) {
    console.error("[api/rewards/redeem POST]", err);
    return Response.json(
      { ok: false, msg: err.message || "Gagal menukar poin." },
      { status: 500 }
    );
  }
}
