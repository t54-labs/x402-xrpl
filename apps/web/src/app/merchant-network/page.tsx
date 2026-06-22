export const metadata = {
  title: "Merchant Network — t54 XRPL AI Index",
  description: "Onboard established merchants to RLUSD settlement on XRPL through network partners.",
};

const BRANDS = ["Macy's", "Saks Fifth Avenue", "Harrods", "Michael Kors", "Zappos"];

const INTAKE_FIELDS = [
  "Company name",
  "Estimated monthly settlement volume",
  "Current payment rails",
  "Target launch window",
  "RLUSD readiness",
  "Region / country",
  "BD contact",
];

export default function MerchantNetworkPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <header className="animate-fade-up">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">Merchant Network</h1>
        <p className="text-base text-[var(--text-secondary)] mt-3 leading-relaxed max-w-2xl">
          Beyond developers, real merchants need to be reachable by AI agents. We bring established brands onto RLUSD settlement on XRPL through merchant-network partners.
        </p>
      </header>

      <section className="animate-fade-up dashboard-panel bg-[var(--bg-surface)] border border-[var(--border)] p-6 sm:p-8" style={{ animationDelay: "60ms" }}>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Flagship partner — CloudStore</h2>
          <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-medium border text-amber-400 bg-amber-500/8 border-amber-500/15">in discussion</span>
        </div>
        <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed max-w-2xl">
          CloudStore (nubestore.ai) is a plug-and-play agentic-checkout platform. Its existing network already includes major retailers — 500+ merchants, $1B+ GMV fulfilled. Through a CloudStore integration, established brands can settle agent purchases in RLUSD on XRPL.
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          {BRANDS.map((b) => (
            <span key={b} className="px-2.5 py-1 rounded-md text-[12px] font-medium text-[var(--text-secondary)] bg-[rgba(255,255,255,0.04)] border border-[var(--border)]">
              {b}
            </span>
          ))}
          <span className="px-2.5 py-1 rounded-md text-[12px] font-medium text-[var(--text-muted)]">&amp; 500+ more</span>
        </div>
      </section>

      <section className="animate-fade-up grid grid-cols-1 sm:grid-cols-2 gap-3" style={{ animationDelay: "120ms" }}>
        <div className="dashboard-panel bg-[var(--bg-surface)] border border-[var(--border)] p-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Why a network, not one-by-one</h3>
          <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mt-2">
            Onboarding traditional merchants is a B2B integration, not a self-serve flow. Partnering with merchant networks brings many brands onto XRPL rails at once.
          </p>
        </div>
        <div className="dashboard-panel bg-[var(--bg-surface)] border border-[var(--border)] p-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Institutional backdrop</h3>
          <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mt-2">
            Ripple is one of 30+ launch partners for Mastercard&rsquo;s Agent Pay for Machines — agent commerce is arriving at the card-network scale, and XRPL + RLUSD is a settlement-grade rail for it.
          </p>
        </div>
      </section>

      <section className="animate-fade-up dashboard-panel bg-[var(--bg-surface)] border border-[var(--border)] p-6 sm:p-8" style={{ animationDelay: "180ms" }}>
        <h2 className="text-base font-semibold text-[var(--text-primary)]">Bring your network</h2>
        <p className="text-sm text-[var(--text-muted)] mt-1 max-w-2xl">
          Run a merchant network, or a brand exploring agent commerce? Talk to us — this is a guided onboarding, not self-serve. We&rsquo;ll ask about:
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          {INTAKE_FIELDS.map((f) => (
            <span key={f} className="px-2.5 py-1 rounded-md text-[12px] text-[var(--text-secondary)] bg-[rgba(255,255,255,0.04)] border border-[var(--border)]">
              {f}
            </span>
          ))}
        </div>
        <a href="https://www.t54.ai" target="_blank" rel="noreferrer" className="ui-control inline-block mt-6 px-4 py-2 bg-[var(--brand-blue)] text-white font-medium text-sm">
          Contact sales
        </a>
      </section>
    </div>
  );
}
