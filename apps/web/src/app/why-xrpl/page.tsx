import Link from "next/link";

export const metadata = {
  title: "Why XRPL — t54 XRPL AI Index",
  description: "Why XRPL is the institution-grade rail for agentic commerce.",
};

const STANZAS = [
  {
    fig: "01",
    metric: "3–5s",
    unit: "to final",
    title: "Settle, then stop wondering.",
    body: "Every payment resolves to tesSUCCESS or a clean expiry — never a stuck, ambiguous pending state. Fourteen years of ledger history, with no rollbacks.",
  },
  {
    fig: "02",
    metric: "<$0.001",
    unit: "per settlement",
    title: "Small enough for machines.",
    body: "Fees are fixed and trivial, so a payment between two agents for a single API call is economically sane — not rounded away by overhead.",
  },
  {
    fig: "03",
    metric: "0",
    unit: "contract surface",
    title: "Nothing to exploit.",
    body: "Payments are native Payment transactions, not contract calls. The whole exploit class that drains DeFi contracts simply does not exist on this rail.",
  },
  {
    fig: "04",
    metric: "L1–L3",
    unit: "verifiable intent",
    title: "Authority is provable.",
    body: "X402 Secure binds a Know-Your-Agent credential, an owner-signed delegation with spend limits, and a per-payment agent signature — and checks the chain before the money moves.",
  },
];

function ChainRule() {
  return (
    <svg width="200" height="20" viewBox="0 0 200 20" fill="none" aria-hidden="true" className="my-20 opacity-80">
      <line x1="16" y1="10" x2="84" y2="10" stroke="var(--rule)" strokeWidth="1.5" />
      <line x1="116" y1="10" x2="184" y2="10" stroke="var(--rule)" strokeWidth="1.5" />
      <circle cx="8" cy="10" r="4" fill="none" stroke="var(--brand-blue)" strokeWidth="1.5" />
      <circle cx="100" cy="10" r="4" fill="none" stroke="var(--brand-blue)" strokeWidth="1.5" />
      <circle cx="192" cy="10" r="4" fill="none" stroke="var(--brand-blue)" strokeWidth="1.5" />
    </svg>
  );
}

export default function WhyXrplPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
      <header className="animate-fade-up max-w-4xl">
        <span className="text-[10px] font-mono uppercase tracking-[0.28em] text-[var(--paper-mute)]">Why XRPL</span>
        <h1 className="mt-6 text-5xl sm:text-7xl font-medium tracking-[-0.04em] leading-[0.98] text-[var(--paper)]">
          Verify before<br />you <span className="text-[var(--t54-coral)]">settle</span>.
        </h1>
        <p className="mt-8 text-lg text-[var(--text-secondary)] leading-relaxed max-w-xl">
          When an agent moves money on your behalf, the rail has to be accountable by default. The edge isn&rsquo;t one feature — it&rsquo;s the whole stack on one L1.
        </p>
      </header>

      <ChainRule />

      <div className="space-y-24 sm:space-y-32">
        {STANZAS.map((s, i) => (
          <section
            key={s.fig}
            className={`animate-fade-up grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-end ${i % 2 ? "lg:text-right" : ""}`}
          >
            <div className={`lg:col-span-7 ${i % 2 ? "lg:order-2 lg:col-start-6" : ""}`}>
              <div className="flex items-baseline gap-3" style={{ justifyContent: i % 2 ? "flex-end" : "flex-start" }}>
                <span className="font-mono tabular-nums text-6xl sm:text-8xl leading-[0.9] text-[var(--paper)] tracking-tight">{s.metric}</span>
                <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-[var(--paper-mute)] pb-2">{s.unit}</span>
              </div>
            </div>
            <div className={`lg:col-span-5 ${i % 2 ? "lg:order-1" : ""}`}>
              <span className="text-[10px] font-mono uppercase tracking-[0.28em] text-[var(--paper-faint)]">Fig {s.fig}</span>
              <h2 className="mt-2 text-2xl font-medium tracking-tight text-[var(--paper)]">{s.title}</h2>
              <p className="mt-3 text-[15px] text-[var(--text-secondary)] leading-relaxed">{s.body}</p>
            </div>
          </section>
        ))}
      </div>

      <ChainRule />

      <section className="animate-fade-up max-w-3xl">
        <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-[var(--paper)] leading-tight">
          The differentiator is the stack, not the coin.
        </h2>
        <p className="mt-5 text-[15px] text-[var(--text-secondary)] leading-relaxed">
          Regulated RLUSD (NYDFS, BNY Mellon custody, monthly Deloitte attestation) settles natively here, alongside XRPL&rsquo;s own institutional primitives — escrow, multi-sig, DepositAuth, credentials — and the t54 facilitator never takes custody. RLUSD and USDC sit at the same regulatory tier; we anchor the claim to the rail, not to a &ldquo;only regulated stablecoin&rdquo; argument.
        </p>
        <div className="mt-8 flex items-center gap-5">
          <Link href="/why-xrpl/compliance" className="ui-control px-5 py-2.5 bg-[var(--brand-blue)] text-white font-medium text-sm">
            Compliance &amp; security
          </Link>
          <Link href="/build" className="text-sm text-[var(--text-secondary)] hover:text-[var(--paper)] transition-colors">Start building &rarr;</Link>
        </div>
      </section>
    </div>
  );
}
