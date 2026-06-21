"use client";

import { C } from "@/lib/constants";

export default function Pill({ active, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flexShrink: 0,
        padding: "7px 13px",
        borderRadius: 20,
        border: `1px solid ${active ? C.glow2 : C.line}`,
        background: active ? "rgba(92,224,160,.1)" : C.deep2,
        color: active ? C.glow2 : C.fog,
        fontSize: 12,
        fontWeight: 700,
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}
