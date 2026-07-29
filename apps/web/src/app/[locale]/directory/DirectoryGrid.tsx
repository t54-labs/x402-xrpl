"use client";

import { useState } from "react";
import Image from "next/image";
import { useT } from "@/app/components/useT";

export type Listing = {
  id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  website: string | null;
  logoUrl: string | null;
  category: string | null;
  useCase: string | null;
  asset: string | null;
  verified402: boolean;
};

export function DirectoryGrid({ listings }: { listings: Listing[] }) {
  const t = useT();
  const categories = Array.from(new Set(listings.map((l) => l.category).filter(Boolean))) as string[];
  const [active, setActive] = useState<string | null>(null);
  const filtered = active ? listings.filter((l) => l.category === active) : listings;

  const chip = (on: boolean) =>
    `px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
      on
        ? "text-[var(--brand-blue)] bg-[rgba(0,140,255,0.08)] border-[rgba(0,140,255,0.25)]"
        : "text-[var(--text-secondary)] bg-[rgba(255,255,255,0.04)] border-[var(--border)] hover:border-[var(--border-hover)]"
    }`;

  return (
    <div className="space-y-6">
      <div className="animate-fade-up flex flex-wrap gap-1.5">
        <button onClick={() => setActive(null)} className={chip(active === null)}>{t("All")}</button>
        {categories.map((c) => (
          <button key={c} onClick={() => setActive(c)} className={chip(active === c)}>{c}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((l) => (
          <a
            key={l.id}
            href={l.website || "#"}
            target={l.website ? "_blank" : undefined}
            rel="noreferrer"
            className="group block dashboard-panel bg-[var(--bg-surface)] border border-[var(--border)] p-5 hover:border-[var(--border-hover)] transition-all duration-200"
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[var(--border)] flex items-center justify-center shrink-0 overflow-hidden">
                {l.logoUrl ? (
                  <Image src={l.logoUrl} alt={l.name} width={24} height={24} className="object-contain" />
                ) : (
                  <span className="text-sm text-[var(--text-secondary)]">{l.name.charAt(0)}</span>
                )}
              </div>
              {l.verified402 ? (
                <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-medium border text-emerald-400 bg-emerald-500/8 border-emerald-500/15">
                  {t("Verified 402")}
                </span>
              ) : null}
            </div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">{l.name}</h3>
            {l.category ? (
              <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-medium border text-[var(--brand-blue)] bg-[rgba(0,140,255,0.06)] border-[rgba(0,140,255,0.12)]">
                {l.category}
              </span>
            ) : null}
            <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mt-3 line-clamp-3">{l.tagline || l.description}</p>
            <div className="flex items-center gap-2 mt-3 text-[11px] text-[var(--text-muted)]">
              {l.useCase ? <span>{l.useCase}</span> : null}
              {l.asset ? <span className="font-mono text-[var(--brand-blue)]">{l.asset}</span> : null}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
