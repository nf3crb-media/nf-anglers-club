"use client";

import { useEffect, useRef } from "react";

const DEFAULT_COLORS = [
  "#c8ff3c",
  "#ffb43c",
  "#5ce0a0",
  "#ffd700",
  "#54b9ff",
  "#ff9ed8",
  "#c77dff",
];

function rand(min, max) {
  return min + Math.random() * (max - min);
}

export default function Confetti({ active, intensity = "epic", colors = DEFAULT_COLORS }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let raf = 0;
    let running = true;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const count =
      intensity === "legendary" ? 140 : intensity === "epic" ? 80 : 40;
    const duration = intensity === "legendary" ? 4200 : 2800;
    const start = performance.now();

    const particles = Array.from({ length: count }, () => ({
      x: rand(0, canvas.width),
      y: rand(-canvas.height * 0.2, -20),
      w: rand(6, intensity === "legendary" ? 14 : 10),
      h: rand(4, 9),
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: rand(0, Math.PI * 2),
      rotV: rand(-0.2, 0.2),
      vx: rand(-2.5, 2.5),
      vy: rand(2, intensity === "legendary" ? 7 : 5),
      opacity: 1,
      shape: Math.random() > 0.35 ? "rect" : "circle",
    }));

    const tick = (now) => {
      if (!running) return;
      const elapsed = now - start;
      const t = elapsed / duration;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06;
        p.vx *= 0.995;
        p.rot += p.rotV;
        p.opacity = Math.max(0, 1 - t * 1.1);

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);

        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.w * 0.45, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
        ctx.restore();
      });

      if (elapsed < duration) {
        raf = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    raf = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [active, intensity, colors]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="nf-confetti"
      aria-hidden="true"
    />
  );
}
