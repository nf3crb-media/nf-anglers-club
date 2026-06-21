-- Seed strike juara, legenda, fish_card, poin_log (jalankan setelah schema.sql + seed-feed.sql)

-- Perkaya member dari seed-feed
UPDATE member SET
  kota = 'Tangerang Selatan',
  provinsi = 'Banten',
  total_belanja = 2500000,
  poin_belanja = 2400,
  poin_aktivitas = 440,
  tier = 'Gold'
WHERE id = 'a1111111-1111-1111-1111-111111111103';

UPDATE member SET
  kota = 'Cirebon',
  provinsi = 'Jawa Barat',
  poin_belanja = 2400,
  poin_aktivitas = 500,
  tier = 'Gold'
WHERE id = 'a1111111-1111-1111-1111-111111111102';

UPDATE member SET
  kota = 'Tangerang Selatan',
  provinsi = 'Banten',
  poin_belanja = 1200,
  poin_aktivitas = 340,
  tier = 'Silver'
WHERE id = 'a1111111-1111-1111-1111-111111111101';

UPDATE member SET
  kota = 'Bandung',
  provinsi = 'Jawa Barat',
  poin_belanja = 1100,
  poin_aktivitas = 280,
  tier = 'Silver'
WHERE id = 'a1111111-1111-1111-1111-111111111104';

-- Poin log Sampriatna
INSERT INTO poin_log (member_id, jenis, label, poin, oleh, dibuat_at)
SELECT 'a1111111-1111-1111-1111-111111111103', v.jenis, v.label, v.poin, v.oleh, v.dibuat_at
FROM (VALUES
  ('belanja', 'Belanja NF Strike Series (3 pcs)', 150, 'CS', now() - interval '1 day'),
  ('aktivitas', 'Strike Juara terverifikasi', 500, 'Sistem', now() - interval '2 days'),
  ('belanja', 'Belanja Essen Ikan Mas NF + Booster Katilayu', 320, 'CS', now() - interval '5 days'),
  ('aktivitas', 'Post tangkapan + tandai spot', 60, 'Sistem', now() - interval '7 days')
) AS v(jenis, label, poin, oleh, dibuat_at)
WHERE NOT EXISTS (
  SELECT 1 FROM poin_log pl
  WHERE pl.member_id = 'a1111111-1111-1111-1111-111111111103'
    AND pl.label = v.label
);

-- Fish cards Sampriatna
INSERT INTO fish_card (member_id, fish, weight, disc, gear, uses_nf, rarity, status, dibuat_at)
SELECT 'a1111111-1111-1111-1111-111111111103', v.fish, v.weight, v.disc, v.gear, true, v.rarity, 'tayang', v.dibuat_at
FROM (VALUES
  ('Ikan Mas', 4.2, 'galatama', 'NF Strike Series', 'legendary', now() - interval '3 days'),
  ('Bawal', 3.1, 'kiloan', 'Magic Strike NF', 'epic', now() - interval '5 days'),
  ('Gabus', 1.4, 'casting', 'Essen Ikan Mas NF', 'rare', now() - interval '10 days'),
  ('Nila', 0.6, 'danau', 'Booster Katilayu NF', 'uncommon', now() - interval '14 days'),
  ('Lele', 0.9, 'kiloan', 'Essen Lele NF', 'common', now() - interval '20 days')
) AS v(fish, weight, disc, gear, rarity, dibuat_at)
WHERE NOT EXISTS (
  SELECT 1 FROM fish_card fc
  WHERE fc.member_id = 'a1111111-1111-1111-1111-111111111103'
    AND fc.fish = v.fish AND fc.weight = v.weight
);

-- Strike juara terverifikasi
INSERT INTO strike_juara (
  member_id, disc, event_name, fish, weight, place, prize, gear, uses_nf,
  kota, foto_kolam, foto_juara, foto_hadiah, verified, status, poin_awarded, dibuat_at
)
SELECT m.id, v.disc, v.event_name, v.fish, v.weight, v.place, v.prize, v.gear, true,
  v.kota, 'https://example.com/kolam.jpg', 'https://example.com/juara.jpg', 'https://example.com/hadiah.jpg',
  true, 'verified', 500, v.dibuat_at
FROM (VALUES
  ('628111111103', 'galatama', 'Galatama Mas — Kolam Berkah Jaya', 'Ikan Mas', 4.2, 1, 'Rp 5.000.000 + Trofi', 'NF Strike Series + pelet', 'Tangerang Selatan', now() - interval '1 day'),
  ('628111111102', 'casting', 'Casting Gabus Open — Rawa Kebon', 'Gabus', 2.1, 1, 'Reel + Rp 1.000.000', 'Magic Strike NF', 'Cirebon', now() - interval '2 days'),
  ('628111111101', 'kiloan', 'Gebrus Bawal Cup — Kolam Sumber Rejeki', 'Bawal', 3.5, 2, 'Rp 500.000', 'Essen Ikan Mas NF', 'Tangerang Selatan', now() - interval '4 days')
) AS v(wa, disc, event_name, fish, weight, place, prize, gear, kota, dibuat_at)
JOIN member m ON m.wa_number = v.wa
WHERE NOT EXISTS (
  SELECT 1 FROM strike_juara sj
  WHERE sj.member_id = m.id AND sj.event_name = v.event_name
);

-- Legenda ranking
INSERT INTO legenda (member_id, gelar_kota, gelar_provinsi, gelar_nasional, poin_legenda)
VALUES
  ('a1111111-1111-1111-1111-111111111103', 7, 5, 2, 9800),
  ('a1111111-1111-1111-1111-111111111101', 5, 3, 1, 7200),
  ('a1111111-1111-1111-1111-111111111102', 4, 2, 0, 6100),
  ('a1111111-1111-1111-1111-111111111104', 6, 4, 3, 8400)
ON CONFLICT (member_id) DO UPDATE SET
  gelar_kota = EXCLUDED.gelar_kota,
  gelar_provinsi = EXCLUDED.gelar_provinsi,
  gelar_nasional = EXCLUDED.gelar_nasional,
  poin_legenda = EXCLUDED.poin_legenda,
  updated_at = now();
