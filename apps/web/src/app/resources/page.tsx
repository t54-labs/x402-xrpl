import Link from "next/link";

type Resource = {
  name: string;
  description: string;
  href: string;
  tag: string;
  maturity?: "live" | "beta" | "external" | "unverified";
  install?: string;
};

type Group = { title: string; blurb: string; items: Resource[] };

const GROUPS: Group[] = [
  {
    title: "Services AI can consume",
    blurb: "AI services already reachable on XRPL rails — pay per call in XRP or RLUSD over x402.",
    items: [
      { name: "BlockRunAI", description: "Per-call LLM gateway across 30+ models, settled over x402.", href: "https://blockrun.ai", tag: "LLM gateway", maturity: "beta" },
      { name: "AskSurf / Surf", description: "Conversational search and crypto-data skills, metered per query.", href: "https://asksurf.ai", tag: "Data / search" },
      { name: "LucyOS", description: "Real-time token analytics for the XRPL ecosystem.", href: "https://lucyos.ai", tag: "Analytics" },
      { name: "Heurist", description: "Decentralized AI inference — LLMs and image generation.", href: "https://heurist.xyz", tag: "Inference" },
    ],
  },
  {
    title: "Developer tools & SDKs",
    blurb: "Everything you need to take a payment from an AI agent on XRPL — first-party from t54, plus the official XRPL toolkit.",
    items: [
      { name: "x402-xrpl — TypeScript SDK", description: "Express middleware (requirePayment) + x402Fetch buyer client + currency helpers + Verifiable Intent.", href: "https://github.com/t54-labs", tag: "SDK", maturity: "live", install: "npm i x402-xrpl" },
      { name: "x402-xrpl — Python SDK", description: "FastAPI/Starlette helpers + presigned-payment client, mirroring the TS ergonomics.", href: "https://github.com/t54-labs", tag: "SDK", maturity: "live", install: "pip install x402-xrpl" },
      { name: "t54 x402 Facilitator", description: "Hosted verify + settle for XRPL presigned payments. No custody, no API keys. Mainnet + testnet.", href: "https://xrpl-x402.t54.ai", tag: "Facilitator", maturity: "live" },
      { name: "X402 Secure — Verifiable Intent", description: "Know-Your-Agent credential + owner→agent delegation + per-payment risk gating, enforced before settlement (L1–L3).", href: "https://www.t54.ai/x402-secure", tag: "Security", maturity: "live" },
      { name: "RLUSD CLI", description: "XRPL trust-line / payment / receipts + Ethereum + DeFi, with prepare-review-execute and JSON output.", href: "https://www.t54.ai/docs", tag: "CLI", maturity: "live" },
      { name: "XRPL CLI", description: "t54's command-line tool for general XRPL operations and agent workflows.", href: "https://www.t54.ai/docs", tag: "CLI", maturity: "live" },
      { name: "RLUSD Skills", description: "Claude / MCP agent skills wrapping the RLUSD CLI, with per-transaction spend caps.", href: "https://www.t54.ai/docs", tag: "Agent skills", maturity: "live" },
      { name: "ClawCredit", description: "Agent-native credit, underwritten by t54's risk engine.", href: "https://www.t54.ai", tag: "Credit", maturity: "beta" },
      { name: "XRPL agentic-transactions docs", description: "Official XRPL guide for building AI agents: Agent Wallet Skill, Payments Skill, security model.", href: "https://xrpl.org/docs/agents/getting-started-with-agentic-transactions", tag: "Official docs", maturity: "external" },
      { name: "XRPL Docs MCP Server", description: "Official MCP server that gives agents grounded access to the XRPL documentation.", href: "https://xrpl.org/docs/agents", tag: "MCP", maturity: "external" },
      { name: "XRPL Commons — xrpl-dev-skills", description: "Community-maintained agent skills for XRPL development.", href: "https://www.xrpl-commons.org", tag: "Agent skills", maturity: "external" },
    ],
  },
  {
    title: "Ship faster",
    blurb: "Programs and accelerators to get an XRPL-AI project off the ground.",
    items: [
      { name: "XRPL Commons — Aquarium & HAKS", description: "Residency and hackathons, including an AI & Blockchain track.", href: "https://www.xrpl-commons.org", tag: "Accelerator", maturity: "external" },
      { name: "Tenity — XRPL Accelerator", description: "Cohort-based acceleration for XRPL builders.", href: "https://www.tenity.com", tag: "Accelerator", maturity: "external" },
      { name: "XRPL Grants", description: "Funding for open-source projects building on the XRP Ledger.", href: "https://xrplgrants.org", tag: "Grants", maturity: "external" },
      { name: "Ripple APEX", description: "Ripple's developer summit and ecosystem programming.", href: "https://apex.ripple.com", tag: "Program", maturity: "external" },
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

export default function ResourcesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      <header className="animate-fade-up">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">Resources</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1 max-w-2xl">
          The toolkit for building AI on XRPL — what agents can consume, what developers build with, and what helps you ship.
        </p>
      </header>

      {GROUPS.map((group, gi) => (
        <section key={group.title} className="animate-fade-up space-y-4" style={{ animationDelay: `${gi * 60}ms` }}>
          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)]">{group.title}</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1 max-w-2xl">{group.blurb}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {group.items.map((r) => (
              <a
                key={r.name}
                href={r.href}
                target="_blank"
                rel="noreferrer"
                className="group block dashboard-panel bg-[var(--bg-surface)] border border-[var(--border)] p-5 hover:border-[var(--border-hover)] transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-medium border text-[var(--brand-blue)] bg-[rgba(0,140,255,0.06)] border-[rgba(0,140,255,0.12)]">
                    {r.tag}
                  </span>
                  <MaturityBadge maturity={r.maturity} />
                </div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">{r.name}</h3>
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
            <p className="text-base font-semibold text-[var(--text-primary)]">Want your service listed?</p>
            <p className="text-sm text-[var(--text-muted)] mt-1">Add your x402 endpoint to the XRPL AI ecosystem.</p>
          </div>
          <Link href="/resources/register" className="ui-control px-4 py-2 bg-[var(--brand-blue)] text-white font-medium text-sm shrink-0">
            Get listed
          </Link>
        </div>
      </div>
    </div>
  );
}
