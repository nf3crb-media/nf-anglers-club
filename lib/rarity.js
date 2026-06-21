import { FISH_AVG, RARITY, RARITY_ORDER } from "./constants";

export { FISH_AVG, RARITY, RARITY_ORDER };

export function calcRarity(fish, weight, usesNF = false, fromComp = false) {
  const avg = FISH_AVG[fish] || 1.0;
  const ratio = parseFloat(weight) / avg;
  let idx;
  if (ratio < 0.8) idx = 0;
  else if (ratio < 1.3) idx = 1;
  else if (ratio < 2.0) idx = 2;
  else if (ratio < 3.0) idx = 3;
  else idx = 4;

  if (usesNF) idx = Math.min(4, idx + 1);
  if (fromComp) idx = Math.max(3, idx);

  return {
    key: RARITY_ORDER[idx],
    ratio: ratio.toFixed(1),
    ...RARITY[RARITY_ORDER[idx]],
  };
}
