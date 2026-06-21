"use client";

import { useState } from "react";
import { C, DISC } from "@/lib/constants";

export default function PostCard({ post, liked, onLike }) {
  const d = DISC.find((x) => x.id === post.disc) || DISC[0];

  return (
    <div
      style={{
        background: C.deep2,
        border: `1px solid ${C.line}`,
        borderRadius: 16,
        overflow: "hidden",
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
        <span style={{ fontSize: 22 }}>{post.avatar}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{post.user}</div>
          <div style={{ fontSize: 11, color: C.fog }}>
            📍 {post.spot} · {post.time}
          </div>
        </div>
        <span
          style={{
            fontSize: 10,
            color: d.color,
            border: `1px solid ${C.line}`,
            padding: "3px 8px",
            borderRadius: 20,
          }}
        >
          {d.icon} {d.label}
        </span>
      </div>
      <div
        style={{
          height: 150,
          background: `linear-gradient(135deg, ${d.color}22, ${C.slate})`,
          display: "grid",
          placeItems: "center",
          position: "relative",
        }}
      >
        <span style={{ fontSize: 64 }}>{post.emoji}</span>
        <span
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: "rgba(10,20,25,.7)",
            padding: "5px 10px",
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 800,
            color: d.color,
          }}
        >
          {post.weight} kg
        </span>
      </div>
      <div style={{ padding: "12px 14px" }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{post.fish}</div>
        <div style={{ fontSize: 12, color: C.fog, marginTop: 3 }}>
          🧪 Pakai: <span style={{ color: C.glow2 }}>{post.gear}</span>
        </div>
        <div
          style={{
            display: "flex",
            gap: 14,
            marginTop: 11,
            fontSize: 13,
            color: C.fog,
          }}
        >
          <button
            type="button"
            onClick={onLike}
            style={{
              background: "none",
              border: "none",
              color: liked ? C.amber : C.fog,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              padding: 0,
            }}
          >
            {liked ? "❤️" : "🤍"} {post.likes + (liked ? 1 : 0)}
          </button>
          <span>💬 komentar</span>
          <span>🗺️ lihat spot</span>
        </div>
      </div>
    </div>
  );
}

export function PostCardList({ posts }) {
  const [likes, setLikes] = useState({});

  return (
    <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
      {posts.map((c) => (
        <PostCard
          key={c.id}
          post={c}
          liked={likes[c.id]}
          onLike={() => setLikes((l) => ({ ...l, [c.id]: !l[c.id] }))}
        />
      ))}
    </div>
  );
}
