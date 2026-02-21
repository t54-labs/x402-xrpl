import { prisma } from "@x402-xrpl/database";
import Link from "next/link";

interface SearchParams {
  q?: string;
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const query = params.q?.trim() || "";

  if (!query) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16 text-center">
        <h1 className="text-2xl font-light text-white mb-4">Search</h1>
        <p className="text-gray-500">Enter an address or transaction hash in the search bar above.</p>
      </div>
    );
  }

  const [merchants, transactions, resources] = await Promise.all([
    prisma.merchant.findMany({
      where: {
        OR: [
          { address: { contains: query, mode: "insensitive" } },
          { name: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 10,
    }),
    prisma.transaction.findMany({
      where: {
        OR: [
          { hash: { contains: query, mode: "insensitive" } },
          { buyerAddress: { contains: query, mode: "insensitive" } },
        ],
      },
      include: { merchant: true },
      take: 10,
      orderBy: { timestamp: "desc" },
    }),
    prisma.resource.findMany({
      where: {
        OR: [
          { url: { contains: query, mode: "insensitive" } },
          { name: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 10,
    }),
  ]);

  const totalResults = merchants.length + transactions.length + resources.length;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-light text-white">Search Results</h1>
        <p className="text-sm text-gray-500 mt-1">
          {totalResults} result{totalResults !== 1 ? "s" : ""} for &ldquo;<span className="text-gray-300">{query}</span>&rdquo;
        </p>
      </div>

      {totalResults === 0 && (
        <div className="bg-[#131518] rounded-xl border border-white/5 p-12 text-center">
          <p className="text-gray-500">No results found. Try a different search term.</p>
        </div>
      )}

      {merchants.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">Merchants / Addresses</h2>
          <div className="bg-[#131518] rounded-xl border border-white/5 divide-y divide-white/5">
            {merchants.map((m) => (
              <Link href={`/address/${m.address}`} key={m.address} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                <div className="w-10 h-10 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center shrink-0">
                  <span className="text-sm text-cyan-400 font-medium">{(m.name || "M").charAt(0)}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-gray-200 font-medium">{m.name || "Unknown Merchant"}</p>
                  <p className="text-xs text-gray-500 font-mono truncate">{m.address}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {transactions.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">Transactions</h2>
          <div className="bg-[#131518] rounded-xl border border-white/5 divide-y divide-white/5">
            {transactions.map((tx) => (
              <Link href={`/tx/${tx.hash}`} key={tx.hash} className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors">
                <div className="min-w-0">
                  <p className="text-sm text-cyan-400 font-mono truncate">{tx.hash}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {tx.merchant?.name || tx.merchantAddr.substring(0, 16) + "..."}
                  </p>
                </div>
                <span className="text-sm text-white font-medium shrink-0 ml-4">
                  {tx.amount} <span className="text-xs text-gray-500">{tx.asset}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {resources.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">Resources</h2>
          <div className="bg-[#131518] rounded-xl border border-white/5 divide-y divide-white/5">
            {resources.map((res) => (
              <Link href={`/address/${res.merchantAddr}`} key={res.id} className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors">
                <div className="min-w-0">
                  <p className="text-sm text-gray-200">{res.name || "Unnamed Resource"}</p>
                  <p className="text-xs text-gray-500 font-mono truncate mt-1">{res.url}</p>
                </div>
                <span className="text-sm font-mono text-cyan-400 shrink-0 ml-4">
                  {res.priceAmount} {res.priceAsset}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
