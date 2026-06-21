-- Bab 2: Arus Sungai (jalankan setelah story_chapter1.sql + fish_species.sql)
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
  2,
  'bab-2-arus-sungai',
  'Arus Sungai',
  'Setelah empang, NF membawamu ke sungai-sungai Cirebon. Arus deras, strike cepat — di sinilah predator mulai muncul.',
  'Sungai mengakui keberanianmu. Bab berikutnya menunggu di rawa dan mangrove.',
  'sungai',
  2,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  judul = EXCLUDED.judul,
  intro_story = EXCLUDED.intro_story,
  outro_story = EXCLUDED.outro_story,
  habitat = EXCLUDED.habitat,
  unlock_level = EXCLUDED.unlock_level,
  aktif = EXCLUDED.aktif;

-- Boss: Raja Baung
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
  'Raja Baung Cirebon',
  'Legenda arus sungai Cirebon. Kalahkan dengan strike Baung minimal 1.2 kg.',
  'normal',
  1.200,
  'sungai',
  '{"story_boss": true}'::jsonb,
  true
FROM fish_species fs
WHERE fs.slug = 'baung'
  AND NOT EXISTS (
    SELECT 1 FROM boss_fish b WHERE b.boss_name = 'Raja Baung Cirebon'
  );

INSERT INTO story_mission (
  chapter_id, mission_number, judul, deskripsi, mission_type,
  objective_config, xp_reward, activity_point_reward, aktif
)
SELECT c.id, 1, 'Jejak Arus',
  'Tangkap ikan dari habitat sungai.',
  'catch_habitat', '{"habitat": "sungai", "count": 1}'::jsonb, 60, 25, true
FROM story_chapter c WHERE c.slug = 'bab-2-arus-sungai'
ON CONFLICT (chapter_id, mission_number) DO UPDATE SET
  judul = EXCLUDED.judul, deskripsi = EXCLUDED.deskripsi,
  mission_type = EXCLUDED.mission_type, objective_config = EXCLUDED.objective_config,
  xp_reward = EXCLUDED.xp_reward, activity_point_reward = EXCLUDED.activity_point_reward;

INSERT INTO story_mission (
  chapter_id, mission_number, judul, deskripsi, mission_type,
  objective_config, xp_reward, activity_point_reward, aktif
)
SELECT c.id, 2, 'Sang Penjaga',
  'Tangkap Baung — penjaga klasik sungai NF.',
  'catch_species', '{"species_slug": "baung", "count": 1}'::jsonb, 80, 30, true
FROM story_chapter c WHERE c.slug = 'bab-2-arus-sungai'
ON CONFLICT (chapter_id, mission_number) DO UPDATE SET
  judul = EXCLUDED.judul, deskripsi = EXCLUDED.deskripsi,
  mission_type = EXCLUDED.mission_type, objective_config = EXCLUDED.objective_config,
  xp_reward = EXCLUDED.xp_reward, activity_point_reward = EXCLUDED.activity_point_reward;

INSERT INTO story_mission (
  chapter_id, mission_number, judul, deskripsi, mission_type,
  objective_config, xp_reward, activity_point_reward, aktif
)
SELECT c.id, 3, 'Predator Sungai',
  'Tangkap Hampala — predator aktif di arus.',
  'catch_species', '{"species_slug": "hampala", "count": 1}'::jsonb, 90, 35, true
FROM story_chapter c WHERE c.slug = 'bab-2-arus-sungai'
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
  c.id, 4, '👑 Raja Baung',
  'BOSS: Strike Baung minimal 1.2 kg — bukti layak disebut master sungai.',
  'catch_min_weight',
  '{"species_slug": "baung", "min_weight_kg": 1.2, "count": 1}'::jsonb,
  150, 50, true, b.id, true
FROM story_chapter c
CROSS JOIN boss_fish b
WHERE c.slug = 'bab-2-arus-sungai'
  AND b.boss_name = 'Raja Baung Cirebon'
ON CONFLICT (chapter_id, mission_number) DO UPDATE SET
  judul = EXCLUDED.judul, deskripsi = EXCLUDED.deskripsi,
  mission_type = EXCLUDED.mission_type, objective_config = EXCLUDED.objective_config,
  xp_reward = EXCLUDED.xp_reward, activity_point_reward = EXCLUDED.activity_point_reward,
  is_boss = EXCLUDED.is_boss, boss_fish_id = EXCLUDED.boss_fish_id;
