"use client";

import { useEffect, useState } from "react";
import SectionTitle from "@/components/ui/SectionTitle";
import StrikeCard from "@/components/feed/StrikeCard";
import LegendaBoard from "@/components/game/LegendaBoard";
import { C, DISC, NF_BAITS } from "@/lib/constants";
import { MOCK_STRIKES } from "@/lib/mock-juara";
import { SFX, haptic } from "@/lib/sound";
import { useAuth } from "@/hooks/useAuth";

export default function JuaraPage() {
  const { member } = useAuth();
  const [strikes, setStrikes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    event_name: "",
    fish: "Ikan Mas",
    weight: "",
    place: "1",
    prize: "",
    gear: NF_BAITS[0],
    disc: "galatama",
    kota: "",
    uses_nf: true,
    foto_kolam: "",
    foto_juara: "",
    foto_hadiah: "",
  });

  useEffect(() => {
    const q = member?.id ? `?member_id=${member.id}` : "";
    fetch(`/api/strike${q}`)
      .then((r) => r.json())
      .then((data) => {
        setStrikes(data.ok && data.strikes?.length ? data.strikes : MOCK_STRIKES);
      })
      .catch(() => setStrikes(MOCK_STRIKES));
  }, [member?.id]);

  const reloadStrikes = () => {
    const q = member?.id ? `?member_id=${member.id}` : "";
    fetch(`/api/strike${q}`)
      .then((r) => r.json())
      .then((data) => {
        setStrikes(data.ok && data.strikes?.length ? data.strikes : MOCK_STRIKES);
      })
      .catch(() => setStrikes(MOCK_STRIKES));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!member) return;
    setSubmitting(true);
    setMsg("");
    SFX.cast();
    haptic(15);
    try {
      const res = await fetch("/api/strike", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member_id: member.id, ...form }),
      });
      const data = await res.json();
      if (data.ok) {
        SFX.reveal();
        setMsg(data.msg);
        setShowForm(false);
        reloadStrikes();
      } else {
        setMsg(data.msg || "Gagal kirim.");
      }
    } catch {
      setMsg("Koneksi gagal.");
    } finally {
      setSubmitting(false);
    }
  };

  const inp = {
    width: "100%",
    background: C.deep,
    border: `1px solid ${C.line}`,
    borderRadius: 10,
    padding: "10px 12px",
    color: C.ink,
    fontSize: 13,
    outline: "none",
    marginBottom: 8,
  };

  return (
    <div>
      <SectionTitle eyebrow="// STRIKE JUARA" title="Kemenangan lomba" />
      <button
        type="button"
        onClick={() => {
          if (!member) return;
          SFX.tap();
          setShowForm(!showForm);
        }}
        style={{
          width: "100%",
          marginTop: 12,
          padding: 13,
          borderRadius: 12,
          border: `1px dashed ${C.glow}`,
          background: "rgba(200,255,60,.05)",
          color: C.glow,
          fontWeight: 700,
          cursor: "pointer",
          fontSize: 13.5,
        }}
      >
        🏆 Kirim Strike Juara — bukti lengkap = +500 poin
      </button>
      <p style={{ fontSize: 11, color: C.fog, marginTop: 6, textAlign: "center" }}>
        Foto kolam + juara + hadiah → diverifikasi CS → poin penuh
      </p>

      {msg && (
        <p style={{ fontSize: 12, color: C.glow2, marginTop: 8, textAlign: "center" }}>
          {msg}
        </p>
      )}

      {showForm && (
        <form
          onSubmit={submit}
          style={{
            marginTop: 14,
            padding: 16,
            background: C.deep2,
            border: `1px solid ${C.line}`,
            borderRadius: 14,
          }}
        >
          <input
            style={inp}
            placeholder="Nama event/lomba"
            value={form.event_name}
            onChange={(e) =>
              setForm((f) => ({ ...f, event_name: e.target.value }))
            }
            required
          />
          <div style={{ display: "flex", gap: 8 }}>
            <input
              style={inp}
              placeholder="Ikan"
              value={form.fish}
              onChange={(e) => setForm((f) => ({ ...f, fish: e.target.value }))}
              required
            />
            <input
              style={inp}
              placeholder="Berat kg"
              value={form.weight}
              onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
            />
          </div>
          <select
            style={inp}
            value={form.disc}
            onChange={(e) => setForm((f) => ({ ...f, disc: e.target.value }))}
          >
            {DISC.map((d) => (
              <option key={d.id} value={d.id}>
                {d.icon} {d.label}
              </option>
            ))}
          </select>
          <select
            style={inp}
            value={form.place}
            onChange={(e) => setForm((f) => ({ ...f, place: e.target.value }))}
          >
            <option value="1">Juara 1</option>
            <option value="2">Juara 2</option>
            <option value="3">Juara 3</option>
          </select>
          <input
            style={inp}
            placeholder="Hadiah (opsional)"
            value={form.prize}
            onChange={(e) => setForm((f) => ({ ...f, prize: e.target.value }))}
          />
          <select
            style={inp}
            value={form.gear}
            onChange={(e) => setForm((f) => ({ ...f, gear: e.target.value }))}
          >
            {NF_BAITS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <input
            style={inp}
            placeholder="Kota"
            value={form.kota}
            onChange={(e) => setForm((f) => ({ ...f, kota: e.target.value }))}
          />
          <input
            style={inp}
            placeholder="URL foto kolam (sementara)"
            value={form.foto_kolam}
            onChange={(e) =>
              setForm((f) => ({ ...f, foto_kolam: e.target.value }))
            }
          />
          <input
            style={inp}
            placeholder="URL foto juara"
            value={form.foto_juara}
            onChange={(e) =>
              setForm((f) => ({ ...f, foto_juara: e.target.value }))
            }
          />
          <input
            style={inp}
            placeholder="URL foto hadiah"
            value={form.foto_hadiah}
            onChange={(e) =>
              setForm((f) => ({ ...f, foto_hadiah: e.target.value }))
            }
          />
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              marginBottom: 12,
            }}
          >
            <input
              type="checkbox"
              checked={form.uses_nf}
              onChange={(e) =>
                setForm((f) => ({ ...f, uses_nf: e.target.checked }))
              }
            />
            Pakai produk NF (+500 poin jika verified)
          </label>
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 10,
              border: "none",
              background: C.glow,
              color: C.deep,
              fontWeight: 800,
              cursor: submitting ? "wait" : "pointer",
            }}
          >
            {submitting ? "Mengirim..." : "Kirim bukti strike"}
          </button>
        </form>
      )}

      <div
        style={{
          marginTop: 14,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {strikes.map((s) => (
          <StrikeCard key={s.id} strike={s} />
        ))}
      </div>

      <div
        style={{
          marginTop: 12,
          padding: "10px 13px",
          borderRadius: 10,
          background: C.deep2,
          border: `1px solid ${C.line}`,
        }}
      >
        <div style={{ fontSize: 10.5, color: C.fog, lineHeight: 1.6 }}>
          <b style={{ color: C.ink }}>⚠️ Ketentuan:</b> Foto/video yang dikirim
          menjadi hak Nusa Fishing untuk materi promosi.
        </div>
      </div>

      <SectionTitle eyebrow="// LEGENDA" title="Ranking pemancing" mt={28} />
      <LegendaBoard />
    </div>
  );
}
