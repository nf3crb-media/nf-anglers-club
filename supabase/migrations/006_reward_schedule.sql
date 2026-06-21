-- Jadwal & highlight hadiah (promo musiman / time-limited)

ALTER TABLE reward_catalog ADD COLUMN IF NOT EXISTS highlight text;
ALTER TABLE reward_catalog ADD COLUMN IF NOT EXISTS starts_at timestamptz;
ALTER TABLE reward_catalog ADD COLUMN IF NOT EXISTS ends_at timestamptz;
ALTER TABLE reward_catalog ADD COLUMN IF NOT EXISTS sort_order int NOT NULL DEFAULT 0;
ALTER TABLE reward_catalog ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_reward_catalog_schedule ON reward_catalog(starts_at, ends_at);
