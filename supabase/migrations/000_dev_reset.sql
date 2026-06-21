-- NF Anglers Club — DEV RESET
-- Jalankan hanya di Supabase development sebelum migration auth.
-- JANGAN di production tanpa backup.

BEGIN;

TRUNCATE TABLE
  poin_log,
  fish_card,
  strike_juara,
  legenda,
  tangkapan,
  spot,
  kode_unik,
  member
RESTART IDENTITY CASCADE;

COMMIT;

-- Urutan setelah reset:
-- 1. supabase/migrations/001_foundation.sql
-- 2. supabase/seed/fish_species.sql
-- 3. supabase/seed/kode_dev.sql
-- 4. (nanti) supabase/migrations/002_auth_member.sql — setelah Email Auth aktif
