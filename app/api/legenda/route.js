import { createServiceClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

const SCOPE_FIELD = {
  kota: "gelar_kota",
  provinsi: "gelar_provinsi",
  nasional: "gelar_nasional",
};

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope") || "kota";
    const field = SCOPE_FIELD[scope] || SCOPE_FIELD.kota;

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("legenda")
      .select("*, member:member_id(nama, username, kota, provinsi)")
      .order(field, { ascending: false })
      .order("poin_legenda", { ascending: false })
      .limit(10);

    if (error) throw error;

    const AVATARS = ["🏆", "🎖️", "🎣", "🐉", "⚡", "👑", "🦈", "🎯"];

    const list = (data || [])
      .filter((row) => (row[field] || 0) > 0)
      .map((row, i) => {
        const m = row.member || {};
        return {
          rank: i + 1,
          user: m.nama || "Angler",
          avatar: AVATARS[i % AVATARS.length],
          area:
            scope === "kota"
              ? m.kota || "-"
              : scope === "provinsi"
                ? m.provinsi || "-"
                : "Indonesia",
          titles: row[field] || 0,
          pts: row.poin_legenda || 0,
        };
      });

    return Response.json({ ok: true, scope, legends: list });
  } catch (err) {
    console.error("[api/legenda]", err);
    return Response.json({ ok: false, msg: "Gagal memuat legenda." }, { status: 500 });
  }
}
