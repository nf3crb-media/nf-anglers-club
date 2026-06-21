-- Badge catalog + member ownership (FASE 5)
CREATE TABLE IF NOT EXISTS badge (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text UNIQUE NOT NULL,
  nama            text NOT NULL,
  emoji           text NOT NULL DEFAULT '🏅',
  deskripsi       text,
  kategori        text NOT NULL DEFAULT 'story',
  aktif           boolean DEFAULT true,
  dibuat_at       timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS member_badge (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id   uuid NOT NULL REFERENCES member(id) ON DELETE CASCADE,
  badge_id    uuid NOT NULL REFERENCES badge(id) ON DELETE CASCADE,
  earned_at   timestamptz DEFAULT now(),
  source      text,
  ref_id      uuid,
  UNIQUE (member_id, badge_id)
);

CREATE INDEX IF NOT EXISTS member_badge_member_idx ON member_badge (member_id);

-- FK story_mission.badge_reward_id (kolom sudah ada di 001)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'story_mission_badge_reward_id_fkey'
  ) THEN
    ALTER TABLE story_mission
      ADD CONSTRAINT story_mission_badge_reward_id_fkey
      FOREIGN KEY (badge_reward_id) REFERENCES badge(id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
