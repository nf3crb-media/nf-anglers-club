import { createServiceClient } from "@/lib/supabase-server";
import { verifyWaOtp } from "@/lib/services/wa-otp";

export const dynamic = "force-dynamic";

const ERR_MSG = {
  OTP_INVALID: "Masukkan kode OTP 6 digit.",
  OTP_NOT_SENT: "OTP belum dikirim. Minta kode baru dulu.",
  OTP_EXPIRED: "OTP sudah kedaluwarsa. Minta kode baru.",
  OTP_MAX_ATTEMPTS: "Terlalu banyak percobaan. Minta kode OTP baru.",
  OTP_WRONG: "Kode OTP salah. Coba lagi.",
};

export async function POST(req) {
  try {
    const { wa_number, otp } = await req.json();

    if (!wa_number?.trim()) {
      return Response.json({ ok: false, msg: "Nomor WhatsApp wajib diisi." }, { status: 400 });
    }

    const supabase = createServiceClient();
    const result = await verifyWaOtp(supabase, wa_number, otp);

    return Response.json({ ok: true, ...result });
  } catch (err) {
    const code = err.message;
    if (ERR_MSG[code]) {
      return Response.json({ ok: false, code, msg: ERR_MSG[code] }, { status: 400 });
    }
    console.error("[api/auth/wa/verify-otp]", err);
    return Response.json({ ok: false, msg: "Gagal memverifikasi OTP." }, { status: 500 });
  }
}
