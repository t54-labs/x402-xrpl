"use client";

import Link from "@/app/components/LocaleLink";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import { AnimatedNumber } from "./AnimatedNumber";
import { formatCurrency } from "../utils/currency";
import { useT } from "@/app/components/useT";

type AssetVolume = { asset: string; total: number };
export type TimeBucket = { t: string; txCount: number; volume: number; merchants: number; byAsset: Record<string, number> };

export function OverviewMetricsStrip({
  volumes,
  fallbackXrp = 0,
  totalTransactions,
  totalMerchants,
  timeSeries,
}: {
  volumes?: AssetVolume[];
  fallbackXrp?: number;
  totalTransactions: number;
  totalMerchants: number;
  timeSeries?: TimeBucket[];
}) {
  const t = useT();
  // Canonicalize asset codes before matching — RLUSD arrives as its 40-hex
  // currency code (524C555344…) on-chain, which formatCurrency decodes to "RLUSD".
  const byAsset = new Map<string, number>();
  for (const v of volumes ?? []) {
    const name = formatCurrency(v.asset);
    byAsset.set(name, (byAsset.get(name) ?? 0) + v.total);
  }
  // fallbackXrp is the lifetime total; use it ONLY when there is no per-asset breakdown at
  // all (degraded API). When a breakdown exists but has no XRP row — e.g. a 7D/30D window
  // with RLUSD-only activity — the window's XRP volume is genuinely 0, not the all-time total.
  const hasBreakdown = (volumes ?? []).length > 0;
  const xrp = byAsset.get("XRP") ?? (hasBreakdown ? 0 : fallbackXrp);
  const rlusd = byAsset.get("RLUSD") ?? 0;
  // Per-card history (sliced from the one dashboard timeSeries field). Decode
  // each bucket's byAsset keys the same way as the headline volumes above — the
  // backend currently sends decoded keys here but raw 40-hex on volumeByAsset,
  // so canonicalize defensively to stay correct if that contract ever changes.
  const ts = timeSeries ?? [];
  const decoded = ts.map((b) => {
    const m: Record<string, number> = {};
    for (const [code, val] of Object.entries(b.byAsset ?? {})) {
      const name = formatCurrency(code);
      m[name] = (m[name] ?? 0) + val;
    }
    return m;
  });
  const xrpSeries = decoded.map((m) => m["XRP"] ?? 0);
  const rlusdSeries = decoded.map((m) => m["RLUSD"] ?? 0);
  const txSeries = ts.map((b) => b.txCount);
  const merchSeries = ts.map((b) => b.merchants);
  return (
    <div className="dashboard-panel border border-[var(--border)] overflow-hidden" style={{ background: "rgba(255,255,255,0.03)" }}>
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-[var(--border)]">
        <CurrencyCell label={t("XRP settled")} value={xrp} asset="XRP" series={xrpSeries} />
        <CurrencyCell label={t("RLUSD settled")} value={rlusd} asset="RLUSD" series={rlusdSeries} />
        <MetricCell label={t("Transactions")} value={totalTransactions} href="/transactions" series={txSeries} />
        <MetricCell label={t("Merchants")} value={totalMerchants} href="/directory" series={merchSeries} />
      </div>
    </div>
  );
}

// ── shared mini-viz for the KPI cards ───────────────────────
function MetricSpark({ values }: { values: number[] }) {
  if (!values || values.length < 2 || values.every((v) => v === 0)) return null;
  const data = values.map((v, i) => ({ i, v }));
  return (
    <div className="mt-3 h-9 -mx-1">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="metricSpark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#008CFF" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#008CFF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis hide domain={[0, "dataMax"]} />
          <Area type="monotone" dataKey="v" stroke="#008CFF" strokeWidth={1.5} fill="url(#metricSpark)" dot={false} activeDot={false} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ▲/▼ change of the recent half vs the prior half of the window.
function DeltaBadge({ values }: { values: number[] }) {
  const t = useT();
  if (!values || values.length < 4) return null;
  const half = Math.floor(values.length / 2);
  const prior = values.slice(0, half).reduce((a, b) => a + b, 0);
  const recent = values.slice(half).reduce((a, b) => a + b, 0);
  if (prior === 0 && recent === 0) return null;
  let label: string;
  let color: string;
  if (prior === 0) {
    label = t("NEW");
    color = "text-[var(--brand-blue)]";
  } else {
    const pct = ((recent - prior) / prior) * 100;
    if (Math.abs(pct) < 1) {
      label = "—";
      color = "text-[var(--paper-mute)]";
    } else {
      // Large swings read better as a multiplier (▲ 21×) than ▲ 2057%.
      const mag = Math.abs(pct) >= 1000 ? `${Math.round(recent / prior)}×` : `${Math.abs(pct).toFixed(0)}%`;
      label = `${pct > 0 ? "▲" : "▼"} ${mag}`;
      color = pct > 0 ? "text-[var(--brand-blue)]" : "text-[var(--t54-coral)]";
    }
  }
  return <span className={`text-[9px] font-plek uppercase tracking-[0.14em] ${color}`}>{label}</span>;
}

function Label({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[10px] font-plek uppercase tracking-[0.2em] text-[var(--paper-mute)]">{children}</h3>;
}

function CurrencyCell({ label, value, asset, series }: { label: string; value: number; asset: string; series?: number[] }) {
  return (
    <div className="relative p-4 sm:p-5 group transition-colors hover:bg-[var(--blue-08)]">
      <div className="flex items-center justify-between gap-2">
        <Label>{label}</Label>
        {series ? <DeltaBadge values={series} /> : null}
      </div>
      <p className="mt-2.5 flex items-baseline gap-1.5 min-w-0">
        <span className="font-mono tabular-nums text-xl sm:text-2xl lg:text-[28px] leading-none text-[var(--paper)] truncate">
          <AnimatedNumber value={value} decimals={value > 0 && value < 1 ? 4 : 2} duration={2000} />
        </span>
        <span className="text-[10px] font-plek uppercase tracking-[0.18em] text-[var(--paper-mute)]">{formatCurrency(asset)}</span>
      </p>
      {series ? <MetricSpark values={series} /> : null}
    </div>
  );
}

function MetricCell({ label, value, href, series }: { label: string; value: number; href?: string; series?: number[] }) {
  const inner = (
    <>
      <div className="flex items-center justify-between gap-2">
        <Label>
          {label}
          {href ? <span className="ml-1 text-[var(--paper-faint)] group-hover:text-[var(--brand-blue)] transition-colors">&#8599;</span> : null}
        </Label>
        {series ? <DeltaBadge values={series} /> : null}
      </div>
      <p className="mt-2.5 font-mono tabular-nums text-2xl sm:text-[28px] leading-none text-[var(--paper)]">
        <AnimatedNumber value={value} duration={1800} />
      </p>
      {series ? <MetricSpark values={series} /> : null}
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
