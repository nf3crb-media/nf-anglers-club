import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase-server";
import { normalizeWa, verifyWaOtp } from "@/lib/services/wa-otp";
import {
  createSessionForEmail,
  resolveMemberAuthEmail,
} from "@/lib/services/wa-session";

export const dynamic = "force-dynamic";

const ERR_MSG = {
  WA_INVALID: "Nomor WhatsApp tidak valid.",
  WA_NOT_REGISTERED: "Nomor WhatsApp belum terdaftar. Daftar dengan kode produk NF dulu.",
  MEMBER_NO_EMAIL:
    "Akun Supabase belum punya email. Selesaikan daftar via tab Daftar, atau hubungi CS NF.",
  AUTH_USER_MISSING:
    "Akun lama belum terhubung ke login baru. Daftar ulang dengan kode NF, atau hubungi CS NF.",
  OTP_INVALID: "Kode OTP harus 6 digit.",
  OTP_NOT_SENT: "OTP belum dikirim. Minta kode baru.",
  OTP_EXPIRED: "OTP sudah kadaluarsa. Minta kode baru.",
  OTP_MAX_ATTEMPTS: "Terlalu banyak percobaan. Minta OTP baru.",
  OTP_WRONG: "Kode OTP salah.",
  SESSION_LINK_FAILED: "Gagal membuat sesi login.",
  SESSION_TOKEN_FAILED: "Token login tidak valid.",
  SESSION_VERIFY_FAILED: "Verifikasi sesi gagal.",
};

export async function POST(req) {
  try {
    const { wa_number, otp } = await req.json();

    if (!wa_number?.trim() || !otp?.trim()) {
      return Response.json(
        { ok: false, msg: "Nomor WhatsApp dan OTP wajib diisi." },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    await verifyWaOtp(supabase, wa_number, otp);

    const waNorm = normalizeWa(wa_number);
    const { data: member } = await supabase
      .from("member")
      .select("id, email, nama")
      .eq("wa_number", waNorm)
      .maybeSingle();

    if (!member) {
      return Response.json(
        { ok: false, code: "WA_NOT_REGISTERED", msg: ERR_MSG.WA_NOT_REGISTERED },
        { status: 404 }
      );
    }

    const email = await resolveMemberAuthEmail(member);

    const authClient = createClient();
    await createSessionForEmail(authClient, email);

    await supabase
      .from("member")
      .update({ last_active: new Date().toISOString() })
      .eq("id", member.id);

    return Response.json({
      ok: true,
      member: { id: member.id, nama: member.nama },
    });
  } catch (err) {
    const code = err.message;
    if (ERR_MSG[code]) {
      const status =
        code.startsWith("OTP_") || code === "WA_INVALID" ? 400 : 401;
      return Response.json({ ok: false, code, msg: ERR_MSG[code] }, { status });
    }
    console.error("[api/auth/wa/verify-login-otp]", err);
    return Response.json({ ok: false, msg: "Gagal masuk via WhatsApp." }, { status: 500 });
  }
}
