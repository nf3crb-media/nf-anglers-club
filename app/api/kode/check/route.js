import { createServiceClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { kode } = await req.json();
    const kodeNorm = kode?.toUpperCase?.()?.trim();

    if (!kodeNorm) {
      return Response.json({ ok: false, msg: "Kode wajib diisi." }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("kode_unik")
      .select("kode, produk, status, batch")
      .eq("kode", kodeNorm)
      .eq("status", "belum_dipakai")
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return Response.json({
        ok: false,
        msg: "Kode tidak valid atau sudah dipakai.",
      });
    }

    return Response.json({
      ok: true,
      kode: data.kode,
      produk: data.produk,
      batch: data.batch,
    });
  } catch (err) {
    console.error("[api/kode/check]", err);
    return Response.json({ ok: false, msg: "Gagal memeriksa kode." }, { status: 500 });
  }
}
