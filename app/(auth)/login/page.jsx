"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import NFLogo from "@/components/game/NFLogo";
import { C } from "@/lib/constants";
import { primeAudio } from "@/lib/sound";
import { isSuperAdminEmail } from "@/lib/env";
import { sendMagicLink, useAuth } from "@/hooks/useAuth";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { member, loading } = useAuth();
  const [mode, setMode] = useState("signup");
  const [step, setStep] = useState("form");
  const [kode, setKode] = useState("");
  const [wa, setWa] = useState("");
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [err, setErr] = useState(params.get("error") || "");
  const [submitting, setSubmitting] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (!loading && member) router.replace("/beranda");
  }, [member, loading, router]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  if (!loading && member) return null;

  const sendOtp = async () => {
    const res = await fetch("/api/auth/wa/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wa_number: wa }),
    });
    const data = await res.json();
    if (!data.ok) {
      throw new Error(data.msg || "Gagal mengirim OTP WhatsApp.");
    }
    setResendIn(data.resend_in || 60);
    return data;
  };

  const handleSignupForm = async () => {
    const check = await fetch("/api/kode/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kode }),
    });
    const checkData = await check.json();
    if (!checkData.ok) {
      throw new Error(checkData.msg || "Kode tidak valid.");
    }

    await sendOtp();
    setStep("otp");
  };

  const handleVerifyOtpAndEmail = async () => {
    const verify = await fetch("/api/auth/wa/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wa_number: wa, otp }),
    });
    const verifyData = await verify.json();
    if (!verifyData.ok) {
      throw new Error(verifyData.msg || "OTP tidak valid.");
    }

    await sendMagicLink({
      email,
      mode: "signup",
      kode,
      wa_number: wa,
      nama,
    });

    const q = new URLSearchParams({ email, new: "1" });
    router.push(`/check-email?${q.toString()}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    primeAudio();
    setSubmitting(true);

    try {
      if (mode === "return") {
        await sendMagicLink({ email, mode: "return" });
        router.push(`/check-email?${new URLSearchParams({ email }).toString()}`);
        return;
      }

      if (step === "form") {
        await handleSignupForm();
        return;
      }

      await handleVerifyOtpAndEmail();
    } catch (ex) {
      setErr(ex.message || "Gagal memproses pendaftaran.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendIn > 0 || submitting) return;
    setErr("");
    setSubmitting(true);
    try {
      await sendOtp();
    } catch (ex) {
      setErr(ex.message || "Gagal kirim ulang OTP.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetSignup = () => {
    setStep("form");
    setOtp("");
    setErr("");
    setResendIn(0);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        maxWidth: 480,
        margin: "0 auto",
        background: "radial-gradient(120% 90% at 50% 0%, #143038, #060d10)",
        padding: "24px 20px",
        color: C.ink,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <NFLogo size={36} />
        <div>
          <div style={{ fontWeight: 800, fontSize: 18 }}>Masuk Club</div>
          <div style={{ fontSize: 12, color: C.fog }}>
            {mode === "signup" && step === "otp"
              ? "Verifikasi WhatsApp lalu magic link email"
              : "Magic link ke email — tanpa password"}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {[
          { id: "signup", label: "Daftar (kode NF)" },
          { id: "return", label: "Sudah punya akun" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setMode(t.id);
              resetSignup();
              setErr("");
            }}
            style={{
              flex: 1,
              padding: "10px 8px",
              borderRadius: 10,
              border: `1px solid ${mode === t.id ? C.glow : C.line}`,
              background: mode === t.id ? "rgba(200,255,60,.08)" : C.deep2,
              color: mode === t.id ? C.glow : C.fog,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {mode === "signup" && step === "form" && (
          <>
            <label style={labelStyle}>
              Kode produk NF
              <input
                type="text"
                placeholder="NF-XXXX-XXXX"
                value={kode}
                onChange={(e) => setKode(e.target.value.toUpperCase())}
                style={inputStyle}
                required
              />
            </label>
            <label style={{ ...labelStyle, marginTop: 14 }}>
              Nomor WhatsApp
              <input
                type="tel"
                placeholder="08xxxxxxxxxx"
                value={wa}
                onChange={(e) => setWa(e.target.value)}
                style={inputStyle}
                required
              />
            </label>
            <label style={{ ...labelStyle, marginTop: 14 }}>
              Nama pemancing
              <input
                type="text"
                placeholder="Nama kamu"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                style={inputStyle}
                required
              />
            </label>
          </>
        )}

        {mode === "signup" && step === "otp" && (
          <>
            <p style={{ fontSize: 13, color: C.fog, marginBottom: 14, lineHeight: 1.5 }}>
              Kode OTP dikirim ke WhatsApp <strong style={{ color: C.ink }}>{wa}</strong>.
              Setelah verifikasi, magic link dikirim ke email.
            </p>
            <label style={labelStyle}>
              Kode OTP WhatsApp
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="6 digit"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                style={{ ...inputStyle, letterSpacing: "0.25em", fontSize: 20, textAlign: "center" }}
                required
              />
            </label>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendIn > 0 || submitting}
              style={{
                marginTop: 10,
                background: "none",
                border: "none",
                color: resendIn > 0 ? C.slate : C.glow2,
                fontSize: 12,
                cursor: resendIn > 0 ? "default" : "pointer",
                padding: 0,
              }}
            >
              {resendIn > 0 ? `Kirim ulang OTP (${resendIn}s)` : "Kirim ulang OTP"}
            </button>
            <button
              type="button"
              onClick={resetSignup}
              style={{
                display: "block",
                marginTop: 8,
                background: "none",
                border: "none",
                color: C.fog,
                fontSize: 12,
                cursor: "pointer",
                padding: 0,
              }}
            >
              ← Ubah nomor / data
            </button>
          </>
        )}

        {(mode === "return" || (mode === "signup" && step === "form")) && (
          <label style={{ ...labelStyle, marginTop: mode === "signup" ? 14 : 0 }}>
            Email {mode === "signup" ? "(untuk login)" : ""}
            <input
              type="email"
              placeholder="email@kamu.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              required
            />
          </label>
        )}

        {mode === "signup" && step === "otp" && (
          <input type="hidden" value={email} readOnly />
        )}

        {mode === "signup" && step === "form" && isSuperAdminEmail(email) && (
          <p style={{ fontSize: 11, color: C.amber, marginTop: 8 }}>
            ⭐ Akun super admin NF — akses CS penuh setelah verifikasi email.
          </p>
        )}

        {err && (
          <div
            style={{
              marginTop: 14,
              padding: "10px 12px",
              borderRadius: 10,
              background: "rgba(255,80,80,.08)",
              border: "1px solid rgba(255,80,80,.25)",
              color: "#ff8a8a",
              fontSize: 13,
            }}
          >
            {err}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: "100%",
            marginTop: 22,
            padding: "14px",
            borderRadius: 12,
            border: "none",
            background: submitting ? C.slate : C.glow,
            color: C.deep,
            fontWeight: 800,
            fontSize: 15,
            cursor: submitting ? "wait" : "pointer",
          }}
        >
          {submitting
            ? "Memproses..."
            : mode === "return"
              ? "Kirim magic link ke email"
              : step === "form"
                ? "Kirim OTP ke WhatsApp"
                : "Verifikasi & kirim magic link"}
        </button>
      </form>

      <p style={{ marginTop: 16, fontSize: 12, color: C.fog, lineHeight: 1.6 }}>
        {mode === "signup"
          ? step === "form"
            ? "Langkah 1: verifikasi WA via OTP Fonnte. Langkah 2: klik magic link di email."
            : "Masukkan OTP dari WhatsApp, lalu cek inbox untuk magic link login."
          : "Masukkan email yang sudah terdaftar. Klik link di inbox untuk masuk."}
      </p>

      <Link href="/" style={{ display: "block", marginTop: 16, textAlign: "center", color: C.glow2, fontSize: 12 }}>
        ← Kembali
      </Link>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#0a1419" }} />}>
      <LoginForm />
    </Suspense>
  );
}

const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 700,
  color: "#7fa6ad",
  letterSpacing: ".04em",
};

const inputStyle = {
  display: "block",
  width: "100%",
  marginTop: 6,
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid #1e3d47",
  background: "#0f2027",
  color: "#e8f3f1",
  fontSize: 15,
  outline: "none",
};
