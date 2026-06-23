"use client";

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

function Label({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--paper-mute)]">{children}</h3>;
}

function CurrencyCell({ label, value, asset }: { label: string; value: number; asset: string }) {
  return (
    <div className="relative p-4 sm:p-5 group transition-colors hover:bg-[var(--blue-08)]">
      <Label>{label}</Label>
      <p className="mt-2.5 flex items-baseline gap-1.5">
        <span className="font-mono tabular-nums text-2xl sm:text-[28px] leading-none text-[var(--paper)]">
          <AnimatedNumber value={value} decimals={value > 0 && value < 1 ? 4 : 2} duration={2000} />
        </span>
        <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--paper-mute)]">{formatCurrency(asset)}</span>
      </p>
    </div>
  );
}

function MetricCell({ label, value, href }: { label: string; value: number; href?: string }) {
  const inner = (
    <>
      <Label>
        {label}
        {href ? <span className="ml-1 text-[var(--paper-faint)] group-hover:text-[var(--brand-blue)] transition-colors">&#8599;</span> : null}
      </Label>
      <p className="mt-2.5 font-mono tabular-nums text-2xl sm:text-[28px] leading-none text-[var(--paper)]">
        <AnimatedNumber value={value} duration={1800} />
      </p>
    </>
  );
  const cls = "relative block p-4 sm:p-5 group transition-colors hover:bg-[var(--blue-08)]";
  return href ? (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}
