-- Seed feed tangkapan untuk Fase 2 (jalankan setelah schema.sql)
-- Member contoh + tangkapan tayang

INSERT INTO member (id, wa_number, nama, username, tier, poin_belanja, poin_aktivitas)
VALUES
  ('a1111111-1111-1111-1111-111111111101', '628111111101', 'Mang Dul', 'mangdul', 'Silver', 1200, 340),
  ('a1111111-1111-1111-1111-111111111102', '628111111102', 'Bintang_Angler', 'bintang', 'Gold', 2400, 500),
  ('a1111111-1111-1111-1111-111111111103', '628111111103', 'Sampriatna', 'sam.priatna', 'Gold', 2400, 440),
  ('a1111111-1111-1111-1111-111111111104', '628111111104', 'Koh Aan', 'kohaan', 'Silver', 1100, 280)
ON CONFLICT (wa_number) DO NOTHING;

INSERT INTO tangkapan (member_id, fish, weight, disc, gear, uses_nf, likes, status, dibuat_at)
SELECT m.id, t.fish, t.weight, t.disc, t.gear, t.uses_nf, t.likes, 'tayang', t.dibuat_at
FROM (VALUES
  ('628111111101', 'Ikan Mas', 2.4, 'galatama', 'Essen Ikan Mas NF + pelet', true, 34, now() - interval '2 hours'),
  ('628111111102', 'Gabus', 1.8, 'casting', 'NF Strike Series', true, 28, now() - interval '5 hours'),
  ('628111111103', 'Bawal', 3.1, 'kiloan', 'Magic Strike NF', true, 51, now() - interval '1 day'),
  ('628111111104', 'Wader', 0.02, 'micro', 'Kail micro #26 + kroto', false, 41, now() - interval '1 day')
) AS t(wa, fish, weight, disc, gear, uses_nf, likes, dibuat_at)
JOIN member m ON m.wa_number = t.wa
WHERE NOT EXISTS (
  SELECT 1 FROM tangkapan tg
  WHERE tg.member_id = m.id AND tg.fish = t.fish AND tg.weight = t.weight
);
