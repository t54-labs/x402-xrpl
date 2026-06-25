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

  // Cycle the featured signal.
  useEffect(() => {
    if (signals.length <= 1) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % signals.length), 4200);
    return () => window.clearInterval(id);
  }, [signals.length]);

  // Particle stream: a river of dots flows left→right and pinches at the centre,
  // so the headline reads as condensing out of the stream. Coral accents echo
  // the t54 dot motif. Static under prefers-reduced-motion.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;
    const size = () => {
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    window.addEventListener("resize", size);

    type Dot = { x: number; y: number; vx: number; r: number; col: string; a: number; ph: number };
    const mk = (): Dot => {
      const coral = Math.random() < 0.12;
      const blue = !coral && Math.random() < 0.08;
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: 0.5 + Math.random() * 0.9,
        r: coral ? 1.7 : 1 + Math.random() * 0.8,
        col: coral ? "#C9462E" : blue ? "#008CFF" : "#6f655c",
        a: 0.25 + Math.random() * 0.5,
        ph: Math.random() * 6.28,
      };
    };
    const dots: Dot[] = Array.from({ length: 150 }, mk);

    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const cx = W * 0.5;
      const cy = H * 0.5;
      for (let k = 0; k < dots.length; k++) {
        const p = dots[k];
        const dx = p.x - cx;
        const prox = Math.exp(-(dx * dx) / (2 * 70 * 70));
        const speed = reduce ? 0 : 0.35 + 0.65 * (1 - prox);
        p.x += p.vx * speed * 1.6;
        const ty = cy + Math.sin(p.ph + p.x * 0.02) * (24 * (1 - prox) + 2);
        p.y += (ty - p.y) * 0.12;
        let alpha = p.a * (0.5 + 0.7 * prox);
        if (alpha > 1) alpha = 1;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.col;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (0.8 + 0.7 * prox), 0, 6.2832);
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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 animate-fade-up">
      <div className="dashboard-panel bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--paper-faint)]" />
              <span className="w-2 h-2 rounded-full bg-[var(--t54-coral)]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--paper-faint)]" />
            </span>
            <span className="font-plek text-[12px] uppercase tracking-[0.28em] text-[var(--paper)]">Ecosystem Signals</span>
            <span className="inline-flex items-center gap-1.5 ml-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-[pulse_2s_infinite]" />
              <span className="font-plek text-[10px] uppercase tracking-[0.16em] text-[#6f8f7f]">live</span>
            </span>
          </div>
          <span className="font-plek text-[10px] uppercase tracking-[0.18em] text-[var(--paper-faint)]">XRPL · RLUSD × AI</span>
        </div>

        <a href={feat.url} target="_blank" rel="noreferrer" className="group block">
          <div className="relative w-full h-[118px]">
            <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />
          </div>
          <div key={feat.id} className="animate-fade-up px-5 sm:px-6 pb-5 -mt-3 text-center">
            <p className="mx-auto max-w-2xl text-[19px] sm:text-[21px] font-medium leading-snug text-[var(--paper)] transition-colors group-hover:text-white">
              {feat.headline}
            </p>
            <div className="mt-3 inline-flex flex-wrap items-center justify-center gap-2.5">
              <span className="font-plek text-[11px] uppercase tracking-[0.12em] text-[var(--paper-mute)]">
                {feat.source}
                {feat.verified ? " ✓" : ""} · <RelativeTime date={feat.publishedAt} />
              </span>
              <span className="text-[var(--rule)]">·</span>
              <span className="font-plek text-[10px] uppercase tracking-[0.16em]" style={{ color: warm(feat.tag) ? "var(--t54-coral)" : "#7cc0ff" }}>
                {feat.tag}
              </span>
              <span className="text-[var(--rule)]">·</span>
              <span className="text-[11px] text-[var(--paper-faint)]">open ↗</span>
            </div>
          </div>
        </a>

        <div className="grid grid-cols-1 gap-x-8 border-t border-[var(--border)] px-5 sm:px-6 py-3 sm:grid-cols-2">
          {signals.map((s, i) => (
            <a
              key={s.id}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              onMouseEnter={() => setActive(i)}
              className="group flex items-start gap-3 border-b border-[#1B1712] py-2.5"
            >
              <span
                className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                style={{ background: i === active ? "#C9462E" : s.verified ? "#008CFF" : "#4E443C" }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-plek text-[10px] uppercase tracking-[0.1em] text-[var(--paper-mute)] truncate">
                    {s.source}
                    {s.verified ? " ✓" : ""}
                  </span>
                  <span className="ml-auto shrink-0 font-mono text-[10px] text-[var(--paper-faint)]">
                    <RelativeTime date={s.publishedAt} />
                  </span>
                </div>
                <p className="mt-0.5 line-clamp-1 text-[13px] leading-snug text-[var(--text-secondary)] transition-colors group-hover:text-[var(--paper)]">
                  {s.headline}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
