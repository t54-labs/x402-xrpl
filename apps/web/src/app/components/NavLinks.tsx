"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/transactions", label: "Transactions" },
  { href: "/merchants", label: "Merchants" },
  { href: "/agora", label: "Agora" },
  { href: "/partners", label: "Partners" },
  { href: "/resources/register", label: "Register" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <div className="hidden lg:flex h-full items-center gap-1.5 xl:gap-2 text-[12px] xl:text-[13px] font-medium">
      {links.map(({ href, label }) => {
        const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
        const isRegister = label === "Register";
        return (
          <Link
            key={href}
            href={href}
            className={
              isRegister
                ? "px-3 py-1.5 rounded-lg bg-white text-black hover:bg-white/90 transition-colors"
                : `relative px-2 py-1.5 text-[var(--text-muted)] transition-colors after:content-[''] after:absolute after:left-0 after:right-0 after:mx-auto after:bottom-[2px] after:h-px after:w-0 after:bg-[rgba(0,140,255,0.68)] after:transition-all after:duration-150 ${
                    isActive
                      ? "text-[var(--text-primary)] after:w-[32%]"
                      : "hover:text-[var(--text-primary)] hover:after:w-[32%]"
                  }`
            }
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
