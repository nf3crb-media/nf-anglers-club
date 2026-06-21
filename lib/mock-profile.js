export const MASCOTS = [
  { emoji: "🐟", name: "Maskie", fish: "Ikan Mas", owned: true },
  { emoji: "🐠", name: "Bawalu", fish: "Bawal", owned: true },
  { emoji: "🐍", name: "Gabuz", fish: "Gabus", owned: true },
  { emoji: "🐡", name: "Lelox", fish: "Lele", owned: false },
  { emoji: "🦐", name: "Wadi", fish: "Wader", owned: false },
  { emoji: "🐉", name: "Toma", fish: "Toman", owned: false },
];

export const BADGES = [
  { emoji: "🎯", name: "Spesialis Galatama", owned: true },
  { emoji: "🏆", name: "Juara Terverifikasi", owned: true },
  { emoji: "🛒", name: "Pelanggan Setia", owned: true },
  { emoji: "🔥", name: "Streak 7 Hari", owned: false },
];

export const REWARDS = [
  { cost: 500, name: "Diskon 10% Essen NF", icon: "💧" },
  { cost: 1200, name: "Essen/Lure Gratis", icon: "🧪" },
  { cost: 3000, name: "Paket Umpan + Merch NF", icon: "🎁" },
];

export const MOCK_POIN_LOG = [
  {
    jenis: "belanja",
    label: "Belanja NF Strike Series (3 pcs)",
    poin: 150,
    oleh: "CS",
    dibuat_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    jenis: "aktivitas",
    label: "Strike Juara terverifikasi",
    poin: 500,
    oleh: "Sistem",
    dibuat_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    jenis: "belanja",
    label: "Belanja Essen Ikan Mas NF + Booster Katilayu",
    poin: 320,
    oleh: "CS",
    dibuat_at: new Date(Date.now() - 432000000).toISOString(),
  },
  {
    jenis: "aktivitas",
    label: "Post tangkapan + tandai spot",
    poin: 60,
    oleh: "Sistem",
    dibuat_at: new Date(Date.now() - 604800000).toISOString(),
  },
];

export const MOCK_FISH_CARDS = [
  {
    fish: "Ikan Mas",
    weight: 4.2,
    rarity: "legendary",
    disc: "galatama",
    gear: "NF Strike Series",
  },
  {
    fish: "Bawal",
    weight: 3.1,
    rarity: "epic",
    disc: "kiloan",
    gear: "Magic Strike NF",
  },
  {
    fish: "Gabus",
    weight: 1.4,
    rarity: "rare",
    disc: "casting",
    gear: "Essen Ikan Mas NF",
  },
  {
    fish: "Nila",
    weight: 0.6,
    rarity: "uncommon",
    disc: "danau",
    gear: "Booster Katilayu NF",
  },
  {
    fish: "Lele",
    weight: 0.9,
    rarity: "common",
    disc: "kiloan",
    gear: "Essen Lele NF",
  },
];
