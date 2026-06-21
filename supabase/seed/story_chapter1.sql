-- Bab 1: Gerbang Empang (jalankan setelah fish_species.sql)
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
  1,
  'bab-1-gerbang-empang',
  'Gerbang Empang',
  'Selamat datang di NF Anglers Club. Perjalananmu dimulai di kolam empang — tempat strike pertama dan fondasi Fishdex.',
  'Kolam empang sudah mengenal namamu. Bab berikutnya membawamu ke aliran sungai.',
  'empang',
  1,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  judul = EXCLUDED.judul,
  intro_story = EXCLUDED.intro_story,
  outro_story = EXCLUDED.outro_story,
  habitat = EXCLUDED.habitat,
  unlock_level = EXCLUDED.unlock_level,
  aktif = EXCLUDED.aktif;

INSERT INTO story_mission (
  chapter_id,
  mission_number,
  judul,
  deskripsi,
  mission_type,
  objective_config,
  xp_reward,
  activity_point_reward,
  aktif
)
SELECT
  c.id,
  1,
  'Strike Pertama',
  'Unggah tangkapan pertama lewat Fish Card.',
  'catch_any',
  '{"count": 1}'::jsonb,
  50,
  20,
  true
FROM story_chapter c
WHERE c.slug = 'bab-1-gerbang-empang'
ON CONFLICT (chapter_id, mission_number) DO UPDATE SET
  judul = EXCLUDED.judul,
  deskripsi = EXCLUDED.deskripsi,
  mission_type = EXCLUDED.mission_type,
  objective_config = EXCLUDED.objective_config,
  xp_reward = EXCLUDED.xp_reward,
  activity_point_reward = EXCLUDED.activity_point_reward;

INSERT INTO story_mission (
  chapter_id,
  mission_number,
  judul,
  deskripsi,
  mission_type,
  objective_config,
  xp_reward,
  activity_point_reward,
  aktif
)
SELECT
  c.id,
  2,
  'Suara Kolam',
  'Tangkap ikan dari habitat empang.',
  'catch_habitat',
  '{"habitat": "empang", "count": 1}'::jsonb,
  75,
  25,
  true
FROM story_chapter c
WHERE c.slug = 'bab-1-gerbang-empang'
ON CONFLICT (chapter_id, mission_number) DO UPDATE SET
  judul = EXCLUDED.judul,
  deskripsi = EXCLUDED.deskripsi,
  mission_type = EXCLUDED.mission_type,
  objective_config = EXCLUDED.objective_config,
  xp_reward = EXCLUDED.xp_reward,
  activity_point_reward = EXCLUDED.activity_point_reward;

INSERT INTO story_mission (
  chapter_id,
  mission_number,
  judul,
  deskripsi,
  mission_type,
  objective_config,
  xp_reward,
  activity_point_reward,
  aktif
)
SELECT
  c.id,
  3,
  'Raja Kolam',
  'Tangkap Ikan Mas minimal 1 kg (auto-verified atau setelah CS approve).',
  'catch_min_weight',
  '{"species_slug": "ikan-mas", "min_weight_kg": 1.0, "count": 1}'::jsonb,
  100,
  30,
  true
FROM story_chapter c
WHERE c.slug = 'bab-1-gerbang-empang'
ON CONFLICT (chapter_id, mission_number) DO UPDATE SET
  judul = EXCLUDED.judul,
  deskripsi = EXCLUDED.deskripsi,
  mission_type = EXCLUDED.mission_type,
  objective_config = EXCLUDED.objective_config,
  xp_reward = EXCLUDED.xp_reward,
  activity_point_reward = EXCLUDED.activity_point_reward;
