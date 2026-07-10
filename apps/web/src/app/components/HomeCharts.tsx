"use client";

import { useState } from "react";
import { Area, AreaChart, CartesianGrid, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TimeBucket } from "./DashboardStats";
import { formatCurrency } from "../utils/currency";

const BLUE = "#008CFF";
const CORAL = "#C9462E";

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

type Mode = "XRP" | "RLUSD";

// Running total of settled value over time — rendered bare on the page (no card).
// Toggle per asset; the curve redraws left-to-right on every switch. There is no
// combined mode: XRP and RLUSD are different units, so summing them into one curve
// produced a meaningless unitless number.
export function CumulativeVolumeChart({ series }: { series?: TimeBucket[] }) {
  const [mode, setMode] = useState<Mode>("XRP");
  if (!series || series.length < 2) return null;

  const pick = (b: TimeBucket) => {
    // byAsset keys may arrive raw 40-hex (RLUSD) or already decoded; canonicalize to match.
    let sum = 0;
    for (const [code, val] of Object.entries(b.byAsset ?? {})) {
      if (formatCurrency(code) === mode) sum += val;
    }
    return sum;
  };
  // Cumulative running total, built without reassigning an outer variable
  // during render (keeps the react-hooks immutability rule happy).
  const data = series.reduce<Array<{ t: string; cum: number }>>((arr, b) => {
    const cum = (arr.length ? arr[arr.length - 1].cum : 0) + pick(b);
    return [...arr, { t: b.t, cum }];
  }, []);
  const total = data.length ? data[data.length - 1].cum : 0;
  const lastT = data[data.length - 1].t;
  const opts: Mode[] = ["XRP", "RLUSD"];

  return (
    <div className="relative">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping motion-reduce:animate-none rounded-full bg-[var(--brand-blue)] opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--brand-blue)]" />
          </span>
          <h2 className="text-base font-medium text-[var(--text-primary)]">Total settled</h2>
        </div>
        <div className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,0.03)] p-0.5 text-[11px] font-medium">
          {opts.map((k) => (
            <button
              key={k}
              onClick={() => setMode(k)}
              aria-pressed={mode === k}
              className={`px-2.5 py-1 rounded-md transition-colors ${mode === k ? "bg-[var(--blue-16)] text-[var(--paper)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"}`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>
      <div key={mode} className="chart-draw h-[230px] -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 18, bottom: 0, left: 10 }}>
            <defs>
              <linearGradient id="cumFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={BLUE} stopOpacity={0.32} />
                <stop offset="100%" stopColor={BLUE} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="t" tickFormatter={fmtDay} tick={{ fontSize: 10, fill: "#998A82" }} axisLine={false} tickLine={false} minTickGap={56} />
            <YAxis hide domain={[0, "dataMax"]} />
            <Tooltip content={<CumTip />} cursor={{ stroke: "rgba(255,255,255,0.12)" }} />
            <Area type="monotone" dataKey="cum" stroke={BLUE} strokeWidth={2.5} fill="url(#cumFill)" dot={false} activeDot={{ r: 3, fill: BLUE, stroke: "none" }} isAnimationActive={false} />
            <ReferenceDot x={lastT} y={total} r={4} fill={CORAL} stroke="none" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
