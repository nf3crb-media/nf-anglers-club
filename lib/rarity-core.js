import { RARITY, RARITY_ORDER } from "./constants";

/**
 * Kelangkaan kartu dari rasio berat vs rata-rata spesies.
 * Produk NF tidak menaikkan tier rarity (hanya dicatat terpisah).
 */
export function calcRarityFromRatio(weight, averageWeightKg, fromComp = false) {
  const avg = Number(averageWeightKg) || 1;
  const w = parseFloat(weight);
  if (!w || w <= 0) {
    return {
      key: "common",
      ratio: "0.0",
      ...RARITY.common,
    };
  }

  const ratio = w / avg;
  let idx;
  if (ratio < 0.8) idx = 0;
  else if (ratio < 1.3) idx = 1;
  else if (ratio < 2.0) idx = 2;
  else if (ratio < 3.0) idx = 3;
  else idx = 4;

  if (fromComp) idx = Math.max(3, idx);

  const key = RARITY_ORDER[idx];
  return {
    key,
    ratio: ratio.toFixed(1),
    ...RARITY[key],
  };
}

export const CATCH_ACTIVITY_POIN = {
  common: 10,
  uncommon: 15,
  rare: 25,
  epic: 50,
  legendary: 100,
};

export const RARITY_XP_MULT = {
  common: 1,
  uncommon: 1.2,
  rare: 1.5,
  epic: 2,
  legendary: 3,
};
