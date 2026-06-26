import type { Metadata } from "next";
import Link from "next/link";
import { apiFetch } from "../lib/api";
import { formatCurrency } from "../utils/currency";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Facilitators",
  description:
    "x402 facilitators settling autonomous agent payments on the XRP Ledger, with live volume by asset.",
  alternates: { canonical: "/facilitators" },
};

type Facilitator = {
  sourceTag: number;
  name: string;
  url: string | null;
  website: string | null;
  description: string | null;
  networks: string[];
  assets: string[];
  isActive: boolean;
  txCount: number;
  activeBuyers: number;
  volumeByAsset: Array<{ asset: string; total: number }>;
};

async function getFacilitators(): Promise<Facilitator[]> {
  try {
    return await apiFetch<Facilitator[]>("/facilitators");
  } catch {
    return [];
  }
}

export default async function FacilitatorsPage() {
  const facilitators = await getFacilitators();
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <header className="animate-fade-up flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">Facilitators</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1 max-w-2xl">
            Every x402 facilitator settling on XRPL, ranked by on-chain activity. Register yours to be indexed.
          </p>
        </div>
        <Link href="/join/facilitator" className="ui-control px-4 py-2 bg-[var(--brand-blue)] text-white font-medium text-sm shrink-0">
          Register your facilitator
        </Link>
      </header>

      {facilitators.length === 0 ? (
        <div className="dashboard-panel bg-[var(--bg-surface)] border border-[var(--border)] p-10 text-center text-sm text-[var(--text-muted)]">
          No facilitators indexed yet.
        </div>
      ) : (
        <div className="dashboard-panel bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden animate-fade-up">
          <div className="divide-y divide-[var(--border)]">
            {facilitators.map((f, i) => (
              <div key={f.sourceTag} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 sm:px-6 py-4 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="text-xs text-[var(--text-muted)] w-5 shrink-0 mt-0.5">#{i + 1}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{f.name}</p>
                      {f.isActive ? <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] shrink-0" /> : null}
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] font-mono">SourceTag {f.sourceTag}</p>
                    {f.description ? <p className="text-[13px] text-[var(--text-secondary)] mt-1 max-w-xl">{f.description}</p> : null}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(f.assets || []).map((a) => (
                        <span key={a} className="text-[10px] font-mono text-[var(--brand-blue)] bg-[rgba(0,140,255,0.06)] border border-[rgba(0,140,255,0.12)] px-1.5 py-0.5 rounded">{a}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6 shrink-0 sm:text-right pl-8 sm:pl-0">
                  <div>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Txs</p>
                    <p className="text-sm font-mono text-[var(--text-primary)]">{f.txCount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Agents</p>
                    <p className="text-sm font-mono text-[var(--text-primary)]">{f.activeBuyers.toLocaleString()}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Settled</p>
                    {f.volumeByAsset && f.volumeByAsset.length > 0 ? (
                      f.volumeByAsset.map((v) => (
                        <p key={v.asset} className="text-sm font-mono text-[var(--text-secondary)]">
                          {v.total < 1 ? v.total.toFixed(3) : v.total.toFixed(2)} {formatCurrency(v.asset)}
                        </p>
                      ))
                    ) : (
                      <p className="text-sm font-mono text-[var(--text-muted)]">—</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
