import { createServiceClient } from "@/lib/supabase-server";
import { verifyAdminAccess } from "@/lib/admin-auth";
import { generateKodeBatch } from "@/lib/kode-generate";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const auth = await verifyAdminAccess(req);
  if (!auth.ok) {
    return Response.json({ ok: false, msg: auth.msg }, { status: auth.status });
  }

  try {
    const { batch, produk, jumlah } = await req.json();
    const count = Math.min(Math.max(parseInt(jumlah, 10) || 10, 1), 500);

    if (!batch?.trim() || !produk?.trim()) {
      return Response.json(
        { ok: false, msg: "Nama batch dan produk wajib." },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const { data: existingRows } = await supabase
      .from("kode_unik")
      .select("kode");

    const existing = new Set((existingRows || []).map((r) => r.kode));
    const codes = generateKodeBatch(count, existing);

    if (codes.length < count) {
      return Response.json(
        { ok: false, msg: "Gagal generate kode unik. Coba lagi." },
        { status: 500 }
      );
    }

    const rows = codes.map((kode) => ({
      kode,
      batch: batch.trim(),
      produk: produk.trim(),
      status: "belum_dipakai",
    }));

    const { data, error } = await supabase
      .from("kode_unik")
      .insert(rows)
      .select("kode, batch, produk, status, dibuat_at");

    if (error) throw error;

    return Response.json({
      ok: true,
      msg: `${data.length} kode berhasil dibuat.`,
      kodes: data,
    });
  } catch (err) {
    console.error("[api/kode/generate]", err);
    return Response.json(
      { ok: false, msg: "Gagal generate kode." },
      { status: 500 }
    );
  }
}
