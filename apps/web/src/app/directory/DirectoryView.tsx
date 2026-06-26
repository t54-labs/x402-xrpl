"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BrandLogo } from "../components/BrandLogo";
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
  merchant?: { name: string | null; logoUrl?: string | null } | null;
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

const SERVICES_PER_PAGE = 9;
const MERCHANTS_PER_PAGE = 15;

function Pager({ page, pages, setPage, label }: { page: number; pages: number; setPage: (p: number) => void; label: string }) {
  if (pages <= 1) return null;
  const btn =
    "ui-control px-3 py-1.5 text-[12px] font-medium border border-[var(--border)] text-[var(--text-secondary)] enabled:hover:text-[var(--text-primary)] enabled:hover:bg-[rgba(255,255,255,0.04)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors";
  return (
    <div className="flex items-center justify-between pt-1">
      <span className="text-[11px] text-[var(--text-muted)]">
        Page {page} of {pages} · {label}
      </span>
      <div className="flex items-center gap-2">
        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className={btn}>Prev</button>
        <button onClick={() => setPage(Math.min(pages, page + 1))} disabled={page === pages} className={btn}>Next</button>
      </div>
    </div>
  );
}

const cardHover =
  "group relative block rounded-[16px] bg-[var(--bg-surface)] border border-[var(--border)] p-5 transition duration-200 ease-out hover:-translate-y-1 hover:bg-[var(--ink-raised)] hover:border-[rgba(201,70,46,0.5)] hover:[filter:drop-shadow(0_10px_22px_rgba(0,0,0,0.45))_drop-shadow(0_6px_18px_rgba(201,70,46,0.16))]";

function SectionHead({ n, title, count, sub }: { n: string; title: string; count: number; sub: string }) {
  return (
    <div>
      <div className="flex items-baseline gap-3">
        <span className="text-[10px] font-plek uppercase tracking-[0.24em] text-[var(--paper-faint)]">{n}</span>
        <h2 className="text-xl font-medium tracking-tight text-[var(--paper)]">{title}</h2>
        <span className="text-[12px] font-mono text-[var(--text-muted)]">{count}</span>
      </div>
      <p className="mt-1 text-sm text-[var(--text-muted)] max-w-2xl">{sub}</p>
    </div>
  );
}

export function DirectoryView({ services, merchants }: { services: Service[]; merchants: Merchant[] }) {
  // Services: put the distinct non-Heurist providers first, then Heurist's many
  // tool endpoints; paginate 9 to a page.
  const sortedServices = useMemo(() => {
    const heuristLast = (s: Service) => (/heurist/i.test(s.url) ? 1 : 0);
    return [...services].sort((a, b) => heuristLast(a) - heuristLast(b));
  }, [services]);
  const [svcPage, setSvcPage] = useState(1);
  const svcPages = Math.max(1, Math.ceil(sortedServices.length / SERVICES_PER_PAGE));
  const svcSlice = sortedServices.slice((svcPage - 1) * SERVICES_PER_PAGE, svcPage * SERVICES_PER_PAGE);

  const sorted = useMemo(
    () => [...merchants].sort((a, b) => (b._count?.transactions ?? 0) - (a._count?.transactions ?? 0)),
    [merchants],
  );
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(sorted.length / MERCHANTS_PER_PAGE));
  const start = (page - 1) * MERCHANTS_PER_PAGE;
  const slice = sorted.slice(start, start + MERCHANTS_PER_PAGE);

  return (
    <div className="space-y-12">
      {/* 01 — Services (Agora) */}
      <section className="animate-fade-up space-y-4">
        <SectionHead n="01" title="Services" count={services.length} sub="Live x402 endpoints that agents can pay to use, indexed from XRPL mainnet." />
        {services.length === 0 ? (
          <Empty label="No services indexed yet." />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {svcSlice.map((s) => (
              <a key={s.id} href={s.url} target="_blank" rel="noreferrer" className={cardHover}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="inline-flex transition-transform duration-200 ease-out group-hover:scale-[1.06]">
                    <BrandLogo logoUrl={s.merchant?.logoUrl} name={s.name || hostOf(s.url)} />
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
            <Pager page={svcPage} pages={svcPages} setPage={setSvcPage} label={`${sortedServices.length} services`} />
          </>
        )}
      </section>

      {/* 02 — Merchants (paginated list, by activity) */}
      <section className="animate-fade-up space-y-4">
        <SectionHead n="02" title="Merchants" count={merchants.length} sub="Addresses settling x402 payments on XRPL, ranked by transaction count." />
        {sorted.length === 0 ? (
          <Empty label="No merchants indexed yet." />
        ) : (
          <>
            <div className="dashboard-panel bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden divide-y divide-[var(--border)]">
              {slice.map((m, i) => {
                const rank = start + i + 1;
                return (
                  <Link
                    key={m.address}
                    href={`/address/${m.address}`}
                    className="group flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 transition-colors hover:bg-[rgba(255,255,255,0.03)]"
                  >
                    <span className="w-6 shrink-0 text-right font-mono text-[12px] text-[var(--paper-faint)]">{rank}</span>
                    <BrandLogo logoUrl={m.logoUrl} name={m.name} className="h-8 w-8" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-[var(--text-primary)] truncate group-hover:text-[var(--paper)]">
                        {m.name || shortAddr(m.address)}
                      </p>
                      <p className="text-[11px] font-mono text-[var(--text-muted)] truncate">{m.name ? m.address : "XRPL merchant"}</p>
                    </div>
                    <span className="shrink-0 font-mono text-[12px] text-[var(--brand-blue)] tabular-nums">
                      {(m._count?.transactions ?? 0).toLocaleString()} <span className="text-[var(--text-muted)]">txns</span>
                    </span>
                    <span className="hidden sm:block shrink-0 w-16 text-right text-[11px] text-[var(--text-muted)] tabular-nums">
                      {m._count?.resources ?? 0} svc
                    </span>
                    <span className="shrink-0 text-[var(--paper-faint)] transition-transform group-hover:translate-x-0.5">&rarr;</span>
                  </Link>
                );
              })}
            </div>

            {pages > 1 ? (
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-[var(--text-muted)]">
                  Page {page} of {pages} · {sorted.length} merchants
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="ui-control px-3 py-1.5 text-[12px] font-medium border border-[var(--border)] text-[var(--text-secondary)] enabled:hover:text-[var(--text-primary)] enabled:hover:bg-[rgba(255,255,255,0.04)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                    disabled={page === pages}
                    className="ui-control px-3 py-1.5 text-[12px] font-medium border border-[var(--border)] text-[var(--text-secondary)] enabled:hover:text-[var(--text-primary)] enabled:hover:bg-[rgba(255,255,255,0.04)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </section>
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
