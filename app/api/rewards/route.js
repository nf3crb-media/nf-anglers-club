import { requireMember } from "@/lib/session";
import { createServiceClient } from "@/lib/supabase-server";
import {
  getMemberRedemptions,
  listActiveRewards,
} from "@/lib/services/reward";
import { rewardScheduleLabel } from "@/lib/reward-utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireMember();
    if (!auth.ok) {
      return Response.json({ ok: false, msg: auth.msg }, { status: auth.status });
    }

    const supabase = createServiceClient();
    const [rewards, redemptions] = await Promise.all([
      listActiveRewards(supabase),
      getMemberRedemptions(supabase, auth.member.id),
    ]);

    const member = auth.member;
    const total_poin =
      (member.poin_belanja ?? 0) + (member.poin_aktivitas ?? 0);

    return Response.json({
      ok: true,
      rewards: rewards.map((r) => ({
        ...r,
        schedule_label: rewardScheduleLabel(r),
      })),
      redemptions,
      total_poin,
    });
  } catch (err) {
    console.error("[api/rewards GET]", err);
    return Response.json({ ok: false, msg: "Gagal memuat hadiah." }, { status: 500 });
  }
}
