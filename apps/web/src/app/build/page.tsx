import Link from "next/link";

export const metadata = {
  title: "Build — t54 XRPL AI Index",
  description: "Take your first payment from an AI agent on XRPL in under 30 minutes.",
};

function CodeBlock({ lines }: { lines: Array<{ t: string; c?: "cmd" | "ok" | "muted" }> }) {
  const color = (c?: string) =>
    c === "cmd" ? "text-[var(--brand-blue)]" : c === "ok" ? "text-[var(--success)]" : c === "muted" ? "text-[var(--text-muted)]" : "text-[var(--text-secondary)]";
  return (
    <pre className="dashboard-panel bg-[rgba(255,255,255,0.02)] border border-[var(--border)] p-4 overflow-x-auto text-[12px] font-mono leading-relaxed">
      {lines.map((l, i) => (
        <div key={i} className={color(l.c)}>{l.t}</div>
      ))}
    </pre>
  );
}

export default function BuildPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      <header className="animate-fade-up">
        <span className="inline-flex items-center gap-2 text-[11px] font-mono text-[var(--brand-blue)] bg-[rgba(0,140,255,0.08)] border border-[rgba(0,140,255,0.2)] px-2.5 py-1 rounded-md">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" /> first payment in under 30 minutes
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] mt-4">Build on the standard</h1>
        <p className="text-sm text-[var(--text-muted)] mt-2 max-w-2xl">
          x402 on XRPL uses a payer-signed Payment transaction, verified and settled by the t54 facilitator — no custody, no API keys. Pick TypeScript or Python and ship.
        </p>
      </header>

      <section className="animate-fade-up grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ animationDelay: "60ms" }}>
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">1 · Gate a resource (TypeScript)</h2>
          <CodeBlock
            lines={[
              { t: "$ npm i x402-xrpl express", c: "cmd" },
              { t: "import { requirePayment } from 'x402-xrpl/express';" },
              { t: "app.use(requirePayment({" },
              { t: "  path: '/ai-news', price: '0.02', asset: 'RLUSD'," },
              { t: "  payToAddress: 'r...', network: 'xrpl:0'," },
              { t: "  facilitatorUrl: 'https://xrpl-facilitator-mainnet.t54.ai'," },
              { t: "}));" },
            ]}
          />
        </div>
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">2 · Pay as an agent</h2>
          <CodeBlock
            lines={[
              { t: "import { x402Fetch } from 'x402-xrpl';", c: "muted" },
              { t: "const pay = x402Fetch({ wallet, network: 'xrpl:0' });" },
              { t: "const res = await pay('https://api.you.xyz/ai-news');" },
              { t: "→ 402 · xrpl · pay in RLUSD", c: "muted" },
              { t: "✓ settled · r…8f2 · 4.2s", c: "ok" },
              { t: "↳ your tx now appears in the Index", c: "muted" },
            ]}
          />
        </div>
      </section>

      <section className="animate-fade-up space-y-3" style={{ animationDelay: "120ms" }}>
        <h2 className="text-base font-semibold text-[var(--text-primary)]">Add institutional safety — Verifiable Intent</h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
          For agent commerce that has to answer &ldquo;who authorized this agent, for how much, and is this payment in scope?&rdquo;, attach an X402 Secure envelope. The facilitator checks it with Trustline and only settles if the decision allows it.
        </p>
        <CodeBlock
          lines={[
            { t: "// L1 Trustline credential → L2 owner delegation → L3 agent signature", c: "muted" },
            { t: "const provider = new RemoteIssuerProvider({" },
            { t: "  issueRequest: { allowedChains: ['xrpl'], allowedAssets: ['XRP']," },
            { t: "    spendingCeiling: '0.001', validitySeconds: 3600 }, ..." },
            { t: "});" },
            { t: "x402Fetch({ wallet, network: 'xrpl:0', verifiableIntentProvider: provider });" },
          ]}
        />
      </section>

      <section className="animate-fade-up grid grid-cols-1 sm:grid-cols-3 gap-3" style={{ animationDelay: "180ms" }}>
        {[
          { label: "x402-xrpl SDK", href: "https://github.com/t54-labs", note: "TypeScript + Python" },
          { label: "Facilitator docs", href: "https://xrpl-x402.t54.ai/docs/overview", note: "verify + settle" },
          { label: "XRPL agentic docs", href: "https://xrpl.org/docs/agents/getting-started-with-agentic-transactions", note: "official wallet + payments skills" },
        ].map((c) => (
          <a key={c.label} href={c.href} target="_blank" rel="noreferrer" className="dashboard-panel bg-[var(--bg-surface)] border border-[var(--border)] p-5 hover:border-[var(--border-hover)] transition-all">
            <p className="text-sm font-semibold text-[var(--text-primary)]">{c.label}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">{c.note}</p>
          </a>
        ))}
      </section>

      <div className="animate-fade-up flex items-center gap-3" style={{ animationDelay: "240ms" }}>
        <Link href="/resources" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Browse all resources &rarr;</Link>
      </div>
    </div>
  );
}
