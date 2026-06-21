import { createServiceClient } from "@/lib/supabase-server";
import { requireMember } from "@/lib/session";
import { createCatch } from "@/lib/services/catch";

export const dynamic = "force-dynamic";

const ERR = {
  SPECIES_INVALID: "Spesies ikan tidak valid.",
  WEIGHT_INVALID: "Berat tangkapan tidak valid.",
  DISC_REQUIRED: "Disiplin wajib dipilih.",
};

export async function POST(req) {
  try {
    const auth = await requireMember();
    if (!auth.ok) {
      return Response.json({ ok: false, msg: auth.msg }, { status: auth.status });
    }

    const body = await req.json();
    const supabase = createServiceClient();
    const result = await createCatch(supabase, auth.member.id, body);

    return Response.json({
      ok: true,
      msg: result.needs_review
        ? "Fish Card dibuat — menunggu verifikasi CS sebelum tayang."
        : "Fish Card berhasil dibuat dan masuk feed!",
      ...result,
    });
  } catch (err) {
    const code = err.message;
    if (ERR[code]) {
      return Response.json({ ok: false, code, msg: ERR[code] }, { status: 400 });
    }
    console.error("[api/catch POST]", err);
    return Response.json({ ok: false, msg: "Gagal menyimpan tangkapan." }, { status: 500 });
  }
}
