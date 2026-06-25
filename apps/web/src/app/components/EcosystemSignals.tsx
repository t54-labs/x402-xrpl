"use client";

import { useEffect, useRef, useState } from "react";
import type { Signal } from "../lib/signals";
import { RelativeTime } from "./RelativeTime";

function warm(tag: string) {
  return /agents|rlusd|trust|x402|t54/i.test(tag);
}

export function EcosystemSignals({ signals }: { signals: Signal[] }) {
  const [active, setActive] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (signals.length <= 1) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % signals.length), 4800);
    return () => window.clearInterval(id);
  }, [signals.length]);

  // Full-width particle stream: a river of dots flows left→right and pinches at
  // the centre, behind the cycling headline. Coral accents echo the t54 dot motif.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;
    let dots: Dot[] = [];

    type Dot = { x: number; y: number; vx: number; r: number; col: string; a: number; ph: number };
    const mk = (): Dot => {
      const coral = Math.random() < 0.12;
      const blue = !coral && Math.random() < 0.07;
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: 0.5 + Math.random() * 0.9,
        r: coral ? 1.7 : 1 + Math.random() * 0.8,
        col: coral ? "#C9462E" : blue ? "#008CFF" : "#6f655c",
        a: 0.22 + Math.random() * 0.45,
        ph: Math.random() * 6.28,
      };
    };
    const size = () => {
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const N = Math.min(320, Math.max(140, Math.round(W / 8)));
      dots = Array.from({ length: N }, mk);
    };
    size();
    window.addEventListener("resize", size);

    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const cx = W * 0.5;
      const cy = H * 0.5;
      for (let k = 0; k < dots.length; k++) {
        const p = dots[k];
        const dx = p.x - cx;
        const prox = Math.exp(-(dx * dx) / (2 * 95 * 95));
        const speed = reduce ? 0 : 0.35 + 0.65 * (1 - prox);
        p.x += p.vx * speed * 1.6;
        const ty = cy + Math.sin(p.ph + p.x * 0.02) * (H * 0.28 * (1 - prox) + 2);
        p.y += (ty - p.y) * 0.12;
        let alpha = p.a * (0.45 + 0.7 * prox);
        if (alpha > 1) alpha = 1;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.col;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (0.8 + 0.6 * prox), 0, 6.2832);
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

  if (!signals.length) return null;
  const feat = signals[active];

  return (
    <div
      style={{ width: "100vw", marginLeft: "calc(50% - 50vw)" }}
      className="relative overflow-hidden border-y border-[var(--border)] bg-[var(--bg-base)]"
    >
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden />

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-9 text-center">
        <div className="mb-5 flex items-center justify-center gap-2.5">
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--paper-faint)]" />
            <span className="h-2 w-2 rounded-full bg-[var(--t54-coral)]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--paper-faint)]" />
          </span>
          <span className="font-plek text-[12px] uppercase tracking-[0.28em] text-[var(--paper)]">Ecosystem Signals</span>
          <span className="ml-1 inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)] animate-[pulse_2s_infinite]" />
            <span className="font-plek text-[10px] uppercase tracking-[0.16em] text-[#6f8f7f]">live</span>
          </span>
        </div>

        <a href={feat.url} target="_blank" rel="noreferrer" className="group block">
          <div key={feat.id} className="animate-fade-in flex min-h-[68px] items-center justify-center">
            <p className="mx-auto max-w-3xl text-[20px] sm:text-[26px] font-medium leading-tight tracking-[-0.01em] text-[var(--paper)] transition-colors group-hover:text-white">
              {feat.headline}
            </p>
          </div>
          <div className="mt-4 inline-flex flex-wrap items-center justify-center gap-2.5">
            <span className="font-plek text-[11px] uppercase tracking-[0.12em] text-[var(--paper-mute)]">
              {feat.source}
              {feat.verified ? " ✓" : ""} · <RelativeTime date={feat.publishedAt} />
            </span>
            <span className="text-[var(--rule)]">·</span>
            <span className="font-plek text-[10px] uppercase tracking-[0.16em]" style={{ color: warm(feat.tag) ? "var(--t54-coral)" : "#7cc0ff" }}>
              {feat.tag}
            </span>
            <span className="text-[var(--rule)]">·</span>
            <span className="text-[11px] text-[var(--paper-faint)] transition-colors group-hover:text-[var(--paper-mute)]">open ↗</span>
          </div>
        </a>

        <div className="mt-6 flex items-center justify-center gap-2">
          {signals.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Show signal ${i + 1}`}
              onClick={() => setActive(i)}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === active ? 18 : 6,
                background: i === active ? "var(--t54-coral)" : "var(--paper-faint)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
