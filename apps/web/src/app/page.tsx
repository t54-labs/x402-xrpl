import Link from "next/link";
import { RelativeTime } from "./components/RelativeTime";
import { CopyButton } from "./components/CopyButton";
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
    address: string; name: string | null; txCount: number; volume: number;
    volumeByAsset?: AssetVolume[];
  }>;
};

export default async function Home() {
  const {
    totalTransactions, totalMerchants, totalResources, totalVolumeXrp, volumeByAsset,
    recentTransactions, recentResources: registeredResources, topMerchants,
  } = await apiFetch<DashboardData>("/dashboard");

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-white">Network Overview</h1>
          <p className="text-sm text-gray-400 mt-2">Global view of the x402 economy on the XRPL</p>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <VolumeCard volumes={volumeByAsset} fallbackXrp={totalVolumeXrp} />
        <StatCard title="Transactions" value={totalTransactions.toLocaleString()} />
        <StatCard title="Merchants" value={totalMerchants.toLocaleString()} />
        <StatCard title="Resources" value={totalResources.toLocaleString()} />
      </div>

      <div className="bg-[#131518] rounded-xl border border-white/5 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h2 className="text-lg font-medium text-white">The Agora</h2>
            <p className="text-xs text-gray-500 mt-1">Pay-per-use API services powered by x402 on the XRPL</p>
          </div>
          <Link href="/agora" className="text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-colors shrink-0">
            Browse All &rarr;
          </Link>
        </div>
        
        {registeredResources.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {registeredResources.map((res) => (
              <Link href={`/address/${res.merchantAddr}`} key={res.id} className="block">
                <div className="p-4 bg-[#181a1e] border border-white/5 rounded-lg hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(34,211,238,0.05)] transition-all group h-full">
                  <h3 className="font-medium text-gray-200 group-hover:text-white truncate">{res.name || "API Resource"}</h3>
                  <p className="text-xs text-gray-500 mt-1 truncate font-mono">{res.url}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs font-mono bg-cyan-400/10 text-cyan-400 px-2 py-1 rounded-sm border border-cyan-400/20">
                      {res.priceAmount} {formatCurrency(res.priceAsset)}
                    </span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">{res.network}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center text-center py-12 gap-3">
            <p className="text-gray-500 text-sm">No resources registered yet.</p>
            <Link href="/resources/register" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
              Register the first one &rarr;
            </Link>
          </div>
        )}
      </div>

      {topMerchants.length > 0 && (
        <div className="bg-[#131518] rounded-xl border border-white/5 overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-white/5">
            <h2 className="text-lg font-medium text-white">Top Merchants</h2>
            <Link href="/merchants" className="text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
              View All &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-white/5">
            {topMerchants.map((m, i) => (
              <Link href={`/address/${m.address}`} key={m.address} className="block p-5 hover:bg-white/[0.02] transition-colors group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-cyan-400">#{i + 1}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-200 group-hover:text-white truncate">
                      {m.name || `${m.address.substring(0, 8)}...${m.address.slice(-4)}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{m.txCount} txs</span>
                  <div className="text-right">
                    {m.volumeByAsset && m.volumeByAsset.length > 0 ? m.volumeByAsset.map((v) => (
                      <span key={v.asset} className="block text-xs font-mono text-cyan-400">{v.total.toFixed(v.total < 1 ? 3 : 2)} {formatCurrency(v.asset)}</span>
                    )) : (
                      <span className="text-xs font-mono text-cyan-400">{m.volume.toFixed(3)} XRP</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-[#131518] to-[#0f1923] rounded-xl border border-cyan-500/10 p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-medium text-white">XRPL x402 Facilitator</h2>
              <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Live</span>
            </div>
            <p className="text-sm text-gray-400 max-w-lg">No API keys, no custody — just plug and play. Supports XRP &amp; IOU tokens (RLUSD, USDC) with presigned payment verification and settlement.</p>
            <div className="flex items-center gap-2 mt-2">
              <code className="text-xs font-mono text-cyan-400 bg-cyan-400/5 px-3 py-1.5 rounded border border-cyan-400/10">https://xrpl-facilitator-mainnet.t54.ai</code>
              <CopyButton text="https://xrpl-facilitator-mainnet.t54.ai" />
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a href="https://xrpl-x402.t54.ai/" target="_blank" rel="noreferrer" className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg transition-all text-sm">
              Get Started
            </a>
            <a href="https://xrpl-x402.t54.ai/docs/overview" target="_blank" rel="noreferrer" className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 hover:text-white hover:border-white/20 transition-all">
              Docs
            </a>
          </div>
        </div>
      </div>

      <div className="bg-[#131518] rounded-xl border border-white/5 overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-white/5">
          <h2 className="text-lg font-medium text-white">Recent Transactions</h2>
          <Link href="/transactions" className="text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
            View All &rarr;
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-[#181a1e]">
              <tr>
                <th className="px-6 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Tx Hash</th>
                <th className="px-6 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Merchant</th>
                <th className="px-6 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentTransactions.map((tx) => (
                <tr key={tx.hash} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/tx/${tx.hash}`} className="font-mono text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                      {tx.hash.substring(0, 16)}...
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/address/${tx.merchant?.address || ""}`} className="text-sm text-gray-400 hover:text-cyan-400 transition-colors">
                      {tx.merchant?.name || `${(tx.merchant?.address || "").substring(0, 10)}...`}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-white">
                    {tx.amount} <span className="text-gray-500 text-xs">{formatCurrency(tx.asset)}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    <RelativeTime date={tx.timestamp} />
                  </td>
                </tr>
              ))}
              {recentTransactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 text-sm">
                    No transactions indexed yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-[#131518] p-5 md:p-6 rounded-xl border border-white/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5">
        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
      </div>
      <h3 className="text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-widest">{title}</h3>
      <p className="text-2xl md:text-3xl font-light text-white mt-2 md:mt-3 tracking-tight">{value}</p>
    </div>
  );
}

function VolumeCard({ volumes, fallbackXrp }: { volumes?: AssetVolume[]; fallbackXrp: number }) {
  return (
    <div className="bg-[#131518] p-5 md:p-6 rounded-xl border border-white/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5">
        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
      </div>
      <h3 className="text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-widest">Total Volume</h3>
      <div className="mt-2 md:mt-3 space-y-1">
        {volumes && volumes.length > 0 ? volumes.map((v) => (
          <p key={v.asset} className="text-2xl md:text-3xl font-light text-white tracking-tight">
            {v.total.toFixed(v.total < 1 ? 4 : 2)} <span className="text-sm text-gray-500">{formatCurrency(v.asset)}</span>
          </p>
        )) : (
          <p className="text-2xl md:text-3xl font-light text-white tracking-tight">{fallbackXrp.toFixed(2)} <span className="text-sm text-gray-500">XRP</span></p>
        )}
      </div>
    </div>
  );
}