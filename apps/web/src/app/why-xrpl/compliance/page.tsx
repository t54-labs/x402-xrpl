export const metadata = {
  title: "Compliance & Security — t54 XRPL AI Index",
  description: "Custody, attestation, and the Verifiable Intent model behind XRPL agentic commerce.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="dashboard-panel bg-[var(--bg-surface)] border border-[var(--border)] p-6">
      <h2 className="text-base font-semibold text-[var(--text-primary)]">{title}</h2>
      <div className="text-[13px] text-[var(--text-secondary)] leading-relaxed mt-3 space-y-2">{children}</div>
    </section>
  );
}

export default function CompliancePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <header className="animate-fade-up">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">Compliance &amp; security</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1 max-w-2xl">
          What &ldquo;institution-grade&rdquo; actually rests on — stated precisely, with the limits called out.
        </p>
      </header>

      <div className="space-y-3 stagger-children">
        <Section title="The settlement asset — RLUSD">
          <p>RLUSD is issued under NYDFS regulation. Reserves are held in custody at BNY Mellon, with monthly third-party attestation by Deloitte.</p>
          <p className="text-[var(--text-muted)]">Precision: OCC national trust-bank approval is conditional and preliminary — and applies equally to RLUSD and USDC. Neither trust bank is operating yet. We do not claim RLUSD is &ldquo;the only regulated stablecoin.&rdquo;</p>
        </Section>

        <Section title="Settlement & custody">
          <p>The t54 facilitator is non-custodial: it verifies and submits a payer-signed XRPL Payment. Private keys never leave the user, and the facilitator never holds funds. Settlement is final in 3–5 seconds, with native primitives (escrow, multi-sig, DepositAuth) available for stronger controls.</p>
        </Section>

        <Section title="Verifiable Intent (X402 Secure)">
          <p>For agent commerce, the hard question is authority. X402 Secure binds a three-link chain, checked before settlement:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><span className="text-[var(--text-primary)]">L1 — credential.</span> A Know-Your-Agent credential issued by Trustline for the organization.</li>
            <li><span className="text-[var(--text-primary)]">L2 — delegation.</span> An owner-signed delegation carrying a spending ceiling, allowed chains and assets, and a validity window.</li>
            <li><span className="text-[var(--text-primary)]">L3 — action.</span> A per-payment signature from the agent itself.</li>
          </ul>
          <p>The facilitator calls X402 Secure, which checks the chain with Trustline and only allows settlement if the decision passes. If the owner hasn&rsquo;t approved a delegation, the SDK returns <code className="text-[var(--text-secondary)]">requires_confirmation</code> and does not sign. Credential issuance can run on your own Trustline issuer or via the T54 issuer broker.</p>
        </Section>

        <Section title="t54 controls">
          <p>t54&rsquo;s SOC 2 program is in progress; we&rsquo;ll publish the report here once complete. Until then we describe the rails as production-grade and document the specific controls above rather than implying a certification we don&rsquo;t yet hold.</p>
        </Section>
      </div>
    </div>
  );
}
