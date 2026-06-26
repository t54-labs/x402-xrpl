"use client";

import { useEffect, useRef } from "react";

// A flowing field of dots (left→right) that fills its parent — the t54 signal
// stream, reusable as a hero background. Coral accents echo the dot motif.
// Kept faint so text on top stays readable; static under prefers-reduced-motion.
export function ParticleField({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;
    let dots: Dot[] = [];

    type Dot = { x: number; y: number; vx: number; r: number; col: string; a: number; ph: number; amp: number };
    const mk = (): Dot => {
      const coral = Math.random() < 0.12;
      const blue = !coral && Math.random() < 0.08;
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: 0.4 + Math.random() * 0.8,
        r: coral ? 1.7 : 1 + Math.random() * 0.9,
        col: coral ? "#C9462E" : blue ? "#008CFF" : "#7d7268",
        a: 0.18 + Math.random() * 0.35,
        ph: Math.random() * 6.28,
        amp: 4 + Math.random() * 10,
      };
    };
    const size = () => {
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const N = Math.min(360, Math.max(120, Math.round((W * H) / 5200)));
      dots = Array.from({ length: N }, mk);
    };
    size();
    window.addEventListener("resize", size);

    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const cx = W * 0.5;
      const cy = H * 0.5;
      const sigma = Math.max(130, W * 0.12); // width of the central gather
      for (let k = 0; k < dots.length; k++) {
        const p = dots[k];
        const dx = p.x - cx;
        const prox = Math.exp(-(dx * dx) / (2 * sigma * sigma)); // ~1 at centre, →0 at edges
        if (!reduce) p.x += p.vx * (0.4 + 0.6 * (1 - prox)) * 1.5; // slow as it nears the knot
        // vertical pinch: spread wide at the edges, converge to the centreline at the knot
        const ty = cy + Math.sin(p.ph + p.x * 0.018) * (p.amp + H * 0.34 * (1 - prox));
        p.y += (ty - p.y) * 0.12;
        let alpha = p.a * (0.6 + 0.75 * prox); // brighter where it gathers
        if (alpha > 1) alpha = 1;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.col;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (0.85 + 0.55 * prox), 0, 6.2832);
        ctx.fill();
        if (p.x > W + 12) {
          Object.assign(p, mk());
          p.x = -10;
        }
      }
      ctx.globalAlpha = 1;
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={`pointer-events-none ${className}`} />;
}
