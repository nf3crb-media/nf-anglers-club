-- Bab 7 Bonus: Dunia Micro (setelah story_chapter6.sql + badges.sql)
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
  7,
  'bab-7-dunia-micro',
  'Dunia Micro',
  'Kail #26, kroto segar, dan strike seukuran ibu jari. NF membuka gerbang microfishing — disiplin paling presisi di klub.',
  'Micro world conquered. Kamu sudah menaklukkan semua habitat NF. Terus kumpulkan Fishdex dan kejar Legenda NF!',
  'micro',
  7,
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
  'master-micro',
  'Master Micro',
  '🔬',
  'Mengalahkan Boss Wader di Bab 7.',
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
  'Wader Raksasa Micro',
  'Legenda micro NF. Strike Wader minimal 50 gram.',
  'hard',
  0.050,
  'micro',
  '{"story_boss": true, "badge_slug": "master-micro"}'::jsonb,
  true
FROM fish_species fs
WHERE fs.slug = 'wader'
  AND NOT EXISTS (
    SELECT 1 FROM boss_fish b WHERE b.boss_name = 'Wader Raksasa Micro'
  );

INSERT INTO story_mission (
  chapter_id, mission_number, judul, deskripsi, mission_type,
  objective_config, xp_reward, activity_point_reward, aktif
)
SELECT c.id, 1, 'Kail #26',
  'Tangkap ikan dari habitat micro.',
  'catch_habitat', '{"habitat": "micro", "count": 1}'::jsonb, 80, 40, true
FROM story_chapter c WHERE c.slug = 'bab-7-dunia-micro'
ON CONFLICT (chapter_id, mission_number) DO UPDATE SET
  judul = EXCLUDED.judul, deskripsi = EXCLUDED.deskripsi,
  mission_type = EXCLUDED.mission_type, objective_config = EXCLUDED.objective_config,
  xp_reward = EXCLUDED.xp_reward, activity_point_reward = EXCLUDED.activity_point_reward;

INSERT INTO story_mission (
  chapter_id, mission_number, judul, deskripsi, mission_type,
  objective_config, xp_reward, activity_point_reward, aktif
)
SELECT c.id, 2, 'Strike Wader',
  'Tangkap Wader — ikon microfishing Indonesia.',
  'catch_species', '{"species_slug": "wader", "count": 1}'::jsonb, 100, 45, true
FROM story_chapter c WHERE c.slug = 'bab-7-dunia-micro'
ON CONFLICT (chapter_id, mission_number) DO UPDATE SET
  judul = EXCLUDED.judul, deskripsi = EXCLUDED.deskripsi,
  mission_type = EXCLUDED.mission_type, objective_config = EXCLUDED.objective_config,
  xp_reward = EXCLUDED.xp_reward, activity_point_reward = EXCLUDED.activity_point_reward;

INSERT INTO story_mission (
  chapter_id, mission_number, judul, deskripsi, mission_type,
  objective_config, xp_reward, activity_point_reward, aktif
)
SELECT c.id, 3, 'Rasbora Merah',
  'Tangkap Rasbora — bukti presisi setrika micro-mu.',
  'catch_species', '{"species_slug": "rasbora", "count": 1}'::jsonb, 110, 50, true
FROM story_chapter c WHERE c.slug = 'bab-7-dunia-micro'
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
  c.id, 4, '👑 Wader Raksasa Micro',
  'BOSS: Strike Wader minimal 50 gram — gelar Master Micro menanti.',
  'catch_min_weight',
  '{"species_slug": "wader", "min_weight_kg": 0.05, "count": 1}'::jsonb,
  200, 60, true, b.id, true
FROM story_chapter c
CROSS JOIN boss_fish b
WHERE c.slug = 'bab-7-dunia-micro'
  AND b.boss_name = 'Wader Raksasa Micro'
ON CONFLICT (chapter_id, mission_number) DO UPDATE SET
  judul = EXCLUDED.judul, deskripsi = EXCLUDED.deskripsi,
  mission_type = EXCLUDED.mission_type, objective_config = EXCLUDED.objective_config,
  xp_reward = EXCLUDED.xp_reward, activity_point_reward = EXCLUDED.activity_point_reward,
  is_boss = EXCLUDED.is_boss, boss_fish_id = EXCLUDED.boss_fish_id;

UPDATE story_mission sm
SET badge_reward_id = b.id
FROM badge b, story_chapter c
WHERE b.slug = 'master-micro'
  AND c.slug = 'bab-7-dunia-micro'
  AND sm.chapter_id = c.id
  AND sm.is_boss = true;
