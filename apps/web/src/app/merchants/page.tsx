import Link from "next/link";
import Image from "next/image";
import { apiFetch } from "../lib/api";
import { CopyButton } from "../components/CopyButton";

interface SearchParams {
  page?: string;
}

type MerchantListResponse = {
  items: Array<{
    address: string;
    name: string | null;
    logoUrl: string | null;
    website: string | null;
    createdAt: string;
    _count: { resources: number; transactions: number };
  }>;
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export default async function MerchantsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);

  const data = await apiFetch<MerchantListResponse>(`/merchants?page=${page}&limit=20`);
  const merchants = data.items;
  const totalCount = data.pagination.total;
  const totalPages = data.pagination.totalPages;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-white">Merchants</h1>
          <p className="text-sm text-gray-400 mt-2">XRPL addresses receiving x402 payments</p>
        </div>
        <span className="text-sm text-gray-500">{totalCount} merchant{totalCount !== 1 ? "s" : ""}</span>
      </div>

      <div className="bg-[#131518] rounded-xl border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-[#181a1e] border-b border-white/5">
              <tr>
                <th className="px-6 py-4 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Address</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Name</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-gray-500 uppercase tracking-widest text-center">Transactions</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-gray-500 uppercase tracking-widest text-center">Resources</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {merchants.map((m) => (
                <tr key={m.address} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/address/${m.address}`} className="font-mono text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                        {m.address}
                      </Link>
                      <CopyButton text={m.address} />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      {m.logoUrl && (
                        <div className="w-6 h-6 rounded-md overflow-hidden shrink-0 bg-cyan-400/10 border border-cyan-400/20">
                          <Image src={m.logoUrl} alt={m.name || ""} width={24} height={24} className="object-cover w-full h-full" />
                        </div>
                      )}
                      {m.name || <span className="text-gray-600 italic">Unknown</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-white text-center font-medium">
                    {m._count.transactions}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400 text-center">
                    {m._count.resources}
                  </td>
                </tr>
              ))}
              {merchants.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-gray-500 text-sm">
                    No merchants found yet.
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
            <Link href={`/merchants?page=${page - 1}`} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white hover:border-white/20 transition-all">
              &larr; Previous
            </Link>
          )}
          <span className="text-sm text-gray-500 px-4">Page {page} of {totalPages}</span>
          {page < totalPages && (
            <Link href={`/merchants?page=${page + 1}`} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white hover:border-white/20 transition-all">
              Next &rarr;
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
