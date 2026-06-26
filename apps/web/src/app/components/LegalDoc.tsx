type Section = { heading: string; paragraphs: string[]; bullets?: string[] };

// Shared reading layout for the legal pages (Terms, Privacy). Narrow column,
// numbered sections, t54 coral-dot bullets. Content is passed in as data.
export function LegalDoc({
  eyebrow,
  title,
  lastUpdated,
  intro,
  sections,
  contact,
}: {
  eyebrow: string;
  title: string;
  lastUpdated: string;
  intro?: string;
  sections: Section[];
  contact?: string;
}) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
      <header className="animate-fade-up">
        <span className="text-[10px] font-plek uppercase tracking-[0.28em] text-[var(--paper-mute)]">{eyebrow}</span>
        <h1 className="mt-6 text-4xl sm:text-5xl font-medium tracking-[-0.03em] leading-[1.02] text-[var(--paper)]">{title}</h1>
        <p className="mt-5 text-[11px] font-plek uppercase tracking-[0.18em] text-[var(--paper-faint)]">Last updated · {lastUpdated}</p>
        {intro ? <p className="mt-7 text-[15px] text-[var(--text-secondary)] leading-relaxed">{intro}</p> : null}
      </header>

      <div className="mt-12 space-y-9">
        {sections.map((s, i) => (
          <section key={i} className="animate-fade-up">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight">
              <span className="font-plek text-[13px] text-[var(--brand-blue)] mr-2.5">{String(i + 1).padStart(2, "0")}</span>
              {s.heading}
            </h2>
            <div className="mt-3 space-y-3">
              {s.paragraphs.map((p, j) => (
                <p key={j} className="text-[14.5px] text-[var(--text-secondary)] leading-relaxed">{p}</p>
              ))}
              {s.bullets && s.bullets.length > 0 ? (
                <ul className="mt-2 space-y-1.5">
                  {s.bullets.map((b, j) => (
                    <li key={j} className="flex gap-2.5 text-[14px] text-[var(--text-secondary)] leading-relaxed">
                      <span className="mt-[7px] h-1 w-1 rounded-full bg-[var(--t54-coral)] shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </section>
        ))}
      </div>

      {contact ? (
        <div className="mt-12 pt-6 border-t border-[var(--rule)]">
          <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">{contact}</p>
        </div>
      ) : null}
    </div>
  );
}
