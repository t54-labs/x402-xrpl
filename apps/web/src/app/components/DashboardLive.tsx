"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatedNumber } from "./AnimatedNumber";
import { CopyButton } from "./CopyButton";
import { OverviewMetricsStrip } from "./DashboardStats";
import { RecentTransactionsLive } from "./RecentTransactionsLive";
import { formatCurrency } from "../utils/currency";

const REFRESH_INTERVAL_MS = 8000;

type AssetVolume = { asset: string; total: number };

export type TransactionRow = {
  hash: string;
  amount: string;
  asset: string;
  timestamp: string;
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

export function DashboardLive({ initialData }: { initialData: DashboardData }) {
  const [data, setData] = useState(initialData);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    const refresh = async () => {
      try {
        const res = await fetch("/api/dashboard", { cache: "no-store" });
        if (!res.ok) return;
        const nextData = (await res.json()) as DashboardData;
        if (mountedRef.current) setData(nextData);
      } catch {
        // Keep the current dashboard snapshot; the next poll will retry.
      }
    };

    const interval = window.setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => {
      mountedRef.current = false;
      window.clearInterval(interval);
    };
  }, []);

  const registeredResources = data.recentResources;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <Hero />
      <TrustBand />

      <div className="flex items-center justify-between gap-2 animate-fade-up pt-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-[pulse_2s_infinite] shrink-0" />
          <h2 className="text-base font-semibold text-[var(--text-primary)]">The XRPL AI Index</h2>
        </div>
        <Link href="/methodology" className="text-xs text-[var(--text-muted)] hover:text-[var(--brand-blue)] transition-colors shrink-0">
          How we measure &rarr;
        </Link>
      </div>

      <div className="animate-fade-up" style={{ animationDelay: "80ms" }}>
        <OverviewMetricsStrip
          volumes={data.volumeByAsset}
          fallbackXrp={data.totalVolumeXrp}
          activeAgents={data.activeAgents ?? 0}
          totalTransactions={data.totalTransactions}
          totalMerchants={data.totalMerchants}
          totalResources={data.totalResources}
        />
      </div>

      <div className="flex flex-col gap-6 stagger-children">
        <FacilitatorPanel />
        <AgoraPanel resources={registeredResources} />
        <RecentTransactionsPanel transactions={data.recentTransactions} />
        <TopMerchantsPanel merchants={data.topMerchants} />
      </div>
    </div>
  );
}

function Hero() {
  return (
    <div className="animate-fade-up grid grid-cols-1 lg:grid-cols-2 gap-6 items-center pt-2">
      <div>
        <span className="inline-flex items-center gap-2 text-[11px] font-mono text-[var(--brand-blue)] bg-[rgba(0,140,255,0.08)] border border-[rgba(0,140,255,0.2)] px-2.5 py-1 rounded-md">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" /> institution-grade rails for agentic commerce on XRPL
        </span>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text-primary)] mt-4 leading-[1.15]">
          The live ledger of the XRPL agentic economy.
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-3 max-w-md leading-relaxed">
          See who&rsquo;s transacting. Build on the standard. Onboard your network.
        </p>
        <div className="flex items-center gap-2.5 mt-5">
          <Link href="/build" className="ui-control px-4 py-2 bg-[var(--brand-blue)] text-white font-medium text-sm">Start building</Link>
          <Link href="/join/service" className="ui-control px-4 py-2 bg-[rgba(255,255,255,0.04)] border border-[var(--border)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Partner with us</Link>
        </div>
      </div>
      <div className="dashboard-panel bg-[rgba(255,255,255,0.02)] border border-[var(--border)] overflow-hidden">
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
          <div className="text-[var(--text-muted)]">→ 402 · xrpl · pay in RLUSD</div>
          <div className="text-[var(--success)]">✓ verified intent L1–L3 · settled 4.2s</div>
          <div className="text-[var(--text-muted)]">↳ your tx now appears in the Index</div>
        </pre>
      </div>
    </div>
  );
}

function TrustBand() {
  const items = [
    "Ripple — strategic investor",
    "BNY Mellon — RLUSD custody",
    "Deloitte — monthly attestation",
    "SOC 2 — in progress",
    "x402 Foundation — member",
  ];
  return (
    <div className="animate-fade-up flex flex-wrap items-center gap-2" style={{ animationDelay: "60ms" }}>
      <span className="text-[10px] text-[var(--text-muted)] mr-1">Backed &amp; verified:</span>
      {items.map((t) => (
        <span key={t} className="text-[11px] text-[var(--text-secondary)] bg-[rgba(255,255,255,0.03)] border border-[var(--border)] px-2.5 py-1 rounded-md">
          {t}
        </span>
      ))}
    </div>
  );
}

function FacilitatorPanel() {
  return (
    <div className="dashboard-panel glow-border order-1 bg-[var(--bg-surface)] border border-[var(--border)] p-6 sm:p-8 overflow-hidden">
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

function AgoraPanel({ resources }: { resources: DashboardData["recentResources"] }) {
  return (
    <div className="dashboard-panel order-2 bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden">
      <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[var(--border)]">
        <div>
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Agora</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">Pay-per-use APIs and resources in the x402 ecosystem.</p>
        </div>
        <Link href="/agora" className="text-xs text-[var(--text-primary)] hover:text-[var(--brand-blue)] font-medium transition-colors shrink-0">
          Browse All &rarr;
        </Link>
      </div>

      {resources.length > 0 ? (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 sm:p-5">
          <AnimatePresence initial={false}>
            {resources.map((res) => (
              <motion.div
                key={res.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link href={`/address/${res.merchantAddr}`} className="block h-full">
                  <div className="agora-resource-card p-4 bg-[rgba(255,255,255,0.02)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-all duration-200 group h-full">
                    <h3 className="text-sm font-medium text-[var(--text-primary)] truncate">{res.name || "API Resource"}</h3>
                    <p className="text-xs text-[var(--text-muted)] mt-1 truncate font-mono">{res.url}</p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="!rounded-md text-[11px] font-mono bg-[rgba(0,140,255,0.06)] text-[var(--brand-blue)] px-2 py-0.5 border border-[rgba(0,140,255,0.12)]">
                        <AnimatedAmount amount={res.priceAmount} /> {formatCurrency(res.priceAsset)}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{res.network}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="flex flex-col items-center text-center py-12 gap-3">
          <p className="text-[var(--text-muted)] text-sm">No resources registered yet.</p>
          <Link href="/resources/register" className="text-xs text-[var(--text-muted)] hover:text-[var(--brand-blue)] transition-colors">
            Register the first one &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}

function RecentTransactionsPanel({ transactions }: { transactions: TransactionRow[] }) {
  return (
    <div className="dashboard-panel order-4 bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden">
      <div className="flex justify-between items-center px-5 sm:px-6 py-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-[pulse_2s_infinite] shrink-0" />
            <h2 className="text-base font-semibold text-[var(--text-primary)]">Recent Transactions</h2>
          </div>
          <p className="text-sm text-[var(--text-muted)] mt-1">Latest x402 payments observed on XRPL.</p>
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
    <div className="dashboard-panel order-3 bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden">
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
