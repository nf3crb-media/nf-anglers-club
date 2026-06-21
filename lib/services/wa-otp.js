import { createHash, randomInt } from "crypto";
import { sendFonnteMessage, getFonnteToken } from "@/lib/fonnte";
import { normalizeWa } from "@/lib/services/onboard";

const OTP_TTL_MS = 10 * 60 * 1000;
const VERIFY_WINDOW_MS = 30 * 60 * 1000;
const MAX_SENDS_PER_HOUR = 5;
const MAX_VERIFY_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 60 * 1000;

function hashOtp(otp, waNumber) {
  const pepper = process.env.FONNTE_TOKEN || process.env.NF_ADMIN_SECRET || "nf-dev";
  return createHash("sha256").update(`${otp}:${waNumber}:${pepper}`).digest("hex");
}

function generateOtp() {
  return String(randomInt(100000, 999999));
}

export { normalizeWa };

async function deliverOtp(waNumber, otp, purpose = "signup") {
  const intro =
    purpose === "login"
      ? "Kode login NF Anglers Club"
      : "Kode verifikasi WhatsApp kamu";
  const message =
    `*NF Anglers Club*\n\n` +
    `${intro}: *${otp}*\n` +
    `Berlaku 10 menit. Jangan bagikan ke siapapun.`;

  if (!getFonnteToken()) {
    if (process.env.NODE_ENV === "development") {
      console.info(`[wa-otp/${purpose}] DEV — OTP untuk ${waNumber}: ${otp}`);
      return;
    }
    throw new Error("FONNTE_NOT_CONFIGURED");
  }

  await sendFonnteMessage(waNumber, message);
}

async function issueOtp(supabase, waNumber, purpose) {
  const now = Date.now();
  const { data: existing } = await supabase
    .from("wa_otp")
    .select("*")
    .eq("wa_number", waNumber)
    .maybeSingle();

  const otp = generateOtp();
  const expiresAt = new Date(now + OTP_TTL_MS).toISOString();

  if (existing) {
    const hourAgo = now - 60 * 60 * 1000;
    const lastSent = new Date(existing.last_sent_at).getTime();
    const sendCount =
      lastSent < hourAgo ? 1 : (existing.send_count || 0) + 1;

    if (lastSent >= hourAgo && existing.send_count >= MAX_SENDS_PER_HOUR) {
      throw new Error("WA_OTP_RATE_LIMIT");
    }

    if (now - lastSent < RESEND_COOLDOWN_MS) {
      throw new Error("WA_OTP_COOLDOWN");
    }

    const { error: updErr } = await supabase.from("wa_otp").upsert(
      {
        wa_number: waNumber,
        otp_hash: hashOtp(otp, waNumber),
        attempts: 0,
        send_count: sendCount,
        last_sent_at: new Date(now).toISOString(),
        expires_at: expiresAt,
        verified_at: null,
      },
      { onConflict: "wa_number" }
    );

    if (updErr) throw updErr;
  } else {
    const { error: insErr } = await supabase.from("wa_otp").insert({
      wa_number: waNumber,
      otp_hash: hashOtp(otp, waNumber),
      attempts: 0,
      send_count: 1,
      last_sent_at: new Date(now).toISOString(),
      expires_at: expiresAt,
    });

    if (insErr) throw insErr;
  }

  await deliverOtp(waNumber, otp, purpose);

  return {
    wa_number: waNumber,
    expires_in: OTP_TTL_MS / 1000,
    resend_in: RESEND_COOLDOWN_MS / 1000,
  };
}

export async function sendWaOtp(supabase, rawWa) {
  const waNumber = normalizeWa(String(rawWa || ""));
  if (waNumber.length < 10 || waNumber.length > 15) {
    throw new Error("WA_INVALID");
  }

  const { data: taken } = await supabase
    .from("member")
    .select("id")
    .eq("wa_number", waNumber)
    .maybeSingle();

  if (taken) {
    throw new Error("WA_TAKEN");
  }

  return issueOtp(supabase, waNumber, "signup");
}

/** OTP login — nomor harus sudah terdaftar sebagai member */
export async function sendWaLoginOtp(supabase, rawWa) {
  const waNumber = normalizeWa(String(rawWa || ""));
  if (waNumber.length < 10 || waNumber.length > 15) {
    throw new Error("WA_INVALID");
  }

  const { data: member } = await supabase
    .from("member")
    .select("id, email")
    .eq("wa_number", waNumber)
    .maybeSingle();

  if (!member) {
    throw new Error("WA_NOT_REGISTERED");
  }

  if (!member.email) {
    throw new Error("MEMBER_NO_EMAIL");
  }

  const result = await issueOtp(supabase, waNumber, "login");
  return { ...result, member_id: member.id };
}

export async function verifyWaOtp(supabase, rawWa, otpInput) {
  const waNumber = normalizeWa(String(rawWa || ""));
  const otp = String(otpInput || "").replace(/\D/g, "");

  if (!otp || otp.length !== 6) {
    throw new Error("OTP_INVALID");
  }

  const { data: row, error } = await supabase
    .from("wa_otp")
    .select("*")
    .eq("wa_number", waNumber)
    .maybeSingle();

  if (error) throw error;
  if (!row) throw new Error("OTP_NOT_SENT");

  if (new Date(row.expires_at).getTime() < Date.now()) {
    throw new Error("OTP_EXPIRED");
  }

  if (row.attempts >= MAX_VERIFY_ATTEMPTS) {
    throw new Error("OTP_MAX_ATTEMPTS");
  }

  const valid = row.otp_hash === hashOtp(otp, waNumber);

  if (!valid) {
    await supabase
      .from("wa_otp")
      .update({ attempts: (row.attempts || 0) + 1 })
      .eq("wa_number", waNumber);
    throw new Error("OTP_WRONG");
  }

  const verifiedAt = new Date().toISOString();
  const { error: updErr } = await supabase
    .from("wa_otp")
    .update({ verified_at: verifiedAt, attempts: 0 })
    .eq("wa_number", waNumber);

  if (updErr) throw updErr;

  return { wa_number: waNumber, verified_at: verifiedAt };
}

export async function isWaVerifiedForOnboard(supabase, waNumber) {
  const { data: row } = await supabase
    .from("wa_otp")
    .select("verified_at")
    .eq("wa_number", waNumber)
    .maybeSingle();

  if (!row?.verified_at) return false;

  return Date.now() - new Date(row.verified_at).getTime() <= VERIFY_WINDOW_MS;
}
