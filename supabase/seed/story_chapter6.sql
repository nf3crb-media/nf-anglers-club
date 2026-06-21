-- Bab 6 Epilog: Mahseer Sang Legenda (setelah story_chapter5.sql + badges.sql)
INSERT INTO story_chapter (
  chapter_number,
  slug,
  judul,
  intro_story,
  outro_story,
  habitat,
  unlock_level,
  aktif
)
VALUES (
  6,
  'bab-6-mahseer-legenda',
  'Mahseer Sang Legenda',
  'Di hulu sungai terpencil, legenda NF berbisik tentang Mahseer — ikan suci yang hanya muncul untuk angler sejati. Ini epilog perjalanan habitat-mu.',
  'Mahseer mengakui strike-mu. Kamu sudah menaklukkan NF dari empang sampai laut. Kejar level 15 dan gelar Legenda NF!',
  'sungai',
  10,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  judul = EXCLUDED.judul,
  intro_story = EXCLUDED.intro_story,
  outro_story = EXCLUDED.outro_story,
  habitat = EXCLUDED.habitat,
  unlock_level = EXCLUDED.unlock_level,
  aktif = EXCLUDED.aktif;

INSERT INTO badge (slug, nama, emoji, deskripsi, kategori)
VALUES (
  'sang-mahseer',
  'Sang Mahseer',
  '🐉',
  'Mengalahkan Boss Mahseer di Bab Epilog.',
  'story'
)
ON CONFLICT (slug) DO UPDATE SET
  nama = EXCLUDED.nama,
  emoji = EXCLUDED.emoji,
  deskripsi = EXCLUDED.deskripsi;

INSERT INTO boss_fish (
  fish_species_id,
  boss_name,
  deskripsi,
  difficulty,
  minimum_weight_kg,
  required_habitat,
  reward_config,
  aktif
)
SELECT
  fs.id,
  'Mahseer Sang Legenda',
  'Legenda hulu sungai NF. Strike Mahseer minimal 3.5 kg.',
  'legendary',
  3.500,
  'sungai',
  '{"story_boss": true, "badge_slug": "sang-mahseer"}'::jsonb,
  true
FROM fish_species fs
WHERE fs.slug = 'mahseer'
  AND NOT EXISTS (
    SELECT 1 FROM boss_fish b WHERE b.boss_name = 'Mahseer Sang Legenda'
  );

INSERT INTO story_mission (
  chapter_id, mission_number, judul, deskripsi, mission_type,
  objective_config, xp_reward, activity_point_reward, aktif
)
SELECT c.id, 1, 'Hulu Sungai',
  'Kembali ke habitat sungai — tempat semuanya bermula.',
  'catch_habitat', '{"habitat": "sungai", "count": 1}'::jsonb, 120, 50, true
FROM story_chapter c WHERE c.slug = 'bab-6-mahseer-legenda'
ON CONFLICT (chapter_id, mission_number) DO UPDATE SET
  judul = EXCLUDED.judul, deskripsi = EXCLUDED.deskripsi,
  mission_type = EXCLUDED.mission_type, objective_config = EXCLUDED.objective_config,
  xp_reward = EXCLUDED.xp_reward, activity_point_reward = EXCLUDED.activity_point_reward;

INSERT INTO story_mission (
  chapter_id, mission_number, judul, deskripsi, mission_type,
  objective_config, xp_reward, activity_point_reward, aktif
)
SELECT c.id, 2, 'Jelawat Perak',
  'Tangkap Jelawat — penanda arus hulu.',
  'catch_species', '{"species_slug": "jelawat", "count": 1}'::jsonb, 140, 55, true
FROM story_chapter c WHERE c.slug = 'bab-6-mahseer-legenda'
ON CONFLICT (chapter_id, mission_number) DO UPDATE SET
  judul = EXCLUDED.judul, deskripsi = EXCLUDED.deskripsi,
  mission_type = EXCLUDED.mission_type, objective_config = EXCLUDED.objective_config,
  xp_reward = EXCLUDED.xp_reward, activity_point_reward = EXCLUDED.activity_point_reward;

INSERT INTO story_mission (
  chapter_id, mission_number, judul, deskripsi, mission_type,
  objective_config, xp_reward, activity_point_reward, aktif
)
SELECT c.id, 3, 'Pertanda Mahseer',
  'Tangkap Mahseer — bukti kamu layak hadapi boss legenda.',
  'catch_species', '{"species_slug": "mahseer", "count": 1}'::jsonb, 180, 65, true
FROM story_chapter c WHERE c.slug = 'bab-6-mahseer-legenda'
ON CONFLICT (chapter_id, mission_number) DO UPDATE SET
  judul = EXCLUDED.judul, deskripsi = EXCLUDED.deskripsi,
  mission_type = EXCLUDED.mission_type, objective_config = EXCLUDED.objective_config,
  xp_reward = EXCLUDED.xp_reward, activity_point_reward = EXCLUDED.activity_point_reward;

INSERT INTO story_mission (
  chapter_id, mission_number, judul, deskripsi, mission_type,
  objective_config, xp_reward, activity_point_reward,
  is_boss, boss_fish_id, aktif
)
SELECT
  c.id, 4, '👑 Mahseer Sang Legenda',
  'BOSS: Strike Mahseer minimal 3.5 kg — puncak epilog NF Anglers Club.',
  'catch_min_weight',
  '{"species_slug": "mahseer", "min_weight_kg": 3.5, "count": 1}'::jsonb,
  350, 100, true, b.id, true
FROM story_chapter c
CROSS JOIN boss_fish b
WHERE c.slug = 'bab-6-mahseer-legenda'
  AND b.boss_name = 'Mahseer Sang Legenda'
ON CONFLICT (chapter_id, mission_number) DO UPDATE SET
  judul = EXCLUDED.judul, deskripsi = EXCLUDED.deskripsi,
  mission_type = EXCLUDED.mission_type, objective_config = EXCLUDED.objective_config,
  xp_reward = EXCLUDED.xp_reward, activity_point_reward = EXCLUDED.activity_point_reward,
  is_boss = EXCLUDED.is_boss, boss_fish_id = EXCLUDED.boss_fish_id;

UPDATE story_mission sm
SET badge_reward_id = b.id
FROM badge b, story_chapter c
WHERE b.slug = 'sang-mahseer'
  AND c.slug = 'bab-6-mahseer-legenda'
  AND sm.chapter_id = c.id
  AND sm.is_boss = true;
