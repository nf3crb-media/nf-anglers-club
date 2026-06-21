import { nominatimSearch, parseNominatimAddress } from "@/lib/geocode";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();

    if (!q || q.length < 3) {
      return Response.json(
        { ok: false, msg: "Ketik minimal 3 karakter." },
        { status: 400 }
      );
    }

    const results = await nominatimSearch(q);

    return Response.json({
      ok: true,
      results: (results || []).map((r) => ({
        lat: parseFloat(r.lat),
        lng: parseFloat(r.lon),
        ...parseNominatimAddress(r),
      })),
    });
  } catch (err) {
    console.error("[geocode/search]", err);
    return Response.json(
      { ok: false, msg: "Pencarian alamat gagal." },
      { status: 502 }
    );
  }
}
