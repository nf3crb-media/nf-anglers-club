-- Seed spot mancing (jalankan setelah schema + seed-feed.sql)
-- Koordinat nyata di Indonesia

INSERT INTO spot (member_id, lat, lng, nama, fish, disc, best_bait, productive, kota, provinsi)
SELECT m.id, s.lat, s.lng, s.nama, s.fish, s.disc, s.best_bait, s.productive, s.kota, s.provinsi
FROM (VALUES
  ('628111111101', -6.7320, 108.5523, 'Galatama Sumber, Cirebon', 'Ikan Mas', 'galatama', 'NF Strike Series sore hari', true, 'Cirebon', 'Jawa Barat'),
  ('628111111102', -6.2088, 106.8456, 'Rawa Kebon, Jakarta', 'Gabus', 'casting', 'Magic Strike NF pagi', true, 'Jakarta', 'DKI Jakarta'),
  ('628111111103', -7.2575, 112.7521, 'Empang Surabaya', 'Bawal', 'kiloan', 'Essen Ikan Mas NF', false, 'Surabaya', 'Jawa Timur'),
  ('628111111104', -6.9175, 107.6191, 'Situ Bandung', 'Nila liar', 'danau', 'Booster Katilayu NF', true, 'Bandung', 'Jawa Barat'),
  ('628111111104', -7.7956, 110.3695, 'Sungai Progo, Yogyakarta', 'Wader', 'micro', 'Kail #26 + kroto', false, 'Yogyakarta', 'DI Yogyakarta'),
  ('628111111101', 3.5952, 98.6722, 'Kolam Medan', 'Toman', 'casting', 'NF Strike Series', true, 'Medan', 'Sumatera Utara')
) AS s(wa, lat, lng, nama, fish, disc, best_bait, productive, kota, provinsi)
JOIN member m ON m.wa_number = s.wa
WHERE NOT EXISTS (
  SELECT 1 FROM spot sp WHERE sp.lat = s.lat AND sp.lng = s.lng AND sp.fish = s.fish
);
