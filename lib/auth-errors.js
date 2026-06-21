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

  return error?.message || "Gagal mengirim magic link.";
}
