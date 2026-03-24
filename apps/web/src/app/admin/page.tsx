"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.xrpl-ai.org";

type AdminData = {
  overview: {
    totalTransactions: number;
    totalMerchants: number;
    totalResources: number;
    totalBuyers: number;
    lastLedgerIndex: number;
    updatedAt: string | null;
  };
  dailyTxs: Array<{ day: string; txCount: number; volume: number }>;
  volumeByAsset: Array<{ asset: string; txCount: number; total: number }>;
  merchantBreakdown: Array<{ address: string; name: string | null; logoUrl: string | null; txCount: number; volume: number }>;
  topBuyers: Array<{ address: string; txCount: number; volume: number }>;
  recentTransactions: Array<{
    hash: string; timestamp: string; buyerAddress: string; merchantAddr: string;
    amount: string; asset: string;
    merchant?: { address: string; name: string | null; logoUrl: string | null } | null;
  }>;
};

function formatCurrency(code: string): string {
  if (!code || code === "XRP") return "XRP";
  if (/^[0-9A-Fa-f]{40}$/.test(code)) {
    const ascii = code.replace(/0+$/, "");
    let result = "";
    for (let i = 0; i < ascii.length; i += 2) {
      const charCode = parseInt(ascii.substring(i, i + 2), 16);
      if (charCode >= 32 && charCode <= 126) result += String.fromCharCode(charCode);
    }
    return result || code.substring(0, 8);
  }
  return code;
}

const CHART_COLORS = ["#008CFF", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

function StatCard({ title, value, subtitle }: { title: string; value: string | number; subtitle?: string }) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-card)] p-5 hover:border-[var(--border-hover)] transition-colors">
      <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">{title}</p>
      <p className="text-2xl font-semibold text-[var(--text-primary)] mt-2 tracking-tight">{value}</p>
      {subtitle && <p className="text-[11px] text-[var(--text-muted)] mt-1">{subtitle}</p>}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-shell)] p-6 hover:border-[var(--border-hover)] transition-colors">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-5">{title}</h3>
      {children}
    </div>
  );
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#111] border border-[var(--border)] rounded-[var(--radius-tag)] px-3 py-2 text-xs">
      <p className="text-[var(--text-muted)] mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">{p.name}: {typeof p.value === "number" ? p.value.toLocaleString() : p.value}</p>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("admin_auth") !== "true") {
      router.replace("/admin/login");
      return;
    }

    fetch(`${API_URL}/admin/stats`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => { setError("Failed to load data"); setLoading(false); });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-[var(--text-muted)] text-sm">Loading dashboard...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-red-400 text-sm">{error || "No data available"}</div>
      </div>
    );
  }

  const { overview, dailyTxs, volumeByAsset, merchantBreakdown, topBuyers, recentTransactions } = data;

  const chartData = dailyTxs.map((d) => ({
    date: new Date(d.day).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    Transactions: d.txCount,
    Volume: d.volume,
  }));

  const weeklyData = (() => {
    const weeks: Record<string, { txCount: number; volume: number }> = {};
    for (const d of dailyTxs) {
      const date = new Date(d.day);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const key = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (!weeks[key]) weeks[key] = { txCount: 0, volume: 0 };
      weeks[key].txCount += d.txCount;
      weeks[key].volume += d.volume;
    }
    return Object.entries(weeks).map(([week, v]) => ({ week, Transactions: v.txCount, Volume: v.volume }));
  })();

  const assetPieData = volumeByAsset.map((v) => ({
    name: formatCurrency(v.asset),
    value: v.txCount,
    volume: v.total,
  }));

  const merchantBarData = merchantBreakdown.map((m) => ({
    name: m.name || `${m.address.substring(0, 6)}...`,
    Transactions: m.txCount,
  }));

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    router.push("/admin/login");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">Admin Dashboard</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            x402 XRPL Network Analytics
            {overview.updatedAt && <span className="ml-2 text-[var(--text-muted)]">· Last sync {new Date(overview.updatedAt).toLocaleString()}</span>}
          </p>
        </div>
        <button onClick={handleLogout} className="px-4 py-2 text-xs text-[var(--text-muted)] border border-[var(--border)] rounded-[var(--radius-control)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all">
          Sign Out
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard title="Total Transactions" value={overview.totalTransactions.toLocaleString()} />
        <StatCard title="Merchants" value={overview.totalMerchants} />
        <StatCard title="Unique Buyers" value={overview.totalBuyers} />
        <StatCard title="Active APIs" value={overview.totalResources} />
        <StatCard title="Ledger Index" value={overview.lastLedgerIndex.toLocaleString()} subtitle="Current XRPL position" />
      </div>

      {/* Charts Row 1: Daily Transactions + Weekly Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Daily Transactions">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="txGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#008CFF" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#008CFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" tick={{ fill: "rgba(245,247,251,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(245,247,251,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Transactions" stroke="#008CFF" fill="url(#txGradient)" strokeWidth={2} dot={{ fill: "#008CFF", r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Weekly Transaction Volume">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="week" tick={{ fill: "rgba(245,247,251,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(245,247,251,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Transactions" fill="#008CFF" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Row 2: Asset Distribution + Merchant Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Transactions by Asset">
          <div className="flex items-center gap-8">
            <ResponsiveContainer width="50%" height={220}>
              <PieChart>
                <Pie data={assetPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" stroke="none">
                  {assetPieData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {assetPieData.map((a, i) => (
                <div key={a.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="text-sm text-[var(--text-secondary)]">{a.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-[var(--text-primary)]">{a.value}</span>
                    <span className="text-[11px] text-[var(--text-muted)] ml-1">txs</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Transactions by Merchant">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={merchantBarData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "rgba(245,247,251,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: "rgba(245,247,251,0.56)", fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Transactions" radius={[0, 6, 6, 0]}>
                {merchantBarData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Tables Row: Top Buyers + Merchant Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-shell)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--border)]">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Top Buyers</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[rgba(255,255,255,0.02)]">
                <tr>
                  <th className="px-6 py-3 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">#</th>
                  <th className="px-6 py-3 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">Address</th>
                  <th className="px-6 py-3 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest text-right">Transactions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {topBuyers.map((b, i) => (
                  <tr key={b.address} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                    <td className="px-6 py-3 text-xs text-[var(--text-muted)]">{i + 1}</td>
                    <td className="px-6 py-3 text-xs font-mono text-[var(--brand-blue)]">{b.address.substring(0, 12)}...{b.address.slice(-4)}</td>
                    <td className="px-6 py-3 text-xs text-[var(--text-primary)] text-right font-medium">{b.txCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-shell)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--border)]">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Merchant Volume</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[rgba(255,255,255,0.02)]">
                <tr>
                  <th className="px-6 py-3 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">Merchant</th>
                  <th className="px-6 py-3 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest text-right">Txs</th>
                  <th className="px-6 py-3 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest text-right">Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {merchantBreakdown.map((m) => (
                  <tr key={m.address} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        {m.logoUrl ? (
                          <div className="w-5 h-5 rounded overflow-hidden shrink-0">
                            <Image src={m.logoUrl} alt="" width={20} height={20} className="object-cover w-full h-full" />
                          </div>
                        ) : null}
                        <span className="text-xs text-[var(--text-secondary)]">{m.name || `${m.address.substring(0, 10)}...`}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-xs text-[var(--text-primary)] text-right font-medium">{m.txCount}</td>
                    <td className="px-6 py-3 text-xs text-[var(--text-primary)] text-right font-mono">{m.volume.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-shell)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border)]">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-[rgba(255,255,255,0.02)]">
              <tr>
                <th className="px-6 py-3 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">Hash</th>
                <th className="px-6 py-3 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">Merchant</th>
                <th className="px-6 py-3 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">Buyer</th>
                <th className="px-6 py-3 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest text-right">Amount</th>
                <th className="px-6 py-3 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {recentTransactions.map((tx) => (
                <tr key={tx.hash} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                  <td className="px-6 py-3 text-xs font-mono text-[var(--brand-blue)]">{tx.hash.substring(0, 14)}...</td>
                  <td className="px-6 py-3 text-xs text-[var(--text-secondary)]">{tx.merchant?.name || `${tx.merchantAddr.substring(0, 10)}...`}</td>
                  <td className="px-6 py-3 text-xs font-mono text-[var(--text-muted)]">{tx.buyerAddress.substring(0, 10)}...</td>
                  <td className="px-6 py-3 text-xs text-[var(--text-primary)] text-right font-medium">{tx.amount} <span className="text-[var(--text-muted)]">{formatCurrency(tx.asset)}</span></td>
                  <td className="px-6 py-3 text-xs text-[var(--text-muted)] text-right">{new Date(tx.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
