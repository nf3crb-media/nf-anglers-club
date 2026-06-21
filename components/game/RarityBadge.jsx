import { RARITY, RARITY_ORDER } from "@/lib/constants";

export default function RarityBadge({ rarityKey, size = "sm" }) {
  const r = RARITY[rarityKey] || RARITY.common;
  const fs = size === "lg" ? 22 : 9.5;

  return (
    <div
      style={{
        flex: 1,
        textAlign: "center",
        padding: size === "lg" ? "10px 4px" : "7px 2px",
        borderRadius: 8,
        background: r.color + "1a",
        border: `1px solid ${r.color}55`,
      }}
    >
      <div style={{ fontSize: fs, fontWeight: 800, color: r.color }}>
        {r.label}
      </div>
    </div>
  );
}

export function RarityLadder({ activeKey }) {
  return (
    <div style={{ display: "flex", gap: 5, marginTop: 12 }}>
      {RARITY_ORDER.map((k) => (
        <RarityBadge
          key={k}
          rarityKey={k}
          size={k === activeKey ? "lg" : "sm"}
        />
      ))}
    </div>
  );
}
