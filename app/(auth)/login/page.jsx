"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NFLogo from "@/components/game/NFLogo";
import { C } from "@/lib/constants";
import { primeAudio } from "@/lib/sound";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { login, member, loading } = useAuth();
  const [kode, setKode] = useState("");
  const [wa, setWa] = useState("");
  const [nama, setNama] = useState("");
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && member) router.replace("/beranda");
  }, [loading, member, router]);

  if (!loading && member) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    primeAudio();
    setSubmitting(true);

    try {
      const res = await fetch("/api/kode/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kode, wa_number: wa, nama }),
      });
      const data = await res.json();

      if (!data.ok) {
        setErr(data.msg || "Verifikasi gagal.");
        return;
      }

      login(data.member);
      router.push(
        `/verify?bonus=${data.welcome_bonus || 0}&produk=${encodeURIComponent(kode)}`
      );
    } catch {
      setErr("Koneksi gagal. Periksa internet kamu.");
    } finally {
      setSubmitting(false);
    }
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
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
        <NFLogo size={36} />
        <div>
          <div style={{ fontWeight: 800, fontSize: 18 }}>Masuk Club</div>
          <div style={{ fontSize: 12, color: C.fog }}>
            Pakai kode unik dari produk NF
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
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

        <label style={{ ...labelStyle, marginTop: 16 }}>
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

        <label style={{ ...labelStyle, marginTop: 16 }}>
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
          {submitting ? "Memverifikasi..." : "Verifikasi & Masuk"}
        </button>
      </form>

      <p
        style={{
          marginTop: 20,
          fontSize: 12,
          color: C.fog,
          lineHeight: 1.6,
          textAlign: "center",
        }}
      >
        Belum punya kode? Beli produk original NF di toko resmi — setiap
        kemasan dapat kode unik sekali pakai.
      </p>

      <Link
        href="/"
        style={{
          display: "block",
          marginTop: 16,
          textAlign: "center",
          color: C.glow2,
          fontSize: 12,
        }}
      >
        ← Kembali
      </Link>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 700,
  color: C.fog,
  letterSpacing: ".04em",
};

const inputStyle = {
  display: "block",
  width: "100%",
  marginTop: 6,
  padding: "12px 14px",
  borderRadius: 10,
  border: `1px solid ${C.line}`,
  background: C.deep2,
  color: C.ink,
  fontSize: 15,
  outline: "none",
};
