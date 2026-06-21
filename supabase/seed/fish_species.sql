-- Seed 38 spesies ikan (nama_ilmiah null jika belum diverifikasi)
INSERT INTO fish_species (slug, nama, habitat, kategori, average_weight_kg, base_rarity, base_xp, is_predator, is_boss_available)
VALUES
  ('ikan-mas', 'Ikan Mas', 'empang', 'air_tawar', 1.500, 'common', 15, false, true),
  ('nila', 'Nila', 'empang', 'air_tawar', 0.500, 'common', 10, false, false),
  ('mujair', 'Mujair', 'empang', 'air_tawar', 0.400, 'common', 10, false, false),
  ('lele', 'Lele', 'empang', 'air_tawar', 1.000, 'common', 12, false, true),
  ('patin', 'Patin', 'empang', 'air_tawar', 2.000, 'uncommon', 18, false, true),
  ('bawal-air-tawar', 'Bawal Air Tawar', 'empang', 'air_tawar', 1.200, 'uncommon', 16, false, false),
  ('gurame', 'Gurame', 'empang', 'air_tawar', 1.800, 'uncommon', 18, false, false),
  ('tawes', 'Tawes', 'sungai', 'air_tawar', 0.800, 'common', 12, false, false),
  ('nilem', 'Nilem', 'sungai', 'air_tawar', 1.000, 'common', 14, false, false),
  ('baung', 'Baung', 'sungai', 'air_tawar', 0.800, 'common', 14, false, true),
  ('hampala', 'Hampala', 'sungai', 'air_tawar', 1.000, 'uncommon', 16, true, false),
  ('jelawat', 'Jelawat', 'sungai', 'air_tawar', 1.500, 'uncommon', 18, false, false),
  ('keting', 'Keting', 'sungai', 'air_tawar', 0.600, 'common', 12, false, false),
  ('gabus', 'Gabus', 'rawa', 'air_tawar', 0.800, 'uncommon', 16, true, true),
  ('toman', 'Toman', 'rawa', 'air_tawar', 3.000, 'rare', 25, true, true),
  ('betok', 'Betok', 'rawa', 'air_tawar', 0.300, 'common', 10, false, false),
  ('sepat', 'Sepat', 'rawa', 'air_tawar', 0.400, 'common', 10, false, false),
  ('belida', 'Belida', 'rawa', 'air_tawar', 2.500, 'rare', 22, true, false),
  ('sidat', 'Sidat', 'rawa', 'air_tawar', 1.500, 'uncommon', 18, true, false),
  ('tapah', 'Tapah', 'rawa', 'air_tawar', 2.000, 'rare', 22, true, false),
  ('wader', 'Wader', 'micro', 'air_tawar', 0.030, 'common', 8, false, true),
  ('uceng', 'Uceng', 'micro', 'air_tawar', 0.020, 'common', 8, false, false),
  ('seluang', 'Seluang', 'micro', 'air_tawar', 0.015, 'common', 8, false, false),
  ('cere', 'Cere', 'micro', 'air_tawar', 0.010, 'common', 8, false, false),
  ('rasbora', 'Rasbora', 'micro', 'air_tawar', 0.008, 'common', 8, false, false),
  ('lunjar', 'Lunjar', 'micro', 'air_tawar', 0.012, 'common', 8, false, false),
  ('bandeng', 'Bandeng', 'muara', 'air_asin', 1.500, 'uncommon', 16, false, false),
  ('belanak', 'Belanak', 'muara', 'air_asin', 0.800, 'common', 12, false, false),
  ('kakap-putih', 'Kakap Putih', 'muara', 'air_asin', 2.000, 'rare', 22, true, true),
  ('baronang', 'Baronang', 'muara', 'air_asin', 0.500, 'common', 12, false, false),
  ('sembilang', 'Sembilang', 'muara', 'air_asin', 1.200, 'uncommon', 16, false, false),
  ('kerapu-lumpur', 'Kerapu Lumpur', 'muara', 'air_asin', 1.800, 'uncommon', 18, true, false),
  ('kerapu-macan', 'Kerapu Macan', 'laut', 'air_asin', 2.500, 'rare', 22, true, false),
  ('kuwe', 'Kuwe', 'laut', 'air_asin', 1.500, 'uncommon', 16, false, false),
  ('tenggiri', 'Tenggiri', 'laut', 'air_asin', 3.000, 'rare', 25, true, false),
  ('barracuda', 'Barracuda', 'laut', 'air_asin', 4.000, 'epic', 30, true, false),
  ('tuna-sirip-kuning', 'Tuna Sirip Kuning', 'laut', 'air_asin', 5.000, 'epic', 35, true, false),
  ('mahseer', 'Mahseer', 'sungai', 'air_tawar', 4.000, 'legendary', 40, true, true)
ON CONFLICT (slug) DO UPDATE SET
  nama = EXCLUDED.nama,
  habitat = EXCLUDED.habitat,
  average_weight_kg = EXCLUDED.average_weight_kg,
  updated_at = now();

-- Backfill fish_species_id dari text fish lama
UPDATE tangkapan t SET fish_species_id = fs.id
FROM fish_species fs
WHERE t.fish_species_id IS NULL
  AND lower(replace(t.fish, ' ', '-')) = fs.slug;

UPDATE tangkapan t SET fish_species_id = fs.id
FROM fish_species fs
WHERE t.fish_species_id IS NULL AND t.fish = 'Ikan Mas' AND fs.slug = 'ikan-mas';

UPDATE tangkapan t SET fish_species_id = fs.id
FROM fish_species fs
WHERE t.fish_species_id IS NULL AND t.fish = 'Bawal' AND fs.slug = 'bawal-air-tawar';

UPDATE fish_card fc SET fish_species_id = fs.id, fish_name_snapshot = fc.fish
FROM fish_species fs
WHERE fc.fish_species_id IS NULL
  AND (
    lower(replace(fc.fish, ' ', '-')) = fs.slug
    OR (fc.fish = 'Ikan Mas' AND fs.slug = 'ikan-mas')
    OR (fc.fish = 'Bawal' AND fs.slug = 'bawal-air-tawar')
  );
