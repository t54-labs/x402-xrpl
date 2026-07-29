import type { Metadata } from "next";
import Link from "@/app/components/LocaleLink";
import { ResourceLogo } from "@/app/components/ResourceLogo";
import { isLocale, type Locale } from "@/app/lib/i18n";
import { RESOURCES_KO } from "./copy.ko";

type Props = { params: Promise<{ locale: string }> };

async function resolveLocale({ params }: Props): Promise<Locale> {
  const { locale } = await params;
  return isLocale(locale) ? locale : "en";
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const locale = await resolveLocale(props);
  return {
    title: "Resources",
    description:
      "Developer tools, SDKs, docs and infrastructure for building x402 agent payments on the XRP Ledger.",
    alternates: {
      canonical: locale === "en" ? "/resources" : `/${locale}/resources`,
      languages: { en: "/resources", ko: "/ko/resources" },
    },
  };
}

type Resource = {
  name: string;
  description: string;
  href: string;
  tag: string;
  maturity?: "live" | "beta" | "external" | "unverified";
  install?: string;
  logo?: string; // optional explicit logo (overrides the favicon derived from href)
};

type Group = { title: string; blurb: string; items: Resource[] };

const GROUPS: Group[] = [
  {
    title: "Developer tools & SDKs",
    blurb: "Everything you need to take a payment from an AI agent on XRPL — first-party from t54, plus the official XRPL toolkit.",
    items: [
      { name: "x402-xrpl — TypeScript SDK", description: "Express middleware (requirePayment) + x402Fetch buyer client + currency helpers + Verifiable Intent.", href: "https://www.npmjs.com/package/x402-xrpl", tag: "SDK", maturity: "live", install: "npm i x402-xrpl" },
      { name: "x402-xrpl — Python SDK", description: "FastAPI/Starlette helpers + presigned-payment client, mirroring the TS ergonomics.", href: "https://pypi.org/project/x402-xrpl/", tag: "SDK", maturity: "live", install: "pip install x402-xrpl" },
      { name: "t54 x402 Facilitator", description: "Hosted verify + settle for XRPL presigned payments. No custody, no API keys. Mainnet + testnet.", href: "https://xrpl-x402.t54.ai", tag: "Facilitator", maturity: "live" },
      { name: "x402 Secure — Verifiable Intent", description: "Know-Your-Agent credential + owner→agent delegation + per-payment risk gating, enforced before settlement (L1–L3).", href: "https://www.t54.ai/x402-secure", tag: "Security", maturity: "live" },
      { name: "Verifiable Intent", description: "Open specification for cryptographic agent authorization in commerce — tamper-evident delegation chains that bind AI agent actions to human-approved scope.", href: "https://verifiableintent.dev/", tag: "Spec", maturity: "external" },
      { name: "Virtuals — Agent Commerce Protocol (ACP)", description: "Cross-agent commerce standard from Virtuals for how agents discover, contract, and settle with each other — live on Base today, with XRPL support coming soon.", href: "https://os.virtuals.io/acp/overview", tag: "Protocol", maturity: "external", logo: "/logos/virtuals.svg" },
      { name: "RLUSD CLI", description: "Multi-chain RLUSD CLI for XRP Ledger and Ethereum (+ L2s): trust lines and payments, native XRPL DEX & AMM trading, Uniswap and Aave on EVM, Wormhole bridging, encrypted wallets, x402 paid requests, and JSON output.", href: "https://github.com/t54-labs/rlusd-cli", tag: "CLI", maturity: "live" },
      { name: "XRPL CLI — xrpl-up", description: "Ripple's CLI for XRPL local dev & scripting — spin up a local sandbox with pre-funded accounts, run scripts, manage snapshots, and hit testnet/devnet, with a Claude Code plugin.", href: "https://github.com/ripple/xrpl-up", tag: "CLI", maturity: "external", install: "npm i -g xrpl-up" },
      { name: "RLUSD Skills", description: "Claude / MCP agent skills wrapping the RLUSD CLI, with per-transaction spend caps.", href: "https://github.com/t54-labs/rlusd-skills", tag: "Agent skills", maturity: "live" },
      { name: "ClawCredit", description: "Agent-native credit, underwritten by t54's risk engine.", href: "https://www.claw.credit", tag: "Credit", maturity: "beta" },
      { name: "XRPL agentic-transactions docs", description: "Official XRPL guide for building AI agents: Agent Wallet Skill, Payments Skill, security model.", href: "https://xrpl.org/docs/agents/getting-started-with-agentic-transactions", tag: "Official docs", maturity: "external" },
      { name: "XRPL Docs MCP Server", description: "Official MCP server that gives agents grounded access to the XRPL documentation.", href: "https://xrpl.org/resources/dev-tools/ai-tools", tag: "MCP", maturity: "external" },
      { name: "XRPL Commons — xrpl-dev-skills", description: "Community-maintained agent skills for XRPL development.", href: "https://github.com/XRPL-Commons/xrpl-dev-skills", tag: "Agent skills", maturity: "external" },
    ],
  },
  {
    title: "Ship faster",
    blurb: "Programs and accelerators to get an XRPL-AI project off the ground.",
    items: [
      { name: "XRPL Commons — Aquarium & HAKS", description: "Residency and hackathons, including an AI & Blockchain track.", href: "https://www.xrpl-commons.org/the-aquarium", tag: "Accelerator", maturity: "external" },
      { name: "Tenity — XRPL Accelerator", description: "Cohort-based acceleration for XRPL builders.", href: "https://www.tenity.com/program/sfiip-2026/", tag: "Accelerator", maturity: "external" },
      { name: "Brinc — XRPL Hong Kong Accelerator", description: "Hong Kong accelerator program for XRPL startups.", href: "https://brinc.io/xrpl-program", tag: "Accelerator", maturity: "external" },
      { name: "XRPL Grants", description: "Funding for open-source projects building on the XRP Ledger.", href: "https://xrplgrants.org", tag: "Grants", maturity: "external" },
      { name: "Ripple Swell (formerly Apex)", description: "Ripple's flagship summit — now folds in the XRPL developer programming previously run as Apex.", href: "https://swell.ripple.com", tag: "Program", maturity: "external" },
    ],
  },
];

function MaturityBadge({ maturity }: { maturity?: Resource["maturity"] }) {
  if (!maturity) return null;
  const styles: Record<string, string> = {
    live: "text-emerald-400 bg-emerald-500/8 border-emerald-500/15",
    beta: "text-amber-400 bg-amber-500/8 border-amber-500/15",
    external: "text-[var(--text-muted)] bg-[rgba(255,255,255,0.04)] border-[var(--border)]",
    unverified: "text-[var(--text-muted)] bg-[rgba(255,255,255,0.04)] border-[var(--border)]",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-medium border ${styles[maturity]}`}>
      {maturity}
    </span>
  );
}

/** Merge translated titles/blurbs/descriptions (matched by resource name) into the canonical groups. */
function localizedGroups(locale: Locale): Group[] {
  if (locale !== "ko") return GROUPS;
  return GROUPS.map((g, gi) => {
    const kg = RESOURCES_KO.groups[gi];
    if (!kg) return g;
    const byName = new Map<string, string>(kg.items.map((it) => [it.name, it.description]));
    return {
      ...g,
      title: kg.title ?? g.title,
      blurb: kg.blurb ?? g.blurb,
      items: g.items.map((r) => ({ ...r, description: byName.get(r.name) ?? r.description })),
    };
  });
}

/** Render the Korean intro, linkifying the Directory / FAQ mentions in place. */
function KoIntro({ text }: { text: string }) {
  const parts = text.split(/(디렉터리|엔지니어링 FAQ)/);
  return (
    <>
      {parts.map((part, i) =>
        part === "디렉터리" ? (
          <Link key={i} href="/directory" className="text-[var(--brand-blue)] hover:underline">{part}</Link>
        ) : part === "엔지니어링 FAQ" ? (
          <Link key={i} href="/faq" className="text-[var(--brand-blue)] hover:underline">{part}</Link>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export default async function ResourcesPage(props: Props) {
  const locale = await resolveLocale(props);
  const isKo = locale === "ko";
  const t = RESOURCES_KO.strings;
  const groups = localizedGroups(locale);
  const [koH1a, koH1b] = (t.h1 ?? "").split("\n");
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">

      <header className="animate-fade-up max-w-3xl">
        <span className="text-[10px] font-plek uppercase tracking-[0.28em] text-[var(--paper-mute)]">{isKo ? t.kicker : "Resources"}</span>
        <h1 className="mt-5 text-4xl sm:text-5xl font-medium tracking-[-0.03em] leading-[1.02] text-[var(--paper)]">
          {isKo ? (<>{koH1a}{koH1b ? (<><br />{koH1b}</>) : null}</>) : (<>The toolkit for<br />building on XRPL</>)}
        </h1>
        <p className="mt-5 text-[15px] text-[var(--text-secondary)] leading-relaxed max-w-xl">
          {isKo ? (
            <KoIntro text={t.intro} />
          ) : (
            <>
              What developers build with, and what helps you ship. Looking for live services agents can consume? See the{" "}
              <Link href="/directory" className="text-[var(--brand-blue)] hover:underline">Directory</Link>. Deep technical
              questions — custody, wallets, operations? The{" "}
              <Link href="/faq" className="text-[var(--brand-blue)] hover:underline">Engineering FAQ</Link> covers them.
            </>
          )}
        </p>
      </header>

      {groups.map((group, gi) => (
        <section key={group.title} className="animate-fade-up space-y-4" style={{ animationDelay: `${gi * 60}ms` }}>
          <div>
            <div className="text-[10px] font-plek uppercase tracking-[0.24em] text-[var(--paper-faint)] mb-2">{String(gi + 1).padStart(2, "0")} / {String(groups.length).padStart(2, "0")}</div>
            <h2 className="text-xl font-medium tracking-tight text-[var(--paper)]">{group.title}</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1 max-w-2xl">{group.blurb}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {group.items.map((r) => (
              <a
                key={r.name}
                href={r.href}
                target="_blank"
                rel="noreferrer"
                className="group relative block rounded-[16px] bg-[var(--bg-surface)] border border-[var(--border)] p-5 transition duration-200 ease-out hover:-translate-y-1 hover:bg-[var(--ink-raised)] hover:border-[rgba(201,70,46,0.5)] hover:[filter:drop-shadow(0_10px_22px_rgba(0,0,0,0.45))_drop-shadow(0_6px_18px_rgba(201,70,46,0.16))]"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="inline-flex transition-transform duration-200 ease-out group-hover:scale-[1.06]">
                    <ResourceLogo href={r.href} name={r.name} logo={r.logo} />
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-medium border text-[var(--brand-blue)] bg-[rgba(0,140,255,0.06)] border-[rgba(0,140,255,0.12)]">
                      {r.tag}
                    </span>
                    <MaturityBadge maturity={r.maturity} />
                  </div>
                </div>
                <h3 className="flex items-start gap-1.5 text-sm font-semibold text-[var(--text-primary)]">
                  <span className="min-w-0">{r.name}</span>
                  <span aria-hidden="true" className="mt-px shrink-0 text-[var(--t54-coral)] opacity-0 -translate-x-1 transition-all duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100">&#8599;</span>
                </h3>
                <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mt-2">{r.description}</p>
                {r.install ? (
                  <code className="mt-3 inline-block !rounded-md text-[11px] font-mono text-[var(--text-secondary)] bg-[rgba(255,255,255,0.04)] px-2.5 py-1 border border-[var(--border)]">
                    {r.install}
                  </code>
                ) : null}
              </a>
            ))}
          </div>
        </section>
      ))}

      <div className="animate-fade-up pt-2">
        <div className="dashboard-panel bg-[var(--bg-surface)] border border-[var(--border)] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-base font-semibold text-[var(--text-primary)]">{isKo ? t.cta_title : "Want your service listed?"}</p>
            <p className="text-sm text-[var(--text-muted)] mt-1">{isKo ? t.cta_sub : "Add your x402 endpoint to the XRPL AI ecosystem."}</p>
          </div>
          <Link href="/join/service" className="ui-control px-4 py-2 bg-[var(--brand-blue)] text-white font-medium text-sm shrink-0">
            {isKo ? t.cta_button : "Get listed"}
          </Link>
        </div>
      </div>
    </div>
  );
}
