-- NF Anglers Club — jalankan di Supabase SQL Editor
-- Urutan tabel diperbaiki: member dulu (kode_unik referensi member)

-- ============================================================
-- TABEL 1: MEMBER
-- ============================================================
CREATE TABLE IF NOT EXISTS member (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wa_number       text UNIQUE NOT NULL,
  nama            text NOT NULL,
  username        text UNIQUE,
  tier            text DEFAULT 'Bronze',
  poin_belanja    int DEFAULT 0,
  poin_aktivitas  int DEFAULT 0,
  total_belanja   bigint DEFAULT 0,
  kota            text,
  provinsi        text,
  joined_at       timestamptz DEFAULT now(),
  last_active     timestamptz DEFAULT now()
);

ALTER TABLE member ADD COLUMN IF NOT EXISTS total_poin int GENERATED ALWAYS AS (poin_belanja + poin_aktivitas) STORED;

-- ============================================================
-- TABEL 2: KODE UNIK PRODUK
-- ============================================================
CREATE TABLE IF NOT EXISTS kode_unik (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kode        text UNIQUE NOT NULL,
  batch       text,
  produk      text,
  status      text DEFAULT 'belum_dipakai',
  dipakai_oleh uuid REFERENCES member(id),
  dipakai_at  timestamptz,
  dibuat_at   timestamptz DEFAULT now()
);

-- ============================================================
-- TABEL 3: POIN LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS poin_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id   uuid REFERENCES member(id) ON DELETE CASCADE,
  jenis       text NOT NULL,
  label       text NOT NULL,
  poin        int NOT NULL,
  oleh        text NOT NULL,
  cs_id       uuid,
  dibuat_at   timestamptz DEFAULT now()
);

-- ============================================================
-- TABEL 4: SPOT MANCING
-- ============================================================
CREATE TABLE IF NOT EXISTS spot (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id   uuid REFERENCES member(id),
  lat         float NOT NULL,
  lng         float NOT NULL,
  nama        text,
  fish        text NOT NULL,
  disc        text NOT NULL,
  best_bait   text,
  productive  boolean DEFAULT false,
  kota        text,
  provinsi    text,
  dibuat_at   timestamptz DEFAULT now()
);

-- ============================================================
-- TABEL 5: TANGKAPAN (FEED)
-- ============================================================
CREATE TABLE IF NOT EXISTS tangkapan (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id   uuid REFERENCES member(id),
  spot_id     uuid REFERENCES spot(id),
  fish        text NOT NULL,
  weight      float,
  disc        text NOT NULL,
  gear        text,
  uses_nf     boolean DEFAULT false,
  photo_url   text,
  caption     text,
  likes       int DEFAULT 0,
  status      text DEFAULT 'tayang',
  dibuat_at   timestamptz DEFAULT now()
);

-- ============================================================
-- TABEL 6: FISH CARD
-- ============================================================
CREATE TABLE IF NOT EXISTS fish_card (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id   uuid REFERENCES member(id),
  tangkapan_id uuid REFERENCES tangkapan(id),
  fish        text NOT NULL,
  weight      float NOT NULL,
  disc        text NOT NULL,
  gear        text,
  uses_nf     boolean DEFAULT false,
  rarity      text NOT NULL,
  rarity_ratio float,
  from_comp   boolean DEFAULT false,
  card_url    text,
  photo_url   text,
  status      text DEFAULT 'tayang',
  dibuat_at   timestamptz DEFAULT now()
);

-- ============================================================
-- TABEL 7: STRIKE JUARA
-- ============================================================
CREATE TABLE IF NOT EXISTS strike_juara (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id     uuid REFERENCES member(id),
  disc          text NOT NULL,
  event_name    text NOT NULL,
  fish          text NOT NULL,
  weight        float,
  place         int NOT NULL,
  prize         text,
  gear          text,
  uses_nf       boolean DEFAULT false,
  kota          text,
  foto_kolam    text,
  foto_juara    text,
  foto_hadiah   text,
  verified      boolean DEFAULT false,
  verified_by   uuid,
  verified_at   timestamptz,
  poin_awarded  int DEFAULT 0,
  status        text DEFAULT 'pending',
  dibuat_at     timestamptz DEFAULT now()
);

-- ============================================================
-- TABEL 8: LEGENDA
-- ============================================================
CREATE TABLE IF NOT EXISTS legenda (
  member_id   uuid PRIMARY KEY REFERENCES member(id),
  gelar_kota      int DEFAULT 0,
  gelar_provinsi  int DEFAULT 0,
  gelar_nasional  int DEFAULT 0,
  poin_legenda    int DEFAULT 0,
  updated_at  timestamptz DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE member ENABLE ROW LEVEL SECURITY;
ALTER TABLE poin_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE fish_card ENABLE ROW LEVEL SECURITY;
ALTER TABLE strike_juara ENABLE ROW LEVEL SECURITY;
ALTER TABLE spot ENABLE ROW LEVEL SECURITY;
ALTER TABLE tangkapan ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "member lihat diri sendiri" ON member;
CREATE POLICY "member lihat diri sendiri"
  ON member FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "poin log milik sendiri" ON poin_log;
CREATE POLICY "poin log milik sendiri"
  ON poin_log FOR SELECT USING (auth.uid() = member_id);

DROP POLICY IF EXISTS "spot publik semua" ON spot;
CREATE POLICY "spot publik semua"
  ON spot FOR SELECT USING (true);

DROP POLICY IF EXISTS "tangkapan publik" ON tangkapan;
CREATE POLICY "tangkapan publik"
  ON tangkapan FOR SELECT USING (status = 'tayang');

DROP POLICY IF EXISTS "fishcard publik" ON fish_card;
CREATE POLICY "fishcard publik"
  ON fish_card FOR SELECT USING (status = 'tayang');

DROP POLICY IF EXISTS "strike publik" ON strike_juara;
CREATE POLICY "strike publik"
  ON strike_juara FOR SELECT USING (verified = true);

-- Seed kode uji (opsional — hapus di production)
INSERT INTO kode_unik (kode, batch, produk, status)
VALUES ('NF-TEST-0001', 'BATCH-DEV', 'Essen Amis NF 30ml', 'belum_dipakai')
ON CONFLICT (kode) DO NOTHING;
