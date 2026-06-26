"use client";

import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";

// Compact filled area sparkline of a merchant's transaction count over time.
// Smooth (monotone) curve, gradient fill, no dots — fills the empty right side
// of the merchant header. Daily, 0-filled buckets keep the time axis linear.
export function MerchantTxChart({ series }: { series: { t: string; count: number }[] }) {
  if (!series || series.length < 2) return null;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={series} margin={{ top: 6, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="merchantTxFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#008CFF" stopOpacity={0.32} />
            <stop offset="100%" stopColor="#008CFF" stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis hide domain={[0, "dataMax"]} />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#008CFF"
          strokeWidth={2}
          fill="url(#merchantTxFill)"
          dot={false}
          activeDot={false}
          isAnimationActive
          animationDuration={700}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
