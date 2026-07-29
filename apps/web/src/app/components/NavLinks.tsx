"use client";

import Link from "@/app/components/LocaleLink";
import { usePathname } from "next/navigation";
import { useLocale } from "./LocaleProvider";
import { stripLocale } from "../lib/i18n";
import { CHROME } from "../lib/chrome-i18n";

export function NavLinks() {
  const locale = useLocale();
  const t = CHROME[locale].nav;
  const links = [
    { href: "/", label: t.index },
    { href: "/build", label: t.build },
    { href: "/resources", label: t.resources },
    { href: "/faq", label: t.faq },
    { href: "/directory", label: t.directory },
    // { href: "/merchant", label: "Merchant" }, // hidden for now (page kept)
    // { href: "/events", label: "Events" }, // hidden for now (page emptied; CMO to fill)
    { href: "/why-xrpl", label: t.why },
  ];
  const pathname = stripLocale(usePathname() ?? "/");

  return (
    <div className="hidden lg:flex h-full items-center gap-1.5 xl:gap-2 text-[12px] xl:text-[13px] font-medium font-youth whitespace-nowrap">
      {links.map(({ href, label }) => {
        const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={`relative px-2 py-1.5 text-[var(--text-muted)] transition-colors after:content-[''] after:absolute after:left-0 after:right-0 after:mx-auto after:bottom-[2px] after:h-px after:w-0 after:bg-[rgba(0,140,255,0.68)] after:transition-all after:duration-150 ${
              isActive
                ? "text-[var(--text-primary)] after:w-[32%]"
                : "hover:text-[var(--text-primary)] hover:after:w-[32%]"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
