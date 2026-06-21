-- ============================================================
-- KODE FRESH — jalankan di Supabase SQL Editor
-- Seed lama (NF-SAMP-0001 dll) TIDAK overwrite jika sudah ada
-- dan status = terpakai. Pakai kode BARU di bawah ini.
-- ============================================================

INSERT INTO kode_unik (kode, batch, produk, status)
VALUES
  ('NF-SAMP-J21-A', 'BATCH-SAMPRIATNA-JUN26', 'NF Anglers Club Access', 'belum_dipakai'),
  ('NF-SAMP-J21-B', 'BATCH-SAMPRIATNA-JUN26', 'NF Anglers Club Access', 'belum_dipakai'),
  ('NF-FRESH-J21-01', 'BATCH-FRESH-JUN26', 'NF Anglers Club Access', 'belum_dipakai'),
  ('NF-FRESH-J21-02', 'BATCH-FRESH-JUN26', 'NF Anglers Club Access', 'belum_dipakai'),
  ('NF-FRESH-J21-03', 'BATCH-FRESH-JUN26', 'NF Anglers Club Access', 'belum_dipakai')
ON CONFLICT (kode) DO NOTHING;

-- Untuk sampriatna@gmail.com / WA 081286660880 pakai:
--   NF-SAMP-J21-A   (cadangan: NF-SAMP-J21-B)

-- ============================================================
-- DIAGNOSTIK — kenapa "sudah dipakai"?
-- ============================================================

-- 1) Status semua kode admin/dev:
-- SELECT kode, status, dipakai_oleh, dipakai_at, batch
-- FROM kode_unik
-- WHERE kode LIKE 'NF-SAMP%' OR kode LIKE 'NF-ADMIN%' OR kode LIKE 'NF-TEST%' OR kode LIKE 'NF-FRESH%'
-- ORDER BY dibuat_at DESC;

-- 2) Kode yang masih bisa dipakai:
-- SELECT kode, batch, produk FROM kode_unik WHERE status = 'belum_dipakai' ORDER BY dibuat_at DESC LIMIT 20;

-- 3) Apakah WA/email sampriatna sudah terdaftar? (bukan masalah kode)
-- SELECT id, nama, email, wa_number, is_admin, is_cs FROM member
-- WHERE email = 'sampriatna@gmail.com'
--    OR wa_number IN ('6281286660880', '081286660880');

-- Jika baris member ADA → jangan daftar lagi; pakai Login → WhatsApp OTP.

-- ============================================================
-- OPSIONAL: reset kode TERTENTU (hanya jika daftar GAGAL & kode terpakai tanpa member)
-- ============================================================
-- UPDATE kode_unik
-- SET status = 'belum_dipakai', dipakai_oleh = NULL, dipakai_at = NULL
-- WHERE kode = 'NF-SAMP-0001'
--   AND dipakai_oleh IS NOT NULL
--   AND NOT EXISTS (SELECT 1 FROM member m WHERE m.id = kode_unik.dipakai_oleh);
