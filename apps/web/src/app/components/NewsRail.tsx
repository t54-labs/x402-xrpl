"use client";

import { useRef, useState } from "react";
import type { Signal } from "../lib/signals";
import { RelativeTime } from "./RelativeTime";
import { useT } from "@/app/components/useT";

// Left offset that lines a full-bleed element's content up with the page's
// 88vw centered container (DashboardLive uses max-w-7xl == 88vw, padding px-6).
const EDGE = "var(--page-edge)";

function NewsCard({ s }: { s: Signal }) {
  const t = useT();
  const [err, setErr] = useState(false);
  const hasImg = !!s.image && !err;
  return (
    <a
      href={s.url}
      target="_blank"
      rel="noreferrer"
      className="group relative block h-[252px] w-[346px] shrink-0 snap-start overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)]"
    >
      {hasImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={s.image}
          alt=""
          loading="lazy"
          decoding="async"
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

      {/* Dim the whole poster, then darken the lower half so the copy pops. */}
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/55 to-black/15" />

      {!hasImg ? (
        <svg viewBox="0 0 24 24" aria-hidden fill="currentColor" className="absolute left-1/2 top-[40%] h-16 w-16 -translate-x-1/2 -translate-y-1/2 text-white/[0.22]">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ) : null}

      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
        <span className="font-plek text-[10px] uppercase tracking-[0.16em] text-white/80">
          {s.source}
          {s.verified ? " ✓" : ""}
        </span>
        <span className="font-plek text-[9px] uppercase tracking-[0.14em] text-white/55">{s.kind === "tweet" ? t("post") : t("news")}</span>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4">
        <p className="text-[16px] font-medium leading-snug text-white line-clamp-2">{s.shortTitle}</p>
        <p className="mt-1.5 text-[12px] leading-snug text-white/65 line-clamp-2">{s.headline}</p>
        <div className="mt-2.5 flex items-center gap-1.5 font-mono text-[10px] text-white/50">
          <RelativeTime date={s.publishedAt} />
          <span>·</span>
          <span className="transition-colors group-hover:text-white/85">{t("open ↗")}</span>
        </div>
      </div>
    </a>
  );
}

export function NewsRail({ signals }: { signals: Signal[] }) {
  const t = useT();
  const railRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => railRef.current?.scrollBy({ left: dir * 370, behavior: "smooth" });

  if (!signals.length) return null;

  return (
    <div className="animate-fade-up py-6">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <span className="font-plek text-[11px] uppercase tracking-[0.3em] text-[var(--paper-mute)]">{t("Ecosystem")}</span>
          <h2 className="mt-1 text-2xl sm:text-3xl font-medium tracking-tight text-[var(--paper)]">{t("News")}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label={t("Scroll left")}
            className="ui-control flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--paper-mute)] transition-colors hover:border-[var(--border-hover)] hover:text-[var(--paper)]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M15 6l-6 6 6 6" /></svg>
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label={t("Scroll right")}
            className="ui-control flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--paper-mute)] transition-colors hover:border-[var(--border-hover)] hover:text-[var(--paper)]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" /></svg>
          </button>
        </div>
      </div>

      <div
        ref={railRef}
        className="hide-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
        style={{ width: "100vw", marginLeft: "calc(50% - 50vw)", paddingLeft: EDGE, paddingRight: EDGE, scrollPaddingLeft: EDGE }}
      >
        {signals.map((s) => (
          <NewsCard key={s.id} s={s} />
        ))}
      </div>
    </div>
  );
}
