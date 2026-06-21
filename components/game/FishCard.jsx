"use client";

import { useEffect, useRef, useState } from "react";
import SectionTitle from "@/components/ui/SectionTitle";
import {
  C,
  DISC,
  FISH_AVG,
  NF_BAITS,
  RARITY,
  RARITY_ORDER,
} from "@/lib/constants";
import { NF_LOGO_LG } from "@/lib/nf-logos";
import { calcRarity } from "@/lib/rarity";
import { SFX, haptic } from "@/lib/sound";
import Confetti from "@/components/game/Confetti";
import { useAuth } from "@/hooks/useAuth";

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export default function FishCardGenerator() {
  const canvasRef = useRef(null);
  const { member } = useAuth();
  const [img, setImg] = useState(null);
  const [step, setStep] = useState("form");
  const [showConfetti, setShowConfetti] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [aiLog, setAiLog] = useState([]);
  const [form, setForm] = useState({
    name: "",
    fish: "Ikan Mas",
    weight: "2.4",
    disc: "🎯 Galatama",
    baitSel: NF_BAITS[0],
    baitCustom: "",
    fromComp: false,
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const displayName = form.name || member?.nama || "Angler";
  const getBait = () =>
    form.baitSel === "__custom" ? form.baitCustom || "-" : form.baitSel;
  const usesNF = () => getBait().toUpperCase().includes("NF");
  const rarity = calcRarity(form.fish, form.weight, usesNF(), form.fromComp);
  const R = RARITY[rarity.key];

  const pickFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const i = new Image();
      i.onload = () => setImg(i);
      i.src = ev.target.result;
    };
    reader.readAsDataURL(f);
  };

  const drawNFLogo = (ctx, x, y, s) => {
    const logoImg = new Image();
    logoImg.onload = () => {
      ctx.save();
      rr(ctx, x, y, s, s * 0.92, s * 0.18);
      ctx.clip();
      ctx.drawImage(logoImg, x, y, s, s * 0.92);
      ctx.restore();
    };
    logoImg.src = NF_LOGO_LG;
  };

  const drawCard = () => {
    const cv = canvasRef.current;
    if (!cv || !img) return;
    const ctx = cv.getContext("2d");
    const W = cv.width;
    const H = cv.height;
    const acc = R.color;

    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#0c1a20");
    bg.addColorStop(1, "#060d10");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = acc;
    rr(ctx, 16, 16, W - 32, H - 32, 44);
    ctx.fill();

    const inner = ctx.createLinearGradient(0, 0, 0, H);
    inner.addColorStop(0, "#102730");
    inner.addColorStop(1, "#0a1419");
    ctx.fillStyle = inner;
    rr(ctx, 34, 34, W - 68, H - 68, 34);
    ctx.fill();

    const rg = ctx.createRadialGradient(W / 2, H * 0.4, 60, W / 2, H * 0.4, W * 0.7);
    rg.addColorStop(0, acc + "33");
    rg.addColorStop(1, "transparent");
    ctx.save();
    rr(ctx, 34, 34, W - 68, H - 68, 34);
    ctx.clip();
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    const pad = 56;
    const photoH = H * 0.56;
    const photoY = 130;

    ctx.save();
    rr(ctx, pad, photoY, W - pad * 2, photoH, 22);
    ctx.clip();
    const ar = img.width / img.height;
    const boxW = W - pad * 2;
    const boxH = photoH;
    const bAr = boxW / boxH;
    let dw, dh, dx, dy;
    if (ar > bAr) {
      dh = boxH;
      dw = dh * ar;
      dx = pad + (boxW - dw) / 2;
      dy = photoY;
    } else {
      dw = boxW;
      dh = dw / ar;
      dx = pad;
      dy = photoY + (boxH - dh) / 2;
    }
    ctx.drawImage(img, dx, dy, dw, dh);
    const vg = ctx.createLinearGradient(0, photoY + photoH - 200, 0, photoY + photoH);
    vg.addColorStop(0, "transparent");
    vg.addColorStop(1, "rgba(6,13,16,.95)");
    ctx.fillStyle = vg;
    ctx.fillRect(pad, photoY, boxW, photoH);
    ctx.restore();
    ctx.strokeStyle = acc;
    ctx.lineWidth = 6;
    rr(ctx, pad, photoY, W - pad * 2, photoH, 22);
    ctx.stroke();

    ctx.textBaseline = "middle";
    ctx.fillStyle = C.ink;
    ctx.font = "900 62px system-ui";
    ctx.fillText((form.fish || "IKAN").toUpperCase(), pad, 84);

    ctx.font = "900 34px system-ui";
    const rl = "◆ " + R.label;
    const rw = ctx.measureText(rl).width + 40;
    ctx.fillStyle = acc;
    rr(ctx, W - pad - rw, 56, rw, 56, 14);
    ctx.fill();
    ctx.fillStyle = "#0a1419";
    ctx.fillText(rl, W - pad - rw + 20, 85);

    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = acc;
    ctx.font = "900 120px system-ui";
    ctx.shadowColor = acc + "88";
    ctx.shadowBlur = 30;
    ctx.fillText(String(form.weight), pad + 20, photoY + photoH - 40);
    ctx.shadowBlur = 0;
    const ww = ctx.measureText(String(form.weight)).width;
    ctx.fillStyle = C.ink;
    ctx.font = "700 44px system-ui";
    ctx.fillText("KG", pad + 20 + ww + 14, photoY + photoH - 44);

    const sy = photoY + photoH + 36;
    ctx.fillStyle = "rgba(255,255,255,.04)";
    rr(ctx, pad, sy, W - pad * 2, 250, 18);
    ctx.fill();
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 2;
    rr(ctx, pad, sy, W - pad * 2, 250, 18);
    ctx.stroke();

    const stat = (label, val, yy, col) => {
      ctx.fillStyle = C.fog;
      ctx.font = "600 30px system-ui";
      ctx.fillText(label, pad + 30, yy);
      ctx.fillStyle = col || C.ink;
      ctx.font = "800 34px system-ui";
      const vw = ctx.measureText(val).width;
      ctx.fillText(val, W - pad - 30 - vw, yy);
    };
    stat("🎣 Pemancing", displayName, sy + 56);
    stat("📊 Disiplin", form.disc, sy + 108);
    stat("🧪 Umpan", getBait(), sy + 160, usesNF() ? C.glow2 : C.fog);
    stat("⭐ Kelangkaan", rarity.ratio + "× rata-rata", sy + 212, acc);

    drawNFLogo(ctx, W - pad - 110, H - 150, 96);
    ctx.fillStyle = C.fog;
    ctx.font = "500 28px system-ui";
    ctx.fillText("© NUSA FISHING · Fish Card", pad, H - 90);
    ctx.fillStyle = acc;
    ctx.font = "700 30px system-ui";
    ctx.fillText("NF ANGLERS CLUB", pad, H - 54);
  };

  const runAI = () => {
    if (!img) {
      alert("Upload foto dulu ya 🎣");
      return;
    }
    SFX.cast();
    haptic(15);
    setStep("processing");
    setAiLog([]);

    const steps = [
      { t: "🔍 Validasi foto — mendeteksi objek ikan...", d: 700 },
      { t: "✓ Foto valid: terdeteksi ikan, bukan duplikat", d: 600, ok: true },
      {
        t: `⚖️ Hitung kelangkaan — ${form.fish} ${form.weight}kg (${rarity.ratio}× rata-rata)...`,
        d: 800,
      },
      {
        t: usesNF()
          ? "✓ Pakai produk NF → bonus kelangkaan +1 tingkat"
          : "• Bukan produk NF → tanpa bonus",
        d: 600,
        ok: usesNF(),
      },
      {
        t: form.fromComp
          ? "✓ Dari lomba → minimal EPIC, antri verifikasi CS"
          : "• Tangkapan harian",
        d: 600,
        ok: form.fromComp,
      },
      { t: `🏆 Hasil: kartu tingkat ${R.label}`, d: 700, final: true },
      {
        t: form.fromComp
          ? "⏳ Status tayang: MENUNGGU VERIFIKASI CS"
          : "✅ Status tayang: LAYAK TAMPIL di feed",
        d: 600,
        ok: !form.fromComp,
      },
    ];

    let i = 0;
    const next = () => {
      if (i >= steps.length) {
        setStep("result");
        const isHigh = rarity.key === "legendary" || rarity.key === "epic";
        if (isHigh) {
          setShowConfetti(true);
          if (rarity.key === "legendary") {
            setShowFlash(true);
            setTimeout(() => setShowFlash(false), 650);
          }
          SFX.legendary();
          haptic(
            rarity.key === "legendary" ? [40, 60, 40, 60, 100] : [30, 50, 30, 50, 80]
          );
        } else {
          SFX.reveal();
          haptic(25);
        }
        return;
      }
      const s = steps[i];
      setAiLog((l) => [...l, s]);
      i += 1;
      setTimeout(next, s.d);
    };
    next();
  };

  useEffect(() => {
    if (step === "result" && img && canvasRef.current) {
      requestAnimationFrame(() => drawCard());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, img]);

  const download = () => {
    const a = document.createElement("a");
    a.download = "fishcard-nf.png";
    a.href = canvasRef.current.toDataURL("image/png");
    a.click();
    SFX.pop();
  };

  const share = () => {
    if (
      !window.confirm(
        "Dengan membagikan, foto jadi hak promosi NF. Lanjut bagikan?"
      )
    ) {
      return;
    }
    canvasRef.current.toBlob(async (blob) => {
      const file = new File([blob], "fishcard-nf.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: "Fish Card NF",
            text: `Dapat Fish Card ${R.label}! 🎣 #NusaFishing #NFAnglersClub`,
          });
        } catch {
          /* user cancelled */
        }
      } else {
        alert(
          "Browser ini belum dukung share langsung. Pakai Download lalu unggah manual ya 🎣"
        );
      }
    }, "image/png");
  };

  const inp = {
    width: "100%",
    background: C.deep,
    border: `1px solid ${C.line}`,
    borderRadius: 10,
    padding: "11px 13px",
    color: C.ink,
    fontSize: 14,
    outline: "none",
    marginBottom: 10,
  };

  return (
    <div>
      <SectionTitle eyebrow="// PENCAPAIAN KOLEKSI" title="🃏 Fish Card" />
      <p style={{ color: C.fog, fontSize: 13, marginTop: 6 }}>
        Abadikan tangkapanmu jadi kartu koleksi. Makin langka ikannya, makin
        tinggi tingkat kartunya — dari Common sampai Legendary. Pakai produk NF
        dapat bonus kelangkaan!
      </p>

      <div style={{ display: "flex", gap: 5, marginTop: 12 }}>
        {RARITY_ORDER.map((k) => (
          <div
            key={k}
            style={{
              flex: 1,
              textAlign: "center",
              padding: "7px 2px",
              borderRadius: 8,
              background: RARITY[k].color + "1a",
              border: `1px solid ${RARITY[k].color}55`,
            }}
          >
            <div
              style={{ fontSize: 9.5, fontWeight: 800, color: RARITY[k].color }}
            >
              {RARITY[k].label}
            </div>
          </div>
        ))}
      </div>

      {step === "form" && (
        <div>
          <label
            style={{
              display: "block",
              marginTop: 14,
              border: `2px dashed ${C.line}`,
              borderRadius: 14,
              padding: "26px 16px",
              textAlign: "center",
              cursor: "pointer",
              background: C.deep2,
            }}
          >
            <div style={{ fontSize: 30 }}>📸</div>
            <div
              style={{
                color: C.glow2,
                fontWeight: 700,
                fontSize: 14,
                marginTop: 6,
              }}
            >
              {img ? "✓ Foto siap — tap untuk ganti" : "Upload foto tangkapan"}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={pickFile}
              style={{ display: "none" }}
            />
          </label>
          <div
            style={{
              background: C.deep2,
              border: `1px solid ${C.line}`,
              borderRadius: 14,
              padding: 14,
              marginTop: 12,
            }}
          >
            <input
              style={inp}
              placeholder="Nama / @username"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <select
                style={inp}
                value={form.fish}
                onChange={(e) => set("fish", e.target.value)}
              >
                {Object.keys(FISH_AVG).map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
              <input
                style={inp}
                placeholder="Berat (kg)"
                value={form.weight}
                onChange={(e) => set("weight", e.target.value)}
              />
            </div>
            <select
              style={inp}
              value={form.disc}
              onChange={(e) => set("disc", e.target.value)}
            >
              {DISC.map((d) => (
                <option key={d.id} value={`${d.icon} ${d.label}`}>
                  {d.icon} {d.label}
                </option>
              ))}
            </select>
            <select
              style={inp}
              value={form.baitSel}
              onChange={(e) => set("baitSel", e.target.value)}
            >
              {NF_BAITS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
              <option value="__custom">✏️ Ketik sendiri...</option>
            </select>
            {form.baitSel === "__custom" && (
              <input
                style={inp}
                placeholder="Ketik umpan/essen"
                value={form.baitCustom}
                onChange={(e) => set("baitCustom", e.target.value)}
              />
            )}
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                fontSize: 13,
                color: C.ink,
                cursor: "pointer",
                marginTop: 2,
              }}
            >
              <input
                type="checkbox"
                checked={form.fromComp}
                onChange={(e) => set("fromComp", e.target.checked)}
                style={{ width: 18, height: 18 }}
              />
              Dari lomba / juara (butuh verifikasi CS)
            </label>
          </div>
          <div
            style={{
              marginTop: 12,
              padding: "14px 16px",
              borderRadius: 14,
              background: R.color + "14",
              border: `1px solid ${R.color}`,
            }}
          >
            <div style={{ fontSize: 11, color: C.fog }}>Perkiraan tingkat kartu</div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: R.color,
                marginTop: 2,
              }}
            >
              ◆ {R.label}
            </div>
            <div style={{ fontSize: 11.5, color: C.fog, marginTop: 3 }}>
              {rarity.ratio}× berat rata-rata {form.fish}{" "}
              {usesNF() && "· +bonus NF 🎣"}
            </div>
          </div>
          <button
            type="button"
            onClick={runAI}
            style={{
              width: "100%",
              marginTop: 14,
              padding: 15,
              borderRadius: 12,
              border: "none",
              fontWeight: 800,
              cursor: "pointer",
              background: C.glow,
              color: C.deep,
              fontSize: 15,
            }}
          >
            🤖 Proses & Buat Fish Card
          </button>
        </div>
      )}

      {step === "processing" && (
        <div
          style={{
            marginTop: 16,
            background: C.deep2,
            border: `1px solid ${C.line}`,
            borderRadius: 16,
            padding: 18,
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: C.glow2,
              fontFamily: "monospace",
              letterSpacing: ".1em",
              marginBottom: 12,
            }}
          >
            {"// NF AI MEMPROSES..."}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {aiLog.map((s, i) => (
              <div
                key={i}
                style={{
                  fontSize: 13,
                  color: s.final
                    ? RARITY[rarity.key].color
                    : s.ok
                      ? C.glow2
                      : C.ink,
                  fontWeight: s.final ? 800 : 500,
                  fontFamily: "monospace",
                  lineHeight: 1.4,
                }}
              >
                {s.t}
              </div>
            ))}
          </div>
        </div>
      )}

      {step === "result" && (
        <div>
          <Confetti
            active={showConfetti}
            intensity={rarity.key === "legendary" ? "legendary" : "epic"}
            colors={
              rarity.key === "legendary"
                ? ["#ffb43c", "#ffd700", "#c8ff3c", "#ff6b35", "#fff"]
                : undefined
            }
          />
          {showFlash && (
            <div
              className="legendary-flash"
              style={{
                position: "fixed",
                inset: 0,
                background: "radial-gradient(circle, rgba(255,180,60,.35), transparent 70%)",
                pointerEvents: "none",
                zIndex: 9998,
              }}
            />
          )}
          <div style={{ textAlign: "center", marginTop: 14, marginBottom: 6 }}>
            <div
              className={
                rarity.key === "epic" || rarity.key === "legendary"
                  ? "legendary-badge"
                  : undefined
              }
              style={{
                display: "inline-block",
                fontSize: 13,
                fontWeight: 900,
                letterSpacing: ".2em",
                color: R.color,
                padding: "6px 18px",
                borderRadius: 30,
                border: `1px solid ${R.color}`,
                background: R.color + "14",
              }}
            >
              {rarity.key === "legendary"
                ? "🌟 LEGENDARY CATCH! 🌟"
                : rarity.key === "epic"
                  ? "✨ EPIC CATCH! ✨"
                  : `KARTU ${R.label} DIDAPAT`}
            </div>
          </div>
          <div
            className={rarity.key === "legendary" ? "legendary-shake" : undefined}
            style={{ position: "relative" }}
          >
            <div className="card-reveal">
              <canvas
                ref={canvasRef}
                width={900}
                height={1260}
                style={{
                  width: "100%",
                  borderRadius: 16,
                  boxShadow: `0 20px 70px -16px ${R.glow}${rarity.key === "legendary" ? "cc" : "88"}`,
                  position: "relative",
                  zIndex: 1,
                }}
              />
            </div>
          </div>
          <div
            style={{
              textAlign: "center",
              marginTop: 12,
              fontSize: 13,
              color: C.fog,
            }}
          >
            {form.fromComp
              ? "⏳ Kartu lomba menunggu verifikasi CS sebelum tayang publik"
              : "✅ Kartu layak tampil & otomatis masuk Fishdex-mu"}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button
              type="button"
              onClick={download}
              style={{
                flex: 1,
                padding: 14,
                borderRadius: 12,
                border: "none",
                fontWeight: 700,
                cursor: "pointer",
                background: C.glow,
                color: C.deep,
              }}
            >
              ⬇️ Download
            </button>
            <button
              type="button"
              onClick={share}
              style={{
                flex: 1,
                padding: 14,
                borderRadius: 12,
                border: "none",
                fontWeight: 700,
                cursor: "pointer",
                background: C.glow2,
                color: "#06281a",
              }}
            >
              📤 Bagikan
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              setStep("form");
              setAiLog([]);
              setShowConfetti(false);
              setShowFlash(false);
            }}
            style={{
              width: "100%",
              marginTop: 10,
              padding: 12,
              borderRadius: 12,
              border: `1px solid ${C.line}`,
              background: "transparent",
              color: C.fog,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ← Buat kartu lain
          </button>
          <p
            style={{
              fontSize: 10.5,
              color: C.fog,
              textAlign: "center",
              marginTop: 12,
              lineHeight: 1.6,
            }}
          >
            Dengan membagikan kartu, kamu setuju logo & merek NF tampil pada
            konten. Foto dapat digunakan NF untuk promosi.
          </p>
        </div>
      )}
    </div>
  );
}
