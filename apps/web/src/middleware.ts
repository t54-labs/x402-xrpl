import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_LOCALE, isLocale } from "./app/lib/i18n";

// English is canonical at the bare path (/build); Korean lives under /ko.
// Internally every page renders under app/[locale], so bare paths are
// rewritten (not redirected) to /en, and explicit /en/* redirects to the
// canonical bare path.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const first = pathname.split("/")[1];

  if (first === DEFAULT_LOCALE) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.slice(DEFAULT_LOCALE.length + 1) || "/";
    return NextResponse.redirect(url, 308);
  }

  if (isLocale(first)) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip API routes, Next internals, and static files (anything with a dot).
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
