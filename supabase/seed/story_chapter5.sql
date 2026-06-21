-- Bab 5: Gelombang Laut (setelah story_chapter4.sql + badges.sql)
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
  5,
  'bab-5-gelombang-laut',
  'Gelombang Laut',
  'Gelombang biru, angin utara, dan strike yang brutal. Perairan lepas Cirebon adalah ujian terakhir habitat — predator laut menunggu di kedalaman.',
  'Semua habitat NF sudah kau taklukkan. Terus strike, naik rank, dan kejar gelar Legenda NF.',
  'laut',
  8,
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
  'pemburu-laut',
  'Pemburu Laut',
  '🦈',
  'Mengalahkan Boss Barracuda di Bab 5.',
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
  'Barracuda Kilat',
  'Predator puncak perairan lepas NF. Strike Barracuda minimal 3 kg.',
  'epic',
  3.000,
  'laut',
  '{"story_boss": true, "badge_slug": "pemburu-laut"}'::jsonb,
  true
FROM fish_species fs
WHERE fs.slug = 'barracuda'
  AND NOT EXISTS (
    SELECT 1 FROM boss_fish b WHERE b.boss_name = 'Barracuda Kilat'
  );

INSERT INTO story_mission (
  chapter_id, mission_number, judul, deskripsi, mission_type,
  objective_config, xp_reward, activity_point_reward, aktif
)
SELECT c.id, 1, 'Horizon Biru',
  'Tangkap ikan dari habitat laut (perairan lepas).',
  'catch_habitat', '{"habitat": "laut", "count": 1}'::jsonb, 100, 45, true
FROM story_chapter c WHERE c.slug = 'bab-5-gelombang-laut'
ON CONFLICT (chapter_id, mission_number) DO UPDATE SET
  judul = EXCLUDED.judul, deskripsi = EXCLUDED.deskripsi,
  mission_type = EXCLUDED.mission_type, objective_config = EXCLUDED.objective_config,
  xp_reward = EXCLUDED.xp_reward, activity_point_reward = EXCLUDED.activity_point_reward;

INSERT INTO story_mission (
  chapter_id, mission_number, judul, deskripsi, mission_type,
  objective_config, xp_reward, activity_point_reward, aktif
)
SELECT c.id, 2, 'Strike Tenggiri',
  'Tangkap Tenggiri — predator cepat perairan lepas.',
  'catch_species', '{"species_slug": "tenggiri", "count": 1}'::jsonb, 120, 50, true
FROM story_chapter c WHERE c.slug = 'bab-5-gelombang-laut'
ON CONFLICT (chapter_id, mission_number) DO UPDATE SET
  judul = EXCLUDED.judul, deskripsi = EXCLUDED.deskripsi,
  mission_type = EXCLUDED.mission_type, objective_config = EXCLUDED.objective_config,
  xp_reward = EXCLUDED.xp_reward, activity_point_reward = EXCLUDED.activity_point_reward;

INSERT INTO story_mission (
  chapter_id, mission_number, judul, deskripsi, mission_type,
  objective_config, xp_reward, activity_point_reward, aktif
)
SELECT c.id, 3, 'Kerapu Macan',
  'Tangkap Kerapu Macan — bukti kamu siap hadapi boss laut.',
  'catch_species', '{"species_slug": "kerapu-macan", "count": 1}'::jsonb, 140, 55, true
FROM story_chapter c WHERE c.slug = 'bab-5-gelombang-laut'
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
  c.id, 4, '👑 Barracuda Kilat',
  'BOSS: Strike Barracuda minimal 3 kg — gelar Pemburu Laut menanti.',
  'catch_min_weight',
  '{"species_slug": "barracuda", "min_weight_kg": 3.0, "count": 1}'::jsonb,
  280, 80, true, b.id, true
FROM story_chapter c
CROSS JOIN boss_fish b
WHERE c.slug = 'bab-5-gelombang-laut'
  AND b.boss_name = 'Barracuda Kilat'
ON CONFLICT (chapter_id, mission_number) DO UPDATE SET
  judul = EXCLUDED.judul, deskripsi = EXCLUDED.deskripsi,
  mission_type = EXCLUDED.mission_type, objective_config = EXCLUDED.objective_config,
  xp_reward = EXCLUDED.xp_reward, activity_point_reward = EXCLUDED.activity_point_reward,
  is_boss = EXCLUDED.is_boss, boss_fish_id = EXCLUDED.boss_fish_id;

UPDATE story_mission sm
SET badge_reward_id = b.id
FROM badge b, story_chapter c
WHERE b.slug = 'pemburu-laut'
  AND c.slug = 'bab-5-gelombang-laut'
  AND sm.chapter_id = c.id
  AND sm.is_boss = true;
