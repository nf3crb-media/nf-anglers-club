export function isRewardVisible(reward, now = new Date()) {
  if (!reward?.aktif) return false;
  if (reward.stock != null && reward.stock <= 0) return false;

  const t = now.getTime();
  if (reward.starts_at && new Date(reward.starts_at).getTime() > t) return false;
  if (reward.ends_at && new Date(reward.ends_at).getTime() < t) return false;

  return true;
}

export function rewardScheduleLabel(reward, now = new Date()) {
  if (!reward?.aktif) return "Nonaktif";
  if (reward.stock != null && reward.stock <= 0) return "Stok habis";

  const t = now.getTime();
  if (reward.starts_at && new Date(reward.starts_at).getTime() > t) {
    return `Mulai ${formatShort(reward.starts_at)}`;
  }
  if (reward.ends_at && new Date(reward.ends_at).getTime() < t) {
    return "Berakhir";
  }
  if (reward.ends_at) {
    return `Sampai ${formatShort(reward.ends_at)}`;
  }
  return "Aktif";
}

function formatShort(iso) {
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function slugifyRewardName(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}
