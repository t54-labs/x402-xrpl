"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { AnimatedNumber } from "./AnimatedNumber";
import { CopyButton } from "./CopyButton";
import { OverviewMetricsStrip } from "./DashboardStats";
import { RecentTransactionsLive } from "./RecentTransactionsLive";
import { BrandDots, DotField, XrplDotMark } from "./BrandDots";
import { BrandLogo } from "./BrandLogo";
import { formatCurrency } from "../utils/currency";

const REFRESH_INTERVAL_MS = 8000;

type AssetVolume = { asset: string; total: number };

export type TransactionRow = {
  hash: string;
  amount: string;
  asset: string;
  timestamp: string;
  sourceTag?: number | null;
  verifiableIntent?: boolean;
  riskChecked?: boolean;
  merchant?: { address: string; name: string | null } | null;
};

export type DashboardData = {
  totalTransactions: number;
  totalMerchants: number;
  totalResources: number;
  totalVolumeXrp: number;
  volumeByAsset?: AssetVolume[];
  recentTransactions: TransactionRow[];
  recentResources: Array<{
    id: string;
    merchantAddr: string;
    url: string;
    name: string | null;
    priceAmount: string;
    priceAsset: string;
    network: string | null;
  }>;
  topMerchants: Array<{
    address: string;
    name: string | null;
    logoUrl?: string | null;
    txCount: number;
    volume: number;
    volumeByAsset?: AssetVolume[];
  }>;
  activeAgents?: number;
  facilitators?: Array<{
    sourceTag: number;
    name: string | null;
    txCount: number;
    volumeByAsset?: AssetVolume[];
  }>;
};

export type DirectoryService = {
  id: string;
  merchantAddr: string;
  url: string;
  name: string | null;
  priceAmount: string;
  priceAsset: string;
  merchant?: { name: string | null; logoUrl?: string | null } | null;
};

export function DashboardLive({ initialData, services, servicesTotal }: { initialData: DashboardData; services: DirectoryService[]; servicesTotal: number }) {
  const [data, setData] = useState(initialData);
  const [range, setRange] = useState<"7d" | "30d" | "all">("all");

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const res = await fetch(`/api/dashboard?range=${range}`, { cache: "no-store" });
        if (!res.ok) return;
        const nextData = (await res.json()) as DashboardData;
        if (active) setData(nextData);
      } catch {
        // Keep the current snapshot; the next poll will retry.
      }
    };
    refresh();
    const interval = window.setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [range]);

  // ── Debug toolbar (only when ?debug is in the URL) — inject synthetic
  // settlements so the live-feed entrance/seal animation can be demoed on staging.
  const [injected, setInjected] = useState<TransactionRow[]>([]);
  const [debug, setDebug] = useState(false);
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      // The debug bar (synthetic-settlement injectors) is opt-in: it shows only
      // when ?debug is in the URL, so every shared link is clean by default.
      setDebug(sp.has("debug"));
    } catch {}
  }, []);
  const feed = [...injected, ...(data.recentTransactions || [])].slice(0, 12);
  function injectTx(opts: { verifiableIntent?: boolean; riskChecked?: boolean }) {
    const id = Math.floor(Math.random() * 0xffffffff).toString(16).toUpperCase().padStart(8, "0");
    const asset = Math.random() > 0.5 ? "RLUSD" : "XRP";
    const amt = Math.random() * (asset === "RLUSD" ? 200 : 5) + 0.5;
    const tx: TransactionRow = {
      hash: (id + id + id + id + id + id + id + id).slice(0, 64),
      amount: amt.toFixed(asset === "RLUSD" ? 2 : 6),
      asset,
      timestamp: new Date().toISOString(),
      sourceTag: 804681468,
      verifiableIntent: opts.verifiableIntent ?? true,
      riskChecked: opts.riskChecked ?? false,
      merchant: { address: "r" + id, name: ["agent.alpha", "agent.merca", "NofaAI", "LucyOS"][Math.floor(Math.random() * 4)] },
    };
    setInjected((prev) => [tx, ...prev].slice(0, 12));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {debug ? (
        <div className="dashboard-panel bg-[var(--ink-raised)] border border-[rgba(0,140,255,0.3)] px-4 py-2.5 flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-plek uppercase tracking-[0.22em] text-[var(--brand-blue)]">debug</span>
          <span className="text-[11px] font-mono text-[var(--paper-mute)] mr-1">inject settlement</span>
          <button onClick={() => injectTx({ verifiableIntent: true, riskChecked: true })} className="text-[11px] font-mono px-2.5 py-1 rounded border border-[var(--rule)] text-[var(--paper)] transition-colors hover:bg-[var(--blue-08)]">Sealed</button>
          <button onClick={() => injectTx({ verifiableIntent: true, riskChecked: false })} className="text-[11px] font-mono px-2.5 py-1 rounded border border-[var(--rule)] text-[var(--paper)] transition-colors hover:bg-[var(--blue-08)]">Verified</button>
          <button onClick={() => injectTx({ verifiableIntent: false, riskChecked: false })} className="text-[11px] font-mono px-2.5 py-1 rounded border border-[var(--rule)] text-[var(--paper-mute)] transition-colors hover:bg-[var(--blue-08)]">Unverified</button>
          <button onClick={() => setInjected([])} className="text-[11px] font-mono px-2.5 py-1 rounded border border-[var(--rule)] text-[var(--paper-faint)] transition-colors hover:text-[var(--paper)] ml-auto">Clear</button>
        </div>
      ) : null}
      <Hero />

      <div className="flex items-center justify-end gap-2 animate-fade-up pt-2 flex-wrap">
        <div className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,0.03)] p-0.5 text-[11px] font-medium">
          {([["7d", "7D"], ["30d", "30D"], ["all", "All time"]] as const).map(([v, label]) => (
            <button
              key={v}
              onClick={() => setRange(v)}
              className={`px-2.5 py-1 rounded-md transition-colors ${range === v ? "bg-[var(--brand-blue)] text-white" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="animate-fade-up" style={{ animationDelay: "80ms" }}>
        <OverviewMetricsStrip
          volumes={data.volumeByAsset}
          fallbackXrp={data.totalVolumeXrp}
          totalTransactions={data.totalTransactions}
          totalMerchants={data.totalMerchants}
        />
      </div>

      <div className="flex flex-col gap-6 stagger-children">
        <RecentTransactionsPanel transactions={feed} />

        {/* Mastercard Verifiable Intent — the agent-authority layer integrated across the hub */}
        <div className="flex items-start sm:items-center gap-4 dashboard-panel bg-[var(--bg-surface)] border border-[var(--border)] px-5 py-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logos/mastercard.svg" alt="Mastercard" className="h-7 w-auto shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-[13px] sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            <span className="text-[var(--paper)] font-medium">Verifiable Intent, built in.</span> Every agent payment on the hub can carry
            Mastercard Verifiable Intent — credentialed, consent-bound payments from Agent Pay for Machines — enforced by t54&rsquo;s
            X402 Secure before it settles.
          </p>
        </div>

        <FacilitatorPanel />
        <ServiceMarquee services={services} total={servicesTotal} />
        <TopMerchantsPanel merchants={data.topMerchants} />
      </div>
    </div>
  );
}

function Hero() {
  return (
    <div className="animate-fade-up relative grid grid-cols-1 lg:grid-cols-2 gap-6 items-center pt-2">
      <XrplDotMark animated size={760} className="pointer-events-none absolute right-[-50px] top-1/2 -translate-y-1/2 z-0 hidden lg:block text-[var(--paper-faint)] opacity-[0.72]" />
      <div className="relative z-10">
        <span className="inline-flex items-center gap-2.5 text-[10px] font-plek uppercase tracking-[0.22em] text-[var(--paper-mute)]">
          <BrandDots count={3} className="shrink-0" /> XRPL · AI community
        </span>
        <h1 className="text-4xl sm:text-5xl font-medium tracking-[-0.03em] text-[var(--paper)] mt-5 leading-[1.04]">
          Build the agent economy on XRP Ledger <span className="text-[var(--t54-coral)]">together</span>
        </h1>
        <p className="text-[15px] text-[var(--text-secondary)] mt-4 max-w-lg leading-relaxed">
          An open community of builders, agents, and services growing on the XRP Ledger — where calls are paid in XRP/RLUSD.
        </p>
        <div className="flex flex-wrap items-center gap-2.5 mt-5">
          <Link href="/build" className="ui-control px-4 py-2 bg-[var(--brand-blue)] text-white font-medium text-sm">Join the community</Link>
          <Link href="/directory" className="ui-control px-4 py-2 border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.04)] font-medium text-sm transition-colors">Explore the map</Link>
        </div>
      </div>
      <div className="dashboard-panel relative z-10 border border-[var(--border)] overflow-hidden" style={{ background: "rgba(255,255,255,0.03)" }}>
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--brand-blue)]" />
            <span className="text-xs font-medium text-[var(--text-secondary)]">Quickstart</span>
          </div>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">ts · py</span>
        </div>
        <pre className="p-4 text-[12px] font-mono leading-relaxed overflow-x-auto">
          <div className="text-[var(--brand-blue)]">$ npm i x402-xrpl</div>
          <div className="text-[var(--text-secondary)]">import {"{"} x402Fetch {"}"} from &apos;x402-xrpl&apos;</div>
          <div className="text-[var(--text-muted)]">→ 402 · xrpl · pay in RLUSD or XRP</div>
          <div className="text-[var(--brand-blue)]">✓ verified intent L1–L3 · settled 4.2s</div>
          <div className="text-[var(--text-muted)]">↳ your tx now appears in the Index</div>
        </pre>
      </div>
    </div>
  );
}

function FacilitatorPanel() {
  return (
    <div className="dashboard-panel glow-border bg-[var(--bg-surface)] border border-[var(--border)] p-6 sm:p-8 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-3 min-w-0">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">XRPL x402 Facilitator</h2>
            <span className="!rounded-md px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold bg-[rgba(0,140,255,0.08)] text-[var(--brand-blue)] border border-[rgba(0,140,255,0.15)]">
              Live
            </span>
          </div>
          <p className="text-sm text-[var(--text-secondary)] max-w-lg leading-relaxed">
            No API keys, no custody — just plug and play. Supports XRP and IOU tokens (RLUSD, USDC) with presigned payment verification and settlement.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <code className="!rounded-md text-xs font-mono text-[var(--text-secondary)] bg-[rgba(255,255,255,0.04)] px-3 py-1.5 border border-[var(--border)]">
              https://xrpl-facilitator-mainnet.t54.ai
            </code>
            <CopyButton text="https://xrpl-facilitator-mainnet.t54.ai" />
          </div>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <a href="https://xrpl-x402.t54.ai/" target="_blank" rel="noreferrer" className="ui-control !rounded-md px-4 py-2 bg-[var(--brand-blue)] text-white font-medium text-sm">
            Get Started
          </a>
          <a href="https://xrpl-x402.t54.ai/docs/overview" target="_blank" rel="noreferrer" className="ui-control !rounded-md px-4 py-2 bg-[rgba(255,255,255,0.04)] border border-[var(--border)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.07)]">
            Docs
          </a>
        </div>
      </div>
    </div>
  );
}

const hostOf = (u: string) => {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u;
  }
};

function ServiceMarqueeCard({ s }: { s: DirectoryService }) {
  return (
    <Link
      href={`/address/${s.merchantAddr}`}
      className="marquee-card group relative flex h-[116px] w-[300px] shrink-0 flex-col justify-between !rounded-[14px] border border-[var(--border)] bg-[rgba(255,255,255,0.02)] p-4 transition-[border-color,transform] duration-200 hover:border-[var(--border-hover)]"
    >
      <div className="flex items-start gap-3">
        <BrandLogo logoUrl={s.merchant?.logoUrl} name={s.name || hostOf(s.url)} className="h-9 w-9" />
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-[13px] font-medium leading-snug text-[var(--text-primary)]">{s.name || "API resource"}</h3>
          <p className="mt-0.5 truncate font-mono text-[11px] text-[var(--text-muted)]">{hostOf(s.url)}</p>
        </div>
      </div>
      <div className="flex items-end justify-between">
        <span className="!rounded-md border border-[rgba(0,140,255,0.12)] bg-[rgba(0,140,255,0.06)] px-2 py-0.5 font-mono text-[11px] tabular-nums text-[var(--brand-blue)]">
          {s.priceAmount} {formatCurrency(s.priceAsset)}
        </span>
        <span className="font-plek text-[8.5px] uppercase tracking-[0.2em] text-[var(--paper-faint)] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          Per call &rarr;
        </span>
      </div>
    </Link>
  );
}

function ServiceMarquee({ services, total }: { services: DirectoryService[]; total: number }) {
  const base = services;
  // Label shows the FULL indexed count (not the rendered slice); never less
  // than what's on screen if the total somehow comes back short.
  const count = Math.max(total, base.length);

  if (base.length === 0) {
    return (
      <div className="dashboard-panel flex flex-col items-center gap-3 border border-[var(--border)] bg-[var(--bg-surface)] py-12 text-center">
        <p className="text-sm text-[var(--text-muted)]">No services indexed yet.</p>
        <Link href="/join/service" className="text-xs text-[var(--text-muted)] transition-colors hover:text-[var(--brand-blue)]">
          List the first one &rarr;
        </Link>
      </div>
    );
  }

  // Repeat the base set so the tape always fills a wide viewport (>=2 copies).
  // The loop shift is exactly ONE base set wide, so the seam stays pixel-exact
  // regardless of how many copies we render. --card-count = base.length.
  const reps = Math.max(2, Math.ceil(16 / base.length));
  const loop = Array.from({ length: reps }, () => base).flat();

  return (
    <div className="relative">
      {/* in-column header (stays inside the max-w-7xl flow) */}
      <div className="mb-4 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping motion-reduce:animate-none rounded-full bg-[var(--brand-blue)] opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--brand-blue)]" />
            </span>
            <h2 className="text-base font-medium text-[var(--text-primary)]">Directory</h2>
            {/* single coral motif dot — used once, deliberate */}
            <span className="ml-1 h-1 w-1 rounded-full bg-[var(--t54-coral)]" aria-hidden />
          </div>
          <p className="mt-1 font-plek text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
            {count} live x402 services &middot; pay per call in RLUSD or XRP
          </p>
        </div>
        <Link href="/directory" className="shrink-0 text-xs font-medium text-[var(--text-primary)] transition-colors hover:text-[var(--brand-blue)]">
          Browse all &rarr;
        </Link>
      </div>

      {/* full-bleed band — breaks the max-w column; <main> is overflow-x-clip so no scrollbar */}
      <div className="marquee-bleed relative left-1/2 -ml-[50vw] w-screen">
        <div className="marquee-mask relative py-2">
          {/* center spotlight glow — sits behind the cards */}
          <div className="marquee-glow" aria-hidden />
          <div className="marquee-track flex w-max gap-4" style={{ "--card-count": base.length } as CSSProperties}>
            {loop.map((s, i) => (
              <div key={`${s.id}-${i}`} aria-hidden={i >= base.length}>
                <ServiceMarqueeCard s={s} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RecentTransactionsPanel({ transactions }: { transactions: TransactionRow[] }) {
  return (
    <div className="dashboard-panel relative bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden">
      <DotField className="pointer-events-none absolute top-2 right-4 z-0 text-[var(--paper-faint)] opacity-[0.12]" cols={12} rows={3} />
      <div className="relative z-10 flex justify-between items-center px-5 sm:px-6 py-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--brand-blue)] animate-[pulse_2s_infinite] shrink-0" />
            <h2 className="text-base font-semibold text-[var(--text-primary)]">Live settlements</h2>
          </div>
          <p className="text-[11px] font-plek uppercase tracking-[0.18em] text-[var(--paper-mute)] mt-1.5">verified before settle · on the spine</p>
        </div>
        <Link href="/transactions" className="text-xs text-[var(--text-primary)] hover:text-[var(--brand-blue)] font-medium transition-colors">
          View All &rarr;
        </Link>
      </div>

      <RecentTransactionsLive transactions={transactions} />
    </div>
  );
}

function TopMerchantsPanel({ merchants }: { merchants: DashboardData["topMerchants"] }) {
  if (merchants.length === 0) return null;

  return (
    <div className="dashboard-panel bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden">
      <div className="flex justify-between items-center px-5 sm:px-6 py-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-[pulse_2s_infinite] shrink-0" />
            <h2 className="text-base font-semibold text-[var(--text-primary)]">Top Merchants</h2>
          </div>
          <p className="text-sm text-[var(--text-muted)] mt-1">Most active merchants by transactions and volume.</p>
        </div>
        <Link href="/merchants" className="text-xs text-[var(--text-primary)] hover:text-[var(--brand-blue)] font-medium transition-colors">
          View All &rarr;
        </Link>
      </div>
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        <AnimatePresence initial={false}>
          {merchants.map((merchant, index) => (
            <motion.div
              key={merchant.address}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="border-r border-[var(--border)] border-b sm:border-b-0"
            >
              <Link href={`/address/${merchant.address}`} className="block p-4 sm:p-5 hover:bg-[rgba(255,255,255,0.02)] transition-colors group h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative shrink-0">
                    <div className="!rounded-md w-8 h-8 bg-[rgba(255,255,255,0.04)] border border-[var(--border)] flex items-center justify-center overflow-hidden">
                      {merchant.logoUrl ? (
                        <Image src={merchant.logoUrl} alt={merchant.name || ""} width={32} height={32} className="object-cover w-full h-full" />
                      ) : (
                        <span className="text-sm font-light text-[var(--text-secondary)]">{merchant.name ? merchant.name.charAt(0) : "M"}</span>
                      )}
                    </div>
                    <span className={`absolute -top-2 -left-2 min-w-[20px] h-5 px-1 rounded-full border text-[10px] font-bold flex items-center justify-center ${rankClassName(index)}`}>
                      #{index + 1}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate group-hover:text-[var(--text-primary)]">
                      {merchant.name || `${merchant.address.substring(0, 8)}...${merchant.address.slice(-4)}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">
                    <AnimatedNumber value={merchant.txCount} duration={1400} /> txs
                  </span>
                  <div className="text-right min-w-0">
                    {merchant.volumeByAsset && merchant.volumeByAsset.length > 0 ? (
                      merchant.volumeByAsset.map((volume) => (
                        <span key={volume.asset} className="block text-xs font-mono text-[var(--text-secondary)]">
                          <AnimatedNumber
                            value={volume.total}
                            decimals={volume.total < 1 ? 3 : 2}
                            duration={1600}
                          />{" "}
                          {formatCurrency(volume.asset)}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs font-mono text-[var(--text-secondary)]">
                        <AnimatedNumber value={merchant.volume} decimals={3} duration={1600} /> XRP
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function AnimatedAmount({ amount }: { amount: string }) {
  const value = Number(amount);
  const decimals = useMemo(() => {
    const fraction = amount.split(".")[1] ?? "";
    return Math.min(Math.max(fraction.length, value > 0 && value < 1 ? 4 : 0), 6);
  }, [amount, value]);

  if (!Number.isFinite(value)) return amount;

  return <AnimatedNumber value={value} decimals={decimals} duration={1600} />;
}

function rankClassName(index: number) {
  if (index === 0) return "bg-amber-400/20 text-amber-300 border-amber-300/50";
  if (index === 1) return "bg-slate-300/20 text-slate-200 border-slate-200/50";
  if (index === 2) return "bg-orange-400/20 text-orange-300 border-orange-300/50";
  return "bg-[var(--brand-blue)]/20 text-[var(--brand-blue)] border-[var(--brand-blue)]/40";
}
