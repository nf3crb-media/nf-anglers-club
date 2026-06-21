-- Bab 3: Hutan Rawa (setelah story_chapter2.sql + badges.sql)
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
  3,
  'bab-3-hutan-rawa',
  'Hutan Rawa',
  'Uap rawa pagi, suara jangkrik dan splash predator. NF mengajakmu masuk habitat paling menantang — di sini legenda Toman lahir.',
  'Rawa memberi restu. Laut dan muara menanti di bab selanjutnya.',
  'rawa',
  4,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  judul = EXCLUDED.judul,
  intro_story = EXCLUDED.intro_story,
  outro_story = EXCLUDED.outro_story,
  habitat = EXCLUDED.habitat,
  unlock_level = EXCLUDED.unlock_level,
  aktif = EXCLUDED.aktif;

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
  'Toman Rawa Legenda',
  'Predator puncak rawa NF. Kalahkan dengan Toman minimal 2 kg.',
  'hard',
  2.000,
  'rawa',
  '{"story_boss": true, "badge_slug": "raja-rawa"}'::jsonb,
  true
FROM fish_species fs
WHERE fs.slug = 'toman'
  AND NOT EXISTS (
    SELECT 1 FROM boss_fish b WHERE b.boss_name = 'Toman Rawa Legenda'
  );

INSERT INTO story_mission (
  chapter_id, mission_number, judul, deskripsi, mission_type,
  objective_config, xp_reward, activity_point_reward, aktif
)
SELECT c.id, 1, 'Kabut Rawa',
  'Tangkap ikan dari habitat rawa.',
  'catch_habitat', '{"habitat": "rawa", "count": 1}'::jsonb, 70, 30, true
FROM story_chapter c WHERE c.slug = 'bab-3-hutan-rawa'
ON CONFLICT (chapter_id, mission_number) DO UPDATE SET
  judul = EXCLUDED.judul, deskripsi = EXCLUDED.deskripsi,
  mission_type = EXCLUDED.mission_type, objective_config = EXCLUDED.objective_config,
  xp_reward = EXCLUDED.xp_reward, activity_point_reward = EXCLUDED.activity_point_reward;

INSERT INTO story_mission (
  chapter_id, mission_number, judul, deskripsi, mission_type,
  objective_config, xp_reward, activity_point_reward, aktif
)
SELECT c.id, 2, 'Shadow Strike',
  'Tangkap Gabus — predator rawa yang suka menyergap.',
  'catch_species', '{"species_slug": "gabus", "count": 1}'::jsonb, 90, 35, true
FROM story_chapter c WHERE c.slug = 'bab-3-hutan-rawa'
ON CONFLICT (chapter_id, mission_number) DO UPDATE SET
  judul = EXCLUDED.judul, deskripsi = EXCLUDED.deskripsi,
  mission_type = EXCLUDED.mission_type, objective_config = EXCLUDED.objective_config,
  xp_reward = EXCLUDED.xp_reward, activity_point_reward = EXCLUDED.activity_point_reward;

INSERT INTO story_mission (
  chapter_id, mission_number, judul, deskripsi, mission_type,
  objective_config, xp_reward, activity_point_reward, aktif
)
SELECT c.id, 3, 'Pemburu Toman',
  'Tangkap Toman — bukti kamu siap hadapi boss rawa.',
  'catch_species', '{"species_slug": "toman", "count": 1}'::jsonb, 110, 40, true
FROM story_chapter c WHERE c.slug = 'bab-3-hutan-rawa'
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
  c.id, 4, '👑 Toman Rawa Legenda',
  'BOSS: Strike Toman minimal 2 kg — gelar Raja Rawa menanti.',
  'catch_min_weight',
  '{"species_slug": "toman", "min_weight_kg": 2.0, "count": 1}'::jsonb,
  200, 60, true, b.id, true
FROM story_chapter c
CROSS JOIN boss_fish b
WHERE c.slug = 'bab-3-hutan-rawa'
  AND b.boss_name = 'Toman Rawa Legenda'
ON CONFLICT (chapter_id, mission_number) DO UPDATE SET
  judul = EXCLUDED.judul, deskripsi = EXCLUDED.deskripsi,
  mission_type = EXCLUDED.mission_type, objective_config = EXCLUDED.objective_config,
  xp_reward = EXCLUDED.xp_reward, activity_point_reward = EXCLUDED.activity_point_reward,
  is_boss = EXCLUDED.is_boss, boss_fish_id = EXCLUDED.boss_fish_id;

-- Link badge raja-rawa (butuh badges.sql di-run dulu)
UPDATE story_mission sm
SET badge_reward_id = b.id
FROM badge b, story_chapter c
WHERE b.slug = 'raja-rawa'
  AND c.slug = 'bab-3-hutan-rawa'
  AND sm.chapter_id = c.id
  AND sm.is_boss = true;
