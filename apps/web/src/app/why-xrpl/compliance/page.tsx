export const metadata = {
  title: "Compliance & Security — t54 XRPL AI Index",
  description: "Custody, attestation, and the Verifiable Intent model behind XRPL agentic commerce.",
};

function ChainRule() {
  return (
    <svg width="200" height="18" viewBox="0 0 200 18" fill="none" aria-hidden="true" className="my-14 opacity-80">
      <line x1="16" y1="9" x2="84" y2="9" stroke="var(--rule)" strokeWidth="1.5" />
      <line x1="116" y1="9" x2="184" y2="9" stroke="var(--rule)" strokeWidth="1.5" />
      <circle cx="8" cy="9" r="4" fill="none" stroke="var(--brand-blue)" strokeWidth="1.5" />
      <circle cx="100" cy="9" r="4" fill="none" stroke="var(--brand-blue)" strokeWidth="1.5" />
      <circle cx="192" cy="9" r="4" fill="none" stroke="var(--brand-blue)" strokeWidth="1.5" />
    </svg>
  );
}

function Section({ n, label, title, children }: { n: string; label: string; title: string; children: React.ReactNode }) {
  return (
    <section className="animate-fade-up grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-10">
      <div className="lg:col-span-3">
        <div className="text-[10px] font-mono uppercase tracking-[0.28em] text-[var(--paper-faint)]">{n}</div>
        <div className="mt-1 text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--paper-mute)]">{label}</div>
      </div>
      <div className="lg:col-span-9">
        <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--paper)] leading-tight">{title}</h2>
        <div className="mt-4 space-y-3 text-[15px] text-[var(--text-secondary)] leading-relaxed max-w-2xl">{children}</div>
      </div>
    </section>
  );
}

// Static "sealed" L1-L2-L3 chain — the verifiable-intent motif.
function IntentChain() {
  const nodeX = [10, 130, 250];
  return (
    <svg viewBox="0 0 312 28" width="312" height="28" fill="none" className="max-w-full">
      <defs>
        <filter id="cmp-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {[0, 1].map((i) => (
        <line key={i} x1={nodeX[i] + 8} y1="14" x2={nodeX[i + 1] - 8} y2="14" stroke="var(--brand-blue)" strokeWidth="2" strokeLinecap="round" />
      ))}
      {nodeX.map((x) => (
        <circle key={x} cx={x} cy="14" r="5.5" fill="none" stroke="var(--brand-blue)" strokeWidth="2" />
      ))}
      <path d="M286 3 l10 3.8 v6 c0 5 -3.5 9.4 -10 11.2 c-6.5 -1.8 -10 -6.2 -10 -11.2 V6.8 z" fill="var(--brand-blue)" stroke="var(--brand-blue)" strokeWidth="2.4" filter="url(#cmp-glow)" />
    </svg>
  );
}

export default function CompliancePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
      <header className="animate-fade-up max-w-3xl">
        <span className="text-[10px] font-mono uppercase tracking-[0.28em] text-[var(--paper-mute)]">Why XRPL · Compliance</span>
        <h1 className="mt-6 text-5xl sm:text-6xl font-medium tracking-[-0.03em] leading-[1.0] text-[var(--paper)]">
          Trust, stated<br />precisely.
        </h1>
        <p className="mt-7 text-lg text-[var(--text-secondary)] leading-relaxed max-w-xl">
          What &ldquo;institution-grade&rdquo; actually rests on — with the limits called out, not glossed over.
        </p>
      </header>

      <ChainRule />

      <div className="space-y-16 sm:space-y-20">
        <Section n="01" label="Settlement asset" title="RLUSD — regulated, attested.">
          <p>RLUSD is issued under NYDFS regulation. Reserves are held in custody at BNY Mellon, with monthly third-party attestation by Deloitte.</p>
          <p className="text-[var(--paper-mute)] text-[14px]">
            Precision: the OCC national trust-bank approval is conditional and preliminary, and applies equally to RLUSD and USDC. Neither trust bank is operating yet. We do not claim RLUSD is &ldquo;the only regulated stablecoin.&rdquo;
          </p>
        </Section>

        <Section n="02" label="Settlement & custody" title="No custody. Final in seconds.">
          <p>The t54 facilitator is non-custodial: it verifies and submits a payer-signed XRPL Payment. Private keys never leave the user, and the facilitator never holds funds.</p>
          <p>Settlement is final in 3–5 seconds — tesSUCCESS or a clean expiry — with native primitives (escrow, multi-sig, DepositAuth) available for stronger controls.</p>
        </Section>

        <Section n="03" label="Verifiable intent" title="Authority, checked before the money moves.">
          <div className="py-2">
            <IntentChain />
          </div>
          <p>For agent commerce the hard question is authority. X402 Secure binds a three-link chain, checked before settlement:</p>
          <ul className="space-y-2.5 mt-2">
            <li><span className="font-mono text-[13px] text-[var(--brand-blue)]">L1 · TRUSTLINE</span> <span className="text-[var(--paper)]">credential</span> — a Know-Your-Agent credential issued by Trustline for the organization.</li>
            <li><span className="font-mono text-[13px] text-[var(--brand-blue)]">L2 · DELEGATION</span> <span className="text-[var(--paper)]">owner-signed</span> — a spending ceiling, allowed chains and assets, and a validity window.</li>
            <li><span className="font-mono text-[13px] text-[var(--brand-blue)]">L3 · AGENT</span> <span className="text-[var(--paper)]">action</span> — a per-payment signature from the agent itself.</li>
          </ul>
          <p>The facilitator calls X402 Secure, which checks the chain with Trustline and only allows settlement if the decision passes. If the owner hasn&rsquo;t approved a delegation, the SDK returns <code className="font-mono text-[13px] text-[var(--paper)] bg-[var(--ink-raised)] px-1.5 py-0.5 rounded">requires_confirmation</code> and does not sign. Credential issuance can run on your own Trustline issuer or via the T54 issuer broker.</p>
        </Section>

        <Section n="04" label="t54 controls" title="SOC 2, in progress.">
          <p>t54&rsquo;s SOC 2 program is underway; the report will be published here once complete. Until then we describe the rails as production-grade and document the specific controls above, rather than implying a certification we don&rsquo;t yet hold.</p>
        </Section>
      </div>
    </div>
  );
}
