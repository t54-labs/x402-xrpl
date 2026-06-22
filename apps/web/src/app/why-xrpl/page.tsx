import Link from "next/link";

export const metadata = {
  title: "Why XRPL — t54 XRPL AI Index",
  description: "Why XRPL is the institution-grade rail for agentic commerce.",
};

const PILLARS = [
  {
    title: "A regulated settlement asset, natively",
    body: "RLUSD is NYDFS-regulated, held in custody at BNY Mellon, with monthly third-party attestation by Deloitte — and it settles natively on XRPL. No bridge, no wrapper.",
  },
  {
    title: "Deterministic finality",
    body: "3–5 second settlement with an unambiguous outcome: tesSUCCESS or a clean expiry — never a stuck, pending mempool state. 14 years of ledger history with no rollbacks.",
  },
  {
    title: "No smart-contract attack surface",
    body: "Payments are native Payment transactions, not contract calls. The exploit class that drains DeFi contracts simply doesn't exist here.",
  },
  {
    title: "A no-custody facilitator",
    body: "The t54 facilitator verifies and submits a payer-signed transaction. Private keys never leave the user; the facilitator never takes custody of funds.",
  },
  {
    title: "Verifiable agent authority",
    body: "X402 Secure attaches a Verifiable Intent chain — a Know-Your-Agent credential, an owner-signed delegation with spending limits, and a per-payment agent signature — checked before settlement. It answers who authorized this agent, for how much, and whether this payment is in scope.",
  },
  {
    title: "Built on the winning standard",
    body: "XRPL is a supported chain in x402 — contributed by t54. We interoperate with emerging agent-payment standards rather than proposing a competing one.",
  },
];

export default function WhyXrplPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      <header className="animate-fade-up">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">Why XRPL for agentic commerce</h1>
        <p className="text-base text-[var(--text-secondary)] mt-3 leading-relaxed">
          When AI agents move money, the rail has to be safe and accountable by default. The differentiator isn&rsquo;t any single feature — it&rsquo;s the whole stack: a regulated asset, native finality, no contract risk, and verifiable agent authority, on one L1.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 stagger-children">
        {PILLARS.map((p) => (
          <div key={p.title} className="dashboard-panel bg-[var(--bg-surface)] border border-[var(--border)] p-5">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">{p.title}</h2>
            <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mt-2">{p.body}</p>
          </div>
        ))}
      </div>

      <div className="animate-fade-up dashboard-panel bg-[var(--bg-surface)] border border-[var(--border)] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-base font-semibold text-[var(--text-primary)]">Compliance &amp; security, in detail</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">Custody, attestation, and the Verifiable Intent model.</p>
        </div>
        <Link href="/why-xrpl/compliance" className="ui-control px-4 py-2 bg-[var(--brand-blue)] text-white font-medium text-sm shrink-0">
          Read more
        </Link>
      </div>

      <p className="text-xs text-[var(--text-muted)] animate-fade-up leading-relaxed">
        Note: RLUSD and USDC sit at the same regulatory tier (both NYDFS-regulated; OCC national trust-bank approvals are conditional and not yet operational for either). We anchor the institution-grade claim to the XRPL stack, not to a &ldquo;only regulated stablecoin&rdquo; argument.
      </p>
    </div>
  );
}
