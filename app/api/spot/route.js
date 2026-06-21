import { createServiceClient } from "@/lib/supabase-server";
import { nominatimReverse, parseNominatimAddress } from "@/lib/geocode";

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      member_id,
      lat,
      lng,
      fish,
      disc,
      best_bait,
      nama,
      kota,
      provinsi,
    } = body;

    if (!member_id || lat == null || lng == null || !fish || !disc) {
      return Response.json(
        { ok: false, msg: "Data spot tidak lengkap." },
        { status: 400 }
      );
    }

    let spotKota = kota;
    let spotProv = provinsi;
    let spotNama = nama;

    if (!spotKota || !spotNama) {
      try {
        const geo = await nominatimReverse(lat, lng);
        const parsed = parseNominatimAddress(geo);
        spotKota = spotKota || parsed.kota;
        spotProv = spotProv || parsed.provinsi;
        spotNama = spotNama || parsed.short;
      } catch {
        spotNama = spotNama || `Spot ${fish}`;
      }
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("spot")
      .insert({
        member_id,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        fish,
        disc,
        best_bait: best_bait || null,
        nama: spotNama,
        kota: spotKota,
        provinsi: spotProv,
        productive: false,
      })
      .select()
      .single();

    if (error) throw error;

    return Response.json({ ok: true, spot: data });
  } catch (err) {
    console.error("[api/spot]", err);
    return Response.json(
      { ok: false, msg: "Gagal menyimpan spot." },
      { status: 500 }
    );
  }
}
