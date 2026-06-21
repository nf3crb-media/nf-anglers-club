const FISH_EMOJI = {
  "Ikan Mas": "🐟",
  Bawal: "🐠",
  Nila: "🐟",
  Lele: "🐡",
  Gabus: "🐍",
  Patin: "🐟",
  Toman: "🐉",
  Hampala: "🐟",
  Wader: "🐟",
  Baung: "🐟",
  Bandeng: "🐠",
};

const AVATARS = ["🎣", "🦈", "👑", "🐉", "⚡", "🏆", "🎖️"];

export function fishEmoji(fish) {
  return FISH_EMOJI[fish] || "🐟";
}

export function avatarFor(name, id) {
  if (!name) return "🎣";
  const idx =
    typeof id === "string"
      ? id.charCodeAt(0) % AVATARS.length
      : (id || 0) % AVATARS.length;
  return AVATARS[idx];
}

export function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "kemarin";
  if (days < 7) return `${days} hari lalu`;
  return new Date(iso).toLocaleDateString("id-ID");
}

export function mapTangkapanRow(row, spotName) {
  const member = row.member || {};
  const name = member.nama || member.username || "Angler";
  return {
    id: row.id,
    user: name,
    avatar: avatarFor(name, row.id),
    disc: row.disc,
    fish: row.fish,
    weight: row.weight,
    gear: row.gear || "-",
    spot: spotName || "Spot mancing",
    time: timeAgo(row.dibuat_at),
    likes: row.likes ?? 0,
    emoji: fishEmoji(row.fish),
    photo_url: row.photo_url,
  };
}
