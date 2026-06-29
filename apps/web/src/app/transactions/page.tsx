import type { Metadata } from "next";
import Link from "next/link";
import { RelativeTime } from "../components/RelativeTime";
import { VerificationBadge, isVerifiedIntent } from "../components/VerificationBadge";
import { apiFetch } from "../lib/api";
import { formatCurrency } from "../utils/currency";

export const metadata: Metadata = {
  title: "Transactions",
  description:
    "Live x402 settlement transactions on XRPL mainnet — autonomous agent payments in RLUSD and XRP.",
  alternates: { canonical: "/transactions" },
};

interface SearchParams {
  page?: string;
}

type TxListResponse = {
  items: Array<{
    hash: string; timestamp: string; amount: string; asset: string;
    buyerAddress: string; merchantAddr: string;
    verifiableIntent?: boolean; riskChecked?: boolean;
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 animate-fade-up">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">Ledger History</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Real-time x402 payment confirmations on the XRPL</p>
        </div>
        <span className="text-sm text-[var(--text-muted)]">{totalCount.toLocaleString()} total transactions</span>
      </div>

      {/* Mobile list */}
      <div className="md:hidden space-y-3 animate-fade-up" style={{ animationDelay: "80ms" }}>
        {transactions.map((tx) => {
          const verified = isVerifiedIntent(tx);
          return (
            <div
              key={tx.hash}
              className={[
                "table-shell bg-[var(--bg-surface)] border p-4",
                verified ? "border-[var(--blue-28)] shadow-[inset_2px_0_0_var(--brand-blue)]" : "border-[var(--border)]",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/tx/${tx.hash}`} className="font-mono text-sm text-[var(--brand-blue)]">
                    {tx.hash.substring(0, 16)}...
                  </Link>
                  <div className="mt-1">
                    <VerificationBadge verifiableIntent={tx.verifiableIntent} riskChecked={tx.riskChecked} compact />
                  </div>
                </div>
                <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">
                  <RelativeTime date={tx.timestamp} />
                </span>
              </div>
              <div className="mt-2 text-sm text-[var(--text-secondary)]">
                <Link href={`/address/${tx.merchantAddr}`} className="hover:text-[var(--text-primary)] transition-colors">
                  {tx.merchant?.name || tx.merchantAddr.substring(0, 14) + "..."}
                </Link>
              </div>
              {tx.resource && (
                <div className="mt-1 text-xs text-[var(--text-muted)] font-mono truncate">
                  {tx.resource.url}
                </div>
              )}
              <div className="mt-3 flex items-center justify-between">
                <Link href={`/address/${tx.buyerAddress}`} className="font-mono text-xs text-[var(--text-muted)]">
                  {tx.buyerAddress.substring(0, 12)}...
                </Link>
                <div className="text-sm">
                  <span className="font-medium text-[var(--text-primary)]">{tx.amount}</span>
                  <span className="text-[var(--text-muted)] text-xs ml-1">{formatCurrency(tx.asset)}</span>
                </div>
              </div>
            </div>
          );
        })}
        {transactions.length === 0 && (
          <div className="table-shell bg-[var(--bg-surface)] border border-[var(--border)] p-10 text-center text-sm text-[var(--text-muted)]">
            No x402 transactions found on the ledger yet.
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block table-shell bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] overflow-hidden animate-fade-up" style={{ animationDelay: "80ms" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-[var(--bg-elevated)] border-b border-[var(--border)]">
              <tr>
                <th className="px-6 py-4 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">Transaction Hash</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">Time</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">Intent</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">Merchant / Resource</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">Buyer</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {transactions.map((tx) => {
                const verified = isVerifiedIntent(tx);
                return (
                  <tr
                    key={tx.hash}
                    className={[
                      "hover:bg-[var(--bg-elevated)] transition-colors",
                      verified ? "bg-[rgba(0,140,255,0.035)] shadow-[inset_2px_0_0_var(--brand-blue)]" : "",
                    ].join(" ")}
                  >
                    <td className="px-6 py-4">
                      <Link href={`/tx/${tx.hash}`} className="font-mono text-sm text-[var(--brand-blue)] hover:text-[var(--brand-blue)] transition-colors">
                        {tx.hash.substring(0, 16)}...
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                      <RelativeTime date={tx.timestamp} />
                    </td>
                    <td className="px-6 py-4">
                      <VerificationBadge verifiableIntent={tx.verifiableIntent} riskChecked={tx.riskChecked} showIdle compact />
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="text-sm font-medium text-[var(--text-primary)] truncate">
                        <Link href={`/address/${tx.merchantAddr}`} className="hover:text-[var(--brand-blue)] transition-colors">
                          {tx.merchant?.name || tx.merchantAddr}
                        </Link>
                      </div>
                      {tx.resource && (
                        <div className="text-xs text-[var(--text-muted)] font-mono truncate mt-0.5">
                          {tx.resource.url}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/address/${tx.buyerAddress}`} className="font-mono text-sm text-[var(--text-secondary)] hover:text-[var(--brand-blue)] transition-colors">
                        {tx.buyerAddress.substring(0, 12)}...
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <span className="font-medium text-[var(--text-primary)]">{tx.amount}</span>
                      <span className="text-[var(--text-muted)] text-xs ml-1">{formatCurrency(tx.asset)}</span>
                    </td>
                  </tr>
                );
              })}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-[var(--text-muted)] text-sm">
                    No x402 transactions found on the ledger yet.
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
            <Link
              href={`/transactions?page=${page - 1}`}
              className="ui-control px-4 py-2 bg-[rgba(255,255,255,0.04)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all"
            >
              &larr; Previous
            </Link>
          )}
          <span className="text-sm text-[var(--text-muted)] px-4">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/transactions?page=${page + 1}`}
              className="ui-control px-4 py-2 bg-[rgba(255,255,255,0.04)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all"
            >
              Next &rarr;
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
