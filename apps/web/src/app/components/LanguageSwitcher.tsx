"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "./LocaleProvider";
import { LOCALES, localePath, stripLocale, type Locale } from "../lib/i18n";

const LABELS: Record<Locale, string> = { en: "EN", ko: "KO" };

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname() ?? "/";
  const bare = stripLocale(pathname);

  return (
    <div
      aria-label="Language"
      className={`flex items-center gap-0.5 px-1 py-0.5 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.16)] rounded-full text-[11px] shrink-0 ${className}`}
    >
      {LOCALES.map((l) => (
        <NextLink
          key={l}
          href={localePath(l, bare)}
          aria-current={l === locale ? "true" : undefined}
          className={`px-2 py-0.5 !rounded-full font-plek tracking-[0.08em] transition-colors ${
            l === locale
              ? "bg-[rgba(255,255,255,0.12)] text-[var(--text-primary)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
        >
          {LABELS[l]}
        </NextLink>
      ))}
    </div>
  );
}
