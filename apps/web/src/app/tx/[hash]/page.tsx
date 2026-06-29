import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CopyButton } from "../../components/CopyButton";
import { RelativeTime } from "../../components/RelativeTime";
import { VerificationBadge } from "../../components/VerificationBadge";
import { getExplorerUrl } from "../../utils/explorer";
import { formatCurrency } from "../../utils/currency";
import { apiFetch } from "../../lib/api";

interface PageProps {
  params: Promise<{ hash: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { hash } = await params;
  const short = hash.length > 16 ? `${hash.slice(0, 8)}…${hash.slice(-6)}` : hash;
  return {
    title: `Transaction ${short}`,
    description: `x402 settlement transaction ${hash} on the XRP Ledger — amount, asset, merchant and verification status.`,
    alternates: { canonical: `/tx/${hash}` },
  };
}

type TxDetail = {
  hash: string; ledgerIndex: number; timestamp: string; amount: string; asset: string;
  assetIssuer: string | null; buyerAddress: string; merchantAddr: string;
  sourceTag: number | null; destinationTag: number | null; invoiceId: string | null;
  facilitator: string | null; rawMemo: string | null;
  verifiableIntent?: boolean | null; riskChecked?: boolean | null;
  merchant?: { name: string | null } | null;
  resource?: { url: string; name: string | null } | null;
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-4 px-5 sm:px-6 py-4">
      <div className="sm:w-52 shrink-0">
        <span className="text-[10px] font-plek uppercase tracking-[0.18em] text-[var(--paper-mute)]">{label}</span>
      </div>
      <div className="flex min-w-0 flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

const mono = "font-mono text-[13px] text-[var(--brand-blue)] break-all";
const linkMono = "font-mono text-[13px] text-[var(--brand-blue)] break-all hover:underline";

export default async function TransactionDetailPage({ params }: PageProps) {
  const { hash } = await params;

  let tx: TxDetail;
  try {
    tx = await apiFetch<TxDetail>(`/transactions/${hash}`);
  } catch {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <header className="animate-fade-up">
        <Link href="/transactions" className="text-[13px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
          &larr; All transactions
        </Link>
        <span className="mt-6 block text-[10px] font-plek uppercase tracking-[0.28em] text-[var(--paper-mute)]">Transaction</span>
        <div className="mt-1.5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-[var(--paper)]">Transaction details</h1>
          <VerificationBadge verifiableIntent={tx.verifiableIntent} riskChecked={tx.riskChecked} showIdle />
        </div>
        <p className="mt-2 font-mono text-[13px] text-[var(--text-muted)] break-all">{hash}</p>
      </header>

      <div className="dashboard-panel bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden">
        <div className="divide-y divide-[var(--border)]">
          <Row label="Amount">
            <span className="font-mono tabular-nums text-lg text-[var(--paper)]">{tx.amount}</span>
            <span className="text-[11px] font-plek uppercase tracking-[0.16em] text-[var(--paper-mute)]">{formatCurrency(tx.asset)}</span>
          </Row>
          <Row label="Intent status">
            <VerificationBadge verifiableIntent={tx.verifiableIntent} riskChecked={tx.riskChecked} showIdle />
          </Row>
          <Row label="Transaction hash">
            <span className={mono}>{tx.hash}</span>
            <CopyButton text={tx.hash} />
          </Row>
          <Row label="Ledger index">
            <span className="font-mono tabular-nums text-[13px] text-[var(--text-secondary)]">{tx.ledgerIndex.toLocaleString()}</span>
          </Row>
          <Row label="Timestamp">
            <span suppressHydrationWarning className="text-[14px] text-[var(--text-secondary)]">{new Date(tx.timestamp).toLocaleString()}</span>
            <span className="text-[12px] text-[var(--text-muted)]">(<RelativeTime date={tx.timestamp} />)</span>
          </Row>
          {tx.assetIssuer ? (
            <Row label="Asset issuer">
              <span className={mono}>{tx.assetIssuer}</span>
              <CopyButton text={tx.assetIssuer} />
            </Row>
          ) : null}
          <Row label="Buyer">
            <Link href={`/address/${tx.buyerAddress}`} className={linkMono}>{tx.buyerAddress}</Link>
            <CopyButton text={tx.buyerAddress} />
          </Row>
          <Row label="Merchant">
            <Link href={`/address/${tx.merchantAddr}`} className={linkMono}>{tx.merchant?.name || tx.merchantAddr}</Link>
            <CopyButton text={tx.merchantAddr} />
          </Row>
          {tx.resource ? (
            <Row label="Resource">
              <div className="min-w-0">
                <p className="text-[14px] text-[var(--text-secondary)]">{tx.resource.name || "Unnamed resource"}</p>
                <p className="mt-0.5 font-mono text-[12px] text-[var(--text-muted)] break-all">{tx.resource.url}</p>
              </div>
            </Row>
          ) : null}
          {tx.destinationTag !== null ? (
            <Row label="Destination tag"><span className="font-mono text-[13px] text-[var(--text-secondary)]">{tx.destinationTag}</span></Row>
          ) : null}
          {tx.sourceTag !== null ? (
            <Row label="Source tag"><span className="font-mono text-[13px] text-[var(--text-secondary)]">{tx.sourceTag}</span></Row>
          ) : null}
          {tx.invoiceId ? (
            <Row label="Invoice ID">
              <span className="font-mono text-[13px] text-[var(--text-secondary)] break-all">{tx.invoiceId}</span>
              <CopyButton text={tx.invoiceId} />
            </Row>
          ) : null}
          {tx.facilitator ? (
            <Row label="Facilitator"><span className="font-mono text-[13px] text-[var(--text-secondary)] break-all">{tx.facilitator}</span></Row>
          ) : null}
          {tx.rawMemo ? (
            <Row label="Raw memo">
              <pre className="w-full !rounded-lg border border-[var(--border)] bg-[var(--ink-surface)] p-3 font-mono text-[12px] text-[var(--text-muted)] overflow-x-auto whitespace-pre-wrap break-all">{tx.rawMemo}</pre>
            </Row>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <a
          href={`${getExplorerUrl()}/transactions/${hash}`}
          target="_blank"
          rel="noreferrer"
          className="ui-control inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.04)] transition-colors"
        >
          View on XRPL Explorer
          <span aria-hidden="true">&#8599;</span>
        </a>
      </div>
    </div>
  );
}
