import { KO } from "./ko-dict";
import type { Locale } from "./i18n";

/**
 * String-level translator: t("English source") → Korean when the locale is ko
 * and the string is in the dictionary, otherwise the English source unchanged.
 * Interpolations use {placeholders} kept verbatim in both languages:
 *   t("{n} live services").replace("{n}", String(n))
 */
export function makeT(locale: Locale): (en: string) => string {
  if (locale !== "ko") return (en) => en;
  return (en) => KO[en] ?? en;
}
