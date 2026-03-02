import Link from "next/link";
import Image from "next/image";

const partners = [
  {
    name: "t54 ai",
    description: "Trusted Agentic Finance — the XRPL x402 facilitator powering presigned payment verification and settlement.",
    website: "https://t54.ai",
    category: "Infrastructure",
    logo: "/partners/t54.png",
  },
  {
    name: "AskSurf",
    description: "AI-powered chat and search assistant. Pay-per-query conversational AI accessible via x402 micropayments.",
    website: "https://asksurf.ai",
    category: "AI Chat",
    logo: "/partners/asksurf.ico",
  },
  {
    name: "LucyOS",
    description: "Intelligent token analysis service for the XRPL ecosystem. Real-time insights on any token via x402.",
    website: "https://lucyos.ai",
    category: "Token Analytics",
    logo: "/partners/lucyos.ico",
  },
  {
    name: "Heurist",
    description: "Composable crypto intelligence agents. Trending token detection, whale tracking, and market analysis skills for AI agents.",
    website: "https://heurist.xyz",
    category: "Market Intelligence",
    logo: "/partners/heurist.ico",
  },
];

const categories = [
  { label: "Infrastructure", color: "text-[var(--brand-blue)] bg-[rgba(0,140,255,0.06)] border-[rgba(0,140,255,0.12)]" },
  { label: "AI Chat", color: "text-violet-400 bg-violet-500/6 border-violet-500/12" },
  { label: "Token Analytics", color: "text-amber-400 bg-amber-500/6 border-amber-500/12" },
  { label: "Market Intelligence", color: "text-emerald-400 bg-emerald-500/6 border-emerald-500/12" },
];

function getCategoryColor(cat: string) {
  return categories.find((c) => c.label === cat)?.color ?? "text-[var(--text-muted)] bg-[rgba(255,255,255,0.04)] border-[var(--border)]";
}

export default function PartnersPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <header className="animate-fade-up">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">Ecosystem Partners</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Projects, tools, and services building the x402 payment economy on the XRP Ledger.
        </p>
      </header>

      <div className="animate-fade-up flex flex-wrap gap-1.5" style={{ animationDelay: "60ms" }}>
        {categories.map(({ label, color }) => (
          <span key={label} className={`px-2.5 py-1 rounded-md text-[11px] font-medium border ${color}`}>{label}</span>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 stagger-children">
        {partners.map((p) => (
          <a
            key={p.name}
            href={p.website}
            target="_blank"
            rel="noreferrer"
            className="group block dashboard-panel bg-[var(--bg-surface)] border border-[var(--border)] p-5 hover:border-[var(--border-hover)] transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[var(--border)] flex items-center justify-center shrink-0 overflow-hidden">
                <Image src={p.logo} alt={p.name} width={28} height={28} className="object-contain" />
              </div>
              <svg className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </div>

            <h3 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--text-primary)]">{p.name}</h3>
            <span className={`inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-medium border ${getCategoryColor(p.category)}`}>
              {p.category}
            </span>

            <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mt-3 line-clamp-3">{p.description}</p>
            <p className="text-[11px] text-[var(--text-muted)] font-mono mt-3">{p.website.replace("https://", "")}</p>
          </a>
        ))}
      </div>

      <div className="animate-fade-up pt-2" style={{ animationDelay: "300ms" }}>
        <div className="dashboard-panel bg-[var(--bg-surface)] border border-[var(--border)] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-base font-semibold text-[var(--text-primary)]">Building with x402 on XRPL?</p>
            <p className="text-sm text-[var(--text-muted)] mt-1">Register your service and join the ecosystem.</p>
          </div>
          <Link
            href="/resources/register"
            className="ui-control px-4 py-2 bg-[var(--brand-blue)] text-white font-medium text-sm shrink-0"
          >
            Join the Ecosystem
          </Link>
        </div>
      </div>
    </div>
  );
}
