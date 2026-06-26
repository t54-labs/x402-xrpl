import Link from "next/link";
import { BuildConsole, X402Flow } from "./BuildConsole";

export const metadata = {
  title: "Build",
  description: "Why and how to build x402 agentic payments on XRPL: gate a route, pay as an agent, and add Verifiable Intent — with the t54 facilitator.",
  alternates: { canonical: "/build" },
};

function PartLabel({ n, total, title }: { n: string; total: string; title: string }) {
  return (
    <div className="flex items-baseline gap-4">
      <span className="text-[11px] font-plek uppercase tracking-[0.24em] text-[var(--paper-faint)] shrink-0">
        {n} / {total}
      </span>
      <span className="h-px flex-1 bg-[var(--rule)]" />
      <span className="text-[11px] font-plek uppercase tracking-[0.24em] text-[var(--paper-mute)] shrink-0">{title}</span>
    </div>
  );
}

const WHY = [
  {
    spec: "Native DEX · auto-bridging",
    title: "One Payment, any asset",
    body: "An agent pays in XRP and the merchant lands RLUSD — atomically, routed through XRPL's in-protocol DEX. No swap, no router, no bridge, no half-finished state. General-purpose chains need a separate approve → swap → pay, each able to fail on its own.",
  },
  {
    spec: "XLS-70 / XLS-80",
    title: "Know-Your-Agent, in-protocol",
    body: "On-ledger Credentials + Permissioned Domains let a counterparty verify an issuer-signed attestation (KYC-verified, non-sanctioned) on the ledger — KYA enforced at settlement rather than in middleware, and without ever exposing the PII behind it.",
  },
  {
    spec: "DepositAuth · Freeze / Clawback",
    title: "Allowlisting and issuer recourse",
    body: "Receivers can accept only credentialed senders (DepositAuth / DepositPreauth); issuers of regulated tokens can Freeze or Claw back a disputed or compromised balance (XLS-39). Recourse without a custodian — while base-layer XRP stays final.",
  },
  {
    spec: "Escrow · Payment Channels",
    title: "Programmable settlement",
    body: "Lock pay-on-delivery Escrow that releases on a proof or a deadline, or stream per-call micropayments over a Payment Channel that settles once on-ledger. Conditional, high-frequency machine payments — with no escrow contract to write or audit.",
  },
  {
    spec: "Mastercard Verifiable Intent",
    title: "Authority is provable, before the money moves",
    body: "x402 Secure implements a Verifiable Intent chain — a Know-Your-Agent credential, an owner-signed delegation with spend limits, and a per-payment agent signature — checked against your risk policy before settlement. Verifiable Intent is Mastercard's framework (Agent Pay for Machines); Ripple and t54 Labs are named partners.",
  },
];

const FLOW = [
  {
    n: "01",
    title: "The agent requests a paid resource",
    body: "A normal HTTP request to your endpoint, with no payment attached. Nothing special on the wire yet — just a GET.",
  },
  {
    n: "02",
    title: "Your server answers 402",
    body: "x402 turns HTTP 402 into a real handshake. The PAYMENT-REQUIRED header carries the scheme (exact), the network (xrpl:0), the asset (RLUSD or XRP), the amount, your payTo address, and a one-time invoiceId.",
  },
  {
    n: "03",
    title: "The agent signs an XRPL Payment",
    body: "The agent builds and signs a Payment that binds that invoiceId (in Memos + InvoiceID), then retries the request with a PAYMENT-SIGNATURE header. The agent's signing key never leaves the agent.",
  },
  {
    n: "04",
    title: "The facilitator verifies and settles",
    body: "t54 validates the signed transaction — and, if present, the Verifiable Intent chain and risk policy — then submits it to XRPL. ~4s later your server returns 200 with the resource and a PAYMENT-RESPONSE carrying the settled tx hash.",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Install the SDK",
    body: "One package, TypeScript or Python. It ships the server middleware, the buyer client, and the Verifiable Intent helpers.",
    code: "npm i x402-xrpl  ·  pip install x402-xrpl",
  },
  {
    n: "2",
    title: "Gate a route on your server",
    body: "Wrap any route with requirePayment. Set the price, the asset (RLUSD needs its issuer; XRP is priced in drops), your payout address, and the facilitator URL. An unpaid request now returns 402 automatically — and your handler only runs once payment has settled.",
  },
  {
    n: "3",
    title: "Pay for it as an agent",
    body: "Give the buyer client a wallet and a network and call the URL like fetch. On a 402 it selects the requirement, signs the Payment, retries, and hands you back the response — the whole exchange in one await.",
  },
  {
    n: "4",
    title: "Add Verifiable Intent (recommended)",
    body: "For autonomous spend, attach a Verifiable Intent provider. It issues the L1→L2→L3 chain and binds spend limits; the facilitator checks the chain and your risk policy before it ever settles. Optional to start, the right default for production agents.",
  },
];

const REFS = [
  { label: "x402-xrpl SDK", href: "https://www.npmjs.com/package/x402-xrpl", note: "npm · PyPI · TypeScript + Python" },
  { label: "x402 Facilitator", href: "https://xrpl-x402.t54.ai", note: "hosted verify + settle · no custody" },
  { label: "x402 Secure — Verifiable Intent", href: "https://www.t54.ai/x402-secure", note: "KYA + delegation + risk gating" },
  { label: "XRPL agentic docs", href: "https://xrpl.org/docs/agents/getting-started-with-agentic-transactions", note: "official wallet + payments skills" },
];

export default function BuildPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
      <header className="animate-fade-up max-w-3xl">
        <span className="text-[10px] font-plek uppercase tracking-[0.28em] text-[var(--paper-mute)]">Build · x402 on XRPL</span>
        <h1 className="mt-6 text-5xl sm:text-6xl font-medium tracking-[-0.03em] leading-[1.0] text-[var(--paper)]">
          Build the agentic<br />economy on XRPL
        </h1>
        <p className="mt-6 text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl">
          x402 makes HTTP&nbsp;402 real: your server answers a request with a price, the agent signs an XRPL Payment,
          and the t54 facilitator verifies and settles it on-ledger in seconds — no custody, no API keys.
          Here&rsquo;s why XRPL is the rail for machine payments, and how to ship your first paid endpoint.
        </p>
      </header>

      {/* 01 — Why XRPL */}
      <section className="mt-20 animate-fade-up" style={{ animationDelay: "60ms" }}>
        <PartLabel n="01" total="04" title="Why XRPL" />
        <h2 className="mt-7 text-2xl sm:text-3xl font-medium tracking-tight text-[var(--paper)] max-w-2xl">
          What general-purpose chains can&rsquo;t give an agent — built into the protocol
        </h2>
        <p className="mt-4 text-[15px] text-[var(--text-secondary)] leading-relaxed max-w-2xl">
          &ldquo;Fast and cheap&rdquo; is table stakes. XRPL&rsquo;s edge for agent commerce is institutional and
          payment-native: identity, recourse, and conditional settlement live in the ledger, not in a contract you have to trust.
        </p>
        <div className="mt-10 space-y-px">
          {WHY.map((w) => (
            <div key={w.title} className="grid grid-cols-1 sm:grid-cols-[210px_1fr] gap-1.5 sm:gap-8 py-6 border-t border-[var(--rule)]">
              <div className="text-[11px] font-plek uppercase tracking-[0.16em] text-[var(--brand-blue)] sm:pt-1.5">{w.spec}</div>
              <div>
                <h3 className="text-base font-semibold text-[var(--text-primary)]">{w.title}</h3>
                <p className="mt-2 text-[14px] text-[var(--text-secondary)] leading-relaxed max-w-2xl">{w.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 02 — How it works */}
      <section className="mt-20 animate-fade-up" style={{ animationDelay: "60ms" }}>
        <PartLabel n="02" total="04" title="How it works" />
        <h2 className="mt-7 text-2xl sm:text-3xl font-medium tracking-tight text-[var(--paper)] max-w-2xl">
          One request, one signed Payment, one settlement
        </h2>
        <p className="mt-4 text-[15px] text-[var(--text-secondary)] leading-relaxed max-w-2xl">
          x402 is an HTTP-native payment handshake. Four steps, every one of them inspectable on the wire and on-ledger.
        </p>

        <div className="mt-8">
          <X402Flow />
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
          {FLOW.map((f) => (
            <div key={f.n} className="flex gap-4">
              <span className="font-plek text-[13px] text-[var(--brand-blue)] tracking-[0.1em] pt-0.5 shrink-0">{f.n}</span>
              <div>
                <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">{f.title}</h3>
                <p className="mt-1.5 text-[13.5px] text-[var(--text-secondary)] leading-relaxed">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 03 — Build it */}
      <section className="mt-20 animate-fade-up" style={{ animationDelay: "60ms" }}>
        <PartLabel n="03" total="04" title="Build it" />
        <h2 className="mt-7 text-2xl sm:text-3xl font-medium tracking-tight text-[var(--paper)] max-w-2xl">
          From zero to a paid endpoint — both sides of the call
        </h2>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-10 items-start">
          <div className="space-y-7">
            {STEPS.map((s) => (
              <div key={s.n} className="flex gap-4">
                <span className="flex items-center justify-center w-7 h-7 shrink-0 rounded-full border border-[var(--blue-28)] text-[12px] font-plek text-[var(--brand-blue)]">
                  {s.n}
                </span>
                <div>
                  <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">{s.title}</h3>
                  <p className="mt-1.5 text-[13.5px] text-[var(--text-secondary)] leading-relaxed">{s.body}</p>
                  {s.code ? (
                    <code className="mt-3 inline-block !rounded-md text-[11.5px] font-mono text-[var(--text-secondary)] bg-[rgba(255,255,255,0.04)] px-2.5 py-1 border border-[var(--border)]">
                      {s.code}
                    </code>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <div className="lg:sticky lg:top-24">
            <BuildConsole />
            <p className="mt-3 text-[12px] text-[var(--text-muted)] leading-relaxed">
              Server gates the route · Agent pays the 402 · Verifiable Intent binds who may spend and how much. Toggle TS / PY.
            </p>
          </div>
        </div>
      </section>

      {/* 04 — Reference */}
      <section className="mt-20 animate-fade-up" style={{ animationDelay: "60ms" }}>
        <PartLabel n="04" total="04" title="Reference" />
        <h2 className="mt-7 text-2xl sm:text-3xl font-medium tracking-tight text-[var(--paper)] max-w-2xl">
          Endpoints, assets, and where to go deeper
        </h2>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="dashboard-panel bg-[var(--bg-surface)] border border-[var(--border)] p-6">
            <h3 className="text-[11px] font-plek uppercase tracking-[0.18em] text-[var(--paper-mute)]">Hosted facilitator</h3>
            <dl className="mt-4 space-y-3 text-[13px]">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-[var(--text-muted)]">Mainnet · xrpl:0</dt>
                <dd className="font-mono text-[12px] text-[var(--text-secondary)] truncate">xrpl-facilitator-mainnet.t54.ai</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-[var(--text-muted)]">Testnet · xrpl:1</dt>
                <dd className="font-mono text-[12px] text-[var(--text-secondary)] truncate">xrpl-facilitator-testnet.t54.ai</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 pt-2 border-t border-[var(--rule)]">
                <dt className="text-[var(--text-muted)]">Endpoints</dt>
                <dd className="font-mono text-[12px] text-[var(--text-secondary)]">/verify · /settle · /supported</dd>
              </div>
            </dl>
          </div>

          <div className="dashboard-panel bg-[var(--bg-surface)] border border-[var(--border)] p-6">
            <h3 className="text-[11px] font-plek uppercase tracking-[0.18em] text-[var(--paper-mute)]">Assets &amp; amounts</h3>
            <dl className="mt-4 space-y-3 text-[13px]">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-[var(--text-muted)]">XRP</dt>
                <dd className="text-[var(--text-secondary)] text-right">priced in drops <span className="font-mono text-[12px] text-[var(--text-muted)]">(1e6 = 1 XRP)</span></dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-[var(--text-muted)]">RLUSD / IOU</dt>
                <dd className="text-[var(--text-secondary)] text-right">decimal value + <span className="font-mono text-[12px] text-[var(--text-muted)]">issuer</span></dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 pt-2 border-t border-[var(--rule)]">
                <dt className="text-[var(--text-muted)]">Networks</dt>
                <dd className="font-mono text-[12px] text-[var(--text-secondary)]">xrpl:0 · xrpl:1 · xrpl:2</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {REFS.map((c) => (
            <a key={c.label} href={c.href} target="_blank" rel="noreferrer" className="dashboard-panel bg-[var(--bg-surface)] border border-[var(--border)] p-5 hover:border-[var(--border-hover)] transition-all">
              <p className="text-sm font-semibold text-[var(--paper)] leading-snug">{c.label}</p>
              <p className="text-[11px] font-plek uppercase tracking-[0.14em] text-[var(--paper-mute)] mt-2">{c.note}</p>
            </a>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link href="/join/service" className="ui-control px-4 py-2 bg-[var(--brand-blue)] text-white font-medium text-sm">List your endpoint</Link>
          <Link href="/resources" className="text-sm text-[var(--text-secondary)] hover:text-[var(--paper)] transition-colors">Browse all resources &rarr;</Link>
          <Link href="/why-xrpl" className="text-sm text-[var(--text-secondary)] hover:text-[var(--paper)] transition-colors">The full case for XRPL &rarr;</Link>
        </div>
      </section>
    </div>
  );
}
