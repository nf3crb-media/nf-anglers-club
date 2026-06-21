"use client";

import { useEffect, useState } from "react";
import { C } from "@/lib/constants";
import { MOCK_LEGENDS } from "@/lib/mock-juara";

export default function LegendaBoard() {
  const [scope, setScope] = useState("kota");
  const [legends, setLegends] = useState([]);
  const [source, setSource] = useState("mock");

  useEffect(() => {
    fetch(`/api/legenda?scope=${scope}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok && data.legends?.length) {
          setLegends(data.legends);
          setSource("db");
        } else {
          setLegends(MOCK_LEGENDS[scope] || []);
          setSource("mock");
        }
      })
      .catch(() => {
        setLegends(MOCK_LEGENDS[scope] || []);
        setSource("mock");
      });
  }, [scope]);

  const top = legends[0];

  return (
    <div>
      <p style={{ fontSize: 12, color: C.fog, marginTop: 8 }}>
        Dihitung dari gelar juara terverifikasi. Berebut dari kota hingga
        nasional.
      </p>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        {[
          { id: "kota", label: "Kota" },
          { id: "provinsi", label: "Provinsi" },
          { id: "nasional", label: "Nasional" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setScope(t.id)}
            style={{
              flex: 1,
              padding: "9px",
              borderRadius: 10,
              border: `1px solid ${scope === t.id ? C.amber : C.line}`,
              background:
                scope === t.id ? "rgba(255,180,60,.08)" : C.deep2,
              color: scope === t.id ? C.amber : C.fog,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {top && (
        <div
          style={{
            marginTop: 14,
            textAlign: "center",
            padding: 16,
            borderRadius: 14,
            background: `linear-gradient(135deg, ${C.amber}18, ${C.deep2})`,
            border: `1px solid ${C.amber}55`,
          }}
        >
          <div style={{ fontSize: 28 }}>{top.avatar}</div>
          <div
            style={{
              fontSize: 10,
              color: C.amber,
              letterSpacing: ".15em",
              marginTop: 4,
            }}
          >
            LEGENDA {scope.toUpperCase()}
          </div>
          <div style={{ fontWeight: 800, fontSize: 16, marginTop: 2 }}>
            {top.user}
          </div>
          <div style={{ fontSize: 12, color: C.fog }}>
            {top.titles} gelar · {top.area}
          </div>
          <div style={{ fontSize: 11, color: C.glow2, marginTop: 6 }}>
            🎁 Hadiah bulanan dari NF
          </div>
        </div>
      )}

      <div
        style={{
          marginTop: 10,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {legends.map((l) => (
          <div
            key={l.rank}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "11px 14px",
              borderRadius: 12,
              background: C.deep2,
              border: `1px solid ${C.line}`,
            }}
          >
            <span
              style={{
                fontWeight: 800,
                color: l.rank === 1 ? C.amber : C.fog,
                width: 18,
                textAlign: "center",
              }}
            >
              {l.rank}
            </span>
            <span style={{ fontSize: 20 }}>{l.avatar}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{l.user}</div>
              <div style={{ fontSize: 11, color: C.fog }}>
                📍 {l.area} · 🏆 {l.titles} gelar
              </div>
            </div>
            <span style={{ color: C.amber, fontWeight: 800, fontSize: 13 }}>
              {l.pts.toLocaleString("id-ID")}
            </span>
          </div>
        ))}
      </div>
      {source === "mock" && (
        <p style={{ fontSize: 11, color: C.fog, marginTop: 8, textAlign: "center" }}>
          Data contoh — jalankan seed-juara-profil.sql
        </p>
      )}
    </div>
  );
}
