export const XP_PER_LEVEL = 500;

export const ANGLER_RANKS = [
  { minLevel: 1, rank: "Anak Kali", icon: "🌊" },
  { minLevel: 3, rank: "Pemancing Sungai", icon: "🏞️" },
  { minLevel: 6, rank: "Jago Empang", icon: "🎯" },
  { minLevel: 10, rank: "Master Strike", icon: "⚡" },
  { minLevel: 15, rank: "Legenda NF", icon: "👑" },
];

export function levelFromXp(xp) {
  const safe = Math.max(0, Number(xp) || 0);
  return Math.max(1, Math.floor(safe / XP_PER_LEVEL) + 1);
}

export function rankFromLevel(level) {
  const lv = Math.max(1, Number(level) || 1);
  let current = ANGLER_RANKS[0];
  for (const row of ANGLER_RANKS) {
    if (lv >= row.minLevel) current = row;
  }
  return current;
}

export function xpProgress(xp) {
  const safe = Math.max(0, Number(xp) || 0);
  const level = levelFromXp(safe);
  const floor = (level - 1) * XP_PER_LEVEL;
  const inLevel = safe - floor;
  const pct = Math.min(100, Math.round((inLevel / XP_PER_LEVEL) * 100));
  const toNext = XP_PER_LEVEL - inLevel;
  return {
    level,
    xp: safe,
    xp_in_level: inLevel,
    xp_to_next: toNext,
    xp_per_level: XP_PER_LEVEL,
    pct,
    rank: rankFromLevel(level),
  };
}

export function mapGameProgress(row) {
  const xp = row?.angler_xp ?? 0;
  const progress = xpProgress(xp);
  const level = row?.angler_level ?? progress.level;
  const computed = rankFromLevel(level);
  const rank = row?.angler_rank || computed.rank;

  return {
    angler_xp: xp,
    angler_level: level,
    angler_rank: rank,
    rank_icon: computed.icon,
    story_chapter: row?.story_chapter ?? 1,
    xp_in_level: progress.xp_in_level,
    xp_to_next: progress.xp_to_next,
    xp_per_level: progress.xp_per_level,
    level_pct: progress.pct,
  };
}
