import { FISH_AVG, RARITY, RARITY_ORDER } from "./constants";
import { calcRarityFromRatio } from "./rarity-core";

export { FISH_AVG, RARITY, RARITY_ORDER };

/** Preview client — tier dari berat, tanpa bonus NF pada rarity */
export function calcRarity(fish, weight, _usesNF = false, fromComp = false) {
  const avg = FISH_AVG[fish] || 1.0;
  return calcRarityFromRatio(weight, avg, fromComp);
}
