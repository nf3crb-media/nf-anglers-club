export async function getMemberBadges(supabase, memberId) {
  const { data: catalog, error: catErr } = await supabase
    .from("badge")
    .select("id, slug, nama, emoji, deskripsi, kategori")
    .eq("aktif", true)
    .order("kategori")
    .order("nama");

  if (catErr) {
    if (catErr.code === "PGRST205" || catErr.message?.includes("badge")) {
      return [];
    }
    throw catErr;
  }

  const { data: owned, error: ownErr } = await supabase
    .from("member_badge")
    .select("badge_id, earned_at")
    .eq("member_id", memberId);

  if (ownErr && ownErr.code !== "PGRST205") {
    throw ownErr;
  }

  const ownedMap = new Map((owned || []).map((r) => [r.badge_id, r.earned_at]));

  return (catalog || []).map((badge) => ({
    ...badge,
    owned: ownedMap.has(badge.id),
    earned_at: ownedMap.get(badge.id) ?? null,
  }));
}

export async function awardBadge(supabase, memberId, badgeId, meta = {}) {
  if (!badgeId) return null;

  const { error } = await supabase.from("member_badge").insert({
    member_id: memberId,
    badge_id: badgeId,
    source: meta.source || "system",
    ref_id: meta.ref_id || null,
  });

  if (error) {
    if (error.code === "23505") {
      return { badge_id: badgeId, duplicate: true };
    }
    console.warn("[badge/award]", error.message);
    return null;
  }

  return { badge_id: badgeId };
}

export async function maybeAwardRankBadge(supabase, memberId, anglerLevel) {
  if ((anglerLevel ?? 0) < 15) return null;

  const { data: badge } = await supabase
    .from("badge")
    .select("id")
    .eq("slug", "legenda-nf")
    .maybeSingle();

  if (!badge) return null;

  return awardBadge(supabase, memberId, badge.id, {
    source: "rank",
    ref_id: null,
  });
}
