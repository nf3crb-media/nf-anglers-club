-- 002_auth_member.sql — jalankan SETELAH Supabase Auth Email aktif
-- member.id harus sama dengan auth.users.id

-- Hapus generated total_poin (campur sistem — gunakan poin_belanja + poin_aktivitas terpisah)
ALTER TABLE member DROP COLUMN IF EXISTS total_poin;

-- Pastikan tidak ada member orphan sebelum FK ketat (dev: sudah di-reset)
-- ALTER TABLE member DROP CONSTRAINT IF EXISTS member_pkey;
-- ALTER TABLE member ADD CONSTRAINT member_id_auth_fkey
--   FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Trigger: buat member_game_progress saat member baru
CREATE OR REPLACE FUNCTION init_member_game_progress()
RETURNS trigger AS $$
BEGIN
  INSERT INTO member_game_progress (member_id)
  VALUES (NEW.id)
  ON CONFLICT (member_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_init_member_game ON member;
CREATE TRIGGER trg_init_member_game
  AFTER INSERT ON member
  FOR EACH ROW EXECUTE FUNCTION init_member_game_progress();
