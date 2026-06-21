"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import NFLogo from "@/components/game/NFLogo";
import { C } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";

function VerifyContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { member, loading, refresh } = useAuth();
  const bonus = params.get("bonus");

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!loading && !member) {
      const t = setTimeout(() => router.replace("/login"), 1500);
      return () => clearTimeout(t);
    }
  }, [member, loading, router]);

  if (loading || !member) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: C.deep, maxWidth: 480, margin: "0 auto" }}
      >
        <div style={{ color: C.fog }}>Memuat...</div>
      </div>
    );
  }

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
      <NFLogo size={72} />
      <h1 style={{ fontSize: 24, fontWeight: 900, marginTop: 20, color: C.glow2 }}>
        Selamat datang! 🎣
      </h1>
      <p style={{ color: C.fog, marginTop: 12, lineHeight: 1.7, fontSize: 14 }}>
        Halo, <b style={{ color: C.ink }}>{member.nama}</b>!
        <br />
        Tier: <b style={{ color: C.amber }}>{member.customer_tier || member.tier || "Bronze"}</b>
        {member.is_admin && (
          <>
            <br />
            <span style={{ color: C.amber }}>⭐ Super Admin NF aktif</span>
          </>
        )}
        {Number(bonus) > 0 && (
          <>
            <br />
            Bonus welcome: <b style={{ color: C.glow }}>+{bonus} poin</b>
          </>
        )}
      </p>
      <button
        type="button"
        onClick={() => router.push("/beranda")}
        style={{
          marginTop: 28,
          padding: "14px 36px",
          borderRadius: 12,
          border: "none",
          background: C.glow,
          color: C.deep,
          fontWeight: 800,
          fontSize: 15,
          cursor: "pointer",
        }}
      >
        Masuk ke Club →
      </button>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a1419" }}>
          Memuat...
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
