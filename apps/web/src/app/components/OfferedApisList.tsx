"use client";

import { useState } from "react";
import { formatCurrency } from "../utils/currency";

type Resource = {
  id: string;
  url: string;
  name: string | null;
  priceAmount: string;
  priceAsset: string;
  isActive: boolean;
};

const PAGE_SIZE = 6;

export function OfferedApisList({ resources }: { resources: Resource[] }) {
  const [page, setPage] = useState(1);

  if (resources.length === 0) {
    return (
      <div className="dashboard-panel bg-[var(--bg-surface)] border border-[var(--border)] p-8 text-center text-sm text-[var(--text-muted)]">
        No resources registered for this merchant.
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(resources.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * PAGE_SIZE;
  const visible = resources.slice(start, start + PAGE_SIZE);

  return (
    <div className="space-y-3">
      {visible.map((res) => (
        <div key={res.id} className="dashboard-panel bg-[var(--bg-surface)] border border-[var(--border)] p-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate">{res.name || "Unnamed resource"}</h3>
          <p className="mt-1 text-[11px] font-mono text-[var(--text-muted)] truncate" title={res.url}>{res.url}</p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="font-mono text-[13px] text-[var(--brand-blue)]">{res.priceAmount} {formatCurrency(res.priceAsset)}</span>
            <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-medium border ${res.isActive ? "text-emerald-400 bg-emerald-500/8 border-emerald-500/15" : "text-[var(--text-muted)] bg-[rgba(255,255,255,0.04)] border-[var(--border)]"}`}>
              {res.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      ))}

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={() => setPage(current - 1)}
            disabled={current <= 1}
            className="ui-control px-3.5 py-1.5 text-[12px] font-medium border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.04)] transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            &larr; Prev
          </button>
          <span className="text-[12px] text-[var(--text-muted)]">
            Page {current} of {totalPages} · {resources.length} APIs
          </span>
          <button
            type="button"
            onClick={() => setPage(current + 1)}
            disabled={current >= totalPages}
            className="ui-control px-3.5 py-1.5 text-[12px] font-medium border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.04)] transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            Next &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
