
export const metadata = {
  title: "Events — t54 XRPL AI Index",
  description: "Programming for AI developers building on XRPL.",
};

type EventItem = {
  title: string;
  host: string;
  cadence: string;
  description: string;
  href: string;
  status: "external" | "in-discussion";
};

const EVENTS: EventItem[] = [
  {
    title: "HAKS — AI & Blockchain track",
    host: "XRPL Commons",
    cadence: "Hackathon",
    description: "The XRPL Commons hackathon series, with a dedicated AI & Blockchain track for agent builders.",
    href: "https://www.xrpl-commons.org",
    status: "external",
  },
  {
    title: "Aquarium residency",
    host: "XRPL Commons",
    cadence: "9-week residency",
    description: "A focused residency for teams building on XRPL — a natural home for XRPL-AI projects.",
    href: "https://www.xrpl-commons.org",
    status: "external",
  },
  {
    title: "XRPL Accelerator",
    host: "Tenity",
    cadence: "Cohort program",
    description: "Cohort-based acceleration for XRPL builders, including agentic-commerce teams.",
    href: "https://www.tenity.com",
    status: "external",
  },
  {
    title: "APEX",
    host: "Ripple",
    cadence: "Annual summit",
    description: "Ripple's developer summit and the gathering point for the XRPL ecosystem.",
    href: "https://apex.ripple.com",
    status: "external",
  },
  {
    title: "AI-on-XRPL builder sessions",
    host: "t54 · with Ripple & XRPL Commons",
    cadence: "Proposed",
    description: "Hands-on sessions to take developers from zero to a settled XRPL payment. Co-hosting is in discussion.",
    href: "https://www.t54.ai",
    status: "in-discussion",
  },
];

export default function EventsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">

      <header className="animate-fade-up max-w-3xl">
        <span className="text-[10px] font-plek uppercase tracking-[0.28em] text-[var(--paper-mute)]">Events</span>
        <h1 className="mt-5 text-4xl sm:text-5xl font-medium tracking-[-0.03em] leading-[1.02] text-[var(--paper)]">
          Where XRPL-AI<br />builders gather.
        </h1>
        <p className="mt-5 text-[15px] text-[var(--text-secondary)] leading-relaxed max-w-xl">
          Programming for developers building AI on XRPL — curated by t54, alongside Ripple and XRPL Commons.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 stagger-children">
        {EVENTS.map((e) => (
          <a
            key={e.title}
            href={e.href}
            target="_blank"
            rel="noreferrer"
            className="group block dashboard-panel bg-[var(--bg-surface)] border border-[var(--border)] p-5 hover:border-[var(--border-hover)] transition-all duration-200"
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <span className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">{e.cadence}</span>
              {e.status === "in-discussion" ? (
                <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-medium border text-amber-400 bg-amber-500/8 border-amber-500/15">
                  in discussion
                </span>
              ) : null}
            </div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">{e.title}</h3>
            <p className="text-[11px] text-[var(--brand-blue)] mt-1">{e.host}</p>
            <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mt-2">{e.description}</p>
          </a>
        ))}
      </div>

      <p className="text-xs text-[var(--text-muted)] animate-fade-up">
        Co-hosting with Ripple and XRPL Commons is an active conversation, not a settled partnership — items marked &ldquo;in discussion&rdquo; reflect that.
      </p>
    </div>
  );
}
