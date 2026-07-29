import type { Metadata } from "next";
import Link from "@/app/components/LocaleLink";
import { isLocale, type Locale } from "@/app/lib/i18n";
import { WHY_XRPL_KO } from "./copy.ko";

type Props = { params: Promise<{ locale: string }> };

async function resolveLocale({ params }: Props): Promise<Locale> {
  const { locale } = await params;
  return isLocale(locale) ? locale : "en";
}

const META_EN = {
  title: "Why XRPL",
  description:
    "The institution-grade, payment-native settlement and compliance stack that makes XRPL the rail for agent commerce — identity, recourse, and programmable settlement built into the protocol.",
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const locale = await resolveLocale(props);
  const ko = WHY_XRPL_KO.strings;
  return {
    title: locale === "ko" ? ko.meta_title : META_EN.title,
    description: locale === "ko" ? ko.meta_description : META_EN.description,
    alternates: {
      canonical: locale === "en" ? "/why-xrpl" : `/${locale}/why-xrpl`,
      languages: { en: "/why-xrpl", ko: "/ko/why-xrpl" },
    },
  };
}

type Feature = { spec: string; title: string; why: string; body: string };
type Group = { n: string; label: string; items: readonly Feature[] };

const GROUPS: Group[] = [
  {
    n: "01",
    label: "Native multi-asset settlement",
    items: [
      {
        spec: "Native DEX · auto-bridging",
        title: "One Payment, any asset",
        why: "An agent pays in XRP and the merchant lands RLUSD — in a single transaction. No swap, no router, no bridge, no half-finished state.",
        body: "A native Payment caps the agent's spend with SendMax and guarantees the merchant's delivered amount, while pathfinding and XRP auto-bridging route through XRPL's in-protocol order book (live since 2012) atomically. General-purpose chains stitch together a separate approve, swap, and pay — each of which can partially fail.",
      },
      {
        spec: "XLS-30 · AMM",
        title: "Best price, no venue to pick",
        why: "Every agent payment auto-routes across the pool and the order book in the same call — the agent never chooses a venue.",
        body: "XLS-30 makes the AMM a first-class ledger object fused with the central limit order book, so one Payment optimizes across the pool, the open offers, or both. On other chains the AMM is a separate deployed contract an agent must integrate with and route to by hand.",
      },
    ],
  },
  {
    n: "02",
    label: "Identity & permissioning, in-protocol",
    items: [
      {
        spec: "XLS-70 · XLS-80",
        title: "Know-Your-Agent is a primitive",
        why: "Counterparties verify an issuer-signed attestation on-ledger — without ever seeing the PII behind it.",
        body: "On-ledger Credentials let a trusted issuer attest that an agent's account is KYC-verified or non-sanctioned, keyed to its XRPL address; Permissioned Domains turn a set of {issuer, credential} pairs into a reusable allowlist. Compliance is expressed declaratively on the chain — not buried in application logic.",
      },
      {
        spec: "DepositAuth · DepositPreauth",
        title: "Refuse everything but the vetted",
        why: "A receiving agent can reject every deposit except from senders carrying the right issuer-signed credentials.",
        body: "DepositAuth blocks unsolicited inbound payments by default; DepositPreauth allowlists specific accounts — or, via a credential set, any account holding the required attestation. You allowlist a credential type once instead of enumerating every counterparty, and it is enforced on the payment path itself.",
      },
    ],
  },
  {
    n: "03",
    label: "Control & recourse",
    items: [
      {
        spec: "XLS-39 · Freeze / Clawback",
        title: "Recourse, without a custodian",
        why: "If an agent account is compromised, sanctioned, or disputed, the token issuer can pause or recover funds on-ledger.",
        body: "Base-layer XRP payments are final and irreversible — but regulated issued tokens carry deliberate, issuer-level reversibility: Freeze immobilizes a balance, Clawback recovers distributed tokens. That asymmetry is the honest dispute-handling story for institutional money, not a blanket claim of “no chargebacks.”",
      },
      {
        spec: "SignerListSet · multi-sig",
        title: "The agent signs; the owner governs",
        why: "An agent holds a signing key but can't move funds alone — the owner or a policy service co-signs by quorum.",
        body: "A weighted SignerList (up to 32 members) with a quorum encodes human-in-the-loop approval, m-of-n treasury control, and key rotation — all without changing the account address. The owner can always override, and the agent's key is never the single point of failure.",
      },
    ],
  },
  {
    n: "04",
    label: "Programmable settlement",
    items: [
      {
        spec: "Payment Channels",
        title: "Pay per call, at signature speed",
        why: "Metered, per-request billing between machines without a ledger transaction for every call.",
        body: "An owner opens a channel to an API or agent provider and pays each inference call or data chunk with an off-ledger signed claim; only the latest cumulative claim ever settles on-ledger, and a required settle-delay guarantees the provider a window to claim. The canonical primitive for sub-cent, high-frequency machine payments.",
      },
      {
        spec: "Escrow · Token Escrow",
        title: "Pay on delivery, provably",
        why: "An agent locks payment that releases only on a cryptographic proof or a deadline.",
        body: "Escrow releases on a PREIMAGE-SHA-256 fulfillment or a finish-after time, with an automatic refund path so funds are never stranded; Token Escrow extends this to RLUSD-style trust-line tokens. Trustless settlement between machine counterparties — with no escrow contract to write or audit.",
      },
    ],
  },
];

// t54 dot divider — solid dots in a deliberate rhythm (two tight pairs flanking a
// coral center), no connecting lines. Matches the home page's dot language.
function ChainRule() {
  return (
    <div className="my-16 sm:my-20 flex justify-center" aria-hidden="true">
      <svg width="72" height="8" viewBox="0 0 72 8" fill="none">
        <circle cx="14" cy="4" r="2.4" fill="var(--paper-mute)" />
        <circle cx="23" cy="4" r="2.4" fill="var(--paper-mute)" />
        <circle cx="36" cy="4" r="2.9" fill="var(--t54-coral)" />
        <circle cx="49" cy="4" r="2.4" fill="var(--paper-mute)" />
        <circle cx="58" cy="4" r="2.4" fill="var(--paper-mute)" />
      </svg>
    </div>
  );
}

function KoAccentH1({ text, accent }: { text: string; accent: string }) {
  const i = text.indexOf(accent);
  if (i === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <span className="text-[var(--t54-coral)]">{accent}</span>
      {text.slice(i + accent.length)}
    </>
  );
}

export default async function WhyXrplPage(props: Props) {
  const locale = await resolveLocale(props);
  const isKo = locale === "ko";
  const ko = WHY_XRPL_KO.strings;
  const groups: Group[] = isKo
    ? GROUPS.map((g, i) => ({ ...g, label: WHY_XRPL_KO.groups[i]?.label ?? g.label, items: WHY_XRPL_KO.groups[i]?.items ?? g.items }))
    : GROUPS;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
      <header className="animate-fade-up max-w-3xl">
        <span className="text-[10px] font-plek uppercase tracking-[0.28em] text-[var(--paper-mute)]">
          {isKo ? ko.kicker : "Why XRPL"}
        </span>
        <h1 className="mt-6 text-5xl sm:text-6xl font-medium tracking-[-0.03em] leading-[1.0] text-[var(--paper)]">
          {isKo ? (
            <KoAccentH1 text={ko.h1} accent={ko.h1_accent} />
          ) : (
            <>
              The rail was built<br />for <span className="text-[var(--t54-coral)]">payments</span>
            </>
          )}
        </h1>
        <p className="mt-6 text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl">
          {isKo ? (
            ko.intro
          ) : (
            <>
              &ldquo;Fast and final&rdquo; is table stakes — every L1 claims it. XRPL&rsquo;s edge is what general-purpose chains
              don&rsquo;t have in-protocol: an institution-grade settlement and compliance stack on one 14-year ledger, where
              identity, recourse, and conditional payment are built into the chain — not bolted on in smart contracts an
              agent has to trust and you have to audit.
            </>
          )}
        </p>
      </header>

      <ChainRule />

      <div className="space-y-16 sm:space-y-20">
        {groups.map((g) => (
          <section key={g.n} className="animate-fade-up">
            <div className="flex items-baseline gap-4">
              <span className="text-[11px] font-plek uppercase tracking-[0.24em] text-[var(--paper-faint)] shrink-0">{g.n}</span>
              <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-[var(--paper)]">{g.label}</h2>
              <span className="h-px flex-1 bg-[var(--rule)]" />
            </div>
            <div className="mt-7 grid grid-cols-1 lg:grid-cols-2 gap-3">
              {g.items.map((f) => (
                <div key={f.title} className="dashboard-panel bg-[var(--bg-surface)] border border-[var(--border)] p-6 sm:p-7">
                  <span className="text-[10px] font-plek uppercase tracking-[0.18em] text-[var(--brand-blue)]">{f.spec}</span>
                  <h3 className="mt-3 text-lg font-semibold text-[var(--text-primary)] tracking-tight">{f.title}</h3>
                  <p className="mt-2.5 text-[14.5px] text-[var(--paper)] leading-relaxed">{f.why}</p>
                  <p className="mt-2.5 text-[13.5px] text-[var(--text-secondary)] leading-relaxed">{f.body}</p>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Mastercard Verifiable Intent — the agent-authority layer */}
        <section className="animate-fade-up">
          <div className="flex items-baseline gap-4">
            <span className="text-[11px] font-plek uppercase tracking-[0.24em] text-[var(--paper-faint)] shrink-0">05</span>
            <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-[var(--paper)]">
              {isKo ? ko.section_05_h2 : "Verifiable Intent"}
            </h2>
            <span className="h-px flex-1 bg-[var(--rule)]" />
          </div>
          <div className="mt-7 dashboard-panel bg-[var(--bg-surface)] border border-[var(--border)] p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logos/mastercard.svg" alt="Mastercard" className="h-7 w-auto" />
              <span className="text-[11px] font-plek uppercase tracking-[0.18em] text-[var(--paper-mute)]">Mastercard · Agent Pay for Machines</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-medium tracking-tight text-[var(--paper)]">
              {isKo ? ko.vi_h3 : "Authority is provable, before the money moves"}
            </h3>
            {isKo ? (
              <>
                <p className="mt-4 text-[15px] text-[var(--text-secondary)] leading-relaxed max-w-3xl">{ko.vi_p1}</p>
                <p className="mt-4 text-[15px] text-[var(--text-secondary)] leading-relaxed max-w-3xl">{ko.vi_p2}</p>
              </>
            ) : (
              <>
                <p className="mt-4 text-[15px] text-[var(--text-secondary)] leading-relaxed max-w-3xl">
                  <span className="text-[var(--paper)]">Verifiable Intent</span> is Mastercard&rsquo;s framework for credentialed,
                  consent-bound agent payments — introduced with Agent Pay for Machines (June 2026), co-developed with Google
                  to work alongside Google&rsquo;s Agent Payments Protocol (AP2), and contributed into the FIDO Alliance for
                  standardization.
                </p>
                <p className="mt-4 text-[15px] text-[var(--text-secondary)] leading-relaxed max-w-3xl">
                  t54&rsquo;s x402 Secure implements a Verifiable Intent chain on XRPL — a Know-Your-Agent credential
                  (L1), an owner-signed delegation with spend limits (L2), and a per-payment agent signature (L3) — and the
                  facilitator checks that chain against your risk policy <em>before</em> a payment settles. Authority isn&rsquo;t
                  asserted in a log after the fact; it&rsquo;s proven on the payment path.
                </p>
              </>
            )}
          </div>
        </section>
      </div>

      <ChainRule />

      <section className="animate-fade-up max-w-3xl">
        <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-[var(--paper)] leading-tight">
          {isKo ? ko.closing_h2 : "The differentiator is the stack, not the coin"}
        </h2>
        <p className="mt-5 text-[15px] text-[var(--text-secondary)] leading-relaxed">
          {isKo ? (
            ko.closing_p
          ) : (
            <>
              Everything an agent needs to transact under enforceable rules is in the protocol: identity, allowlisting,
              issuer recourse, conditional settlement, multi-asset payment — plus native sub-account routing (one facilitator
              address fans out to a whole agent fleet via destination tags) and a burned, non-auctioned fee model with no gas
              war or MEV to reason about. RLUSD and XRP settle on it; the t54 facilitator never takes custody.
            </>
          )}
        </p>
        <div className="mt-8 flex items-center gap-5">
          <Link href="/build" className="ui-control px-5 py-2.5 bg-[var(--brand-blue)] text-white font-medium text-sm">
            {isKo ? ko.cta_build : "Start building"}
          </Link>
          <Link href="/resources" className="text-sm text-[var(--text-secondary)] hover:text-[var(--paper)] transition-colors">
            {isKo ? ko.cta_toolkit.replace(/\s*→\s*$/, "") : "Browse the toolkit"} &rarr;
          </Link>
        </div>
        <p className="mt-10 text-[11px] text-[var(--text-muted)] leading-relaxed max-w-2xl">
          {isKo ? (
            ko.footnote_mastercard
          ) : (
            <>
              Mastercard, Mastercard Agent Pay, Agent Pay for Machines and Verifiable Intent are trademarks of Mastercard
              International Incorporated. References reflect publicly announced partner relationships and do not imply
              endorsement or a formal or exclusive partnership beyond the named-partner role in Agent Pay for Machines.
            </>
          )}
        </p>
      </section>
    </div>
  );
}
