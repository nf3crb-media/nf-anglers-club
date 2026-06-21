"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SectionTitle from "@/components/ui/SectionTitle";
import { C } from "@/lib/constants";
import { SFX } from "@/lib/sound";

const STATUS_STYLE = {
  completed: { icon: "✅", color: C.glow2, label: "Selesai" },
  in_progress: { icon: "🎣", color: C.glow, label: "Berjalan" },
  available: { icon: "📋", color: C.ink, label: "Siap" },
  locked: { icon: "🔒", color: C.fog, label: "Terkunci" },
};

export default function StoryPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/story")
      .then((r) => r.json())
      .then((res) => {
        if (res.ok) setData(res);
        else setData(null);
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ color: C.fog, fontSize: 14, textAlign: "center", padding: 40 }}>
        Memuat story...
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <SectionTitle title="Story Campaign" subtitle="NF Anglers Club" />
        <div
          style={{
            background: C.deep2,
            border: `1px solid ${C.line}`,
            borderRadius: 16,
            padding: 24,
            textAlign: "center",
            color: C.fog,
            fontSize: 13,
          }}
        >
          Gagal memuat story. Coba refresh halaman.
        </div>
      </div>
    );
  }

  const { chapter, missions = [], chapter_complete, timeline = [], story_chapter } = data;
  const doneCount = missions.filter((m) => m.status === "completed").length;

  return (
    <div>
      <SectionTitle
        title="Story Campaign"
        subtitle={
          chapter
            ? `Bab ${chapter.chapter_number} · ${chapter.judul}`
            : `Bab ${story_chapter ?? "?"}`
        }
      />

      {timeline.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 6,
            marginBottom: 14,
            overflowX: "auto",
            paddingBottom: 4,
          }}
        >
          {timeline.map((ch) => {
            const colors = {
              completed: { bg: "rgba(92,224,160,.12)", border: C.glow2, text: C.glow2 },
              current: { bg: "rgba(200,255,60,.1)", border: C.glow, text: C.glow },
              locked: { bg: C.deep2, border: C.line, text: C.fog },
            };
            const style = colors[ch.state] || colors.locked;
            return (
              <div
                key={ch.slug}
                style={{
                  flex: "0 0 auto",
                  padding: "8px 12px",
                  borderRadius: 10,
                  border: `1px solid ${style.border}`,
                  background: style.bg,
                  fontSize: 11,
                  fontWeight: 700,
                  color: style.text,
                }}
              >
                {ch.state === "completed" ? "✓ " : ch.state === "locked" ? "🔒 " : "▶ "}
                Bab {ch.chapter_number}
              </div>
            );
          })}
        </div>
      )}

      {!chapter ? (
        <div
          style={{
            background: C.deep2,
            border: `1px dashed ${C.line}`,
            borderRadius: 16,
            padding: 20,
            textAlign: "center",
            color: C.fog,
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          Bab {story_chapter ?? "?"} belum di-seed di database.
          <br /><br />
          Jalankan di Supabase SQL Editor:
          <br />
          <code style={{ color: C.glow2 }}>story_chapter1.sql</code>
          {Number(story_chapter) > 1 && (
            <>
              {" "}dan <code style={{ color: C.glow2 }}>story_chapter2.sql</code>
            </>
          )}
        </div>
      ) : (
        <>
          <div
            style={{
              background: `linear-gradient(135deg, ${C.slate}, ${C.deep2})`,
              border: `1px solid ${C.line}`,
              borderRadius: 16,
              padding: 18,
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 11, color: C.fog, letterSpacing: ".08em" }}>
              CERITA BAB INI
            </div>
            <p style={{ fontSize: 13, color: C.ink, lineHeight: 1.55, marginTop: 8 }}>
              {chapter.intro_story}
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 14,
                fontSize: 11,
                color: C.fog,
              }}
            >
              <span>🏞️ Habitat: {chapter.habitat || "—"}</span>
              <span>
                {doneCount}/{missions.length} misi
              </span>
            </div>
            <div
              style={{
                height: 6,
                background: C.deep,
                borderRadius: 8,
                marginTop: 8,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${missions.length ? (doneCount / missions.length) * 100 : 0}%`,
                  height: "100%",
                  background: C.glow2,
                  borderRadius: 8,
                }}
              />
            </div>
            {chapter.level_locked && (
              <div style={{ marginTop: 12, fontSize: 12, color: C.amber }}>
                🔒 Butuh level {chapter.unlock_level} untuk membuka bab ini.
              </div>
            )}
          </div>

          {chapter_complete && chapter.outro_story && (
            <div
              style={{
                background: "rgba(92,224,160,.08)",
                border: `1px solid ${C.glow2}`,
                borderRadius: 12,
                padding: 14,
                marginBottom: 16,
                fontSize: 13,
                color: C.glow2,
              }}
            >
              🎉 {chapter.outro_story}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {missions.map((mission) => {
              const meta = STATUS_STYLE[mission.status] || STATUS_STYLE.locked;
              return (
                <div
                  key={mission.id}
                  style={{
                    background: mission.is_boss ? "rgba(255,200,60,.06)" : C.deep2,
                    border: `1px solid ${
                      mission.status === "completed"
                        ? C.glow2
                        : mission.is_boss
                          ? "rgba(255,200,60,.35)"
                          : C.line
                    }`,
                    borderRadius: 14,
                    padding: 14,
                    opacity: mission.status === "locked" ? 0.55 : 1,
                  }}
                >
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ fontSize: 22 }}>{meta.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 8,
                        }}
                      >
                        <div style={{ fontWeight: 800, fontSize: 14 }}>
                          {mission.is_boss ? "👑 " : ""}
                          {mission.mission_number}. {mission.judul}
                        </div>
                        <span
                          style={{
                            fontSize: 10,
                            color: meta.color,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {meta.label}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: C.fog, marginTop: 4 }}>
                        {mission.deskripsi}
                      </div>
                      <div style={{ fontSize: 11, color: C.glow2, marginTop: 6 }}>
                        {mission.progress_label}
                      </div>
                      {(mission.xp_reward > 0 || mission.activity_point_reward > 0) && (
                        <div style={{ fontSize: 10, color: C.fog, marginTop: 6 }}>
                          Hadiah: +{mission.xp_reward} XP
                          {mission.activity_point_reward > 0 &&
                            ` · +${mission.activity_point_reward} poin aktivitas`}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Link
            href="/fishcard"
            onClick={() => SFX.pop()}
            style={{
              display: "block",
              marginTop: 20,
              textAlign: "center",
              background: C.glow,
              color: C.deep,
              fontWeight: 800,
              fontSize: 14,
              padding: "14px 16px",
              borderRadius: 12,
              textDecoration: "none",
            }}
          >
            🃏 Buat Fish Card untuk progres misi
          </Link>
        </>
      )}
    </div>
  );
}
