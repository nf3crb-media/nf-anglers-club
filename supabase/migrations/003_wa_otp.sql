-- OTP WhatsApp (Fonnte) — verifikasi sebelum onboarding
CREATE TABLE IF NOT EXISTS wa_otp (
  wa_number text PRIMARY KEY,
  otp_hash text NOT NULL,
  attempts int NOT NULL DEFAULT 0,
  send_count int NOT NULL DEFAULT 1,
  last_sent_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  verified_at timestamptz,
  dibuat_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS wa_otp_expires_idx ON wa_otp (expires_at);
