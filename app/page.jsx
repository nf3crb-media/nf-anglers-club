"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import NFLogo from "@/components/game/NFLogo";
import { C } from "@/lib/constants";
import { SFX, haptic, primeAudio } from "@/lib/sound";
import { useAuth, useWelcome } from "@/hooks/useAuth";

export default function WelcomePage() {
  const router = useRouter();
  const { member, loading: authLoading } = useAuth();
  const { markWelcomed } = useWelcome();

  useEffect(() => {
    if (authLoading) return;
    if (member) {
      router.replace("/beranda");
    }
  }, [member, authLoading, router]);

  if (authLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: C.deep }}
      >
        <div style={{ color: C.fog, fontSize: 14 }}>Memuat...</div>
      </div>
    );
  }

  if (member) return null;

  const handleStart = () => {
    primeAudio();
    SFX.tap();
    haptic(10);
    markWelcomed();
    router.push("/login");
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "radial-gradient(120% 90% at 50% 0%, #143038, #060d10)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: 28,
        maxWidth: 480,
        margin: "0 auto",
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
      }}
    >
      <div className="welcome-float">
        <NFLogo size={84} />
      </div>
      <h1
        style={{
          fontSize: 28,
          fontWeight: 900,
          marginTop: 20,
          letterSpacing: "-.02em",
        }}
      >
        NF Anglers Club
      </h1>
      <p
        style={{
          color: C.glow2,
          fontSize: 13,
          fontFamily: "monospace",
          letterSpacing: ".15em",
          marginTop: 4,
        }}
      >
        KOMUNITAS · AI · KARTU · PETA
      </p>
      <p
        style={{
          color: C.fog,
          fontSize: 13.5,
          marginTop: 22,
          maxWidth: 320,
          lineHeight: 1.7,
        }}
      >
        Selamat datang, pemancing! 🎣
        <br />
        Tandai spot, abadikan tangkapan jadi{" "}
        <b style={{ color: C.ink }}>Fish Card</b>, dan berburu jadi{" "}
        <b style={{ color: C.amber }}>Legendaris</b>.
      </p>
      <div
        style={{
          marginTop: 18,
          padding: "12px 16px",
          borderRadius: 12,
          background: "rgba(255,255,255,.04)",
          border: `1px solid ${C.line}`,
          fontSize: 11.5,
          color: C.fog,
          maxWidth: 330,
          lineHeight: 1.6,
        }}
      >
        ℹ️ Spot yang kamu tandai akan{" "}
        <b style={{ color: C.ink }}>terlihat publik</b> agar bisa dibagikan ke
        sesama pemancing. Tandai titik mancing, bukan rumahmu, ya.
      </div>
      <button
        type="button"
        onClick={handleStart}
        style={{
          marginTop: 24,
          padding: "15px 40px",
          borderRadius: 14,
          border: "none",
          background: C.glow,
          color: C.deep,
          fontWeight: 800,
          fontSize: 16,
          cursor: "pointer",
          boxShadow: `0 10px 30px -8px ${C.glow}77`,
        }}
      >
        🎣 Mulai Mancing
      </button>
    </div>
  );
}
