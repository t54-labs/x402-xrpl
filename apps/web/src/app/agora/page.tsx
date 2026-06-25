import Link from "next/link";
import { apiFetch } from "../lib/api";
import { formatCurrency } from "../utils/currency";

interface SearchParams {
  page?: string;
}

type ResourceListResponse = {
  items: Array<{
    id: string; merchantAddr: string; url: string; name: string | null;
    description: string | null; priceAmount: string; priceAsset: string;
    network: string | null; isDiscovered: boolean; isActive: boolean;
    merchant?: { address: string; name: string | null } | null;
    _count?: { transactions: number };
  }>;
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export default async function AgoraPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);

  const data = await apiFetch<ResourceListResponse>(`/resources?page=${page}&limit=12`);
  const resources = data.items;
  const totalCount = data.pagination.total;
  const totalPages = data.pagination.totalPages;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-6 sm:space-y-8">

      <header className="animate-fade-up">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">Agora</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Discover pay-per-use APIs and services on the XRPL x402 network.
          {totalCount > 0 && <span className="ml-2 text-[var(--text-muted)]">({totalCount} resources)</span>}
        </p>
      </header>

      {resources.length === 0 ? (
        <div className="dashboard-panel bg-[var(--bg-surface)] border border-[var(--border)] p-10 sm:p-16 text-center animate-fade-up" style={{ animationDelay: "80ms" }}>
          <h2 className="text-lg font-medium text-[var(--paper)] mb-2">No resources listed yet</h2>
          <p className="text-sm text-[var(--text-muted)] mb-6">Be the first to register an x402-compatible API on the XRPL.</p>
          <Link href="/join/service" className="ui-control inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--brand-blue)] text-white font-semibold rounded-lg transition-all text-sm">
            Register Your API
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 stagger-children">
            {resources.map((res) => (
              <Link href={`/address/${res.merchantAddr}`} key={res.id} className="block group">
                <div className="ui-card bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] p-4 sm:p-6 h-full hover:border-[rgba(0,140,255,0.28)] transition-all flex flex-col">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-medium text-[var(--text-primary)] group-hover:text-[var(--text-primary)] truncate">
                      {res.name || "API Resource"}
                    </h3>
                    <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold ${
                      res.isDiscovered
                        ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                        : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                    }`}>
                      {res.isDiscovered ? "Discovered" : "Registered"}
                    </span>
                  </div>

                  {res.description && (
                    <p className="text-xs text-[var(--text-muted)] mb-3 line-clamp-2">{res.description}</p>
                  )}

                  <p className="text-xs text-[var(--text-muted)] font-mono truncate mb-4" title={res.url}>{res.url}</p>

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-[var(--border)]">
                    <span className="text-sm font-mono bg-cyan-400/10 text-cyan-400 px-2.5 py-1 rounded border border-cyan-400/20">
                      {res.priceAmount} {formatCurrency(res.priceAsset)}
                    </span>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-[10px] text-[var(--text-muted)]">
                        {res._count?.transactions ?? 0} txs
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{res.network}</span>
                    </div>
                  </div>

                  {res.merchant?.name && (
                    <div className="mt-3 flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-cyan-400/10 flex items-center justify-center">
                        <span className="text-[10px] text-cyan-400 font-medium">{res.merchant.name.charAt(0)}</span>
                      </div>
                      <span className="text-xs text-[var(--text-muted)]">{res.merchant.name}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4 animate-fade-up" style={{ animationDelay: "180ms" }}>
              {page > 1 && (
                <Link
                  href={`/agora?page=${page - 1}`}
                  className="ui-control px-4 py-2 bg-[rgba(255,255,255,0.04)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all"
                >
                  Previous
                </Link>
              )}
              <span className="text-sm text-[var(--text-muted)] px-4">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/agora?page=${page + 1}`}
                  className="ui-control px-4 py-2 bg-[rgba(255,255,255,0.04)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all"
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
