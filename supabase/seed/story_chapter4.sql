-- Bab 4: Pintu Muara (setelah story_chapter3.sql + badges.sql)
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
  4,
  'bab-4-pintu-muara',
  'Pintu Muara',
  'Air payau bertemu arus laut. Muara Cirebon adalah gerbang strike salinitas — di sinilah NF anglers mulai berburu kakap dan predator muara.',
  'Muara sudah mengenal strike-mu. Bab berikutnya membawamu ke perairan lepas.',
  'muara',
  6,
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
  'penjaga-muara',
  'Penjaga Muara',
  '🦐',
  'Mengalahkan Boss Kakap Putih di Bab 4.',
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
  'Kakap Putih Muara',
  'Boss legenda muara NF. Strike Kakap Putih minimal 2.5 kg.',
  'hard',
  2.500,
  'muara',
  '{"story_boss": true, "badge_slug": "penjaga-muara"}'::jsonb,
  true
FROM fish_species fs
WHERE fs.slug = 'kakap-putih'
  AND NOT EXISTS (
    SELECT 1 FROM boss_fish b WHERE b.boss_name = 'Kakap Putih Muara'
  );

INSERT INTO story_mission (
  chapter_id, mission_number, judul, deskripsi, mission_type,
  objective_config, xp_reward, activity_point_reward, aktif
)
SELECT c.id, 1, 'Air Payau',
  'Tangkap ikan dari habitat muara.',
  'catch_habitat', '{"habitat": "muara", "count": 1}'::jsonb, 80, 35, true
FROM story_chapter c WHERE c.slug = 'bab-4-pintu-muara'
ON CONFLICT (chapter_id, mission_number) DO UPDATE SET
  judul = EXCLUDED.judul, deskripsi = EXCLUDED.deskripsi,
  mission_type = EXCLUDED.mission_type, objective_config = EXCLUDED.objective_config,
  xp_reward = EXCLUDED.xp_reward, activity_point_reward = EXCLUDED.activity_point_reward;

INSERT INTO story_mission (
  chapter_id, mission_number, judul, deskripsi, mission_type,
  objective_config, xp_reward, activity_point_reward, aktif
)
SELECT c.id, 2, 'Strike Belanak',
  'Tangkap Belanak — klasik muara Cirebon.',
  'catch_species', '{"species_slug": "belanak", "count": 1}'::jsonb, 90, 40, true
FROM story_chapter c WHERE c.slug = 'bab-4-pintu-muara'
ON CONFLICT (chapter_id, mission_number) DO UPDATE SET
  judul = EXCLUDED.judul, deskripsi = EXCLUDED.deskripsi,
  mission_type = EXCLUDED.mission_type, objective_config = EXCLUDED.objective_config,
  xp_reward = EXCLUDED.xp_reward, activity_point_reward = EXCLUDED.activity_point_reward;

INSERT INTO story_mission (
  chapter_id, mission_number, judul, deskripsi, mission_type,
  objective_config, xp_reward, activity_point_reward, aktif
)
SELECT c.id, 3, 'Menuju Laut',
  'Tangkap ikan dari habitat laut (perairan lepas).',
  'catch_habitat', '{"habitat": "laut", "count": 1}'::jsonb, 110, 45, true
FROM story_chapter c WHERE c.slug = 'bab-4-pintu-muara'
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
  c.id, 4, '👑 Kakap Putih Muara',
  'BOSS: Strike Kakap Putih minimal 2.5 kg — bukti layak jadi Penjaga Muara.',
  'catch_min_weight',
  '{"species_slug": "kakap-putih", "min_weight_kg": 2.5, "count": 1}'::jsonb,
  220, 70, true, b.id, true
FROM story_chapter c
CROSS JOIN boss_fish b
WHERE c.slug = 'bab-4-pintu-muara'
  AND b.boss_name = 'Kakap Putih Muara'
ON CONFLICT (chapter_id, mission_number) DO UPDATE SET
  judul = EXCLUDED.judul, deskripsi = EXCLUDED.deskripsi,
  mission_type = EXCLUDED.mission_type, objective_config = EXCLUDED.objective_config,
  xp_reward = EXCLUDED.xp_reward, activity_point_reward = EXCLUDED.activity_point_reward,
  is_boss = EXCLUDED.is_boss, boss_fish_id = EXCLUDED.boss_fish_id;

UPDATE story_mission sm
SET badge_reward_id = b.id
FROM badge b, story_chapter c
WHERE b.slug = 'penjaga-muara'
  AND c.slug = 'bab-4-pintu-muara'
  AND sm.chapter_id = c.id
  AND sm.is_boss = true;
