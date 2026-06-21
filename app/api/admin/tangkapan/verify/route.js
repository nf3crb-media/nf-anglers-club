import { createServiceClient } from "@/lib/supabase-server";
import { verifyAdminAccess } from "@/lib/admin-auth";
import { finalizeCatchApproval, rejectCatch } from "@/lib/services/catch";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const auth = await verifyAdminAccess(req);
  if (!auth.ok) {
    return Response.json({ ok: false, msg: auth.msg }, { status: auth.status });
  }

  try {
    const { tangkapan_id, action, reason, cs_id } = await req.json();

    if (!tangkapan_id || !["approve", "reject"].includes(action)) {
      return Response.json(
        { ok: false, msg: "tangkapan_id dan action (approve/reject) wajib." },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    if (action === "reject") {
      await rejectCatch(supabase, tangkapan_id, reason, cs_id || null);
      return Response.json({ ok: true, msg: "Tangkapan ditolak.", status: "rejected" });
    }

    const result = await finalizeCatchApproval(
      supabase,
      tangkapan_id,
      cs_id || null
    );

    return Response.json({
      ok: true,
      msg: "Tangkapan disetujui dan tayang di feed.",
      status: "verified",
      ...result,
    });
  } catch (err) {
    const code = err.message;
    if (code === "NOT_FOUND") {
      return Response.json({ ok: false, msg: "Tangkapan tidak ditemukan." }, { status: 404 });
    }
    if (code === "ALREADY_VERIFIED" || code === "ALREADY_REJECTED") {
      return Response.json({ ok: false, msg: "Tangkapan sudah diproses." }, { status: 400 });
    }
    console.error("[api/admin/tangkapan/verify]", err);
    return Response.json({ ok: false, msg: "Gagal verifikasi tangkapan." }, { status: 500 });
  }
}
