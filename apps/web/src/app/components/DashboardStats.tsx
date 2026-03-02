"use client";

import { AnimatedNumber } from "./AnimatedNumber";

type AssetVolume = { asset: string; total: number };

const CURRENCY_LABELS: Record<string, string> = {
  XRP: "XRP",
};

function formatCurrency(asset: string): string {
  if (CURRENCY_LABELS[asset]) return CURRENCY_LABELS[asset];
  if (asset.includes(".")) {
    const [code] = asset.split(".");
    return code;
  }
  return asset;
}

export function OverviewMetricsStrip({
  volumes,
  fallbackXrp,
  totalTransactions,
  totalMerchants,
  totalResources,
}: {
  volumes?: AssetVolume[];
  fallbackXrp: number;
  totalTransactions: number;
  totalMerchants: number;
  totalResources: number;
}) {
  return (
    <div className="dashboard-panel bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden">
      <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[var(--border)]">
        <div className="relative p-4 pr-14 sm:p-5 sm:pr-16 md:p-6 md:pr-20 group hover:bg-[rgba(255,255,255,0.015)] transition-colors col-span-2 md:col-span-1">
          <MetricMark />
          <h3 className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">
            Total Volume
          </h3>
          <div className="mt-2 md:mt-3 space-y-1">
            {volumes && volumes.length > 0 ? (
              volumes.map((v) => (
                <p
                  key={v.asset}
                  className="text-xl sm:text-2xl md:text-3xl font-light text-[var(--text-primary)] tracking-tight"
                >
                  <AnimatedNumber
                    value={v.total}
                    decimals={v.total < 1 ? 4 : 2}
                    duration={2000}
                  />{" "}
                  <span className="text-xs text-[var(--text-muted)]">{formatCurrency(v.asset)}</span>
                </p>
              ))
            ) : (
              <p className="text-xl sm:text-2xl md:text-3xl font-light text-[var(--text-primary)] tracking-tight">
                <AnimatedNumber value={fallbackXrp} decimals={2} duration={2000} />{" "}
                <span className="text-xs text-[var(--text-muted)]">XRP</span>
              </p>
            )}
          </div>
        </div>

        <MetricCell label="Transactions" value={totalTransactions} />
        <MetricCell label="Merchants" value={totalMerchants} />
        <MetricCell label="Resources" value={totalResources} />
      </div>
    </div>
  );
}

function MetricCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="relative p-4 pr-14 sm:p-5 sm:pr-16 md:p-6 md:pr-20 group hover:bg-[rgba(255,255,255,0.015)] transition-colors">
      <MetricMark />
      <h3 className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">
        {label}
      </h3>
      <p className="text-xl sm:text-2xl md:text-3xl font-light text-[var(--text-primary)] mt-2 md:mt-3 tracking-tight">
        <AnimatedNumber value={value} duration={1800} />
      </p>
    </div>
  );
}

function MetricMark() {
  return (
    <img
      src="/icon.png"
      alt=""
      aria-hidden="true"
      className="pointer-events-none absolute right-4 top-4 sm:right-5 sm:top-5 md:right-6 md:top-6 h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 object-contain opacity-[0.12] transition-opacity duration-300 group-hover:opacity-[0.18]"
    />
  );
}
