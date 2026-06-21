import { createServiceClient } from "@/lib/supabase-server";
import { sendWaOtp } from "@/lib/services/wa-otp";

export const dynamic = "force-dynamic";

const ERR_MSG = {
  WA_INVALID: "Nomor WhatsApp tidak valid.",
  WA_TAKEN: "Nomor WhatsApp sudah terdaftar.",
  WA_OTP_RATE_LIMIT: "Terlalu banyak permintaan OTP. Coba lagi nanti.",
  WA_OTP_COOLDOWN: "Tunggu sebentar sebelum kirim ulang OTP.",
  FONNTE_NOT_CONFIGURED: "Layanan WhatsApp belum dikonfigurasi.",
};

export async function POST(req) {
  try {
    const { wa_number } = await req.json();

    if (!wa_number?.trim()) {
      return Response.json({ ok: false, msg: "Nomor WhatsApp wajib diisi." }, { status: 400 });
    }

    const supabase = createServiceClient();
    const result = await sendWaOtp(supabase, wa_number);

    return Response.json({ ok: true, ...result });
  } catch (err) {
    const code = err.message;
    if (ERR_MSG[code]) {
      return Response.json({ ok: false, code, msg: ERR_MSG[code] }, { status: 400 });
    }
    console.error("[api/auth/wa/send-otp]", err);
    return Response.json({ ok: false, msg: "Gagal mengirim OTP WhatsApp." }, { status: 500 });
  }
}
