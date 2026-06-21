-- Katalog hadiah & riwayat penukaran poin

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
