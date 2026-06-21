"use client";

import { C, DISC } from "@/lib/constants";

export default function StrikeCard({ strike }) {
  const d = DISC.find((x) => x.id === strike.disc) || DISC[0];

  return (
    <div
      style={{
        background: C.deep2,
        border: `1px solid ${strike.place === 1 ? C.amber : C.line}`,
        borderRadius: 14,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 14px",
        }}
      >
        <span style={{ fontSize: 22 }}>{strike.avatar || "🏆"}</span>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontWeight: 800,
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {strike.user}{" "}
            {strike.verified ? (
              <span style={{ color: C.glow2 }}>✓</span>
            ) : (
              <span style={{ color: C.fog, fontSize: 10 }}>(menunggu CS)</span>
            )}
          </div>
          <div style={{ fontSize: 11, color: C.fog }}>
            📍 {strike.loc} · {d.icon} {d.label} · {strike.time}
          </div>
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: C.deep,
            background: strike.place === 1 ? C.amber : C.fog,
            padding: "3px 8px",
            borderRadius: 20,
          }}
        >
          JUARA {strike.place}
        </span>
      </div>
      <div style={{ padding: "0 14px 12px" }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{strike.event}</div>
        <div style={{ fontSize: 12, color: C.fog, marginTop: 2 }}>
          🐟 {strike.fish}
          {strike.weight ? ` · ${strike.weight} kg` : ""}
        </div>
        {strike.prize && (
          <div style={{ fontSize: 12, color: C.amber, marginTop: 2 }}>
            🎁 {strike.prize}
          </div>
        )}
        <div style={{ fontSize: 12, color: C.glow2, marginTop: 2 }}>
          🧪 {strike.gear}
        </div>
        <div style={{ display: "flex", gap: 7, marginTop: 10 }}>
          {[
            ["kolam", "🏞️"],
            ["juara", "🏆"],
            ["hadiah", "🎁"],
          ].map(([k, ic]) => (
            <span
              key={k}
              style={{
                flex: 1,
                textAlign: "center",
                fontSize: 10.5,
                padding: "5px 3px",
                borderRadius: 8,
                border: `1px solid ${strike.proof?.[k] ? C.glow2 : C.line}`,
                color: strike.proof?.[k] ? C.glow2 : C.fog,
              }}
            >
              {ic} {strike.proof?.[k] ? "✓" : "—"}
            </span>
          ))}
        </div>
        {strike.verified && (
          <div style={{ marginTop: 8, fontSize: 12, color: C.glow }}>
            ⚡ +{strike.xp} poin
          </div>
        )}
      </div>
    </div>
  );
}
