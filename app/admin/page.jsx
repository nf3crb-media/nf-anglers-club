"use client";

import { useCallback, useEffect, useState } from "react";
import NFLogo from "@/components/game/NFLogo";
import { C } from "@/lib/constants";
import { POIN_PER_RUPIAH } from "@/lib/poin";
import {
  adminFetch,
  clearAdminKey,
  getAdminKey,
  setAdminKey,
  trySessionAdmin,
} from "@/lib/admin-fetch";

const TABS = [
  { id: "poin", label: "Tambah Poin" },
  { id: "strike", label: "Strike" },
  { id: "tangkapan", label: "Tangkapan" },
  { id: "hadiah", label: "Hadiah" },
  { id: "kode", label: "Kode" },
];

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

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [authMode, setAuthMode] = useState(null);
  const [secretInput, setSecretInput] = useState("");
  const [tab, setTab] = useState("poin");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [overview, setOverview] = useState(null);
  const [members, setMembers] = useState([]);
  const [memberQ, setMemberQ] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [poinForm, setPoinForm] = useState({
    label: "",
    produk_harga: "",
    poin: "",
  });
  const [kodeForm, setKodeForm] = useState({
    batch: "",
    produk: "",
    jumlah: "10",
  });
  const [generatedKodes, setGeneratedKodes] = useState([]);
  const [pendingTangkapan, setPendingTangkapan] = useState([]);
  const [catalogRewards, setCatalogRewards] = useState([]);
  const [pendingRedemptions, setPendingRedemptions] = useState([]);
  const [editingRewardId, setEditingRewardId] = useState(null);
  const [rewardForm, setRewardForm] = useState({
    nama: "",
    slug: "",
    deskripsi: "",
    icon: "🎁",
    cost_poin: "",
    stock: "",
    highlight: "",
    starts_at: "",
    ends_at: "",
    sort_order: "0",
    aktif: true,
  });

  const emptyRewardForm = () => ({
    nama: "",
    slug: "",
    deskripsi: "",
    icon: "🎁",
    cost_poin: "",
    stock: "",
    highlight: "",
    starts_at: "",
    ends_at: "",
    sort_order: "0",
    aktif: true,
  });

  const toLocalDatetime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const loadRewardsAdmin = useCallback(async () => {
    const res = await adminFetch("/api/admin/rewards");
    const data = await res.json();
    if (data.ok) {
      setCatalogRewards(data.rewards || []);
      setPendingRedemptions(data.pending_redemptions || []);
    }
  }, []);

  const loadOverview = useCallback(async () => {
    const res = await adminFetch("/api/admin/overview");
    const data = await res.json();
    if (data.ok) setOverview(data);
  }, []);

  const loadPendingTangkapan = useCallback(async () => {
    const res = await adminFetch("/api/admin/tangkapan");
    const data = await res.json();
    if (data.ok) setPendingTangkapan(data.pending || []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (getAdminKey()) {
        if (!cancelled) setAuthed(true);
        return;
      }
      const ok = await trySessionAdmin();
      if (!cancelled && ok) {
        setAuthed(true);
        setAuthMode("session");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!authed) return;
    loadOverview();
    loadPendingTangkapan();
    loadRewardsAdmin();
  }, [authed, loadOverview, loadPendingTangkapan, loadRewardsAdmin]);

  const login = async (e) => {
    e.preventDefault();
    setMsg("");
    setAdminKey(secretInput.trim());
    const res = await adminFetch("/api/admin/overview");
    const data = await res.json();
    if (data.ok) {
      setAuthed(true);
      setAuthMode("secret");
      setOverview(data);
    } else {
      clearAdminKey();
      setMsg(data.msg || "Kunci admin salah.");
    }
  };

  const searchMembers = async (q) => {
    setMemberQ(q);
    if (q.length < 2) {
      setMembers([]);
      return;
    }
    const res = await adminFetch(`/api/admin/members?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    if (data.ok) setMembers(data.members || []);
  };

  const submitPoin = async (e) => {
    e.preventDefault();
    if (!selectedMember) return;
    setLoading(true);
    setMsg("");
    try {
      const body = {
        member_id: selectedMember.id,
        label: poinForm.label,
      };
      if (poinForm.produk_harga) {
        body.produk_harga = Number(poinForm.produk_harga);
      } else {
        body.poin = Number(poinForm.poin);
      }

      const res = await adminFetch("/api/poin", {
        method: "POST",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.ok) {
        setMsg(
          `+${data.poin_ditambah} poin belanja. Tier: ${data.tier}. Total: ${data.total_poin}`
        );
        setPoinForm({ label: "", produk_harga: "", poin: "" });
        loadOverview();
      } else {
        setMsg(data.msg || "Gagal menambah poin.");
      }
    } catch {
      setMsg("Koneksi gagal.");
    } finally {
      setLoading(false);
    }
  };

  const verifyStrike = async (strikeId, action) => {
    setLoading(true);
    setMsg("");
    try {
      const res = await adminFetch("/api/strike/verify", {
        method: "POST",
        body: JSON.stringify({ strike_id: strikeId, action }),
      });
      const data = await res.json();
      setMsg(data.msg || (data.ok ? "Berhasil." : "Gagal."));
      if (data.ok) loadOverview();
    } catch {
      setMsg("Koneksi gagal.");
    } finally {
      setLoading(false);
    }
  };

  const verifyTangkapan = async (tangkapanId, action) => {
    setLoading(true);
    setMsg("");
    try {
      const res = await adminFetch("/api/admin/tangkapan/verify", {
        method: "POST",
        body: JSON.stringify({ tangkapan_id: tangkapanId, action }),
      });
      const data = await res.json();
      setMsg(data.msg || (data.ok ? "Berhasil." : "Gagal."));
      if (data.ok) {
        loadOverview();
        loadPendingTangkapan();
      }
    } catch {
      setMsg("Koneksi gagal.");
    } finally {
      setLoading(false);
    }
  };

  const generateKodes = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    setGeneratedKodes([]);
    try {
      const res = await adminFetch("/api/kode/generate", {
        method: "POST",
        body: JSON.stringify(kodeForm),
      });
      const data = await res.json();
      if (data.ok) {
        setMsg(data.msg);
        setGeneratedKodes(data.kodes || []);
        loadOverview();
      } else {
        setMsg(data.msg || "Gagal generate.");
      }
    } catch {
      setMsg("Koneksi gagal.");
    } finally {
      setLoading(false);
    }
  };

  const saveReward = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const payload = {
        ...rewardForm,
        cost_poin: Number(rewardForm.cost_poin),
        stock: rewardForm.stock === "" ? null : Number(rewardForm.stock),
        sort_order: Number(rewardForm.sort_order) || 0,
        starts_at: rewardForm.starts_at || null,
        ends_at: rewardForm.ends_at || null,
      };

      const res = editingRewardId
        ? await adminFetch("/api/admin/rewards", {
            method: "PATCH",
            body: JSON.stringify({ id: editingRewardId, ...payload }),
          })
        : await adminFetch("/api/admin/rewards", {
            method: "POST",
            body: JSON.stringify(payload),
          });

      const data = await res.json();
      if (data.ok) {
        setMsg(editingRewardId ? "Hadiah diperbarui." : "Hadiah ditambahkan.");
        setEditingRewardId(null);
        setRewardForm(emptyRewardForm());
        loadRewardsAdmin();
      } else {
        setMsg(data.msg || "Gagal menyimpan hadiah.");
      }
    } catch {
      setMsg("Koneksi gagal.");
    } finally {
      setLoading(false);
    }
  };

  const editReward = (r) => {
    setEditingRewardId(r.id);
    setRewardForm({
      nama: r.nama || "",
      slug: r.slug || "",
      deskripsi: r.deskripsi || "",
      icon: r.icon || "🎁",
      cost_poin: String(r.cost_poin ?? ""),
      stock: r.stock == null ? "" : String(r.stock),
      highlight: r.highlight || "",
      starts_at: toLocalDatetime(r.starts_at),
      ends_at: toLocalDatetime(r.ends_at),
      sort_order: String(r.sort_order ?? 0),
      aktif: r.aktif !== false,
    });
    setTab("hadiah");
    setMsg("");
  };

  const removeReward = async (id, hard = false) => {
    if (!confirm(hard ? "Hapus permanen hadiah ini?" : "Nonaktifkan hadiah ini?")) return;
    setLoading(true);
    setMsg("");
    try {
      const res = await adminFetch(
        `/api/admin/rewards?id=${encodeURIComponent(id)}${hard ? "&hard=1" : ""}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      setMsg(data.msg || (data.ok ? "Berhasil." : "Gagal."));
      if (data.ok) {
        if (editingRewardId === id) {
          setEditingRewardId(null);
          setRewardForm(emptyRewardForm());
        }
        loadRewardsAdmin();
      }
    } catch {
      setMsg("Koneksi gagal.");
    } finally {
      setLoading(false);
    }
  };

  const fulfillRedemption = async (redemptionId) => {
    setLoading(true);
    setMsg("");
    try {
      const res = await adminFetch("/api/admin/rewards", {
        method: "PATCH",
        body: JSON.stringify({ action: "fulfill_redemption", redemption_id: redemptionId }),
      });
      const data = await res.json();
      setMsg(data.msg || (data.ok ? "Penukaran selesai." : "Gagal."));
      if (data.ok) loadRewardsAdmin();
    } catch {
      setMsg("Koneksi gagal.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAdminKey();
    setAuthed(false);
    setAuthMode(null);
    setSecretInput("");
  };

  if (!authed) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <NFLogo size={48} />
          <h1 style={{ fontSize: 20, fontWeight: 800, marginTop: 12 }}>
            NF CS Dashboard
          </h1>
          <p style={{ fontSize: 13, color: C.fog, marginTop: 6 }}>
            Login admin NF (sudah masuk app) otomatis masuk.
            <br />
            Atau masukkan kunci CS (NF_ADMIN_SECRET)
          </p>
        </div>
        <form onSubmit={login}>
          <input
            type="password"
            style={inp}
            placeholder="Kunci admin"
            value={secretInput}
            onChange={(e) => setSecretInput(e.target.value)}
            required
          />
          <button
            type="submit"
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 10,
              border: "none",
              background: C.glow,
              color: C.deep,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Masuk
          </button>
        </form>
        {msg && (
          <p style={{ color: C.amber, fontSize: 12, marginTop: 12, textAlign: "center" }}>
            {msg}
          </p>
        )}
      </div>
    );
  }

  const stats = overview?.stats;

  return (
    <div style={{ padding: "20px 16px 40px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <NFLogo size={32} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>CS Dashboard</div>
            <div style={{ fontSize: 11, color: C.fog }}>NF Anglers Club</div>
            {authMode === "session" && (
              <div style={{ fontSize: 10, color: C.glow2, marginTop: 2 }}>
                via login admin NF
              </div>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          style={{
            padding: "6px 12px",
            borderRadius: 8,
            border: `1px solid ${C.line}`,
            background: "transparent",
            color: C.fog,
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          Keluar
        </button>
      </div>

      {stats && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[
            ["👥", stats.total_members, "Member"],
            ["⏳", stats.pending_strikes, "Strike"],
            ["🃏", stats.pending_tangkapan ?? 0, "Tangkapan"],
            ["🔑", stats.unused_kodes, "Kode"],
          ].map(([icon, val, label]) => (
            <div
              key={label}
              style={{
                flex: 1,
                padding: "12px 8px",
                borderRadius: 12,
                background: C.deep2,
                border: `1px solid ${C.line}`,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 18 }}>{icon}</div>
              <div style={{ fontWeight: 800, fontSize: 16, marginTop: 2 }}>
                {val}
              </div>
              <div style={{ fontSize: 10, color: C.fog }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setTab(t.id);
              setMsg("");
            }}
            style={{
              flex: 1,
              padding: "10px 6px",
              borderRadius: 10,
              border: `1px solid ${tab === t.id ? C.glow : C.line}`,
              background: tab === t.id ? "rgba(200,255,60,.08)" : C.deep2,
              color: tab === t.id ? C.glow : C.fog,
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {msg && (
        <p
          style={{
            fontSize: 12,
            color: C.glow2,
            marginBottom: 12,
            padding: "10px 12px",
            background: C.deep2,
            borderRadius: 10,
            border: `1px solid ${C.line}`,
          }}
        >
          {msg}
        </p>
      )}

      {tab === "poin" && (
        <form onSubmit={submitPoin}>
          <label style={{ fontSize: 12, color: C.fog }}>Cari member</label>
          <input
            style={inp}
            placeholder="Nama atau nomor WA"
            value={memberQ}
            onChange={(e) => searchMembers(e.target.value)}
          />
          {members.length > 0 && (
            <div
              style={{
                marginBottom: 12,
                border: `1px solid ${C.line}`,
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              {members.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setSelectedMember(m);
                    setMemberQ(m.nama);
                    setMembers([]);
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "10px 12px",
                    border: "none",
                    borderBottom: `1px solid ${C.line}`,
                    background:
                      selectedMember?.id === m.id ? C.slate : C.deep2,
                    color: C.ink,
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  <b>{m.nama}</b> · {m.wa_number}
                  <span style={{ color: C.fog, fontSize: 11 }}>
                    {" "}
                    · {m.tier} ·{" "}
                    {((m.poin_belanja ?? 0) + (m.poin_aktivitas ?? 0)).toLocaleString(
                      "id-ID"
                    )}{" "}
                    poin
                  </span>
                </button>
              ))}
            </div>
          )}
          {selectedMember && (
            <p style={{ fontSize: 12, color: C.glow, marginBottom: 12 }}>
              Terpilih: <b>{selectedMember.nama}</b>
            </p>
          )}
          <label style={{ fontSize: 12, color: C.fog }}>Label riwayat poin</label>
          <input
            style={inp}
            placeholder="Belanja NF Strike Series (3 pcs)"
            value={poinForm.label}
            onChange={(e) =>
              setPoinForm((f) => ({ ...f, label: e.target.value }))
            }
            required
          />
          <label style={{ fontSize: 12, color: C.fog }}>
            Nominal belanja (Rp) — 1 poin / Rp
            {POIN_PER_RUPIAH.toLocaleString("id-ID")}
          </label>
          <input
            style={inp}
            type="number"
            placeholder="250000"
            value={poinForm.produk_harga}
            onChange={(e) =>
              setPoinForm((f) => ({ ...f, produk_harga: e.target.value, poin: "" }))
            }
          />
          <p style={{ fontSize: 11, color: C.fog, margin: "-4px 0 8px" }}>
            atau isi poin manual:
          </p>
          <input
            style={inp}
            type="number"
            placeholder="150"
            value={poinForm.poin}
            onChange={(e) =>
              setPoinForm((f) => ({
                ...f,
                poin: e.target.value,
                produk_harga: "",
              }))
            }
          />
          <button
            type="submit"
            disabled={loading || !selectedMember}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 10,
              border: "none",
              background: selectedMember ? C.glow : C.slate,
              color: selectedMember ? C.deep : C.fog,
              fontWeight: 800,
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? "Menyimpan..." : "Tambah poin belanja"}
          </button>
        </form>
      )}

      {tab === "strike" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {(overview?.pending_strikes || []).length === 0 ? (
            <p style={{ color: C.fog, fontSize: 13, textAlign: "center" }}>
              Tidak ada strike menunggu verifikasi.
            </p>
          ) : (
            overview.pending_strikes.map((s) => (
              <div
                key={s.id}
                style={{
                  padding: 14,
                  borderRadius: 12,
                  background: C.deep2,
                  border: `1px solid ${C.amber}55`,
                }}
              >
                <div style={{ fontWeight: 800, fontSize: 14 }}>{s.user}</div>
                <div style={{ fontSize: 11, color: C.fog }}>
                  {s.wa} · {s.time}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, marginTop: 8 }}>
                  {s.event}
                </div>
                <div style={{ fontSize: 12, color: C.fog }}>
                  🐟 {s.fish}
                  {s.weight ? ` · ${s.weight} kg` : ""} · Juara {s.place}
                </div>
                <div style={{ fontSize: 12, color: C.glow2 }}>
                  🧪 {s.gear} · {s.uses_nf ? "Pakai NF (+500)" : "Bukan NF (+75)"}
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                  {[
                    ["kolam", "🏞️"],
                    ["juara", "🏆"],
                    ["hadiah", "🎁"],
                  ].map(([k, ic]) => (
                    <span
                      key={k}
                      style={{
                        flex: 1,
                        textAlign: "center",
                        fontSize: 10,
                        padding: "4px",
                        borderRadius: 6,
                        border: `1px solid ${s.proof[k] ? C.glow2 : C.line}`,
                        color: s.proof[k] ? C.glow2 : C.fog,
                      }}
                    >
                      {ic} {s.proof[k] ? "✓" : "—"}
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => verifyStrike(s.id, "approve")}
                    style={{
                      flex: 1,
                      padding: 10,
                      borderRadius: 8,
                      border: "none",
                      background: C.glow,
                      color: C.deep,
                      fontWeight: 800,
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    ✓ Setujui
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => verifyStrike(s.id, "reject")}
                    style={{
                      flex: 1,
                      padding: 10,
                      borderRadius: 8,
                      border: `1px solid ${C.line}`,
                      background: "transparent",
                      color: C.fog,
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    ✕ Tolak
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "tangkapan" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {pendingTangkapan.length === 0 ? (
            <p style={{ color: C.fog, fontSize: 13, textAlign: "center" }}>
              Tidak ada tangkapan menunggu verifikasi.
            </p>
          ) : (
            pendingTangkapan.map((t) => {
              const card = Array.isArray(t.fish_card) ? t.fish_card[0] : t.fish_card;
              const member = t.member || {};
              return (
                <div
                  key={t.id}
                  style={{
                    padding: 14,
                    borderRadius: 12,
                    background: C.deep2,
                    border: `1px solid ${C.glow2}55`,
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: 14 }}>
                    {member.nama || "Angler"}
                  </div>
                  <div style={{ fontSize: 11, color: C.fog }}>
                    {member.wa_number || "—"}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginTop: 8 }}>
                    🐟 {t.fish} · {t.weight} kg · {t.disc}
                  </div>
                  <div style={{ fontSize: 12, color: C.glow2, marginTop: 4 }}>
                    ◆ {card?.rarity?.toUpperCase() || "—"}
                    {card?.serial_number ? ` · ${card.serial_number}` : ""}
                    {card?.from_comp ? " · Lomba" : ""}
                    {t.uses_nf ? " · NF" : ""}
                  </div>
                  {t.photo_url && (
                    <a
                      href={t.photo_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: 11, color: C.glow, display: "block", marginTop: 6 }}
                    >
                      Lihat foto tangkapan →
                    </a>
                  )}
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => verifyTangkapan(t.id, "approve")}
                      style={{
                        flex: 1,
                        padding: 10,
                        borderRadius: 8,
                        border: "none",
                        background: C.glow,
                        color: C.deep,
                        fontWeight: 800,
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      ✓ Setujui
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => verifyTangkapan(t.id, "reject")}
                      style={{
                        flex: 1,
                        padding: 10,
                        borderRadius: 8,
                        border: `1px solid ${C.line}`,
                        background: "transparent",
                        color: C.fog,
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      ✕ Tolak
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {tab === "hadiah" && (
        <div>
          {pendingRedemptions.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: C.fog, marginBottom: 8 }}>
                Penukaran menunggu ({pendingRedemptions.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {pendingRedemptions.map((rd) => (
                  <div
                    key={rd.id}
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      background: C.deep2,
                      border: `1px solid ${C.amber}55`,
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 13 }}>
                      {rd.reward?.icon} {rd.reward?.nama}
                    </div>
                    <div style={{ fontSize: 11, color: C.fog, marginTop: 4 }}>
                      {rd.member?.nama} · {rd.member?.wa_number} · {rd.cost_poin} poin
                    </div>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => fulfillRedemption(rd.id)}
                      style={{
                        marginTop: 10,
                        width: "100%",
                        padding: 10,
                        borderRadius: 8,
                        border: "none",
                        background: C.glow,
                        color: C.deep,
                        fontWeight: 800,
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      ✓ Tandai selesai / sudah dikirim
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ fontSize: 12, color: C.fog, marginBottom: 8 }}>
            {editingRewardId ? "Edit hadiah" : "Tambah hadiah baru"}
          </div>
          <form onSubmit={saveReward}>
            <input
              style={inp}
              placeholder="Nama hadiah *"
              value={rewardForm.nama}
              onChange={(e) => setRewardForm((f) => ({ ...f, nama: e.target.value }))}
              required
            />
            <input
              style={inp}
              placeholder="Slug (opsional, auto dari nama)"
              value={rewardForm.slug}
              onChange={(e) => setRewardForm((f) => ({ ...f, slug: e.target.value }))}
            />
            <input
              style={inp}
              placeholder="Deskripsi"
              value={rewardForm.deskripsi}
              onChange={(e) => setRewardForm((f) => ({ ...f, deskripsi: e.target.value }))}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <input
                style={{ ...inp, flex: "0 0 72px", marginBottom: 8 }}
                placeholder="🎁"
                value={rewardForm.icon}
                onChange={(e) => setRewardForm((f) => ({ ...f, icon: e.target.value }))}
              />
              <input
                style={{ ...inp, flex: 1, marginBottom: 8 }}
                type="number"
                min={1}
                placeholder="Biaya poin *"
                value={rewardForm.cost_poin}
                onChange={(e) => setRewardForm((f) => ({ ...f, cost_poin: e.target.value }))}
                required
              />
            </div>
            <input
              style={inp}
              placeholder="Highlight / tag promo (mis. Promo Ramadan)"
              value={rewardForm.highlight}
              onChange={(e) => setRewardForm((f) => ({ ...f, highlight: e.target.value }))}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <input
                style={{ ...inp, flex: 1, marginBottom: 8 }}
                type="datetime-local"
                value={rewardForm.starts_at}
                onChange={(e) => setRewardForm((f) => ({ ...f, starts_at: e.target.value }))}
              />
              <input
                style={{ ...inp, flex: 1, marginBottom: 8 }}
                type="datetime-local"
                value={rewardForm.ends_at}
                onChange={(e) => setRewardForm((f) => ({ ...f, ends_at: e.target.value }))}
              />
            </div>
            <p style={{ fontSize: 10, color: C.fog, margin: "-4px 0 8px" }}>
              Jadwal: mulai (kiri) · berakhir (kanan). Kosongkan = selalu tampil.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                style={{ ...inp, flex: 1, marginBottom: 8 }}
                type="number"
                min={0}
                placeholder="Stok (kosong = unlimited)"
                value={rewardForm.stock}
                onChange={(e) => setRewardForm((f) => ({ ...f, stock: e.target.value }))}
              />
              <input
                style={{ ...inp, flex: 1, marginBottom: 8 }}
                type="number"
                placeholder="Urutan tampil"
                value={rewardForm.sort_order}
                onChange={(e) => setRewardForm((f) => ({ ...f, sort_order: e.target.value }))}
              />
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: C.fog, marginBottom: 12 }}>
              <input
                type="checkbox"
                checked={rewardForm.aktif}
                onChange={(e) => setRewardForm((f) => ({ ...f, aktif: e.target.checked }))}
              />
              Aktif (tampil di profil member)
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 10,
                  border: "none",
                  background: C.glow,
                  color: C.deep,
                  fontWeight: 800,
                  cursor: loading ? "wait" : "pointer",
                }}
              >
                {loading ? "Menyimpan..." : editingRewardId ? "Simpan perubahan" : "Tambah hadiah"}
              </button>
              {editingRewardId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingRewardId(null);
                    setRewardForm(emptyRewardForm());
                  }}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: `1px solid ${C.line}`,
                    background: "transparent",
                    color: C.fog,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Batal
                </button>
              )}
            </div>
          </form>

          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 12, color: C.fog, marginBottom: 8 }}>
              Katalog hadiah ({catalogRewards.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {catalogRewards.map((r) => (
                <div
                  key={r.id}
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    background: C.deep2,
                    border: `1px solid ${r.aktif ? C.line : C.fog}`,
                    opacity: r.aktif ? 1 : 0.55,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>
                        {r.icon} {r.nama}
                      </div>
                      <div style={{ fontSize: 11, color: C.glow, marginTop: 2 }}>
                        {r.cost_poin.toLocaleString("id-ID")} poin · {r.schedule_label}
                      </div>
                      {r.highlight && (
                        <div style={{ fontSize: 10, color: C.amber, marginTop: 2 }}>
                          ✨ {r.highlight}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <button
                        type="button"
                        onClick={() => editReward(r)}
                        style={{
                          padding: "4px 8px",
                          borderRadius: 6,
                          border: `1px solid ${C.line}`,
                          background: "transparent",
                          color: C.glow2,
                          fontSize: 10,
                          cursor: "pointer",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => removeReward(r.id, false)}
                        style={{
                          padding: "4px 8px",
                          borderRadius: 6,
                          border: `1px solid ${C.line}`,
                          background: "transparent",
                          color: C.fog,
                          fontSize: 10,
                          cursor: "pointer",
                        }}
                      >
                        Off
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "kode" && (
        <div>
          <form onSubmit={generateKodes}>
            <input
              style={inp}
              placeholder="Nama batch (mis. BATCH-MAR-2026)"
              value={kodeForm.batch}
              onChange={(e) =>
                setKodeForm((f) => ({ ...f, batch: e.target.value }))
              }
              required
            />
            <input
              style={inp}
              placeholder="Nama produk (mis. Essen Amis NF 30ml)"
              value={kodeForm.produk}
              onChange={(e) =>
                setKodeForm((f) => ({ ...f, produk: e.target.value }))
              }
              required
            />
            <input
              style={inp}
              type="number"
              min={1}
              max={500}
              placeholder="Jumlah kode"
              value={kodeForm.jumlah}
              onChange={(e) =>
                setKodeForm((f) => ({ ...f, jumlah: e.target.value }))
              }
              required
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 10,
                border: "none",
                background: C.glow,
                color: C.deep,
                fontWeight: 800,
                cursor: loading ? "wait" : "pointer",
              }}
            >
              {loading ? "Generating..." : "Generate kode unik"}
            </button>
          </form>

          {generatedKodes.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, color: C.fog, marginBottom: 8 }}>
                Kode baru ({generatedKodes.length}):
              </div>
              <div
                style={{
                  maxHeight: 240,
                  overflowY: "auto",
                  background: C.deep2,
                  border: `1px solid ${C.line}`,
                  borderRadius: 10,
                  padding: 10,
                  fontFamily: "monospace",
                  fontSize: 12,
                }}
              >
                {generatedKodes.map((k) => (
                  <div key={k.kode} style={{ padding: "3px 0" }}>
                    {k.kode}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  const text = generatedKodes.map((k) => k.kode).join("\n");
                  navigator.clipboard?.writeText(text);
                  setMsg("Kode disalin ke clipboard.");
                }}
                style={{
                  marginTop: 10,
                  width: "100%",
                  padding: 10,
                  borderRadius: 8,
                  border: `1px solid ${C.line}`,
                  background: C.deep2,
                  color: C.glow2,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                📋 Salin semua kode
              </button>
            </div>
          )}

          {overview?.recent_kodes?.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 12, color: C.fog, marginBottom: 8 }}>
                Kode terbaru:
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {overview.recent_kodes.slice(0, 8).map((k) => (
                  <div
                    key={k.kode}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 11,
                      padding: "8px 10px",
                      background: C.deep2,
                      borderRadius: 8,
                      border: `1px solid ${C.line}`,
                    }}
                  >
                    <span style={{ fontFamily: "monospace" }}>{k.kode}</span>
                    <span style={{ color: k.status === "belum_dipakai" ? C.glow2 : C.fog }}>
                      {k.status === "belum_dipakai" ? "aktif" : "terpakai"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
