"use client";

import { useEffect, useState } from "react";
import SectionTitle from "@/components/ui/SectionTitle";
import Pill from "@/components/ui/Pill";
import { PostCardList } from "@/components/feed/PostCard";
import { C, DISC } from "@/lib/constants";
import { SFX, haptic } from "@/lib/sound";
import { useFeed } from "@/hooks/useFeed";

export default function BerandaPage() {
  const [filter, setFilter] = useState("all");
  const { posts, loading, source } = useFeed(filter);

  const setDisc = (id) => {
    SFX.tap();
    haptic(8);
    setFilter(id);
  };

  return (
    <div>
      <SectionTitle eyebrow="// FEED KOMUNITAS" title="Tangkapan terbaru" />
      <div
        style={{
          display: "flex",
          gap: 7,
          marginTop: 12,
          overflowX: "auto",
          paddingBottom: 4,
        }}
      >
        <Pill
          active={filter === "all"}
          onClick={() => setDisc("all")}
          label="Semua"
        />
        {DISC.map((d) => (
          <Pill
            key={d.id}
            active={filter === d.id}
            onClick={() => setDisc(d.id)}
            label={`${d.icon} ${d.label}`}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={() => {
          SFX.tap();
          haptic(8);
        }}
        style={{
          width: "100%",
          marginTop: 12,
          padding: "13px",
          borderRadius: 12,
          border: `1px dashed ${C.line}`,
          background: C.deep2,
          color: C.glow2,
          fontWeight: 700,
          cursor: "pointer",
          fontSize: 14,
        }}
      >
        📸 Post tangkapanmu — dapat poin aktivitas
      </button>
      {loading ? (
        <p style={{ marginTop: 20, color: C.fog, fontSize: 13, textAlign: "center" }}>
          Memuat feed...
        </p>
      ) : (
        <>
          {source === "mock" && (
            <p style={{ marginTop: 10, fontSize: 11, color: C.fog, textAlign: "center" }}>
              Data contoh — jalankan seed feed di Supabase untuk data live
            </p>
          )}
          <PostCardList posts={posts} />
        </>
      )}
    </div>
  );
}
