import { createServiceClient } from "@/lib/supabase-server";
import { verifyAdminAccess } from "@/lib/admin-auth";
import {
  createReward,
  deleteReward,
  fulfillRedemption,
  listAllRewards,
  listPendingRedemptions,
  rejectRedemption,
  updateReward,
} from "@/lib/services/reward";
import { rewardScheduleLabel } from "@/lib/reward-utils";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const auth = await verifyAdminAccess(req);
  if (!auth.ok) {
    return Response.json({ ok: false, msg: auth.msg }, { status: auth.status });
  }

  try {
    const supabase = createServiceClient();
    const [rewards, pending] = await Promise.all([
      listAllRewards(supabase),
      listPendingRedemptions(supabase),
    ]);

    return Response.json({
      ok: true,
      rewards: rewards.map((r) => ({
        ...r,
        schedule_label: rewardScheduleLabel(r),
      })),
      pending_redemptions: pending,
    });
  } catch (err) {
    console.error("[api/admin/rewards GET]", err);
    return Response.json({ ok: false, msg: "Gagal memuat hadiah." }, { status: 500 });
  }
}

export async function POST(req) {
  const auth = await verifyAdminAccess(req);
  if (!auth.ok) {
    return Response.json({ ok: false, msg: auth.msg }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const supabase = createServiceClient();
    const result = await createReward(supabase, body);

    if (!result.ok) {
      return Response.json({ ok: false, msg: result.msg }, { status: result.status });
    }

    return Response.json(result);
  } catch (err) {
    console.error("[api/admin/rewards POST]", err);
    return Response.json({ ok: false, msg: "Gagal menambah hadiah." }, { status: 500 });
  }
}

export async function PATCH(req) {
  const auth = await verifyAdminAccess(req);
  if (!auth.ok) {
    return Response.json({ ok: false, msg: auth.msg }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const supabase = createServiceClient();

    if (body.action === "fulfill_redemption") {
      const result = await fulfillRedemption(
        supabase,
        body.redemption_id,
        auth.member_id || null
      );
      if (!result.ok) {
        return Response.json({ ok: false, msg: result.msg }, { status: result.status });
      }
      return Response.json({ ok: true, msg: "Penukaran ditandai selesai." });
    }

    if (body.action === "reject_redemption") {
      const result = await rejectRedemption(supabase, body.redemption_id, {
        csId: auth.member_id || null,
        note: body.note,
      });
      if (!result.ok) {
        return Response.json({ ok: false, msg: result.msg }, { status: result.status });
      }
      return Response.json({
        ok: true,
        msg: `Penukaran ditolak. ${result.refunded} poin dikembalikan ke member.`,
      });
    }

    const result = await updateReward(supabase, body.id, body);
    if (!result.ok) {
      return Response.json({ ok: false, msg: result.msg }, { status: result.status });
    }

    return Response.json(result);
  } catch (err) {
    console.error("[api/admin/rewards PATCH]", err);
    return Response.json({ ok: false, msg: "Gagal memperbarui." }, { status: 500 });
  }
}

export async function DELETE(req) {
  const auth = await verifyAdminAccess(req);
  if (!auth.ok) {
    return Response.json({ ok: false, msg: auth.msg }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const hard = searchParams.get("hard") === "1";

    const supabase = createServiceClient();
    const result = await deleteReward(supabase, id, { hard });

    if (!result.ok) {
      return Response.json({ ok: false, msg: result.msg }, { status: result.status });
    }

    return Response.json({
      ok: true,
      msg: result.deleted ? "Hadiah dihapus." : "Hadiah dinonaktifkan.",
    });
  } catch (err) {
    console.error("[api/admin/rewards DELETE]", err);
    return Response.json({ ok: false, msg: "Gagal menghapus hadiah." }, { status: 500 });
  }
}
