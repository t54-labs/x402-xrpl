import { prisma } from "@x402-xrpl/database";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CopyButton } from "../../components/CopyButton";
import { RelativeTime } from "../../components/RelativeTime";
import { getExplorerUrl } from "../../utils/explorer";

interface PageProps {
  params: Promise<{ hash: string }>;
}

export default async function TransactionDetailPage({ params }: PageProps) {
  const { hash } = await params;

  const tx = await prisma.transaction.findUnique({
    where: { hash },
    include: {
      merchant: true,
      resource: true,
    },
  });

  if (!tx) {
    notFound();
  }

  type Field = { label: string; value: string; mono?: boolean; copyable?: boolean; relative?: string; highlight?: boolean };

  const fields: Field[] = [
    { label: "Transaction Hash", value: tx.hash, mono: true, copyable: true },
    { label: "Ledger Index", value: tx.ledgerIndex.toLocaleString() },
    { label: "Timestamp", value: new Date(tx.timestamp).toLocaleString(), relative: tx.timestamp.toISOString() },
    { label: "Amount", value: `${tx.amount} ${tx.asset}`, highlight: true },
  ];

  if (tx.assetIssuer) {
    fields.push({ label: "Asset Issuer", value: tx.assetIssuer, mono: true, copyable: true });
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/transactions" className="text-gray-500 hover:text-gray-300 transition-colors text-sm">&larr; All Transactions</Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center shrink-0">
          <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-light text-white tracking-tight">Transaction Details</h1>
          <p className="text-sm text-gray-500 font-mono mt-1">{hash.substring(0, 20)}...</p>
        </div>
      </div>

      <div className="bg-[#131518] rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
        <div className="divide-y divide-white/5">
          {fields.map((f) => (
            <div key={f.label} className="flex flex-col sm:flex-row px-6 py-4 gap-2">
              <div className="sm:w-48 shrink-0">
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">{f.label}</span>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <span className={`text-sm break-all ${f.mono ? "font-mono text-cyan-400" : ""} ${f.highlight ? "font-medium text-white text-lg" : "text-gray-300"}`}>
                  {f.value}
                </span>
                {f.copyable && <CopyButton text={f.value as string} />}
                {f.relative && (
                  <span className="text-xs text-gray-500">
                    (<RelativeTime date={f.relative} />)
                  </span>
                )}
              </div>
            </div>
          ))}

          <div className="flex flex-col sm:flex-row px-6 py-4 gap-2">
            <div className="sm:w-48 shrink-0">
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Buyer</span>
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <Link href={`/address/${tx.buyerAddress}`} className="font-mono text-sm text-cyan-400 hover:text-cyan-300 transition-colors break-all">
                {tx.buyerAddress}
              </Link>
              <CopyButton text={tx.buyerAddress} />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row px-6 py-4 gap-2">
            <div className="sm:w-48 shrink-0">
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Merchant</span>
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <Link href={`/address/${tx.merchantAddr}`} className="font-mono text-sm text-cyan-400 hover:text-cyan-300 transition-colors break-all">
                {tx.merchant?.name || tx.merchantAddr}
              </Link>
              <CopyButton text={tx.merchantAddr} />
            </div>
          </div>

          {tx.resource && (
            <div className="flex flex-col sm:flex-row px-6 py-4 gap-2">
              <div className="sm:w-48 shrink-0">
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Resource</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm text-gray-300">{tx.resource.name || "Unnamed Resource"}</p>
                <p className="text-xs text-gray-500 font-mono mt-1 break-all">{tx.resource.url}</p>
              </div>
            </div>
          )}

          {tx.destinationTag !== null && (
            <div className="flex flex-col sm:flex-row px-6 py-4 gap-2">
              <div className="sm:w-48 shrink-0">
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Destination Tag</span>
              </div>
              <span className="text-sm text-gray-300 font-mono">{tx.destinationTag}</span>
            </div>
          )}

          {tx.sourceTag !== null && (
            <div className="flex flex-col sm:flex-row px-6 py-4 gap-2">
              <div className="sm:w-48 shrink-0">
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Source Tag</span>
              </div>
              <span className="text-sm text-gray-300 font-mono">{tx.sourceTag}</span>
            </div>
          )}

          {tx.invoiceId && (
            <div className="flex flex-col sm:flex-row px-6 py-4 gap-2">
              <div className="sm:w-48 shrink-0">
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Invoice ID</span>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm text-gray-300 font-mono break-all">{tx.invoiceId}</span>
                <CopyButton text={tx.invoiceId} />
              </div>
            </div>
          )}

          {tx.rawMemo && (
            <div className="flex flex-col sm:flex-row px-6 py-4 gap-2">
              <div className="sm:w-48 shrink-0">
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Raw Memo</span>
              </div>
              <div className="min-w-0">
                <pre className="text-xs text-gray-400 font-mono bg-[#0b0d10] rounded-lg p-3 overflow-x-auto break-all whitespace-pre-wrap">{tx.rawMemo}</pre>
              </div>
            </div>
          )}

          {tx.facilitator && (
            <div className="flex flex-col sm:flex-row px-6 py-4 gap-2">
              <div className="sm:w-48 shrink-0">
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Facilitator</span>
              </div>
              <span className="text-sm text-gray-300 font-mono">{tx.facilitator}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <a
          href={`${getExplorerUrl()}/transactions/${hash}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white hover:border-white/20 transition-all"
        >
          View on XRPL Explorer
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}
