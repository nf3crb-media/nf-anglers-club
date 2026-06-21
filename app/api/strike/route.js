import { createServiceClient } from "@/lib/supabase-server";
import { timeAgo } from "@/lib/time";

export const dynamic = "force-dynamic";

function mapStrike(row) {
  const member = row.member || {};
  return {
    id: row.id,
    user: member.nama || "Angler",
    avatar: "🏆",
    loc: row.kota || "-",
    disc: row.disc,
    event: row.event_name,
    fish: row.fish,
    weight: row.weight,
    place: row.place,
    prize: row.prize || "-",
    gear: row.gear || "-",
    verified: row.verified,
    status: row.status,
    xp: row.poin_awarded || 0,
    likes: 0,
    proof: {
      kolam: !!row.foto_kolam,
      juara: !!row.foto_juara,
      hadiah: !!row.foto_hadiah,
    },
    time: timeAgo(row.dibuat_at),
    member_id: row.member_id,
  };
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const member_id = searchParams.get("member_id");

    const supabase = createServiceClient();
    let query = supabase
      .from("strike_juara")
      .select("*, member:member_id(nama, username)")
      .order("dibuat_at", { ascending: false })
      .limit(30);

    const { data, error } = await query;
    if (error) throw error;

    const rows = data || [];
    const filtered = rows.filter(
      (r) =>
        r.verified ||
        r.status === "verified" ||
        (member_id && r.member_id === member_id)
    );

    return Response.json({
      ok: true,
      strikes: filtered.map(mapStrike),
    });
  } catch (err) {
    console.error("[api/strike GET]", err);
    return Response.json({ ok: false, msg: "Gagal memuat strike." }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      member_id,
      disc,
      event_name,
      fish,
      weight,
      place,
      prize,
      gear,
      uses_nf,
      kota,
      foto_kolam,
      foto_juara,
      foto_hadiah,
    } = body;

    if (!member_id || !disc || !event_name || !fish || !place) {
      return Response.json(
        { ok: false, msg: "Data strike tidak lengkap." },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("strike_juara")
      .insert({
        member_id,
        disc,
        event_name,
        fish,
        weight: weight ? parseFloat(weight) : null,
        place: parseInt(place, 10),
        prize: prize || null,
        gear: gear || null,
        uses_nf: !!uses_nf,
        kota: kota || null,
        foto_kolam: foto_kolam || null,
        foto_juara: foto_juara || null,
        foto_hadiah: foto_hadiah || null,
        status: "pending",
        verified: false,
      })
      .select()
      .single();

    if (error) throw error;

    return Response.json({
      ok: true,
      msg: "Strike Juara terkirim! Menunggu verifikasi CS.",
      strike: data,
    });
  } catch (err) {
    console.error("[api/strike POST]", err);
    return Response.json({ ok: false, msg: "Gagal kirim strike." }, { status: 500 });
  }
}
