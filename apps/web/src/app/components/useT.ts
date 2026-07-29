"use client";

import { useLocale } from "./LocaleProvider";
import { makeT } from "../lib/i18n-t";

/** Client-side hook version of makeT — see lib/i18n-t.ts. */
export function useT(): (en: string) => string {
  const locale = useLocale();
  return makeT(locale);
}
