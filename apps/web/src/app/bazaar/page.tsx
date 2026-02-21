import { prisma } from "@x402-xrpl/database";
import Link from "next/link";

interface SearchParams {
  page?: string;
}

export default async function BazaarPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const pageSize = 12;
  const skip = (page - 1) * pageSize;

  const [resources, totalCount] = await Promise.all([
    prisma.resource.findMany({
      where: { isActive: true },
      include: {
        merchant: true,
        _count: { select: { transactions: true } },
      },
      orderBy: { createdAt: "desc" },
      take: pageSize,
      skip,
    }),
    prisma.resource.count({ where: { isActive: true } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      <header>
        <h1 className="text-3xl font-light tracking-tight text-white">The Bazaar</h1>
        <p className="text-sm text-gray-400 mt-2">
          Discover pay-per-use APIs and services on the XRPL x402 network.
          {totalCount > 0 && <span className="ml-2 text-gray-500">({totalCount} resources)</span>}
        </p>
      </header>

      {resources.length === 0 ? (
        <div className="bg-[#131518] rounded-2xl border border-white/5 p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h2 className="text-lg text-gray-300 mb-2">No Resources Listed Yet</h2>
          <p className="text-sm text-gray-500 mb-6">Be the first to register an x402-compatible API on the XRPL.</p>
          <Link href="/resources/register" className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg transition-all text-sm">
            Register Your API
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((res) => (
              <Link href={`/address/${res.merchantAddr}`} key={res.id} className="block group">
                <div className="bg-[#131518] rounded-xl border border-white/5 p-6 h-full hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.05)] transition-all flex flex-col">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-medium text-gray-200 group-hover:text-white truncate">
                      {res.name || "API Resource"}
                    </h3>
                    <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold ${
                      res.isDiscovered
                        ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                        : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    }`}>
                      {res.isDiscovered ? "Discovered" : "Registered"}
                    </span>
                  </div>

                  {res.description && (
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{res.description}</p>
                  )}

                  <p className="text-xs text-gray-600 font-mono truncate mb-4" title={res.url}>{res.url}</p>

                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-sm font-mono bg-cyan-400/10 text-cyan-400 px-2.5 py-1 rounded border border-cyan-400/20">
                      {res.priceAmount} {res.priceAsset}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-gray-500">
                        {res._count.transactions} txs
                      </span>
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider">{res.network}</span>
                    </div>
                  </div>

                  {res.merchant?.name && (
                    <div className="mt-3 flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-cyan-400/10 flex items-center justify-center">
                        <span className="text-[10px] text-cyan-400 font-medium">{res.merchant.name.charAt(0)}</span>
                      </div>
                      <span className="text-xs text-gray-500">{res.merchant.name}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              {page > 1 && (
                <Link
                  href={`/bazaar?page=${page - 1}`}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white hover:border-white/20 transition-all"
                >
                  Previous
                </Link>
              )}
              <span className="text-sm text-gray-500 px-4">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/bazaar?page=${page + 1}`}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white hover:border-white/20 transition-all"
                >
                  Next
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
