import Link from "next/link";
import { RelativeTime } from "../components/RelativeTime";
import { apiFetch } from "../lib/api";
import { formatCurrency } from "../utils/currency";

interface SearchParams {
  page?: string;
}

type TxListResponse = {
  items: Array<{
    hash: string; timestamp: string; amount: string; asset: string;
    buyerAddress: string; merchantAddr: string;
    merchant?: { address: string; name: string | null } | null;
    resource?: { id: string; url: string; name: string | null } | null;
  }>;
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export default async function TransactionsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);

  const data = await apiFetch<TxListResponse>(`/transactions?page=${page}&limit=25`);
  const transactions = data.items;
  const totalCount = data.pagination.total;
  const totalPages = data.pagination.totalPages;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-white">Ledger History</h1>
          <p className="text-sm text-gray-400 mt-2">Real-time x402 payment confirmations on the XRPL</p>
        </div>
        <span className="text-sm text-gray-500">{totalCount.toLocaleString()} total transactions</span>
      </div>
      
      <div className="bg-[#131518] rounded-xl border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-[#181a1e] border-b border-white/5">
              <tr>
                <th className="px-6 py-4 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Transaction Hash</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Time</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Merchant / Resource</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Buyer</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-gray-500 uppercase tracking-widest text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.map((tx) => (
                <tr key={tx.hash} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/tx/${tx.hash}`} className="font-mono text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                      {tx.hash.substring(0, 16)}...
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    <RelativeTime date={tx.timestamp} />
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <div className="text-sm font-medium text-gray-200 truncate">
                      <Link href={`/address/${tx.merchantAddr}`} className="hover:text-cyan-400 transition-colors">
                        {tx.merchant?.name || tx.merchantAddr}
                      </Link>
                    </div>
                    {tx.resource && (
                      <div className="text-xs text-gray-500 font-mono truncate mt-0.5">
                        {tx.resource.url}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/address/${tx.buyerAddress}`} className="font-mono text-sm text-gray-400 hover:text-cyan-400 transition-colors">
                      {tx.buyerAddress.substring(0, 12)}...
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    <span className="font-medium text-white">{tx.amount}</span>
                    <span className="text-gray-500 text-xs ml-1">{formatCurrency(tx.asset)}</span>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-500 text-sm">
                    No x402 transactions found on the ledger yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {page > 1 && (
            <Link
              href={`/transactions?page=${page - 1}`}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white hover:border-white/20 transition-all"
            >
              &larr; Previous
            </Link>
          )}
          <span className="text-sm text-gray-500 px-4">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/transactions?page=${page + 1}`}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white hover:border-white/20 transition-all"
            >
              Next &rarr;
            </Link>
          )}
        </div>
      )}
    </div>
  );
}