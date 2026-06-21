import { createServiceClient } from "@/lib/supabase-server";
import { verifyAdminAccess } from "@/lib/admin-auth";
import { addBelanjaPoin, poinFromHarga } from "@/lib/poin";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const auth = await verifyAdminAccess(req);
  if (!auth.ok) {
    return Response.json({ ok: false, msg: auth.msg }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const { member_id, poin, label, produk_harga, cs_id } = body;

    if (!member_id || !label?.trim()) {
      return Response.json(
        { ok: false, msg: "member_id dan label wajib." },
        { status: 400 }
      );
    }

    const poinBelanja = produk_harga
      ? poinFromHarga(Number(produk_harga))
      : Number(poin);

    if (!poinBelanja || poinBelanja < 1) {
      return Response.json(
        { ok: false, msg: "Poin atau nominal belanja tidak valid." },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const result = await addBelanjaPoin(supabase, {
      member_id,
      poin: poinBelanja,
      label: label.trim(),
      cs_id: cs_id || null,
      produk_harga: produk_harga ? Number(produk_harga) : undefined,
    });

    return Response.json({ ok: true, ...result });
  } catch (err) {
    console.error("[api/poin POST]", err);
    return Response.json(
      { ok: false, msg: err.message || "Gagal menambah poin." },
      { status: 500 }
    );
  }
}
