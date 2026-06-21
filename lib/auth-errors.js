export function mapAuthError(error) {
  const msg = (error?.message || String(error || "")).toLowerCase();

  if (msg.includes("rate limit") || msg.includes("email rate limit")) {
    return (
      "Batas kirim email Supabase sudah tercapai (±3–4 email/jam paket gratis). " +
      "Tunggu ~1 jam lalu coba lagi, atau pasang SMTP custom di Supabase Dashboard."
    );
  }

  if (msg.includes("signup is disabled")) {
    return "Pendaftaran email dinonaktifkan di Supabase. Hubungi admin NF.";
  }

  if (msg.includes("invalid email")) {
    return "Format email tidak valid.";
  }

  if (msg.includes("failed to fetch") || msg.includes("networkerror")) {
    return "Koneksi ke server auth gagal. Coba lagi atau gunakan login WhatsApp OTP.";
  }

  if (msg.includes("redirect") && msg.includes("not allowed")) {
    return (
      "URL redirect belum diizinkan di Supabase. Tambahkan " +
      "https://club.nusafishing.com/auth/callback di Auth → URL Configuration."
    );
  }

  return error?.message || "Gagal mengirim magic link.";
}
