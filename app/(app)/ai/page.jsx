"use client";

import { useEffect, useRef, useState } from "react";
import SectionTitle from "@/components/ui/SectionTitle";
import { C } from "@/lib/constants";
import { SFX, haptic, primeAudio } from "@/lib/sound";
import { useAuth } from "@/hooks/useAuth";

export default function AIPage() {
  const { member } = useAuth();
  const [chat, setChat] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    const name = member?.nama || "pemancing";
    setChat([
      {
        role: "ai",
        text: `Halo ${name}! 🎣 Aku NF AI — spesialis racikan umpan & essen Nusa Fishing. Sebut disiplin + ikan target + kondisi spot, nanti aku racikkan.`,
      },
    ]);
  }, [member?.nama]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, sending]);

  const toApiMessages = (history) =>
    history
      .filter((m) => m.role === "me" || m.role === "ai")
      .map((m) => ({
        role: m.role === "me" ? "user" : "assistant",
        content: m.text,
      }));

  const sendChat = async () => {
    const text = input.trim();
    if (!text || sending) return;

    primeAudio();
    SFX.tap();
    haptic(8);

    const userMsg = { role: "me", text };
    const nextChat = [...chat, userMsg];
    setChat(nextChat);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: toApiMessages(nextChat) }),
      });
      const data = await res.json();
      if (data.ok) {
        setChat((c) => [...c, { role: "ai", text: data.reply }]);
        SFX.pop();
      } else {
        setChat((c) => [
          ...c,
          { role: "ai", text: data.msg || "Gagal memuat jawaban." },
        ]);
      }
    } catch {
      setChat((c) => [
        ...c,
        { role: "ai", text: "Koneksi putus. Coba lagi ya 🎣" },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <SectionTitle eyebrow="// SPESIALIS UMPAN" title="NF AI" />
      <div
        style={{
          marginTop: 14,
          background: C.deep2,
          border: `1px solid ${C.line}`,
          borderRadius: 16,
          height: 380,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {chat.map((m, i) => (
            <div
              key={i}
              style={{
                alignSelf: m.role === "me" ? "flex-end" : "flex-start",
                maxWidth: "85%",
                display: "flex",
                gap: 8,
                flexDirection: m.role === "me" ? "row-reverse" : "row",
              }}
            >
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 7,
                  flexShrink: 0,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 12,
                  fontWeight: 800,
                  background: m.role === "ai" ? C.glow : C.slate,
                  color: m.role === "ai" ? C.deep : C.ink,
                }}
              >
                {m.role === "ai" ? "NF" : "🎣"}
              </span>
              <div
                style={{
                  padding: "10px 13px",
                  borderRadius: 13,
                  fontSize: 13.5,
                  background: m.role === "me" ? C.glow : C.slate,
                  color: m.role === "me" ? C.deep : C.ink,
                  border: m.role === "ai" ? `1px solid ${C.line}` : "none",
                  fontWeight: m.role === "me" ? 500 : 400,
                  whiteSpace: "pre-wrap",
                }}
              >
                {m.text}
              </div>
            </div>
          ))}
          {sending && (
            <div style={{ fontSize: 12, color: C.fog, fontFamily: "monospace" }}>
              NF AI mengetik...
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div
          style={{
            display: "flex",
            gap: 9,
            padding: 12,
            borderTop: `1px solid ${C.line}`,
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendChat()}
            placeholder="Tanya racikan umpan..."
            disabled={sending}
            style={{
              flex: 1,
              background: C.deep,
              border: `1px solid ${C.line}`,
              borderRadius: 10,
              padding: "11px 13px",
              color: C.ink,
              fontSize: 13.5,
              outline: "none",
            }}
          />
          <button
            type="button"
            onClick={sendChat}
            disabled={sending}
            style={{
              width: 44,
              borderRadius: 10,
              border: "none",
              background: sending ? C.slate : C.glow,
              color: C.deep,
              fontSize: 17,
              cursor: sending ? "wait" : "pointer",
            }}
          >
            ➤
          </button>
        </div>
      </div>
      <p
        style={{
          fontSize: 11,
          color: C.fog,
          textAlign: "center",
          marginTop: 10,
        }}
      >
        Scope dikunci: hanya produk & racikan umpan NF. Khusus member.
      </p>
    </div>
  );
}
