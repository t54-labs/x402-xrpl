import Link from "next/link";
import { BuildConsole } from "./BuildConsole";

export const metadata = {
  title: "Build — t54 XRPL AI Index",
  description: "Take your first payment from an AI agent on XRPL in under 30 minutes.",
};

export default function BuildPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
      <header className="animate-fade-up max-w-3xl">
        <span className="text-[10px] font-mono uppercase tracking-[0.28em] text-[var(--paper-mute)]">Build · first payment under 30 min</span>
        <h1 className="mt-6 text-5xl sm:text-6xl font-medium tracking-[-0.03em] leading-[1.0] text-[var(--paper)]">
          Watch it settle.<br />Then ship it.
        </h1>
        <p className="mt-6 text-[15px] text-[var(--text-secondary)] leading-relaxed max-w-xl">
          x402 on XRPL is a payer-signed Payment, verified and settled by the t54 facilitator — no custody, no API keys. Pick a side and run.
        </p>
      </header>

      <div className="mt-12 animate-fade-up" style={{ animationDelay: "60ms" }}>
        <BuildConsole />
      </div>

      <section className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-up" style={{ animationDelay: "120ms" }}>
        {[
          { label: "x402-xrpl SDK", href: "https://github.com/t54-labs", note: "TypeScript + Python" },
          { label: "Facilitator docs", href: "https://xrpl-x402.t54.ai/docs/overview", note: "verify + settle" },
          { label: "XRPL agentic docs", href: "https://xrpl.org/docs/agents/getting-started-with-agentic-transactions", note: "official wallet + payments skills" },
        ].map((c) => (
          <a key={c.label} href={c.href} target="_blank" rel="noreferrer" className="dashboard-panel bg-[var(--bg-surface)] border border-[var(--border)] p-5 hover:border-[var(--border-hover)] transition-all">
            <p className="text-sm font-semibold text-[var(--paper)]">{c.label}</p>
            <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-[var(--paper-mute)] mt-1.5">{c.note}</p>
          </a>
        ))}
      </section>

      <div className="mt-10 animate-fade-up">
        <Link href="/resources" className="text-sm text-[var(--text-secondary)] hover:text-[var(--paper)] transition-colors">Browse all resources &rarr;</Link>
      </div>
    </div>
  );
}
