import { prisma } from "@x402-xrpl/database";
import Link from "next/link";
import { RelativeTime } from "./components/RelativeTime";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [totalTransactions, totalMerchants, totalResources, recentTransactions, registeredResources] = await Promise.all([
    prisma.transaction.count(),
    prisma.merchant.count(),
    prisma.resource.count({ where: { isActive: true } }),
    prisma.transaction.findMany({
      take: 10,
      orderBy: { timestamp: "desc" },
      include: { merchant: true },
    }),
    prisma.resource.findMany({
      take: 5,
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const volumeResult = await prisma.$queryRawUnsafe<[{ total: string }]>(
    `SELECT COALESCE(SUM(CAST(amount AS DOUBLE PRECISION)), 0) as total FROM "Transaction" WHERE asset = 'XRP'`
  );
  const totalVolumeXrp = parseFloat(volumeResult[0]?.total || "0");

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-white">Network Overview</h1>
          <p className="text-sm text-gray-400 mt-2">Global view of the x402 economy on the XRPL</p>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="Total Volume" value={`${totalVolumeXrp.toFixed(2)} XRP`} />
        <StatCard title="Transactions" value={totalTransactions.toLocaleString()} />
        <StatCard title="Merchants" value={totalMerchants.toLocaleString()} />
        <StatCard title="Resources" value={totalResources.toLocaleString()} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#131518] rounded-xl border border-white/5 overflow-hidden">
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
                    <td className="px-6 py-4 text-sm font-medium text-white">
                      {tx.amount} <span className="text-gray-500 text-xs">{tx.asset}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      <RelativeTime date={tx.timestamp.toISOString()} />
                    </td>
                  </tr>
                ))}
                {recentTransactions.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-gray-500 text-sm">
                      No transactions indexed yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-[#131518] rounded-xl border border-white/5 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-white">The Bazaar</h2>
            <Link href="/bazaar" className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
              Browse All &rarr;
            </Link>
          </div>
          <p className="text-xs text-gray-400 mb-6">Discover pay-per-use APIs on the XRPL.</p>
          
          <div className="space-y-4 flex-1">
            {registeredResources.map((res) => (
              <Link href={`/address/${res.merchantAddr}`} key={res.id} className="block">
                <div className="p-4 bg-[#181a1e] border border-white/5 rounded-lg hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(34,211,238,0.05)] transition-all group">
                  <h3 className="font-medium text-gray-200 group-hover:text-white truncate">{res.name || "API Resource"}</h3>
                  <p className="text-xs text-gray-500 mt-1 truncate font-mono">{res.url}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs font-mono bg-cyan-400/10 text-cyan-400 px-2 py-1 rounded-sm border border-cyan-400/20">
                      {res.priceAmount} {res.priceAsset}
                    </span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">{res.network}</span>
                  </div>
                </div>
              </Link>
            ))}
            
            {registeredResources.length === 0 && (
              <div className="flex flex-col items-center text-center py-8 gap-3">
                <p className="text-gray-500 text-sm">No resources registered yet.</p>
                <Link href="/resources/register" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                  Register the first one &rarr;
                </Link>
              </div>
            )}
          </div>
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