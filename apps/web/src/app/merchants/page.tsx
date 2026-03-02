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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 animate-fade-up">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">Merchants</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">XRPL addresses receiving x402 payments</p>
        </div>
        <span className="text-sm text-[var(--text-muted)]">{totalCount} merchant{totalCount !== 1 ? "s" : ""}</span>
      </div>

      {/* Mobile list */}
      <div className="md:hidden space-y-3 animate-fade-up" style={{ animationDelay: "80ms" }}>
        {merchants.map((m) => (
          <div key={m.address} className="table-shell bg-[var(--bg-surface)] border border-[var(--border)] p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                {m.logoUrl && (
                  <div className="w-7 h-7 rounded-md overflow-hidden shrink-0 bg-cyan-400/10 border border-cyan-400/20">
                    <Image src={m.logoUrl} alt={m.name || ""} width={28} height={28} className="object-cover w-full h-full" />
                  </div>
                )}
                <p className="text-sm text-[var(--text-primary)] truncate">{m.name || "Unknown"}</p>
              </div>
              <div className="text-xs text-[var(--text-muted)] shrink-0">
                {m._count.transactions} txs
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2 min-w-0">
              <Link href={`/address/${m.address}`} className="font-mono text-xs text-[var(--brand-blue)] truncate">
                {m.address}
              </Link>
              <CopyButton text={m.address} />
            </div>
            <div className="mt-2 text-xs text-[var(--text-muted)]">
              {m._count.resources} resources
            </div>
          </div>
        ))}
        {merchants.length === 0 && (
          <div className="table-shell bg-[var(--bg-surface)] border border-[var(--border)] p-10 text-center text-sm text-[var(--text-muted)]">
            No merchants found yet.
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block table-shell bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] overflow-hidden animate-fade-up" style={{ animationDelay: "80ms" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-[var(--bg-elevated)] border-b border-[var(--border)]">
              <tr>
                <th className="px-6 py-4 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">Address</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">Name</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest text-center">Transactions</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest text-center">Resources</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {merchants.map((m) => (
                <tr key={m.address} className="hover:bg-[var(--bg-elevated)] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/address/${m.address}`} className="font-mono text-sm text-[var(--brand-blue)] hover:text-[var(--brand-blue)] transition-colors">
                        {m.address}
                      </Link>
                      <CopyButton text={m.address} />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                    <div className="flex items-center gap-2">
                      {m.logoUrl && (
                        <div className="w-6 h-6 rounded-md overflow-hidden shrink-0 bg-cyan-400/10 border border-cyan-400/20">
                          <Image src={m.logoUrl} alt={m.name || ""} width={24} height={24} className="object-cover w-full h-full" />
                        </div>
                      )}
                      {m.name || <span className="text-[var(--text-muted)] italic">Unknown</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-primary)] text-center font-medium">
                    {m._count.transactions}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)] text-center">
                    {m._count.resources}
                  </td>
                </tr>
              ))}
              {merchants.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-[var(--text-muted)] text-sm">
                    No merchants found yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6 animate-fade-up" style={{ animationDelay: "140ms" }}>
          {page > 1 && (
            <Link href={`/merchants?page=${page - 1}`} className="ui-control px-4 py-2 bg-[rgba(255,255,255,0.04)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all">
              &larr; Previous
            </Link>
          )}
          <span className="text-sm text-[var(--text-muted)] px-4">Page {page} of {totalPages}</span>
          {page < totalPages && (
            <Link href={`/merchants?page=${page + 1}`} className="ui-control px-4 py-2 bg-[rgba(255,255,255,0.04)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all">
              Next &rarr;
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
