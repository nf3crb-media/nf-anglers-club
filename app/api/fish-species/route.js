import { createServiceClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("fish_species")
      .select("id, slug, nama, habitat, average_weight_kg, base_rarity, base_xp")
      .eq("aktif", true)
      .order("nama");

    if (error) throw error;

    return Response.json({ ok: true, species: data || [] });
  } catch (err) {
    console.error("[api/fish-species]", err);
    return Response.json({ ok: false, msg: "Gagal memuat spesies ikan." }, { status: 500 });
  }
}
