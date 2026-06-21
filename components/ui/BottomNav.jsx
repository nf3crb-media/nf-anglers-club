"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { C, NAV_TABS } from "@/lib/constants";
import { SFX, haptic } from "@/lib/sound";

export default function BottomNav() {
  const pathname = usePathname();

  const onNav = () => {
    SFX.tab();
    haptic(8);
  };

  return (
    <nav
      className="nf-bottom-nav"
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 480,
        display: "flex",
        background: "rgba(10,20,25,.95)",
        backdropFilter: "blur(12px)",
        borderTop: `1px solid ${C.line}`,
        zIndex: 30,
      }}
    >
      {NAV_TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.id}
            href={tab.href}
            onClick={onNav}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "10px 0 12px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              color: active ? C.glow : C.fog,
              fontSize: 10.5,
              fontWeight: 600,
              textDecoration: "none",
              transition: "color .2s",
            }}
          >
            <span
              style={{
                fontSize: 18,
                filter: active ? "none" : "grayscale(.6)",
                transform: active ? "scale(1.15)" : "scale(1)",
                transition: "transform .2s",
              }}
            >
              {tab.icon}
            </span>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
