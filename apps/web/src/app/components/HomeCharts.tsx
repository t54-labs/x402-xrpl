"use client";

import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TimeBucket } from "./DashboardStats";
import { formatCurrency } from "../utils/currency";

const BLUE = "#008CFF";
const STEEL = "#4E7CA8";
const CORAL = "#C9462E";
const FAINT = "#4E443C";

function fmtNum(n: number): string {
  if (n >= 1000) return Math.round(n).toLocaleString();
  return n.toLocaleString(undefined, { maximumFractionDigits: n > 0 && n < 1 ? 4 : 2 });
}
function fmtDay(iso: string): string {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric" });
}

function CumTip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { t: string; cum: number } }> }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-[var(--rule)] bg-[var(--ink-raised)] px-3 py-2">
      <p className="font-mono text-[12px] tabular-nums text-[var(--paper)]">{fmtNum(p.cum)}</p>
      <p className="text-[10px] text-[var(--text-muted)]">{fmtDay(p.t)}</p>
    </div>
  );
}

// Running-total of settled volume over time — the growth anchor. A cumulative
// total never dips, so it reads as honest growth even on a young dataset.
export function CumulativeVolumeChart({ series }: { series?: TimeBucket[] }) {
  if (!series || series.length < 2) return null;
  let run = 0;
  const data = series.map((b) => {
    run += b.volume;
    return { t: b.t, cum: run };
  });
  const total = run;
  const lastT = data[data.length - 1].t;

  return (
    <div className="dashboard-panel bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping motion-reduce:animate-none rounded-full bg-[var(--brand-blue)] opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--brand-blue)]" />
            </span>
            <h2 className="text-base font-medium text-[var(--text-primary)]">Total settled &middot; climbing</h2>
          </div>
          <p className="mt-1 font-plek text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">Cumulative value settled on XRPL &middot; XRP + RLUSD</p>
        </div>
        <span className="font-mono tabular-nums text-lg text-[var(--paper)] shrink-0">{fmtNum(total)}</span>
      </div>
      <div className="h-[210px] px-1 pt-3 pb-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 6, right: 18, bottom: 0, left: 10 }}>
            <defs>
              <linearGradient id="cumFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={BLUE} stopOpacity={0.28} />
                <stop offset="100%" stopColor={BLUE} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="t" tickFormatter={fmtDay} tick={{ fontSize: 10, fill: "#998A82" }} axisLine={false} tickLine={false} minTickGap={56} />
            <YAxis hide domain={[0, "dataMax"]} />
            <Tooltip content={<CumTip />} cursor={{ stroke: "rgba(255,255,255,0.12)" }} />
            <Area type="monotone" dataKey="cum" stroke={BLUE} strokeWidth={2.5} fill="url(#cumFill)" dot={false} activeDot={{ r: 3, fill: BLUE, stroke: "none" }} isAnimationActive animationDuration={800} />
            <ReferenceDot x={lastT} y={total} r={4} fill={CORAL} stroke="none" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const ASSET_COLOR: Record<string, string> = { XRP: BLUE, RLUSD: STEEL };

// Composition donut — share of settled value by asset (XRP vs RLUSD). The honest
// categorical split that actually exists in the data; scale-free so it reads even when young.
export function SettlementMixDonut({ volumes }: { volumes?: Array<{ asset: string; total: number }> }) {
  const byAsset = new Map<string, number>();
  for (const v of volumes ?? []) {
    const name = formatCurrency(v.asset);
    byAsset.set(name, (byAsset.get(name) ?? 0) + v.total);
  }
  const data = [...byAsset.entries()]
    .filter(([, t]) => t > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([asset, total]) => ({ asset, total }));
  const total = data.reduce((a, d) => a + d.total, 0);
  if (data.length === 0 || total <= 0) return null;

  return (
    <div className="dashboard-panel bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden p-5 sm:p-6">
      <h2 className="text-base font-medium text-[var(--text-primary)]">Settlement mix</h2>
      <p className="mt-1 font-plek text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">Share of value settled &middot; by asset</p>
      <div className="relative mt-4 h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="total" nameKey="asset" innerRadius={58} outerRadius={84} paddingAngle={2} cornerRadius={6} stroke="none" isAnimationActive animationDuration={700}>
              {data.map((d) => (
                <Cell key={d.asset} fill={ASSET_COLOR[d.asset] ?? FAINT} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-plek text-[9px] uppercase tracking-[0.2em] text-[var(--paper-mute)]">total value</span>
          <span className="font-mono tabular-nums text-lg text-[var(--paper)]">{fmtNum(total)}</span>
        </div>
      </div>
      <div className="mt-4 space-y-1.5">
        {data.map((d) => (
          <div key={d.asset} className="flex items-center gap-2 text-[12px]">
            <span className="h-2 w-2 rounded-full shrink-0" style={{ background: ASSET_COLOR[d.asset] ?? FAINT }} />
            <span className="font-plek uppercase tracking-[0.14em] text-[var(--text-secondary)]">{d.asset}</span>
            <span className="ml-auto font-mono tabular-nums text-[var(--text-muted)]">{((d.total / total) * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
