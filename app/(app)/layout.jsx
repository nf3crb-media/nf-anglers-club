"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import NFLogo from "@/components/game/NFLogo";
import BottomNav from "@/components/ui/BottomNav";
import { C } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";

export default function AppLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { member, loading } = useAuth();

  useEffect(() => {
    if (!loading && !member) {
      router.replace("/login");
    }
  }, [member, loading, router]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: C.deep }}
      >
        <div style={{ color: C.fog, fontSize: 14 }}>Memuat sesi...</div>
      </div>
    );
  }

  if (!member) return null;

  const totalPoin =
    (member.poin_belanja ?? 0) + (member.poin_aktivitas ?? 0);

  return (
    <div className="nf-app-shell">
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          background: "rgba(10,20,25,.9)",
          backdropFilter: "blur(10px)",
          borderBottom: `1px solid ${C.line}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            fontWeight: 800,
            letterSpacing: ".02em",
          }}
        >
          <NFLogo size={30} /> Anglers Club
        </div>
        <div
          style={{
            fontSize: 12,
            color: C.glow,
            background: "rgba(200,255,60,.06)",
            border: `1px solid ${C.line}`,
            padding: "5px 10px",
            borderRadius: 20,
          }}
        >
          ⚡ {totalPoin.toLocaleString("id-ID")} poin
        </div>
      </header>

      <main key={pathname} className="tabcontent" style={{ padding: "18px 16px" }}>
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
