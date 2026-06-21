import { createServiceClient } from "@/lib/supabase-server";
import { verifyAdminRequest } from "@/lib/admin-auth";
import {
  addAktivitasPoin,
  bumpLegenda,
  POIN_STRIKE_NF,
  POIN_STRIKE_NON_NF,
} from "@/lib/poin";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const auth = verifyAdminRequest(req);
  if (!auth.ok) {
    return Response.json({ ok: false, msg: auth.msg }, { status: auth.status });
  }

  try {
    const { strike_id, action, cs_id } = await req.json();

    if (!strike_id || !["approve", "reject"].includes(action)) {
      return Response.json(
        { ok: false, msg: "strike_id dan action (approve/reject) wajib." },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const { data: strike, error: fetchErr } = await supabase
      .from("strike_juara")
      .select("*")
      .eq("id", strike_id)
      .single();

    if (fetchErr || !strike) {
      return Response.json(
        { ok: false, msg: "Strike tidak ditemukan." },
        { status: 404 }
      );
    }

    if (strike.status === "verified" || strike.verified) {
      return Response.json(
        { ok: false, msg: "Strike sudah diverifikasi." },
        { status: 400 }
      );
    }

    if (strike.status === "rejected") {
      return Response.json(
        { ok: false, msg: "Strike sudah ditolak." },
        { status: 400 }
      );
    }

    if (action === "reject") {
      const { error } = await supabase
        .from("strike_juara")
        .update({
          status: "rejected",
          verified: false,
          verified_at: new Date().toISOString(),
        })
        .eq("id", strike_id);

      if (error) throw error;

      return Response.json({
        ok: true,
        msg: "Strike ditolak.",
        status: "rejected",
      });
    }

    const poinAward =
      strike.uses_nf ? POIN_STRIKE_NF : POIN_STRIKE_NON_NF;

    const { error: updErr } = await supabase
      .from("strike_juara")
      .update({
        status: "verified",
        verified: true,
        verified_at: new Date().toISOString(),
        poin_awarded: poinAward,
      })
      .eq("id", strike_id);

    if (updErr) throw updErr;

    await addAktivitasPoin(supabase, {
      member_id: strike.member_id,
      poin: poinAward,
      label: `Strike Juara: ${strike.event_name}`,
      cs_id: cs_id || null,
    });

    await bumpLegenda(supabase, strike.member_id, poinAward);

    return Response.json({
      ok: true,
      msg: `Strike disetujui. +${poinAward} poin aktivitas.`,
      poin_awarded: poinAward,
      status: "verified",
    });
  } catch (err) {
    console.error("[api/strike/verify]", err);
    return Response.json(
      { ok: false, msg: "Gagal verifikasi strike." },
      { status: 500 }
    );
  }
}
