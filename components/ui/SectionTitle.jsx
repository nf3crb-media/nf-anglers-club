import { C } from "@/lib/constants";

export default function SectionTitle({ eyebrow, title, mt = 0 }) {
  return (
    <div style={{ marginTop: mt }}>
      <div
        style={{
          color: C.glow2,
          fontSize: 11,
          letterSpacing: ".24em",
          fontFamily: "monospace",
          textTransform: "uppercase",
        }}
      >
        {eyebrow}
      </div>
      <div
        style={{
          fontSize: 21,
          fontWeight: 800,
          marginTop: 4,
          letterSpacing: "-.01em",
        }}
      >
        {title}
      </div>
    </div>
  );
}
