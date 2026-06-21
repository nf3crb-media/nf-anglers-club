"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import NFLogo from "@/components/game/NFLogo";
import { C } from "@/lib/constants";

function CheckEmailContent() {
  const params = useSearchParams();
  const email = params.get("email") || "email kamu";
  const isNew = params.get("new") === "1";

  return (
    <div
      style={{
        minHeight: "100vh",
        maxWidth: 480,
        margin: "0 auto",
        background: C.deep,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 28,
        textAlign: "center",
      }}
    >
      <NFLogo size={64} />
      <h1 style={{ fontSize: 22, fontWeight: 800, marginTop: 20 }}>Cek email kamu 📬</h1>
      <p style={{ color: C.fog, marginTop: 12, lineHeight: 1.7, fontSize: 14 }}>
        Magic link sudah dikirim ke
        <br />
        <b style={{ color: C.ink }}>{email}</b>
      </p>
      <p style={{ color: C.fog, marginTop: 12, fontSize: 13, lineHeight: 1.6 }}>
        {isNew
          ? "Klik link di email untuk mengaktifkan kode NF dan masuk ke club."
          : "Klik link di email untuk masuk."}
        <br />
        Cek folder spam jika belum muncul.
      </p>

      {typeof window !== "undefined" &&
        (window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1") && (
          <div
            style={{
              marginTop: 20,
              padding: "14px 16px",
              borderRadius: 12,
              background: "rgba(255,180,60,.08)",
              border: "1px solid rgba(255,180,60,.35)",
              textAlign: "left",
              fontSize: 12,
              lineHeight: 1.65,
              color: C.fog,
            }}
          >
            <b style={{ color: C.amber }}>Mode lokal (belum deploy)</b>
            <br />
            Link email hanya jalan di komputer yang sama. Buka email di PC ini,
            lalu <b style={{ color: C.ink }}>salin-tempel</b> seluruh URL link
            ke browser (harus{" "}
            <code style={{ color: C.glow2 }}>
              {window.location.origin}/auth/callback
            </code>
            ).
            <br />
            <br />
            Supabase → Auth → URL Configuration: tambahkan redirect{" "}
            <code style={{ color: C.glow2 }}>
              {window.location.origin}/auth/callback
            </code>
            .
            <br />
            <br />
            Untuk login dari HP / email yang bisa diklik:{" "}
            <b style={{ color: C.ink }}>deploy dulu</b> ke Vercel (
            <span style={{ color: C.glow2 }}>nf-anglers-club.vercel.app</span>
            ).
          </div>
        )}
      <Link
        href="/login"
        style={{
          marginTop: 28,
          color: C.glow2,
          fontSize: 13,
        }}
      >
        ← Kirim ulang / ganti email
      </Link>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: C.deep }} />}>
      <CheckEmailContent />
    </Suspense>
  );
}
