"use client";

import { useRef, useState } from "react";
import type { Signal } from "../lib/signals";
import { RelativeTime } from "./RelativeTime";

function NewsCard({ s }: { s: Signal }) {
  const [err, setErr] = useState(false);
  const hasImg = !!s.image && !err;
  return (
    <a
      href={s.url}
      target="_blank"
      rel="noreferrer"
      className="group relative block h-[232px] w-[330px] shrink-0 snap-start overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)]"
    >
      {hasImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={s.image}
          alt=""
          onError={() => setErr(true)}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 130% at 22% 0%, rgba(0,140,255,0.22), transparent 58%), radial-gradient(120% 120% at 92% 100%, rgba(201,70,46,0.20), transparent 55%)",
          }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/5" />

      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
        <span className="font-plek text-[10px] uppercase tracking-[0.16em] text-white/75">
          {s.source}
          {s.verified ? " ✓" : ""}
        </span>
        <span className="font-plek text-[9px] uppercase tracking-[0.14em] text-white/55">{s.kind === "tweet" ? "post" : "news"}</span>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4">
        <p className="text-[17px] font-medium leading-snug text-white line-clamp-2 [text-shadow:0_1px_8px_rgba(0,0,0,0.5)]">{s.shortTitle}</p>
        <div className="mt-2 flex items-center gap-1.5 font-mono text-[10px] text-white/55">
          <RelativeTime date={s.publishedAt} />
          <span>·</span>
          <span className="transition-colors group-hover:text-white/80">open ↗</span>
        </div>
      </div>
    </a>
  );
}

export function NewsRail({ signals }: { signals: Signal[] }) {
  const railRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => railRef.current?.scrollBy({ left: dir * 360, behavior: "smooth" });

  if (!signals.length) return null;

  return (
    <div style={{ width: "100vw", marginLeft: "calc(50% - 50vw)" }} className="animate-fade-up py-7">
      <div className="mb-5 flex items-end justify-between gap-4" style={{ paddingLeft: "max(1rem, 6vw)", paddingRight: "max(1rem, 6vw)" }}>
        <div>
          <span className="font-plek text-[11px] uppercase tracking-[0.3em] text-[var(--paper-mute)]">Ecosystem</span>
          <h2 className="mt-1 text-2xl sm:text-3xl font-medium tracking-tight text-[var(--paper)]">News</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="Scroll left"
            className="ui-control flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--paper-mute)] transition-colors hover:border-[var(--border-hover)] hover:text-[var(--paper)]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M15 6l-6 6 6 6" /></svg>
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="Scroll right"
            className="ui-control flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--paper-mute)] transition-colors hover:border-[var(--border-hover)] hover:text-[var(--paper)]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" /></svg>
          </button>
        </div>
      </div>

      <div
        ref={railRef}
        className="hide-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
        style={{ paddingLeft: "max(1rem, 6vw)", paddingRight: "max(1rem, 6vw)", scrollPaddingLeft: "max(1rem, 6vw)" }}
      >
        {signals.map((s) => (
          <NewsCard key={s.id} s={s} />
        ))}
      </div>
    </div>
  );
}
