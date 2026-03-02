import Link from "next/link";
import Image from "next/image";
import { CopyButton } from "./components/CopyButton";
import { OverviewMetricsStrip } from "./components/DashboardStats";
import { RecentTransactionsLive } from "./components/RecentTransactionsLive";
import { apiFetch } from "./lib/api";
import { formatCurrency } from "./utils/currency";

export const dynamic = "force-dynamic";

type AssetVolume = { asset: string; total: number };

type DashboardData = {
  totalTransactions: number;
  totalMerchants: number;
  totalResources: number;
  totalVolumeXrp: number;
  volumeByAsset?: AssetVolume[];
  recentTransactions: Array<{
    hash: string; amount: string; asset: string; timestamp: string;
    merchant?: { address: string; name: string | null } | null;
  }>;
  recentResources: Array<{
    id: string; merchantAddr: string; url: string; name: string | null;
    priceAmount: string; priceAsset: string; network: string | null;
  }>;
  topMerchants: Array<{
    address: string; name: string | null; logoUrl?: string | null;
    txCount: number; volume: number; volumeByAsset?: AssetVolume[];
  }>;
};

export default async function Home() {
  const {
    totalTransactions, totalMerchants, totalResources, totalVolumeXrp, volumeByAsset,
    recentTransactions, recentResources: registeredResources, topMerchants,
  } = await apiFetch<DashboardData>("/dashboard");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <header className="animate-fade-up space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
          Network Overview
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Key activity metrics and ecosystem sections for x402 on XRPL.
        </p>
      </header>

      <div className="animate-fade-up" style={{ animationDelay: "80ms" }}>
        <OverviewMetricsStrip
          volumes={volumeByAsset}
          fallbackXrp={totalVolumeXrp}
          totalTransactions={totalTransactions}
          totalMerchants={totalMerchants}
          totalResources={totalResources}
        />
      </div>

      <div className="flex flex-col gap-6 stagger-children">

        {/* Facilitator */}
        <div className="dashboard-panel glow-border order-1 bg-[var(--bg-surface)] border border-[var(--border)] p-6 sm:p-8 overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3 min-w-0">
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-semibold text-[var(--text-primary)]">XRPL x402 Facilitator</h2>
                <span className="!rounded-md px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold bg-[rgba(0,140,255,0.08)] text-[var(--brand-blue)] border border-[rgba(0,140,255,0.15)]">Live</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] max-w-lg leading-relaxed">No API keys, no custody — just plug and play. Supports XRP and IOU tokens (RLUSD, USDC) with presigned payment verification and settlement.</p>
              <div className="flex items-center gap-2 mt-2">
                <code className="!rounded-md text-xs font-mono text-[var(--text-secondary)] bg-[rgba(255,255,255,0.04)] px-3 py-1.5 border border-[var(--border)]">https://xrpl-facilitator-mainnet.t54.ai</code>
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

        {/* The Agora */}
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

          {registeredResources.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 sm:p-5">
              {registeredResources.map((res) => (
                <Link href={`/address/${res.merchantAddr}`} key={res.id} className="block">
                  <div className="agora-resource-card p-4 bg-[rgba(255,255,255,0.02)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-all duration-200 group h-full">
                    <h3 className="text-sm font-medium text-[var(--text-primary)] truncate">{res.name || "API Resource"}</h3>
                    <p className="text-xs text-[var(--text-muted)] mt-1 truncate font-mono">{res.url}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="!rounded-md text-[11px] font-mono bg-[rgba(0,140,255,0.06)] text-[var(--brand-blue)] px-2 py-0.5 border border-[rgba(0,140,255,0.12)]">
                        {res.priceAmount} {formatCurrency(res.priceAsset)}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{res.network}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center text-center py-12 gap-3">
              <p className="text-[var(--text-muted)] text-sm">No resources registered yet.</p>
              <Link href="/resources/register" className="text-xs text-[var(--text-muted)] hover:text-[var(--brand-blue)] transition-colors">
                Register the first one &rarr;
              </Link>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
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

          <RecentTransactionsLive initialTransactions={recentTransactions} />
        </div>

        {/* Top Merchants */}
        {topMerchants.length > 0 && (
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
              {topMerchants.map((m, i) => (
                <Link href={`/address/${m.address}`} key={m.address} className="block p-4 sm:p-5 hover:bg-[rgba(255,255,255,0.02)] transition-colors group border-r border-[var(--border)] border-b sm:border-b-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative shrink-0">
                      <div className="!rounded-md w-8 h-8 bg-[rgba(255,255,255,0.04)] border border-[var(--border)] flex items-center justify-center overflow-hidden">
                        {m.logoUrl ? (
                          <Image src={m.logoUrl} alt={m.name || ""} width={32} height={32} className="object-cover w-full h-full" />
                        ) : (
                          <span className="text-sm font-light text-[var(--text-secondary)]">{m.name ? m.name.charAt(0) : "M"}</span>
                        )}
                      </div>
                      <span
                        className={`absolute -top-2 -left-2 min-w-[20px] h-5 px-1 rounded-full border text-[10px] font-bold flex items-center justify-center ${
                          i === 0
                            ? "bg-amber-400/20 text-amber-300 border-amber-300/50"
                            : i === 1
                              ? "bg-slate-300/20 text-slate-200 border-slate-200/50"
                              : i === 2
                                ? "bg-orange-400/20 text-orange-300 border-orange-300/50"
                                : "bg-[var(--brand-blue)]/20 text-[var(--brand-blue)] border-[var(--brand-blue)]/40"
                        }`}
                      >
                        #{i + 1}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate group-hover:text-[var(--text-primary)]">
                        {m.name || `${m.address.substring(0, 8)}...${m.address.slice(-4)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--text-muted)]">{m.txCount} txs</span>
                    <div className="text-right">
                      {m.volumeByAsset && m.volumeByAsset.length > 0 ? m.volumeByAsset.map((v) => (
                        <span key={v.asset} className="block text-xs font-mono text-[var(--text-secondary)]">{v.total.toFixed(v.total < 1 ? 3 : 2)} {formatCurrency(v.asset)}</span>
                      )) : (
                        <span className="text-xs font-mono text-[var(--text-secondary)]">{m.volume.toFixed(3)} XRP</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
