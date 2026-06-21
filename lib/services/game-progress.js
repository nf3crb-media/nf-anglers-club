import { levelFromXp, rankFromLevel } from "@/lib/game-progress";

export async function ensureGameProgress(supabase, memberId) {
  const { data } = await supabase
    .from("member_game_progress")
    .select("*")
    .eq("member_id", memberId)
    .maybeSingle();

  if (data) return data;

  const { data: created, error } = await supabase
    .from("member_game_progress")
    .insert({ member_id: memberId })
    .select()
    .single();

  if (error) throw error;
  return created;
}

export async function applyXpGain(supabase, memberId, xpGain) {
  const row = await ensureGameProgress(supabase, memberId);
  const newXp = (row.angler_xp ?? 0) + xpGain;
  const newLevel = levelFromXp(newXp);
  const newRank = rankFromLevel(newLevel).rank;

  const { data, error } = await supabase
    .from("member_game_progress")
    .upsert(
      {
        member_id: memberId,
        angler_xp: newXp,
        angler_level: newLevel,
        angler_rank: newRank,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "member_id" }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}
