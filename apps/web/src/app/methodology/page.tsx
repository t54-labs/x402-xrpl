export const metadata = {
  title: "Methodology — t54 XRPL AI Index",
  description: "How the XRPL AI Index measures the XRPL agentic economy.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="dashboard-panel bg-[var(--bg-surface)] border border-[var(--border)] p-6">
      <h2 className="text-base font-semibold text-[var(--text-primary)]">{title}</h2>
      <div className="text-[13px] text-[var(--text-secondary)] leading-relaxed mt-3 space-y-2">{children}</div>
    </section>
  );
}

export default function MethodologyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <header className="animate-fade-up">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">Methodology</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1 max-w-2xl">
          How we measure the XRPL agentic economy — and the limits we&rsquo;re honest about.
        </p>
      </header>

      <div className="space-y-3 stagger-children">
        <Section title="What counts as an agentic payment">
          <p>An XRPL <code className="text-[var(--text-secondary)]">Payment</code> is counted when it carries a registered facilitator <code className="text-[var(--text-secondary)]">SourceTag</code> — the on-chain fingerprint an x402 facilitator stamps on every settlement (the t54 facilitator uses <code className="text-[var(--text-secondary)]">804681468</code>).</p>
        </Section>

        <Section title="Multi-facilitator by design">
          <p>The Index aggregates across <em>every</em> registered facilitator, not just t54&rsquo;s. Any facilitator can self-register its SourceTag, after which its settled payments are indexed and attributed to it. This is what makes it an ecosystem index rather than a single-product dashboard.</p>
        </Section>

        <Section title="Data source">
          <p>Metrics are computed from an independent XRPL ledger index maintained by t54 — not re-published from a third-party explorer. Volume is summed by asset from the settled <code className="text-[var(--text-secondary)]">amount</code> of each detected payment; active agents are distinct buyer addresses; facilitators are distinct registered SourceTags observed on-chain.</p>
        </Section>

        <Section title="By asset, not blended">
          <p>Headline volume is reported per asset (XRP and RLUSD) rather than as a single blended USD figure. A blended USD headline requires a price-normalization layer (XRP daily price + an RLUSD ≈ $1 assumption) and is deliberately deferred until that layer ships and its assumptions can be stated here.</p>
        </Section>

        <Section title="Honesty about scale">
          <p>Agentic settlement on XRPL is early. We present it as a first-mover scoreboard with real, independently-indexed numbers and growth — never implying parity with larger stablecoin-settlement ecosystems. Figures shown in non-production environments may be illustrative seed data.</p>
        </Section>
      </div>
    </div>
  );
}
