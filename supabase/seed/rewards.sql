-- Hadiah tukar poin — aman di-run langsung di SQL Editor (DDL + seed)
-- Setara: 005_rewards.sql + data hadiah

CREATE TABLE IF NOT EXISTS reward_catalog (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,
  nama        text NOT NULL,
  deskripsi   text,
  icon        text NOT NULL DEFAULT '🎁',
  cost_poin   int NOT NULL CHECK (cost_poin > 0),
  stock       int,
  aktif       boolean DEFAULT true,
  dibuat_at   timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reward_redemption (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id     uuid NOT NULL REFERENCES member(id) ON DELETE CASCADE,
  reward_id     uuid NOT NULL REFERENCES reward_catalog(id),
  cost_poin     int NOT NULL CHECK (cost_poin > 0),
  status        text NOT NULL DEFAULT 'pending',
  note          text,
  cs_id         uuid REFERENCES member(id),
  dibuat_at     timestamptz DEFAULT now(),
  fulfilled_at  timestamptz
);

CREATE INDEX IF NOT EXISTS idx_reward_redemption_member ON reward_redemption(member_id);
CREATE INDEX IF NOT EXISTS idx_reward_redemption_status ON reward_redemption(status);

ALTER TABLE reward_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemption ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reward catalog baca aktif" ON reward_catalog;
CREATE POLICY "reward catalog baca aktif"
  ON reward_catalog FOR SELECT USING (aktif = true);

DROP POLICY IF EXISTS "redemption milik sendiri" ON reward_redemption;
CREATE POLICY "redemption milik sendiri"
  ON reward_redemption FOR SELECT USING (auth.uid() = member_id);

INSERT INTO reward_catalog (slug, nama, deskripsi, icon, cost_poin, stock, aktif)
VALUES
  (
    'diskon-essen-10',
    'Diskon 10% Essen NF',
    'Voucher diskon 10% untuk produk Essen NF. CS akan hubungi via WA.',
    '💧',
    500,
    NULL,
    true
  ),
  (
    'essen-lure-gratis',
    'Essen/Lure Gratis',
    'Satu produk Essen atau Lure NF gratis (sesuai stok).',
    '🧪',
    1200,
    NULL,
    true
  ),
  (
    'paket-umpan-merch',
    'Paket Umpan + Merch NF',
    'Paket umpan pilihan + merchandise NF edisi terbatas.',
    '🎁',
    3000,
    50,
    true
  )
ON CONFLICT (slug) DO UPDATE SET
  nama = EXCLUDED.nama,
  deskripsi = EXCLUDED.deskripsi,
  icon = EXCLUDED.icon,
  cost_poin = EXCLUDED.cost_poin,
  stock = EXCLUDED.stock,
  aktif = EXCLUDED.aktif;
