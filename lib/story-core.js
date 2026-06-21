export function resolveMissionStatus(mission, progress, previousCompleted) {
  if (progress?.status === "completed") return "completed";
  if (mission.mission_number > 1 && !previousCompleted) return "locked";
  return progress?.status || "available";
}

export function evaluateCatchForMission(mission, catchCtx) {
  const cfg = mission.objective_config || {};
  const needed = cfg.count ?? 1;
  const current = catchCtx.progress_count ?? 0;

  let matches = false;

  switch (mission.mission_type) {
    case "catch_any":
      matches = true;
      break;
    case "catch_habitat":
      matches = catchCtx.habitat === cfg.habitat;
      break;
    case "catch_species":
      matches = catchCtx.species_slug === cfg.species_slug;
      break;
    case "catch_min_weight": {
      const min = Number(cfg.min_weight_kg ?? 0);
      matches = Number(catchCtx.weight_kg) >= min;
      if (cfg.species_slug) {
        matches = matches && catchCtx.species_slug === cfg.species_slug;
      }
      break;
    }
    default:
      matches = false;
  }

  if (!matches) {
    return { matches: false, complete: false, newCount: current, needed };
  }

  const newCount = current + 1;
  return {
    matches: true,
    complete: newCount >= needed,
    newCount,
    needed,
  };
}

export function missionProgressLabel(mission, progressData) {
  const cfg = mission.objective_config || {};
  const needed = cfg.count ?? 1;
  const current = progressData?.count ?? 0;

  switch (mission.mission_type) {
    case "catch_any":
      return `${Math.min(current, needed)}/${needed} tangkapan`;
    case "catch_habitat":
      return `Tangkap di ${cfg.habitat} (${Math.min(current, needed)}/${needed})`;
    case "catch_species":
      return `${Math.min(current, needed)}/${needed} tangkapan target`;
    case "catch_min_weight":
      return cfg.species_slug
        ? `Min ${cfg.min_weight_kg} kg · ${Math.min(current, needed)}/${needed}`
        : `Min ${cfg.min_weight_kg} kg`;
    default:
      return mission.deskripsi || "";
  }
}
