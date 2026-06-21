-- Kode daftar baru (jalankan di Supabase SQL Editor)
-- PENTING: ON CONFLICT DO NOTHING = kode yang SUDAH ADA tidak di-reset.
-- Kalau NF-SAMP-0001 status terpakai, pakai seed baru: kode_fresh_jun26.sql

INSERT INTO kode_unik (kode, batch, produk, status)
VALUES
  ('NF-SAMP-0001', 'BATCH-ADMIN-2026', 'NF Anglers Club Access', 'belum_dipakai'),
  ('NF-ADMIN-0002', 'BATCH-ADMIN-2026', 'NF Anglers Club Access', 'belum_dipakai'),
  ('NF-ADMIN-0003', 'BATCH-ADMIN-2026', 'NF Anglers Club Access', 'belum_dipakai'),
  ('NF-ADMIN-0004', 'BATCH-ADMIN-2026', 'NF Anglers Club Access', 'belum_dipakai'),
  ('NF-TEST-0002', 'BATCH-DEV', 'Essen Amis NF 30ml', 'belum_dipakai')
ON CONFLICT (kode) DO NOTHING;

-- Cek kode siap pakai:
-- SELECT kode, batch, status FROM kode_unik WHERE status = 'belum_dipakai' ORDER BY dibuat_at DESC;

-- Super admin kedua: sampriatna@gmail.com + WA 081286660880
-- Daftar di app dengan kode NF-SAMP-0001 (atau NF-ADMIN-0002).
-- Pastikan Vercel env: NF_SUPER_ADMIN_EMAILS=nf3.crb@gmail.com,sampriatna@gmail.com

-- Cek WA/email belum dipakai member lain:
-- SELECT id, nama, email, wa_number FROM member
-- WHERE wa_number IN ('6281286660880', '081286660880')
--    OR email = 'sampriatna@gmail.com';
