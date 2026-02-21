import { prisma } from "@x402-xrpl/database";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CopyButton } from "../../components/CopyButton";
import { RelativeTime } from "../../components/RelativeTime";

interface PageProps {
  params: Promise<{ address: string }>;
}

export default async function AddressPage({ params }: PageProps) {
  const { address } = await params;

  const [merchant, buyerTxCount] = await Promise.all([
    prisma.merchant.findUnique({
      where: { address },
      include: {
        resources: true,
        transactions: {
          take: 50,
          orderBy: { timestamp: "desc" },
          include: { resource: true },
        },
      },
    }),
    prisma.transaction.count({ where: { buyerAddress: address } }),
  ]);

  const isMerchant = !!merchant;
  const hasActivity = isMerchant || buyerTxCount > 0;

  if (!hasActivity) {
    notFound();
  }

  if (isMerchant) {
    return <MerchantView address={address} merchant={merchant} />;
  }

  return <BuyerView address={address} txCount={buyerTxCount} />;
}

async function MerchantView({
  address,
  merchant,
}: {
  address: string;
  merchant: NonNullable<Awaited<ReturnType<typeof prisma.merchant.findUnique>> & {
    resources: Awaited<ReturnType<typeof prisma.resource.findMany>>;
    transactions: (Awaited<ReturnType<typeof prisma.transaction.findMany>>[number] & {
      resource: Awaited<ReturnType<typeof prisma.resource.findUnique>> | null;
    })[];
  }>;
}) {
  const [totalTxCount, volumeResult] = await Promise.all([
    prisma.transaction.count({ where: { merchantAddr: address } }),
    prisma.$queryRawUnsafe<[{ total: string }]>(
      `SELECT COALESCE(SUM(CAST(amount AS DOUBLE PRECISION)), 0) as total FROM "Transaction" WHERE "merchantAddr" = $1 AND asset = 'XRP'`,
      address
    ),
  ]);
  const totalVolume = parseFloat(volumeResult[0]?.total || "0");

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      <div className="bg-[#131518] rounded-2xl border border-white/5 p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
            <span className="text-3xl font-light text-cyan-400">
              {merchant.name ? merchant.name.charAt(0).toUpperCase() : "M"}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-light text-white tracking-tight">
                {merchant.name || "Unknown Merchant"}
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Merchant
              </span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className="font-mono text-sm text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-full border border-cyan-400/20">
                {address}
              </span>
              <CopyButton text={address} />
              <a 
                href={`https://testnet.xrpl.org/accounts/${address}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                XRPL Explorer ↗
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 pt-8 border-t border-white/5">
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Total Volume</p>
            <p className="text-2xl font-light text-white mt-1">{totalVolume.toFixed(2)} <span className="text-sm text-gray-500">XRP</span></p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Payments Received</p>
            <p className="text-2xl font-light text-white mt-1">{totalTxCount}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Active APIs</p>
            <p className="text-2xl font-light text-white mt-1">{merchant.resources.length}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Joined</p>
            <p className="text-sm font-medium text-gray-300 mt-2">{new Date(merchant.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-xl font-light text-white">Offered APIs</h2>
          <div className="space-y-4">
            {merchant.resources.map((res) => (
              <div key={res.id} className="bg-[#131518] rounded-xl border border-white/5 p-5 hover:border-cyan-500/30 transition-colors">
                <h3 className="font-medium text-gray-200 truncate">{res.name || "Unnamed Resource"}</h3>
                <p className="text-xs text-gray-500 mt-1 font-mono truncate" title={res.url}>{res.url}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">Price</span>
                    <span className="text-sm text-cyan-400 font-medium">
                      {res.priceAmount} {res.priceAsset}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded text-[10px] uppercase tracking-wider font-semibold ${
                    res.isActive ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}>
                    {res.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            ))}
            {merchant.resources.length === 0 && (
              <div className="bg-[#131518] rounded-xl border border-white/5 p-8 text-center text-gray-500 text-sm">
                No resources registered for this merchant.
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-light text-white">Recent Payments</h2>
          <TxTable transactions={merchant.transactions} perspective="merchant" />
        </div>
      </div>
    </div>
  );
}

async function BuyerView({ address, txCount }: { address: string; txCount: number }) {
  const [transactions, volumeResult] = await Promise.all([
    prisma.transaction.findMany({
      where: { buyerAddress: address },
      take: 50,
      orderBy: { timestamp: "desc" },
      include: { merchant: true, resource: true },
    }),
    prisma.$queryRawUnsafe<[{ total: string }]>(
      `SELECT COALESCE(SUM(CAST(amount AS DOUBLE PRECISION)), 0) as total FROM "Transaction" WHERE "buyerAddress" = $1 AND asset = 'XRP'`,
      address
    ),
  ]);
  const totalSpent = parseFloat(volumeResult[0]?.total || "0");

  const uniqueMerchants = new Set(transactions.map((tx) => tx.merchantAddr)).size;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      <div className="bg-[#131518] rounded-2xl border border-white/5 p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-purple-400/10 border border-purple-400/20 flex items-center justify-center">
            <span className="text-3xl font-light text-purple-400">B</span>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-light text-white tracking-tight">Buyer Address</h1>
              <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Buyer
              </span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className="font-mono text-sm text-purple-400 bg-purple-400/10 px-3 py-1 rounded-full border border-purple-400/20">
                {address}
              </span>
              <CopyButton text={address} />
              <a 
                href={`https://testnet.xrpl.org/accounts/${address}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                XRPL Explorer ↗
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-10 pt-8 border-t border-white/5">
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Total Spent</p>
            <p className="text-2xl font-light text-white mt-1">{totalSpent.toFixed(2)} <span className="text-sm text-gray-500">XRP</span></p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Payments Made</p>
            <p className="text-2xl font-light text-white mt-1">{txCount}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Merchants Used</p>
            <p className="text-2xl font-light text-white mt-1">{uniqueMerchants}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-light text-white">Payment History</h2>
        <TxTable transactions={transactions} perspective="buyer" />
      </div>
    </div>
  );
}

function TxTable({
  transactions,
  perspective,
}: {
  transactions: Array<{
    hash: string;
    timestamp: Date;
    buyerAddress: string;
    merchantAddr: string;
    amount: string;
    asset: string;
    merchant?: { name: string | null } | null;
    resource?: { url: string; name: string | null } | null;
  }>;
  perspective: "merchant" | "buyer";
}) {
  const counterLabel = perspective === "merchant" ? "Buyer" : "Merchant";

  return (
    <div className="bg-[#131518] rounded-xl border border-white/5 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-[#181a1e] border-b border-white/5">
            <tr>
              <th className="px-6 py-4 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Hash</th>
              <th className="px-6 py-4 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">{counterLabel}</th>
              <th className="px-6 py-4 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Resource</th>
              <th className="px-6 py-4 text-[10px] font-semibold text-gray-500 uppercase tracking-widest text-right">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {transactions.map((tx) => {
              const counterAddr = perspective === "merchant" ? tx.buyerAddress : tx.merchantAddr;
              const counterName = perspective === "buyer" ? tx.merchant?.name : null;

              return (
                <tr key={tx.hash} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/tx/${tx.hash}`} className="font-mono text-sm text-cyan-400 hover:text-cyan-300">
                      {tx.hash.substring(0, 10)}...
                    </Link>
                    <div className="text-[10px] text-gray-500 mt-1">
                      <RelativeTime date={tx.timestamp.toISOString()} />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/address/${counterAddr}`} className="font-mono text-sm text-gray-400 hover:text-cyan-400 transition-colors">
                      {counterName || `${counterAddr.substring(0, 12)}...`}
                    </Link>
                  </td>
                  <td className="px-6 py-4 max-w-[200px]">
                    {tx.resource ? (
                      <div className="text-xs text-gray-300 font-mono truncate" title={tx.resource.url}>
                        {tx.resource.url}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-600 italic">Unknown</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    <span className="font-medium text-white">{tx.amount}</span>
                    <span className="text-gray-500 text-xs ml-1">{tx.asset}</span>
                  </td>
                </tr>
              );
            })}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500 text-sm">
                  No transactions recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
