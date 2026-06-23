"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatedNumber } from "./AnimatedNumber";
import { formatCurrency } from "../utils/currency";

type AssetVolume = { asset: string; total: number };

export function OverviewMetricsStrip({
  volumes,
  fallbackXrp = 0,
  activeAgents,
  totalTransactions,
  totalMerchants,
  totalResources,
}: {
  volumes?: AssetVolume[];
  fallbackXrp?: number;
  activeAgents: number;
  totalTransactions: number;
  totalMerchants: number;
  totalResources: number;
}) {
  const xrp = volumes?.find((v) => v.asset === "XRP")?.total ?? fallbackXrp;
  const rlusd = volumes?.find((v) => v.asset === "RLUSD")?.total ?? 0;
  return (
    <div className="dashboard-panel bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-y lg:divide-y-0 divide-[var(--border)]">
        <CurrencyCell label="XRP settled" value={xrp} asset="XRP" />
        <CurrencyCell label="RLUSD settled" value={rlusd} asset="RLUSD" />
        <MetricCell label="Active agents" value={activeAgents} />
        <MetricCell label="Transactions" value={totalTransactions} />
        <MetricCell label="Merchants" value={totalMerchants} />
        <MetricCell label="Resources" value={totalResources} />
      </div>
    </div>
  );
}

function CurrencyCell({ label, value, asset }: { label: string; value: number; asset: string }) {
  return (
    <div className="relative p-4 pr-12 sm:p-5 group hover:bg-[rgba(255,255,255,0.015)] transition-colors">
      <MetricMark />
      <h3 className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">{label}</h3>
      <p className="text-xl sm:text-2xl font-light text-[var(--text-primary)] mt-2 tracking-tight">
        <AnimatedNumber value={value} decimals={value > 0 && value < 1 ? 4 : 2} duration={2000} />{" "}
        <span className="text-xs text-[var(--text-muted)]">{formatCurrency(asset)}</span>
      </p>
    </div>
  );
}

function MetricCell({ label, value, href }: { label: string; value: number; href?: string }) {
  const cls = "relative block p-4 pr-14 sm:p-5 sm:pr-16 md:p-6 md:pr-20 group hover:bg-[rgba(255,255,255,0.015)] transition-colors";
  const inner = (
    <>
      <MetricMark />
      <h3 className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">
        {label}
        {href ? <span className="ml-1 text-[var(--text-muted)] group-hover:text-[var(--brand-blue)] transition-colors">&rarr;</span> : null}
      </h3>
      <p className="text-xl sm:text-2xl md:text-3xl font-light text-[var(--text-primary)] mt-2 md:mt-3 tracking-tight">
        <AnimatedNumber value={value} duration={1800} />
      </p>
    </>
  );
  return href ? <Link href={href} className={cls}>{inner}</Link> : <div className={cls}>{inner}</div>;
}

function MetricMark() {
  return (
    <Image
      src="/icon.png"
      alt=""
      aria-hidden="true"
      width={56}
      height={56}
      className="pointer-events-none absolute right-4 top-4 sm:right-5 sm:top-5 md:right-6 md:top-6 h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 object-contain opacity-[0.12] transition-opacity duration-300 group-hover:opacity-[0.18]"
    />
  );
}
