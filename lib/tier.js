import { TIER_THRESHOLDS } from "./constants";

const ORDER = ["Bronze", "Silver", "Gold", "Mitra"];

export function calcTierFromPoin(totalPoin) {
  if (totalPoin >= TIER_THRESHOLDS.Mitra) return "Mitra";
  if (totalPoin >= TIER_THRESHOLDS.Gold) return "Gold";
  if (totalPoin >= TIER_THRESHOLDS.Silver) return "Silver";
  return "Bronze";
}

export function getNextTier(currentTier) {
  const idx = ORDER.indexOf(currentTier || "Bronze");
  if (idx < 0 || idx >= ORDER.length - 1) return null;
  return ORDER[idx + 1];
}

export function getNextTierThreshold(currentTier) {
  const next = getNextTier(currentTier);
  if (!next) return null;
  return TIER_THRESHOLDS[next];
}

export function tierProgress(totalPoin, currentTier) {
  const nextThreshold = getNextTierThreshold(currentTier);
  if (!nextThreshold) return 100;
  const currentThreshold = TIER_THRESHOLDS[currentTier] || 0;
  const span = nextThreshold - currentThreshold;
  const progress = totalPoin - currentThreshold;
  return Math.min(100, Math.round((progress / span) * 100));
}
