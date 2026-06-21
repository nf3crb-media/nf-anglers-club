"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import SectionTitle from "@/components/ui/SectionTitle";
import { C, DISC } from "@/lib/constants";
import { SFX, haptic } from "@/lib/sound";
import { useAuth } from "@/hooks/useAuth";
import { useSpots } from "@/hooks/useSpots";

const TILE_URL =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

function discOf(id) {
  return DISC.find((d) => d.id === id) || DISC[0];
}

function spotPinIcon(disc, productive) {
  const d = discOf(disc);
  const col = productive ? C.glow : C.glow2;
  return L.divIcon({
    html: `<div style="position:relative;transform:translate(-50%,-100%)">
      <div style="width:38px;height:38px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${col};display:grid;place-items:center;box-shadow:0 0 16px ${col}88;border:2px solid #0a1419">
        <span style="transform:rotate(45deg);font-size:16px">${d.icon}</span>
      </div>
      ${productive ? `<div style="position:absolute;top:-6px;left:50%;transform:translateX(-50%);width:46px;height:46px;border-radius:50%;border:2px solid ${col};opacity:.5;animation:pingRing 1.8s infinite"></div>` : ""}
    </div>`,
    className: "",
    iconSize: [38, 38],
  });
}

export default function SpotMap() {
  const router = useRouter();
  const { member } = useAuth();
  const { spots, loading, refresh } = useSpots();
  const mapRef = useRef(null);
  const mapObj = useRef(null);
  const markersLayer = useRef(null);
  const userMarker = useRef(null);

  const [activeSpot, setActiveSpot] = useState(null);
  const [geoMsg, setGeoMsg] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [markForm, setMarkForm] = useState(null);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapObj.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([-2.5, 118], 5);

    L.tileLayer(TILE_URL, { maxZoom: 19, subdomains: "abcd" }).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);

    markersLayer.current = L.layerGroup().addTo(map);
    mapObj.current = map;

    setTimeout(() => map.invalidateSize(), 300);

    return () => {
      map.remove();
      mapObj.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapObj.current;
    const layer = markersLayer.current;
    if (!map || !layer) return;

    layer.clearLayers();
    spots.forEach((s) => {
      const marker = L.marker([s.lat, s.lng], {
        icon: spotPinIcon(s.disc, s.productive),
      });
      marker.on("click", () => {
        SFX.tap();
        haptic(8);
        setActiveSpot(s);
      });
      layer.addLayer(marker);
    });
  }, [spots]);

  const showUserPin = (lat, lng, label) => {
    const map = mapObj.current;
    if (!map) return;
    if (userMarker.current) {
      map.removeLayer(userMarker.current);
    }
    const icon = L.divIcon({
      html: `<div style="width:22px;height:22px;border-radius:50%;background:#54b9ff;border:3px solid #fff;box-shadow:0 0 0 8px rgba(84,185,255,.3)"></div>`,
      className: "",
      iconSize: [22, 22],
    });
    userMarker.current = L.marker([lat, lng], { icon })
      .addTo(map)
      .bindPopup(label || "Kamu di sini 🎣")
      .openPopup();
  };

  const locateMe = () => {
    if (!navigator.geolocation) {
      setGeoMsg("Browser tidak mendukung GPS.");
      return;
    }
    SFX.tap();
    haptic(12);
    setGeoMsg("📍 Mencari lokasimu...");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setGeoMsg("");
        mapObj.current?.setView([latitude, longitude], 15);
        showUserPin(latitude, longitude, "Kamu di sini 🎣");

        try {
          const res = await fetch(
            `/api/geocode/reverse?lat=${latitude}&lng=${longitude}`
          );
          const data = await res.json();
          if (data.ok) {
            showUserPin(
              latitude,
              longitude,
              `<b>${data.short}</b><br/>Tap "Tandai spot" untuk simpan`
            );
          }
        } catch {
          /* pin tetap tampil tanpa alamat */
        }
      },
      () =>
        setGeoMsg(
          "Akses lokasi ditolak. Di HP production butuh HTTPS (Vercel sudah oke)."
        ),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const runSearch = async () => {
    const q = searchQ.trim();
    if (q.length < 3) return;
    SFX.tap();
    setGeoMsg("Mencari alamat...");
    try {
      const res = await fetch(`/api/geocode/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSearchResults(data.ok ? data.results : []);
      setGeoMsg("");
    } catch {
      setGeoMsg("Pencarian gagal.");
      setSearchResults([]);
    }
  };

  const goToResult = (r) => {
    mapObj.current?.setView([r.lat, r.lng], 14);
    showUserPin(r.lat, r.lng, r.short);
    setSearchResults([]);
    setSearchQ(r.short);
    SFX.pop();
  };

  const startMarkFromGps = () => {
    if (!member) {
      router.push("/login");
      return;
    }
    if (!navigator.geolocation) {
      setGeoMsg("GPS tidak tersedia.");
      return;
    }
    setMarking(true);
    setGeoMsg("📍 Ambil koordinat & alamat nyata...");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let alamat = "Spot mancing";
        let kota = "";
        let provinsi = "";
        try {
          const res = await fetch(
            `/api/geocode/reverse?lat=${latitude}&lng=${longitude}`
          );
          const data = await res.json();
          if (data.ok) {
            alamat = data.short;
            kota = data.kota || "";
            provinsi = data.provinsi || "";
          }
        } catch {
          /* fallback coords only */
        }
        setMarkForm({
          lat: latitude,
          lng: longitude,
          nama: alamat,
          kota,
          provinsi,
          fish: "Ikan Mas",
          disc: "galatama",
          best_bait: "",
        });
        mapObj.current?.setView([latitude, longitude], 16);
        showUserPin(latitude, longitude, `<b>${alamat}</b>`);
        setGeoMsg("");
        setMarking(false);
      },
      () => {
        setGeoMsg("GPS ditolak — izinkan lokasi untuk tandai spot.");
        setMarking(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const submitMark = async () => {
    if (!markForm || !member) return;
    SFX.cast();
    haptic(15);
    try {
      const res = await fetch("/api/spot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member_id: member.id, ...markForm }),
      });
      const data = await res.json();
      if (data.ok) {
        SFX.reveal();
        setMarkForm(null);
        refresh();
        setGeoMsg("✅ Spot tersimpan dengan alamat nyata!");
        setTimeout(() => setGeoMsg(""), 3000);
      } else {
        setGeoMsg(data.msg || "Gagal simpan spot.");
      }
    } catch {
      setGeoMsg("Koneksi gagal.");
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
      <SectionTitle
        eyebrow="// PETA SPOT — LIVE"
        title="Spot mancing se-Indonesia"
      />
      <p style={{ color: C.fog, fontSize: 13, marginTop: 8 }}>
        Peta nyata (koordinat GPS) dengan gaya game gelap. Alamat kota/jalan dari
        API NF — bukan tebakan.
      </p>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input
          value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runSearch()}
          placeholder="Cari alamat / kota / kolam..."
          style={{ ...inp, marginBottom: 0, flex: 1 }}
        />
        <button
          type="button"
          onClick={runSearch}
          style={{
            padding: "0 14px",
            borderRadius: 10,
            border: "none",
            background: C.slate,
            color: C.glow2,
            fontWeight: 700,
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          Cari
        </button>
      </div>

      {searchResults.length > 0 && (
        <div
          style={{
            marginTop: 8,
            background: C.deep2,
            border: `1px solid ${C.line}`,
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {searchResults.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goToResult(r)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "10px 12px",
                border: "none",
                borderBottom:
                  i < searchResults.length - 1
                    ? `1px solid ${C.line}`
                    : "none",
                background: "transparent",
                color: C.ink,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              📍 {r.short}
            </button>
          ))}
        </div>
      )}

      <div style={{ position: "relative", marginTop: 14 }}>
        <div
          ref={mapRef}
          style={{
            height: 360,
            borderRadius: 16,
            border: `1px solid ${C.line}`,
            overflow: "hidden",
            zIndex: 1,
          }}
        />
        {loading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              color: C.fog,
              fontSize: 13,
              background: "rgba(10,20,25,.6)",
              borderRadius: 16,
            }}
          >
            Memuat spot... 🗺️
          </div>
        )}
        <button
          type="button"
          onClick={locateMe}
          style={{
            position: "absolute",
            right: 12,
            top: 12,
            zIndex: 1000,
            width: 44,
            height: 44,
            borderRadius: 12,
            border: "none",
            background: C.glow,
            color: C.deep,
            fontSize: 20,
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(0,0,0,.4)",
          }}
          title="Lokasi saya"
        >
          🧭
        </button>
        <div
          style={{
            position: "absolute",
            left: 12,
            top: 12,
            zIndex: 1000,
            fontSize: 11,
            color: C.ink,
            background: "rgba(10,20,25,.85)",
            padding: "6px 11px",
            borderRadius: 20,
            border: `1px solid ${C.line}`,
          }}
        >
          <span style={{ color: C.glow }}>●</span> produktif &nbsp;
          <span style={{ color: C.glow2 }}>●</span> biasa
        </div>
      </div>

      {geoMsg && (
        <div
          style={{
            fontSize: 12,
            color: C.fog,
            marginTop: 8,
            textAlign: "center",
          }}
        >
          {geoMsg}
        </div>
      )}

      {activeSpot && (
        <div
          style={{
            marginTop: 14,
            background: C.deep2,
            border: `1px solid ${C.glow2}`,
            borderRadius: 14,
            padding: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ fontWeight: 700 }}>
              {discOf(activeSpot.disc).icon} Spot {activeSpot.fish}
            </div>
            <button
              type="button"
              onClick={() => setActiveSpot(null)}
              style={{
                background: "none",
                border: "none",
                color: C.fog,
                cursor: "pointer",
                fontSize: 18,
              }}
            >
              ×
            </button>
          </div>
          <div style={{ fontSize: 13, color: C.fog, marginTop: 6 }}>
            Ditandai oleh{" "}
            <b style={{ color: C.ink }}>{activeSpot.user}</b>
          </div>
          <div style={{ fontSize: 13, color: C.glow2, marginTop: 4 }}>
            📍 {activeSpot.alamat || activeSpot.nama || activeSpot.city}
          </div>
          {(activeSpot.kota || activeSpot.provinsi) && (
            <div style={{ fontSize: 12, color: C.fog, marginTop: 2 }}>
              {activeSpot.kota}
              {activeSpot.provinsi ? `, ${activeSpot.provinsi}` : ""}
            </div>
          )}
          <div style={{ fontSize: 13, color: C.fog, marginTop: 3 }}>
            {discOf(activeSpot.disc).label} ·{" "}
            {activeSpot.productive
              ? "🔥 Produktif minggu ini"
              : "Aktivitas sedang"}
          </div>
          <div style={{ fontSize: 13, color: C.glow2, marginTop: 3 }}>
            🧪 Racikan jitu: {activeSpot.best}
          </div>
          <button
            type="button"
            onClick={() => router.push("/ai")}
            style={{
              marginTop: 12,
              width: "100%",
              padding: 11,
              borderRadius: 10,
              border: "none",
              background: C.glow,
              color: C.deep,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            🤖 Tanya AI racikan buat spot ini
          </button>
        </div>
      )}

      {markForm && (
        <div
          style={{
            marginTop: 14,
            background: C.deep2,
            border: `1px solid ${C.amber}`,
            borderRadius: 14,
            padding: 16,
          }}
        >
          <div style={{ fontWeight: 700, color: C.amber }}>
            Tandai spot baru
          </div>
          <div style={{ fontSize: 12, color: C.fog, marginTop: 6 }}>
            📍 {markForm.nama}
          </div>
          <div style={{ fontSize: 11, color: C.fog, marginTop: 2 }}>
            {markForm.lat.toFixed(5)}, {markForm.lng.toFixed(5)}
          </div>
          <input
            style={{ ...inp, marginTop: 12 }}
            placeholder="Jenis ikan utama"
            value={markForm.fish}
            onChange={(e) =>
              setMarkForm((f) => ({ ...f, fish: e.target.value }))
            }
          />
          <select
            style={inp}
            value={markForm.disc}
            onChange={(e) =>
              setMarkForm((f) => ({ ...f, disc: e.target.value }))
            }
          >
            {DISC.map((d) => (
              <option key={d.id} value={d.id}>
                {d.icon} {d.label}
              </option>
            ))}
          </select>
          <input
            style={inp}
            placeholder="Racikan jitu (opsional)"
            value={markForm.best_bait}
            onChange={(e) =>
              setMarkForm((f) => ({ ...f, best_bait: e.target.value }))
            }
          />
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button
              type="button"
              onClick={() => setMarkForm(null)}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 10,
                border: `1px solid ${C.line}`,
                background: "transparent",
                color: C.fog,
                cursor: "pointer",
              }}
            >
              Batal
            </button>
            <button
              type="button"
              onClick={submitMark}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 10,
                border: "none",
                background: C.glow,
                color: C.deep,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Simpan spot
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        disabled={marking}
        onClick={startMarkFromGps}
        style={{
          width: "100%",
          marginTop: 14,
          padding: 13,
          borderRadius: 12,
          border: `1px dashed ${C.line}`,
          background: C.deep2,
          color: C.glow2,
          fontWeight: 700,
          cursor: marking ? "wait" : "pointer",
          fontSize: 14,
        }}
      >
        {marking
          ? "Mengambil GPS & alamat..."
          : "📍 Tandai spot dari lokasiku (+40 poin)"}
      </button>
    </div>
  );
}
