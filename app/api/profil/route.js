import { requireMember, mapMemberPublic } from "@/lib/session";
import { createServiceClient } from "@/lib/supabase-server";
import { mapGameProgress } from "@/lib/game-progress";
import { ensureGameProgress } from "@/lib/services/game-progress";
import { getMemberBadges } from "@/lib/services/badge";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireMember();
    if (!auth.ok) {
      return Response.json({ ok: false, msg: auth.msg }, { status: auth.status });
    }

    const supabase = createServiceClient();
    const member_id = auth.member.id;

    const progressRow = await ensureGameProgress(supabase, member_id);

    const [
      { data: member },
      { data: poinLog },
      { data: fishCards },
      { data: xpLog },
      { data: fishdexRows },
      { data: allSpecies },
      badges,
    ] = await Promise.all([
      supabase.from("member").select("*").eq("id", member_id).single(),
      supabase
        .from("poin_log")
        .select("*")
        .eq("member_id", member_id)
        .order("dibuat_at", { ascending: false })
        .limit(20),
      supabase
        .from("fish_card")
        .select("*")
        .eq("member_id", member_id)
        .eq("status", "tayang")
        .order("dibuat_at", { ascending: false }),
      supabase
        .from("xp_log")
        .select("*")
        .eq("member_id", member_id)
        .order("dibuat_at", { ascending: false })
        .limit(10),
      supabase
        .from("member_fishdex")
        .select(
          "id, total_catches, highest_weight_kg, first_discovered_at, fish_species:fish_species_id(id, slug, nama, habitat, base_rarity, is_boss_available)"
        )
        .eq("member_id", member_id),
      supabase
        .from("fish_species")
        .select("id, slug, nama, habitat, base_rarity, is_boss_available, is_predator")
        .eq("aktif", true)
        .order("nama"),
      getMemberBadges(supabase, member_id),
    ]);

    const dexMap = new Map(
      (fishdexRows || []).map((row) => [row.fish_species?.id || row.fish_species_id, row])
    );

    const fishdex = (allSpecies || []).map((species) => {
      const entry = dexMap.get(species.id);
      return {
        species,
        owned: !!entry,
        total_catches: entry?.total_catches ?? 0,
        highest_weight_kg: entry?.highest_weight_kg ?? null,
        first_discovered_at: entry?.first_discovered_at ?? null,
      };
    });

    const ownedCount = fishdex.filter((d) => d.owned).length;

    return Response.json({
      ok: true,
      member: mapMemberPublic(member),
      game: mapGameProgress(progressRow),
      poin_log: poinLog || [],
      fish_cards: fishCards || [],
      xp_log: xpLog || [],
      fishdex,
      fishdex_stats: {
        owned: ownedCount,
        total: fishdex.length,
      },
      badges,
    });
  } catch (err) {
    console.error("[api/profil]", err);
    return Response.json({ ok: false, msg: "Gagal memuat profil." }, { status: 500 });
  }
}
