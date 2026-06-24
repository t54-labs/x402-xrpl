import { PageHalftone } from "@/app/components/BrandDots";

export const metadata = {
  title: "Methodology — t54 XRPL AI Index",
  description: "How the XRPL AI Index measures the XRPL agentic economy.",
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
        <div className="text-[10px] font-plek uppercase tracking-[0.28em] text-[var(--paper-faint)]">{n}</div>
        <div className="mt-1 text-[11px] font-plek uppercase tracking-[0.2em] text-[var(--paper-mute)]">{label}</div>
      </div>
      <div className="lg:col-span-9">
        <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--paper)] leading-tight">{title}</h2>
        <div className="mt-4 space-y-3 text-[15px] text-[var(--text-secondary)] leading-relaxed max-w-2xl">{children}</div>
      </div>
    </section>
  );
}

export default function MethodologyPage() {
  return (
    <div className="relative isolate overflow-hidden max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
      <PageHalftone />
      <header className="animate-fade-up max-w-3xl">
        <span className="text-[10px] font-plek uppercase tracking-[0.28em] text-[var(--paper-mute)]">Index · Methodology</span>
        <h1 className="mt-6 text-5xl sm:text-6xl font-medium tracking-[-0.03em] leading-[1.0] text-[var(--paper)]">
          How we measure<br />the economy.
        </h1>
        <p className="mt-7 text-lg text-[var(--text-secondary)] leading-relaxed max-w-xl">
          The numbers on the Index, defined — and the limits we&rsquo;re honest about.
        </p>
      </header>

      <ChainRule />

      <div className="space-y-16 sm:space-y-20">
        <Section n="01" label="What counts" title="A settlement, not a transaction.">
          <p>An XRPL <code className="font-mono text-[13px] text-[var(--paper)] bg-[var(--ink-raised)] px-1.5 py-0.5 rounded">Payment</code> is counted when it carries a registered facilitator <code className="font-mono text-[13px] text-[var(--paper)] bg-[var(--ink-raised)] px-1.5 py-0.5 rounded">SourceTag</code> — the on-chain fingerprint an x402 facilitator stamps on every settlement (the t54 facilitator uses 804681468).</p>
        </Section>

        <Section n="02" label="Coverage" title="Multi-facilitator by design.">
          <p>The Index aggregates across every registered facilitator, not just t54&rsquo;s. Any facilitator can self-register its SourceTag, after which its settled payments are indexed and attributed to it — that&rsquo;s what makes it an ecosystem index rather than a single-product dashboard.</p>
        </Section>

        <Section n="03" label="Source" title="Our own ledger index.">
          <p>Metrics are computed from an independent XRPL ledger index maintained by t54 — not re-published from a third-party explorer. Volume is summed by asset from each detected settlement; active agents are distinct buyer addresses; facilitators are distinct registered SourceTags seen on-chain.</p>
        </Section>

        <Section n="04" label="By asset" title="No blended number, yet.">
          <p>Headline volume is reported per asset (XRP and RLUSD), not as a single blended USD figure. A blended headline needs a price-normalization layer (an XRP daily price + an RLUSD ≈ $1 assumption) and is deliberately deferred until that layer ships and its assumptions can be stated here.</p>
        </Section>

        <Section n="05" label="Honesty" title="A first-mover scoreboard.">
          <p>Agentic settlement on XRPL is early. We present it as a first-mover scoreboard with real, independently-indexed numbers and growth — never implying parity with larger stablecoin-settlement ecosystems. Figures shown in non-production environments may be illustrative seed data.</p>
        </Section>
      </div>
    </div>
  );
}
