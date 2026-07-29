// Locale plumbing for the hub. URL scheme: English is unprefixed (/build),
// Korean lives under /ko (/ko/build). The middleware rewrites unprefixed paths
// to /en internally so every page renders under app/[locale].

export const LOCALES = ["en", "ko"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Prefix an internal path for a locale: localePath("ko", "/faq#custody") → "/ko/faq#custody". */
export function localePath(locale: Locale, href: string): string {
  if (locale === DEFAULT_LOCALE) return href;
  if (!href.startsWith("/") || href.startsWith(`/${locale}/`) || href === `/${locale}`) return href;
  return href === "/" ? `/${locale}` : `/${locale}${href}`;
}

/** Strip a locale prefix from a browser pathname: "/ko/build" → "/build". */
export function stripLocale(pathname: string): string {
  for (const l of LOCALES) {
    if (pathname === `/${l}`) return "/";
    if (pathname.startsWith(`/${l}/`)) return pathname.slice(l.length + 1);
  }
  return pathname;
}
