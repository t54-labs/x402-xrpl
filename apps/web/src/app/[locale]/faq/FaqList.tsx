"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FaqCategory, FaqItem } from "./faq-data";
import { useLocale } from "@/app/components/LocaleProvider";
import { localePath } from "@/app/lib/i18n";
import type { ChromeStrings } from "@/app/lib/chrome-i18n";

type FaqLabels = ChromeStrings["faq"];

/* Renders `code` spans and **bold** inside answer/question strings. */
export function InlineFormat({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={i}
              className="font-mono text-[0.92em] text-[var(--text-primary)] bg-[rgba(255,255,255,0.05)] border border-[var(--border)] rounded px-1 py-px"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-[var(--text-primary)]">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function CopyAnchorButton({ id, labels }: { id: string; labels: FaqLabels }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={labels.copyAria}
      title={labels.copyAria}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const url = `${window.location.origin}/faq#${id}`;
        void navigator.clipboard?.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1400);
      }}
      className="shrink-0 inline-flex items-center gap-1 text-[10px] font-plek uppercase tracking-[0.14em] text-[var(--paper-faint)] hover:text-[var(--brand-blue)] transition-colors opacity-0 group-hover/item:opacity-100 focus:opacity-100"
    >
      {copied ? (
        <span className="text-[var(--brand-blue)]">{labels.copied}</span>
      ) : (
        <>
          <svg viewBox="0 0 16 16" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
            <path d="M6.5 9.5a3 3 0 0 0 4.24 0l2.12-2.12a3 3 0 1 0-4.24-4.24l-1 1" strokeLinecap="round" />
            <path d="M9.5 6.5a3 3 0 0 0-4.24 0L3.14 8.62a3 3 0 1 0 4.24 4.24l1-1" strokeLinecap="round" />
          </svg>
          {labels.link}
        </>
      )}
    </button>
  );
}

function matches(item: FaqItem, needle: string): boolean {
  if (!needle) return true;
  const hay = [item.q, ...item.a.map((b) => (b.kind === "p" ? b.text : b.body)), ...(item.keywords ?? [])]
    .join(" ")
    .toLowerCase();
  return needle
    .toLowerCase()
    .split(/\s+/)
    .every((word) => hay.includes(word));
}

function AnswerBlock({ item }: { item: FaqItem }) {
  const locale = useLocale();
  return (
    <div className="pt-1 pb-5 pr-2 sm:pr-10 space-y-3">
      {item.a.map((block, i) =>
        block.kind === "p" ? (
          <p key={i} className="text-[13.5px] text-[var(--text-secondary)] leading-relaxed max-w-3xl">
            <InlineFormat text={block.text} />
          </p>
        ) : (
          <pre
            key={i}
            className="!rounded-lg overflow-x-auto text-[11.5px] leading-relaxed font-mono text-[var(--text-secondary)] bg-[rgba(255,255,255,0.03)] border border-[var(--border)] px-4 py-3 max-w-3xl"
          >
            <code>{block.body}</code>
          </pre>
        ),
      )}
      {item.links && item.links.length > 0 ? (
        <p className="flex flex-wrap gap-x-4 gap-y-1 pt-0.5">
          {item.links.map((l) =>
            l.href.startsWith("/") ? (
              <a key={l.href} href={localePath(locale, l.href)} className="text-[12px] text-[var(--brand-blue)] hover:underline">
                {l.label} &rarr;
              </a>
            ) : (
              <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="text-[12px] text-[var(--brand-blue)] hover:underline">
                {l.label} &#8599;
              </a>
            ),
          )}
        </p>
      ) : null}
    </div>
  );
}

export function FaqList({ categories, labels }: { categories: FaqCategory[]; labels: FaqLabels }) {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const scrolledOnLoad = useRef(false);

  // Deep links: /faq#<question-id> opens that question; #<category-id> just scrolls.
  useEffect(() => {
    const applyHash = () => {
      const id = window.location.hash.replace(/^#/, "");
      if (!id) return;
      const isQuestion = categories.some((c) => c.items.some((it) => it.id === id));
      if (isQuestion) setOpenId(id);
      if (!scrolledOnLoad.current) {
        scrolledOnLoad.current = true;
        window.setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 60);
      }
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, [categories]);

  const needle = query.trim();
  const filtered = useMemo(
    () =>
      categories
        .map((c) => ({ ...c, items: c.items.filter((it) => matches(it, needle)) }))
        .filter((c) => c.items.length > 0),
    [categories, needle],
  );
  const total = categories.reduce((n, c) => n + c.items.length, 0);
  const shown = filtered.reduce((n, c) => n + c.items.length, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-10 items-start">
      {/* Section jump nav */}
      <aside className="hidden lg:block sticky top-[104px]">
        <div className="text-[10px] font-plek uppercase tracking-[0.24em] text-[var(--paper-faint)] mb-3">{labels.sections}</div>
        <nav className="space-y-1">
          {categories.map((c, i) => (
            <a
              key={c.id}
              href={`#${c.id}`}
              className="group flex items-baseline gap-2.5 py-1 text-[12.5px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <span className="font-plek text-[10px] tracking-[0.1em] text-[var(--paper-faint)] group-hover:text-[var(--brand-blue)] transition-colors">
                {String(i + 1).padStart(2, "0")}
              </span>
              {c.title}
            </a>
          ))}
        </nav>
        <a
          href="mailto:support@t54.ai?subject=Engineering%20question%20%E2%80%94%20XRPL%20AI%20Hub"
          className="mt-6 inline-block text-[12px] text-[var(--brand-blue)] hover:underline"
        >
          {labels.ask} &rarr;
        </a>
      </aside>

      <div className="min-w-0">
        {/* Filter */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <svg
              viewBox="0 0 16 16"
              width="13"
              height="13"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--paper-faint)]"
            >
              <circle cx="7" cy="7" r="4.5" />
              <path d="M10.5 10.5 14 14" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={labels.filterPlaceholder}
              aria-label={labels.filterAria}
              className="w-full rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] pl-9 pr-4 py-2.5 text-[13px] text-[var(--text-primary)] placeholder:text-[var(--paper-faint)] focus:outline-none focus:border-[rgba(0,140,255,0.45)] transition-colors"
            />
          </div>
          {needle ? (
            <p className="mt-2 text-[11px] font-plek uppercase tracking-[0.14em] text-[var(--paper-mute)]">
              {shown} / {total} {labels.questionsLabel}
            </p>
          ) : null}
        </div>

        {filtered.length === 0 ? (
          <div className="dashboard-panel bg-[var(--bg-surface)] border border-[var(--border)] p-8 text-center">
            <p className="text-sm text-[var(--text-secondary)]">No questions match &ldquo;{needle}&rdquo;.</p>
            <p className="text-[12px] text-[var(--text-muted)] mt-2">
              Ask us directly at{" "}
              <a href="mailto:support@t54.ai" className="text-[var(--brand-blue)] hover:underline">
                support@t54.ai
              </a>{" "}
              — we fold real integration questions back into this page.
            </p>
          </div>
        ) : null}

        <div className="space-y-12">
          {filtered.map((c) => {
            const ci = categories.findIndex((x) => x.id === c.id);
            return (
              <section key={c.id} id={c.id} className="scroll-mt-[104px]">
                <div className="flex items-baseline gap-4 mb-1">
                  <span className="text-[11px] font-plek uppercase tracking-[0.24em] text-[var(--paper-faint)] shrink-0">
                    {String(ci + 1).padStart(2, "0")} / {String(categories.length).padStart(2, "0")}
                  </span>
                  <span className="h-px flex-1 bg-[var(--rule)]" />
                  <span className="text-[11px] font-plek uppercase tracking-[0.24em] text-[var(--paper-mute)] shrink-0">
                    {c.title}
                  </span>
                </div>
                <p className="text-[13px] text-[var(--text-muted)] mt-3 mb-2 max-w-2xl">{c.blurb}</p>
                <div>
                  {c.items.map((item) => {
                    const isOpen = needle ? true : openId === item.id;
                    return (
                      <div
                        key={item.id}
                        id={item.id}
                        className="group/item border-b border-[var(--rule)] scroll-mt-[104px]"
                      >
                        <div
                          className="flex items-center justify-between gap-4 py-4 cursor-pointer select-none"
                          onClick={() => {
                            setOpenId(isOpen ? null : item.id);
                            if (!isOpen) history.replaceState(null, "", `#${item.id}`);
                          }}
                        >
                          <button
                            type="button"
                            aria-expanded={isOpen}
                            aria-controls={`${item.id}-answer`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenId(isOpen ? null : item.id);
                              if (!isOpen) history.replaceState(null, "", `#${item.id}`);
                            }}
                            className="text-left cursor-pointer"
                          >
                            <h3 className="text-[14.5px] font-medium text-[var(--text-primary)] leading-snug">
                              <InlineFormat text={item.q} />
                            </h3>
                          </button>
                          <span className="flex items-center gap-3 shrink-0">
                            <CopyAnchorButton id={item.id} labels={labels} />
                            <span
                              aria-hidden
                              className={`inline-flex items-center justify-center w-6 h-6 rounded-full border transition-transform duration-300 ease-out ${isOpen ? "rotate-45 border-[rgba(0,140,255,0.4)] text-[var(--brand-blue)]" : "border-[var(--border)] text-[var(--text-muted)]"}`}
                            >
                              <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
                                <path d="M6 1.5v9M1.5 6h9" strokeLinecap="round" />
                              </svg>
                            </span>
                          </span>
                        </div>
                        <div
                          id={`${item.id}-answer`}
                          className="grid transition-[grid-template-rows] duration-300 ease-out"
                          style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                        >
                          <div
                            className={`overflow-hidden min-h-0 transition-[opacity,transform] duration-300 ease-out ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"}`}
                            aria-hidden={!isOpen}
                          >
                            <AnswerBlock item={item} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
