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
    const { data: row, error } = await supabase
      .from("kode_unik")
      .select("kode, produk, status, batch")
      .eq("kode", kodeNorm)
      .maybeSingle();

    if (error) throw error;

    if (!row) {
      return Response.json({
        ok: false,
        msg: "Kode tidak ditemukan. Cek penulisan (contoh: NF-SAMP-J21-A).",
      });
    }

    if (row.status !== "belum_dipakai") {
      return Response.json({
        ok: false,
        msg: "Kode sudah dipakai. Minta kode fresh ke admin atau jalankan seed kode_fresh_jun26.sql di Supabase.",
      });
    }

    return Response.json({
      ok: true,
      kode: row.kode,
      produk: row.produk,
      batch: row.batch,
    });
  } catch (err) {
    console.error("[api/kode/check]", err);
    return Response.json({ ok: false, msg: "Gagal memeriksa kode." }, { status: 500 });
  }
}
