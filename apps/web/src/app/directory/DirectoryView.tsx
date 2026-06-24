"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ResourceLogo } from "../components/ResourceLogo";
import { formatCurrency } from "../utils/currency";

export type Service = {
  id: string;
  merchantAddr: string;
  url: string;
  name: string | null;
  priceAmount: string;
  priceAsset: string;
  network?: string | null;
  isDiscovered?: boolean;
  _count?: { transactions: number };
};

export type Merchant = {
  address: string;
  name: string | null;
  logoUrl?: string | null;
  _count?: { resources: number; transactions: number };
};

const shortAddr = (a: string) => (a.length > 16 ? `${a.slice(0, 8)}…${a.slice(-5)}` : a);
const hostOf = (u: string) => {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u;
  }
};

const cardHover =
  "group relative block rounded-[16px] bg-[var(--bg-surface)] border border-[var(--border)] p-5 transition duration-200 ease-out hover:-translate-y-1 hover:bg-[var(--ink-raised)] hover:border-[rgba(201,70,46,0.5)] hover:[filter:drop-shadow(0_10px_22px_rgba(0,0,0,0.45))_drop-shadow(0_6px_18px_rgba(201,70,46,0.16))]";

export function DirectoryView({ services, merchants }: { services: Service[]; merchants: Merchant[] }) {
  const [tab, setTab] = useState<"services" | "merchants">("services");

  const sortedMerchants = useMemo(
    () => [...merchants].sort((a, b) => (b._count?.transactions ?? 0) - (a._count?.transactions ?? 0)),
    [merchants],
  );

  const seg = (on: boolean) =>
    `px-3.5 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
      on ? "bg-[var(--brand-blue)] text-white" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
    }`;

  return (
    <div className="space-y-6">
      <div className="animate-fade-up inline-flex items-center rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,0.03)] p-0.5">
        <button onClick={() => setTab("services")} className={seg(tab === "services")}>
          Services · {services.length}
        </button>
        <button onClick={() => setTab("merchants")} className={seg(tab === "merchants")}>
          Merchants · {merchants.length}
        </button>
      </div>

      {tab === "services" ? (
        services.length === 0 ? (
          <Empty label="No services indexed yet." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {services.map((s) => (
              <a key={s.id} href={s.url} target="_blank" rel="noreferrer" className={cardHover}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="inline-flex transition-transform duration-200 ease-out group-hover:scale-[1.06]">
                    <ResourceLogo href={s.url} name={s.name || hostOf(s.url)} />
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-medium border ${
                      s.isDiscovered
                        ? "text-purple-300 bg-purple-500/8 border-purple-500/15"
                        : "text-[var(--brand-blue)] bg-[rgba(0,140,255,0.06)] border-[rgba(0,140,255,0.12)]"
                    }`}
                  >
                    {s.isDiscovered ? "Discovered" : "Registered"}
                  </span>
                </div>
                <h3 className="flex items-start gap-1.5 text-sm font-semibold text-[var(--text-primary)]">
                  <span className="line-clamp-2">{s.name || "API resource"}</span>
                  <span
                    aria-hidden="true"
                    className="mt-px shrink-0 text-[var(--t54-coral)] opacity-0 -translate-x-1 transition-all duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100"
                  >
                    &#8599;
                  </span>
                </h3>
                <p className="mt-1 text-[12px] font-mono text-[var(--text-muted)] truncate">{hostOf(s.url)}</p>
                <div className="mt-3 flex items-center gap-3 text-[11px]">
                  <span className="font-mono text-[var(--brand-blue)]">
                    {s.priceAmount} {formatCurrency(s.priceAsset)}
                  </span>
                  {s._count ? <span className="text-[var(--text-muted)]">{s._count.transactions.toLocaleString()} txns</span> : null}
                </div>
              </a>
            ))}
          </div>
        )
      ) : sortedMerchants.length === 0 ? (
        <Empty label="No merchants indexed yet." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sortedMerchants.map((m) => (
            <Link key={m.address} href={`/address/${m.address}`} className={cardHover}>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,0.04)] font-plek text-[12px] text-[var(--paper-mute)]">
                  {(m.name?.[0] || "r").toUpperCase()}
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate">{m.name || shortAddr(m.address)}</h3>
                  <p className="text-[11px] font-mono text-[var(--text-muted)] truncate">
                    {m.name ? shortAddr(m.address) : "XRPL merchant"}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
                <span className="font-mono text-[var(--brand-blue)]">{(m._count?.transactions ?? 0).toLocaleString()} txns</span>
                <span>{m._count?.resources ?? 0} services</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="dashboard-panel bg-[var(--bg-surface)] border border-[var(--border)] p-10 text-center text-sm text-[var(--text-muted)]">
      {label} <Link href="/join/service" className="text-[var(--brand-blue)]">Get listed &rarr;</Link>
    </div>
  );
}
