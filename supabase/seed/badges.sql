-- Badge NF Anglers Club (jalankan setelah 004_badges.sql)
INSERT INTO badge (slug, nama, emoji, deskripsi, kategori)
VALUES
  (
    'penjaga-empang',
    'Penjaga Empang',
    '🎣',
    'Menyelesaikan Bab 1 — Gerbang Empang.',
    'story'
  ),
  (
    'master-sungai',
    'Master Sungai',
    '🌊',
    'Mengalahkan Boss Raja Baung di Bab 2.',
    'story'
  ),
  (
    'raja-rawa',
    'Raja Rawa',
    '🐉',
    'Mengalahkan Boss Toman di Bab 3.',
    'story'
  ),
  (
    'legenda-nf',
    'Legenda NF',
    '👑',
    'Mencapai rank Legenda NF (Lv.15+).',
    'rank'
  ),
  (
    'penjaga-muara',
    'Penjaga Muara',
    '🦐',
    'Mengalahkan Boss Kakap Putih di Bab 4.',
    'story'
  ),
  (
    'pemburu-laut',
    'Pemburu Laut',
    '🦈',
    'Mengalahkan Boss Barracuda di Bab 5.',
    'story'
  )
ON CONFLICT (slug) DO UPDATE SET
  nama = EXCLUDED.nama,
  emoji = EXCLUDED.emoji,
  deskripsi = EXCLUDED.deskripsi,
  kategori = EXCLUDED.kategori;

-- Link badge ke misi story (bab 1 misi 3, bab 2 boss, bab 3 boss)
UPDATE story_mission sm
SET badge_reward_id = b.id
FROM badge b, story_chapter c
WHERE b.slug = 'penjaga-empang'
  AND c.slug = 'bab-1-gerbang-empang'
  AND sm.chapter_id = c.id
  AND sm.mission_number = 3;

UPDATE story_mission sm
SET badge_reward_id = b.id
FROM badge b, story_chapter c
WHERE b.slug = 'master-sungai'
  AND c.slug = 'bab-2-arus-sungai'
  AND sm.chapter_id = c.id
  AND sm.is_boss = true;

UPDATE story_mission sm
SET badge_reward_id = b.id
FROM badge b, story_chapter c
WHERE b.slug = 'raja-rawa'
  AND c.slug = 'bab-3-hutan-rawa'
  AND sm.chapter_id = c.id
  AND sm.is_boss = true;

UPDATE story_mission sm
SET badge_reward_id = b.id
FROM badge b, story_chapter c
WHERE b.slug = 'penjaga-muara'
  AND c.slug = 'bab-4-pintu-muara'
  AND sm.chapter_id = c.id
  AND sm.is_boss = true;

UPDATE story_mission sm
SET badge_reward_id = b.id
FROM badge b, story_chapter c
WHERE b.slug = 'pemburu-laut'
  AND c.slug = 'bab-5-gelombang-laut'
  AND sm.chapter_id = c.id
  AND sm.is_boss = true;
