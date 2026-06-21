-- Kode dev setelah reset
INSERT INTO kode_unik (kode, batch, produk, status)
VALUES ('NF-TEST-0001', 'BATCH-DEV', 'Essen Amis NF 30ml', 'belum_dipakai')
ON CONFLICT (kode) DO NOTHING;
