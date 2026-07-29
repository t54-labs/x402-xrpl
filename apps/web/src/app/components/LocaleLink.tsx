"use client";

import NextLink from "next/link";
import { forwardRef } from "react";
import { useLocale } from "./LocaleProvider";
import { localePath } from "../lib/i18n";

type Props = React.ComponentProps<typeof NextLink>;

/**
 * Drop-in replacement for next/link that keeps internal links inside the
 * current locale (/ko/... when browsing Korean). External and non-string
 * hrefs pass through untouched.
 */
const LocaleLink = forwardRef<HTMLAnchorElement, Props>(function LocaleLink({ href, ...rest }, ref) {
  const locale = useLocale();
  const localized = typeof href === "string" ? localePath(locale, href) : href;
  return <NextLink ref={ref} href={localized} {...rest} />;
});

export default LocaleLink;
