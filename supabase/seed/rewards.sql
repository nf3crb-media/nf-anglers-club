-- Hadiah tukar poin (jalankan setelah 005_rewards.sql)
INSERT INTO reward_catalog (slug, nama, deskripsi, icon, cost_poin, stock, aktif)
VALUES
  (
    'diskon-essen-10',
    'Diskon 10% Essen NF',
    'Voucher diskon 10% untuk produk Essen NF. CS akan hubungi via WA.',
    '💧',
    500,
    NULL,
    true
  ),
  (
    'essen-lure-gratis',
    'Essen/Lure Gratis',
    'Satu produk Essen atau Lure NF gratis (sesuai stok).',
    '🧪',
    1200,
    NULL,
    true
  ),
  (
    'paket-umpan-merch',
    'Paket Umpan + Merch NF',
    'Paket umpan pilihan + merchandise NF edisi terbatas.',
    '🎁',
    3000,
    50,
    true
  )
ON CONFLICT (slug) DO UPDATE SET
  nama = EXCLUDED.nama,
  deskripsi = EXCLUDED.deskripsi,
  icon = EXCLUDED.icon,
  cost_poin = EXCLUDED.cost_poin,
  stock = EXCLUDED.stock,
  aktif = EXCLUDED.aktif;
