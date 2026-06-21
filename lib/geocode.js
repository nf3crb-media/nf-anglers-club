const NOMINATIM = "https://nominatim.openstreetmap.org";
const UA = "NF-Anglers-Club/1.0 (Nusa Fishing; contact@nusafishing.id)";

export function parseNominatimAddress(data) {
  const a = data?.address || {};
  const kota =
    a.city ||
    a.town ||
    a.village ||
    a.municipality ||
    a.county ||
    a.suburb ||
    null;
  const provinsi = a.state || a.region || null;
  const jalan = a.road || a.neighbourhood || a.hamlet || null;

  const short = [jalan, kota, provinsi].filter(Boolean).join(", ");

  return {
    display: data?.display_name || short || "Lokasi mancing",
    kota,
    provinsi,
    jalan,
    short: short || data?.display_name || "Indonesia",
  };
}

export async function nominatimReverse(lat, lng) {
  const url = `${NOMINATIM}/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&format=json&accept-language=id&zoom=16`;
  const res = await fetch(url, {
    headers: { "User-Agent": UA },
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error("Geocode gagal");
  return res.json();
}

export async function nominatimSearch(q) {
  const url = `${NOMINATIM}/search?q=${encodeURIComponent(q)}&format=json&countrycodes=id&limit=5&accept-language=id`;
  const res = await fetch(url, {
    headers: { "User-Agent": UA },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error("Pencarian gagal");
  return res.json();
}
