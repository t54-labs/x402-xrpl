"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/transactions", label: "Transactions" },
  { href: "/merchants", label: "Merchants" },
  { href: "/agora", label: "Agora" },
  { href: "/partners", label: "Partners" },
  { href: "/resources/register", label: "Register" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [mounted] = useState(true);
  const pathname = usePathname();

  return (
    <div className="lg:hidden relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        aria-label="Toggle menu"
      >
        {open ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {mounted &&
        open &&
        createPortal(
          <>
            <button
              type="button"
              aria-label="Close menu overlay"
              onClick={() => setOpen(false)}
              className="fixed top-[80px] left-0 right-0 bottom-0 z-[998] bg-[rgba(0,0,0,0.35)]"
            />
            <div className="fixed top-[80px] left-0 right-0 z-[999] px-4 py-3">
              <div className="animate-slide-down mx-auto max-w-7xl max-h-[calc(100svh-96px)] overflow-y-auto bg-[rgba(0,0,0,0.94)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.08)] rounded-xl p-2 space-y-1">
                {links.map(({ href, label }) => {
                  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
                  const isRegister = label.includes("Register");
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      className={`block text-sm font-medium py-2.5 px-3 rounded-lg transition-colors ${
                        isRegister
                          ? "bg-white text-black hover:bg-white/90"
                          : isActive
                            ? "text-[var(--text-primary)] bg-[rgba(255,255,255,0.06)]"
                            : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.03)]"
                      }`}
                    >
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  );
}
