-- Super admin otomatis is_admin + is_cs saat onboard (lib/services/onboard.js + lib/env.js)
-- Default emails: nf3.crb@gmail.com, sampriatna@gmail.com
-- Override via env NF_SUPER_ADMIN_EMAILS (pisah koma)

-- Setelah login pertama sampriatna:
-- SELECT id, email, nama, wa_number, is_admin, is_cs FROM member WHERE email = 'sampriatna@gmail.com';

-- Jika sudah daftar tapi belum admin, jalankan sekali:
-- UPDATE member SET is_admin = true, is_cs = true WHERE email = 'sampriatna@gmail.com';
