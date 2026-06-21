"use client";

import { useEffect, useState } from "react";
import { C } from "@/lib/constants";

export default function LegendaBoard() {
  const [scope, setScope] = useState("kota");
  const [legends, setLegends] = useState([]);

  useEffect(() => {
    fetch(`/api/legenda?scope=${scope}`)
      .then((r) => r.json())
      .then((data) => {
        setLegends(data.ok && data.legends?.length ? data.legends : []);
      })
      .catch(() => setLegends([]));
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
        ].map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setScope(s.id)}
            style={{
              flex: 1,
              padding: "8px 6px",
              borderRadius: 10,
              border: `1px solid ${scope === s.id ? C.glow : C.line}`,
              background: scope === s.id ? "rgba(200,255,60,.08)" : C.deep2,
              color: scope === s.id ? C.glow : C.fog,
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {top && (
        <div
          style={{
            marginTop: 16,
            padding: 16,
            borderRadius: 16,
            background: `linear-gradient(135deg, ${C.slate}, ${C.deep2})`,
            border: `1px solid ${C.amber}55`,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 11, color: C.amber, letterSpacing: ".1em" }}>
            👑 LEGENDA {scope.toUpperCase()}
          </div>
          <div style={{ fontSize: 36, marginTop: 6 }}>{top.avatar}</div>
          <div style={{ fontWeight: 800, fontSize: 16, marginTop: 4 }}>
            {top.user}
          </div>
          <div style={{ fontSize: 12, color: C.fog }}>{top.area}</div>
          <div style={{ fontSize: 13, color: C.glow, marginTop: 8 }}>
            {top.titles} gelar · {top.pts?.toLocaleString("id-ID")} poin legenda
          </div>
        </div>
      )}

      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
        {legends.length === 0 ? (
          <p style={{ fontSize: 12, color: C.fog, textAlign: "center", padding: 16 }}>
            Belum ada legenda {scope} — menunggu strike juara terverifikasi.
          </p>
        ) : (
          legends.slice(top ? 1 : 0).map((l) => (
            <div
              key={`${l.user}-${l.rank}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 14px",
                borderRadius: 12,
                background: C.deep2,
                border: `1px solid ${C.line}`,
              }}
            >
              <span style={{ fontSize: 18, width: 28, textAlign: "center" }}>
                {l.rank}
              </span>
              <span style={{ fontSize: 22 }}>{l.avatar}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{l.user}</div>
                <div style={{ fontSize: 11, color: C.fog }}>
                  {l.area} · {l.titles} gelar
                </div>
              </div>
              <span style={{ fontSize: 12, color: C.glow, fontWeight: 700 }}>
                {l.pts?.toLocaleString("id-ID")}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
