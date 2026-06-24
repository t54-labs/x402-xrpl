"use client";

import { useEffect, useRef, useState } from "react";

// Animated t54 halftone aperture. Same iris/lens dot layout as the static
// <Halftone>, but drawn on a canvas with a requestAnimationFrame loop so every
// dot can pulse (size + opacity) without the cost of hundreds of animated SVG
// nodes. Two combined waves give it life: a radial ripple breathing outward
// from the centre plus a slow angular shimmer rotating around the ring.
//
// Rendered client-only (after mount) so it never participates in SSR/hydration —
// that keeps the effect's canvas ref stable even if the surrounding tree is
// re-rendered during hydration recovery (otherwise the rAF loop ends up drawing
// to a detached canvas and the visible one stays blank).
export function HalftoneCanvas({
  className = "",
  size = 480,
  cell = 11,
}: {
  className?: string;
  size?: number;
  cell?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    ctx.scale(dpr, dpr);

    const cs = getComputedStyle(document.documentElement);
    const base = cs.getPropertyValue("--paper-faint").trim() || "#4E443C";
    const coral = cs.getPropertyValue("--t54-coral").trim() || "#C9462E";

    // Precompute the aperture dots once (identical layout to <Halftone>).
    const n = Math.floor(size / cell);
    const c = (n - 1) / 2;
    type Dot = { x: number; y: number; baseR: number; dist: number; angle: number; color: string };
    const dots: Dot[] = [];
    for (let row = 0; row < n; row++) {
      for (let col = 0; col < n; col++) {
        const dx = col - c;
        const dy = row - c;
        const dist = Math.sqrt(dx * dx + dy * dy) / c;
        if (dist > 1.04) continue;
        const ring = Math.exp(-Math.pow((dist - 0.66) / 0.24, 2));
        const pupil = dist < 0.1 ? 0.85 : 0;
        const intensity = Math.max(ring, pupil);
        if (intensity < 0.05) continue;
        const onRing = Math.abs(dist - 0.66) < 0.18;
        const isCoral = onRing && (row * 31 + col * 17) % 17 === 0;
        dots.push({
          x: col * cell + cell / 2,
          y: row * cell + cell / 2,
          baseR: 0.6 + intensity * (cell * 0.46),
          dist,
          angle: Math.atan2(dy, dx),
          color: isCoral ? coral : base,
        });
      }
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let startTs = 0;

    const draw = (ts: number) => {
      if (!startTs) startTs = ts;
      const t = (ts - startTs) / 1000;
      ctx.clearRect(0, 0, size, size);
      for (const d of dots) {
        const wave = reduce
          ? 0
          : 0.66 * Math.sin(d.dist * 7.2 - t * 1.5) + 0.34 * Math.sin(d.angle * 4 + t * 0.8);
        const norm = wave * 0.5 + 0.5; // 0..1
        const r = Math.max(0.2, d.baseR * (0.8 + norm * 0.52));
        ctx.globalAlpha = 0.5 + norm * 0.5;
        ctx.fillStyle = d.color;
        ctx.beginPath();
        ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (!reduce) raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [mounted, size, cell]);

  if (!mounted) return null;

  return (
    <canvas
      ref={ref}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      aria-hidden
      className={className}
    />
  );
}
