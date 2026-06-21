import { nominatimReverse, parseNominatimAddress } from "@/lib/geocode";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    if (!lat || !lng) {
      return Response.json(
        { ok: false, msg: "Parameter lat & lng wajib." },
        { status: 400 }
      );
    }

    const data = await nominatimReverse(lat, lng);
    const address = parseNominatimAddress(data);

    return Response.json({
      ok: true,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      ...address,
    });
  } catch (err) {
    console.error("[geocode/reverse]", err);
    return Response.json(
      { ok: false, msg: "Alamat tidak ditemukan." },
      { status: 502 }
    );
  }
}
