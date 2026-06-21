"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SectionTitle from "@/components/ui/SectionTitle";
import { C, DISC, RARITY } from "@/lib/constants";
import {
  MASCOTS,
  BADGES,
  REWARDS,
  MOCK_POIN_LOG,
  MOCK_FISH_CARDS,
} from "@/lib/mock-profile";
import { fishEmoji } from "@/lib/feed-utils";
import { timeAgo } from "@/lib/time";
import {
  getNextTierThreshold,
  tierProgress,
} from "@/lib/tier";
import { SFX } from "@/lib/sound";
import { useAuth } from "@/hooks/useAuth";

export default function ProfilPage() {
  const { member, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!member?.id) return;
    setLoading(true);
    fetch("/api/profil")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setProfile(data);
        else setProfile(null);
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [member?.id]);

  if (!member) return null;

  const m = profile?.member || member;
  const totalPoin =
    (m.poin_belanja ?? 0) + (m.poin_aktivitas ?? 0);
  const tier = m.tier || "Bronze";
  const nextThreshold = getNextTierThreshold(tier);
  const pct = tierProgress(totalPoin, tier);
  const poinLog =
    profile?.poin_log?.length > 0 ? profile.poin_log : MOCK_POIN_LOG;
  const fishCards =
    profile?.fish_cards?.length > 0 ? profile.fish_cards : MOCK_FISH_CARDS;
  const handle = m.username ? `@${m.username}` : member.wa_number;

  const discIcon = (discId) =>
    DISC.find((d) => d.id === discId)?.icon || "🎣";

  return (
    <div>
      <div
        style={{
          background: `linear-gradient(135deg, ${C.slate}, ${C.deep2})`,
          border: `1px solid ${C.line}`,
          borderRadius: 18,
          padding: 20,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 44 }}>👑</div>
        <div style={{ fontWeight: 800, fontSize: 18, marginTop: 4 }}>
          {m.nama}
        </div>
        <div style={{ fontSize: 12, color: C.fog }}>{handle}</div>
        <div
          style={{
            display: "inline-flex",
            gap: 6,
            marginTop: 10,
            fontSize: 11,
            color: C.deep,
            background: C.amber,
            padding: "4px 12px",
            borderRadius: 20,
            fontWeight: 800,
          }}
        >
          ⭐ TIER {tier.toUpperCase()}
        </div>
        <div style={{ marginTop: 16 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 11,
              color: C.fog,
              marginBottom: 5,
            }}
          >
            <span>{totalPoin.toLocaleString("id-ID")} poin</span>
            <span>
              {nextThreshold
                ? `Tier berikutnya ${nextThreshold.toLocaleString("id-ID")}`
                : "Tier maksimum"}
            </span>
          </div>
          <div
            style={{
              height: 8,
              background: C.deep,
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${pct}%`,
                height: "100%",
                background: C.glow,
                borderRadius: 10,
              }}
            />
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <div
            style={{
              flex: 1,
              background: C.deep,
              borderRadius: 10,
              padding: "10px 8px",
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 800, color: C.glow }}>
              {(m.poin_belanja ?? 0).toLocaleString("id-ID")}
            </div>
            <div style={{ fontSize: 10, color: C.fog }}>🛒 dari belanja</div>
          </div>
          <div
            style={{
              flex: 1,
              background: C.deep,
              borderRadius: 10,
              padding: "10px 8px",
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 800, color: C.glow2 }}>
              {(m.poin_aktivitas ?? 0).toLocaleString("id-ID")}
            </div>
            <div style={{ fontSize: 10, color: C.fog }}>🎣 dari aktivitas</div>
          </div>
        </div>
        {(m.total_belanja ?? 0) > 0 && (
          <div style={{ fontSize: 11, color: C.fog, marginTop: 12 }}>
            Total belanja:{" "}
            <b style={{ color: C.ink }}>
              Rp {Math.round(m.total_belanja / 1000).toLocaleString("id-ID")}rb
            </b>{" "}
            · makin banyak belanja, tier makin tinggi
          </div>
        )}
      </div>

      <Link
        href="/juara"
        onClick={() => SFX.tap()}
        style={{
          display: "block",
          marginTop: 16,
          padding: 14,
          borderRadius: 12,
          border: `1px solid ${C.amber}55`,
          background: "rgba(255,180,60,.06)",
          textDecoration: "none",
          color: C.amber,
          fontWeight: 700,
          fontSize: 13,
          textAlign: "center",
        }}
      >
        🏆 Strike Juara & Legenda →
      </Link>

      <SectionTitle eyebrow="// RIWAYAT POIN" title="Dari mana poinmu" mt={22} />
      {loading ? (
        <p style={{ color: C.fog, fontSize: 12, marginTop: 12 }}>Memuat...</p>
      ) : (
        <div
          style={{
            marginTop: 12,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {poinLog.map((p, i) => {
            const isShop = p.jenis === "belanja" || p.type === "shop";
            return (
              <div
                key={p.id || i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                  background: C.deep2,
                  border: `1px solid ${C.line}`,
                  borderRadius: 12,
                  padding: "11px 13px",
                }}
              >
                <span style={{ fontSize: 18 }}>{isShop ? "🛒" : "🎣"}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>
                    {p.label}
                  </div>
                  <div style={{ fontSize: 10.5, color: C.fog }}>
                    oleh {p.oleh} · {timeAgo(p.dibuat_at) || p.time}
                  </div>
                </div>
                <span
                  style={{
                    color: isShop ? C.glow : C.glow2,
                    fontWeight: 800,
                    fontSize: 13,
                  }}
                >
                  +{p.poin ?? p.pts}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <SectionTitle eyebrow="// DECK FISH CARD" title="Koleksi kartumu" mt={22} />
      <p style={{ color: C.fog, fontSize: 12, marginTop: 6 }}>
        Tangkapan terbaik yang sudah jadi Fish Card. Buru yang Legendary! (
        {fishCards.length} kartu)
      </p>
      <div
        style={{
          display: "flex",
          gap: 10,
          marginTop: 12,
          overflowX: "auto",
          paddingBottom: 6,
        }}
      >
        {fishCards.map((c, i) => {
          const R = RARITY[c.rarity] || RARITY.common;
          return (
            <div
              key={c.id || i}
              style={{
                flexShrink: 0,
                width: 116,
                borderRadius: 14,
                overflow: "hidden",
                border: `2px solid ${R.color}`,
                background: `linear-gradient(160deg, ${R.color}22, ${C.deep2})`,
                boxShadow:
                  c.rarity === "legendary"
                    ? `0 0 18px ${R.glow}55`
                    : "none",
              }}
            >
              <div
                style={{
                  height: 80,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 40,
                  background: `radial-gradient(circle, ${R.color}22, transparent)`,
                }}
              >
                {fishEmoji(c.fish)}
              </div>
              <div style={{ padding: "8px 10px" }}>
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 900,
                    color: R.color,
                    letterSpacing: ".05em",
                  }}
                >
                  ◆ {R.label}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, marginTop: 2 }}>
                  {c.fish}
                </div>
                <div style={{ fontSize: 11, color: C.fog }}>
                  {discIcon(c.disc)} {c.weight} kg
                </div>
              </div>
            </div>
          );
        })}
        <div
          style={{
            flexShrink: 0,
            width: 116,
            borderRadius: 14,
            border: `2px dashed ${C.line}`,
            display: "grid",
            placeItems: "center",
            color: C.fog,
            fontSize: 12,
            textAlign: "center",
            padding: 10,
          }}
        >
          <div>
            🎣
            <br />
            Buru kartu
            <br />
            berikutnya
          </div>
        </div>
      </div>

      <SectionTitle eyebrow="// FISHDEX" title="Koleksi maskot" mt={28} />
      <p style={{ color: C.fog, fontSize: 12, marginTop: 6 }}>
        Tangkap jenis ikan baru buat unlock maskotnya. Koleksi:{" "}
        {MASCOTS.filter((x) => x.owned).length}/{MASCOTS.length}
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 10,
          marginTop: 12,
        }}
      >
        {MASCOTS.map((mascot) => (
          <div
            key={mascot.name}
            style={{
              background: C.deep2,
              border: `1px solid ${mascot.owned ? C.glow2 : C.line}`,
              borderRadius: 14,
              padding: "16px 8px",
              textAlign: "center",
              opacity: mascot.owned ? 1 : 0.4,
            }}
          >
            <div
              style={{
                fontSize: 32,
                filter: mascot.owned
                  ? "none"
                  : "grayscale(1) brightness(.5)",
              }}
            >
              {mascot.owned ? mascot.emoji : "❓"}
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, marginTop: 4 }}>
              {mascot.owned ? mascot.name : "???"}
            </div>
            <div style={{ fontSize: 10, color: C.fog }}>{mascot.fish}</div>
          </div>
        ))}
      </div>

      <SectionTitle eyebrow="// PENCAPAIAN" title="Badge" mt={22} />
      <div
        style={{
          display: "flex",
          gap: 10,
          marginTop: 12,
          flexWrap: "wrap",
        }}
      >
        {BADGES.map((b) => (
          <div
            key={b.name}
            style={{
              flex: "1 1 calc(50% - 5px)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: C.deep2,
              border: `1px solid ${b.owned ? C.amber : C.line}`,
              borderRadius: 12,
              padding: "12px 14px",
              opacity: b.owned ? 1 : 0.45,
            }}
          >
            <span style={{ fontSize: 22 }}>{b.owned ? b.emoji : "🔒"}</span>
            <span style={{ fontSize: 12, fontWeight: 700 }}>{b.name}</span>
          </div>
        ))}
      </div>

      <SectionTitle eyebrow="// TUKAR POIN" title="Hadiah nyata" mt={22} />
      <div
        style={{
          marginTop: 12,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {REWARDS.map((r) => {
          const can = totalPoin >= r.cost;
          return (
            <div
              key={r.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: C.deep2,
                border: `1px solid ${C.line}`,
                borderRadius: 12,
                padding: "12px 14px",
              }}
            >
              <span style={{ fontSize: 24 }}>{r.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{r.name}</div>
                <div style={{ fontSize: 11, color: C.glow }}>
                  ⚡ {r.cost.toLocaleString("id-ID")} poin
                </div>
              </div>
              <button
                type="button"
                disabled={!can}
                onClick={() => can && SFX.tap()}
                style={{
                  padding: "8px 14px",
                  borderRadius: 9,
                  border: "none",
                  background: can ? C.glow : C.slate,
                  color: can ? C.deep : C.fog,
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: can ? "pointer" : "not-allowed",
                }}
              >
                {can ? "Tukar" : "Kurang"}
              </button>
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: 11, color: C.fog, marginTop: 8, textAlign: "center" }}>
        Tukar poin via CS — fitur otomatis Fase 4
      </p>

      <button
        type="button"
        onClick={logout}
        style={{
          marginTop: 28,
          width: "100%",
          padding: "12px",
          borderRadius: 10,
          border: `1px solid ${C.line}`,
          background: "transparent",
          color: C.fog,
          fontSize: 13,
          cursor: "pointer",
        }}
      >
        Keluar
      </button>
    </div>
  );
}
