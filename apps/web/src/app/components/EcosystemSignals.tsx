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

  // A full-width river of dots flows left→right across its own band (above the
  // headline — never behind it). Dots stay visible edge to edge; a gentle
  // vertical pinch at centre gives the stream some shape. Coral accents = t54 dot motif.
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
      const coral = Math.random() < 0.13;
      const blue = !coral && Math.random() < 0.08;
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: 0.5 + Math.random() * 0.9,
        r: coral ? 1.8 : 1 + Math.random() * 0.9,
        col: coral ? "#C9462E" : blue ? "#008CFF" : "#7d7268",
        a: 0.32 + Math.random() * 0.5,
        ph: Math.random() * 6.28,
      };
    };
    const size = () => {
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const N = Math.min(360, Math.max(160, Math.round(W / 6)));
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
        const prox = Math.exp(-(dx * dx) / (2 * 160 * 160));
        const speed = reduce ? 0 : 0.5 + 0.5 * (1 - prox);
        p.x += p.vx * speed * 1.6;
        const ty = cy + Math.sin(p.ph + p.x * 0.018) * (H * 0.34 * (1 - prox) + 2);
        p.y += (ty - p.y) * 0.12;
        ctx.globalAlpha = p.a; // uniform across width → visible edge to edge
        ctx.fillStyle = p.col;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (0.9 + 0.5 * prox), 0, 6.2832);
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
      className="relative overflow-hidden border-y border-[var(--border)] bg-[var(--bg-base)] py-9"
    >
      <div className="mb-1 text-center">
        <span className="font-plek text-[12px] uppercase tracking-[0.3em] text-[var(--paper-mute)]">Ecosystem Signals</span>
      </div>

      <div className="relative h-[88px] w-full">
        <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden />
      </div>

      <div className="mx-auto max-w-4xl px-4 text-center">
        <a href={feat.url} target="_blank" rel="noreferrer" className="group block">
          <div key={feat.id} className="animate-fade-in flex min-h-[66px] items-center justify-center">
            <p className="mx-auto max-w-3xl text-[20px] sm:text-[26px] font-medium leading-tight tracking-[-0.01em] text-[var(--paper)] transition-colors group-hover:text-white">
              {feat.headline}
            </p>
          </div>
          <div className="mt-3.5 inline-flex flex-wrap items-center justify-center gap-2.5">
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
              style={{ width: i === active ? 18 : 6, background: i === active ? "var(--t54-coral)" : "var(--paper-faint)" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
