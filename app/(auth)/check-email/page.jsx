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
