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

const categoryColors: Record<string, string> = {
  Infrastructure: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "AI Chat": "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "Token Analytics": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Market Intelligence": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

export default function PartnersPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      <header className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-light tracking-tight text-white">Ecosystem Partners</h1>
        <p className="text-sm text-gray-400 mt-3 leading-relaxed">
          Projects, tools, and services building the x402 payment economy on the XRP Ledger.
        </p>
      </header>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {Object.entries(categoryColors).map(([cat, cls]) => (
          <span key={cat} className={`px-3 py-1 rounded-full text-xs font-medium border ${cls}`}>{cat}</span>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {partners.map((p) => (
          <a
            key={p.name}
            href={p.website}
            target="_blank"
            rel="noreferrer"
            className="group block bg-[#131518] rounded-xl border border-white/5 p-6 hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.05)] transition-all"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                  <Image src={p.logo} alt={p.name} width={32} height={32} className="object-contain" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white group-hover:text-cyan-400 transition-colors">{p.name}</h3>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold border ${categoryColors[p.category] || "bg-white/5 text-gray-400 border-white/10"}`}>
                    {p.category}
                  </span>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-600 group-hover:text-cyan-400 transition-colors shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">{p.description}</p>
            <p className="text-xs text-gray-600 font-mono mt-3">{p.website.replace("https://", "")}</p>
          </a>
        ))}
      </div>

      <div className="text-center pt-4">
        <p className="text-sm text-gray-500 mb-4">Building with x402 on XRPL?</p>
        <Link
          href="/resources/register"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg transition-all text-sm"
        >
          Join the Ecosystem
        </Link>
      </div>
    </div>
  );
}
