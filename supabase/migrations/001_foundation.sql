-- 001_foundation.sql — idempotent foundation (fish_species, member cols, future tables)
-- Prasyarat dev: jalankan 000_dev_reset.sql jika member lama tanpa auth.users

-- ============================================================
-- FISH SPECIES (master ikan)
-- ============================================================
CREATE TABLE IF NOT EXISTS fish_species (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                text UNIQUE NOT NULL,
  nama                text NOT NULL,
  nama_lain           text[] DEFAULT '{}',
  nama_ilmiah         text,
  habitat             text NOT NULL,
  kategori            text NOT NULL DEFAULT 'air_tawar',
  average_weight_kg   numeric(8,3),
  minimum_weight_kg   numeric(8,3),
  maximum_weight_kg   numeric(8,3),
  base_rarity         text NOT NULL DEFAULT 'common',
  base_xp             int NOT NULL DEFAULT 10,
  deskripsi           text,
  image_url           text,
  is_predator         boolean DEFAULT false,
  is_native           boolean DEFAULT true,
  is_boss_available   boolean DEFAULT false,
  aktif               boolean DEFAULT true,
  dibuat_at           timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fish_species_habitat ON fish_species(habitat);
CREATE INDEX IF NOT EXISTS idx_fish_species_aktif ON fish_species(aktif);

-- ============================================================
-- MEMBER — kolom baru (auth FK di 002 setelah Supabase Auth aktif)
-- ============================================================
ALTER TABLE member ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE member ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE member ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE member ADD COLUMN IF NOT EXISTS preferred_discipline text;
ALTER TABLE member ADD COLUMN IF NOT EXISTS customer_tier text;
ALTER TABLE member ADD COLUMN IF NOT EXISTS wa_verified boolean DEFAULT false;
ALTER TABLE member ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;
ALTER TABLE member ADD COLUMN IF NOT EXISTS is_cs boolean DEFAULT false;
ALTER TABLE member ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

UPDATE member SET customer_tier = tier WHERE customer_tier IS NULL AND tier IS NOT NULL;

-- ============================================================
-- XP & GAME PROGRESS (kosong, siap FASE 3–4)
-- ============================================================
CREATE TABLE IF NOT EXISTS xp_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id   uuid NOT NULL REFERENCES member(id) ON DELETE CASCADE,
  source      text NOT NULL,
  label       text NOT NULL,
  xp          int NOT NULL CHECK (xp > 0),
  ref_type    text,
  ref_id      uuid,
  idempotency_key text UNIQUE,
  dibuat_at   timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS member_game_progress (
  member_id       uuid PRIMARY KEY REFERENCES member(id) ON DELETE CASCADE,
  angler_xp       int NOT NULL DEFAULT 0,
  angler_level    int NOT NULL DEFAULT 1,
  angler_rank     text NOT NULL DEFAULT 'Anak Kali',
  story_chapter   int NOT NULL DEFAULT 1,
  updated_at      timestamptz DEFAULT now()
);

-- ============================================================
-- FISHDEX
-- ============================================================
CREATE TABLE IF NOT EXISTS member_fishdex (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id           uuid NOT NULL REFERENCES member(id) ON DELETE CASCADE,
  fish_species_id     uuid NOT NULL REFERENCES fish_species(id),
  first_catch_id      uuid,
  largest_catch_id    uuid,
  highest_weight_kg   numeric(8,3),
  total_catches       int NOT NULL DEFAULT 0,
  first_discovered_at timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now(),
  UNIQUE (member_id, fish_species_id)
);

-- ============================================================
-- STORY (schema kosong, FASE 4)
-- ============================================================
CREATE TABLE IF NOT EXISTS story_chapter (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_number  int UNIQUE NOT NULL,
  slug            text UNIQUE NOT NULL,
  judul           text NOT NULL,
  intro_story     text,
  outro_story     text,
  habitat         text,
  cover_image_url text,
  unlock_level    int NOT NULL DEFAULT 1,
  aktif           boolean DEFAULT true,
  dibuat_at       timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS boss_fish (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fish_species_id     uuid NOT NULL REFERENCES fish_species(id),
  boss_name           text NOT NULL,
  deskripsi           text,
  difficulty          text NOT NULL DEFAULT 'normal',
  minimum_weight_kg   numeric(8,3),
  required_discipline text,
  required_habitat    text,
  phases              jsonb DEFAULT '{}',
  reward_config       jsonb DEFAULT '{}',
  image_url           text,
  aktif               boolean DEFAULT true,
  dibuat_at           timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS story_mission (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id              uuid NOT NULL REFERENCES story_chapter(id) ON DELETE CASCADE,
  mission_number          int NOT NULL,
  judul                   text NOT NULL,
  deskripsi               text,
  mission_type            text NOT NULL DEFAULT 'catch_any',
  objective_config        jsonb NOT NULL DEFAULT '{}',
  xp_reward               int NOT NULL DEFAULT 0,
  activity_point_reward   int NOT NULL DEFAULT 0,
  badge_reward_id         uuid,
  previous_mission_id     uuid REFERENCES story_mission(id),
  is_boss                 boolean DEFAULT false,
  boss_fish_id            uuid REFERENCES boss_fish(id),
  aktif                   boolean DEFAULT true,
  dibuat_at               timestamptz DEFAULT now(),
  UNIQUE (chapter_id, mission_number)
);

CREATE TABLE IF NOT EXISTS member_mission_progress (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id           uuid NOT NULL REFERENCES member(id) ON DELETE CASCADE,
  mission_id          uuid NOT NULL REFERENCES story_mission(id) ON DELETE CASCADE,
  status              text NOT NULL DEFAULT 'locked',
  progress_data       jsonb DEFAULT '{}',
  attempts            int NOT NULL DEFAULT 0,
  completed_catch_id  uuid,
  started_at          timestamptz,
  completed_at        timestamptz,
  UNIQUE (member_id, mission_id)
);

-- ============================================================
-- TANGKAPAN — kolom verifikasi & species (backfill setelah seed)
-- ============================================================
ALTER TABLE tangkapan ADD COLUMN IF NOT EXISTS fish_species_id uuid REFERENCES fish_species(id);
ALTER TABLE tangkapan ADD COLUMN IF NOT EXISTS custom_spot_name text;
ALTER TABLE tangkapan ADD COLUMN IF NOT EXISTS length_cm numeric(8,2);
ALTER TABLE tangkapan ADD COLUMN IF NOT EXISTS bait text;
ALTER TABLE tangkapan ADD COLUMN IF NOT EXISTS nf_product text;
ALTER TABLE tangkapan ADD COLUMN IF NOT EXISTS caught_at timestamptz;
ALTER TABLE tangkapan ADD COLUMN IF NOT EXISTS is_catch_and_release boolean DEFAULT false;
ALTER TABLE tangkapan ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'pending';
ALTER TABLE tangkapan ADD COLUMN IF NOT EXISTS verified_by uuid;
ALTER TABLE tangkapan ADD COLUMN IF NOT EXISTS verified_at timestamptz;
ALTER TABLE tangkapan ADD COLUMN IF NOT EXISTS rejection_reason text;
ALTER TABLE tangkapan ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

UPDATE tangkapan SET verification_status = 'verified', caught_at = dibuat_at
WHERE status = 'tayang' AND verification_status = 'pending';

-- ============================================================
-- FISH CARD — species FK + snapshot
-- ============================================================
ALTER TABLE fish_card ADD COLUMN IF NOT EXISTS fish_species_id uuid REFERENCES fish_species(id);
ALTER TABLE fish_card ADD COLUMN IF NOT EXISTS fish_name_snapshot text;
ALTER TABLE fish_card ADD COLUMN IF NOT EXISTS serial_number text;
ALTER TABLE fish_card ADD COLUMN IF NOT EXISTS nf_boosted boolean DEFAULT false;

-- ============================================================
-- RLS — fish_species publik baca
-- ============================================================
ALTER TABLE fish_species ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "fish_species baca aktif" ON fish_species;
CREATE POLICY "fish_species baca aktif"
  ON fish_species FOR SELECT USING (aktif = true);

ALTER TABLE member_fishdex ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "fishdex milik sendiri" ON member_fishdex;
CREATE POLICY "fishdex milik sendiri"
  ON member_fishdex FOR SELECT USING (auth.uid() = member_id);

ALTER TABLE xp_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "xp log milik sendiri" ON xp_log;
CREATE POLICY "xp log milik sendiri"
  ON xp_log FOR SELECT USING (auth.uid() = member_id);

ALTER TABLE member_game_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "game progress milik sendiri" ON member_game_progress;
CREATE POLICY "game progress milik sendiri"
  ON member_game_progress FOR SELECT USING (auth.uid() = member_id);

-- Cek hasil:
-- SELECT count(*) FROM fish_species;
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'member';
