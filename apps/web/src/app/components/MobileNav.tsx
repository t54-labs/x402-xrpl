"use client";

import { useState } from "react";
import Link from "next/link";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-gray-400 hover:text-white transition-colors"
        aria-label="Toggle menu"
      >
        {open ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute top-16 left-0 right-0 bg-[#0b0d10] border-b border-white/5 py-4 px-6 space-y-3 z-50">
          <Link href="/" onClick={() => setOpen(false)} className="block text-gray-400 hover:text-white transition-colors text-sm font-medium py-2">
            Dashboard
          </Link>
          <Link href="/transactions" onClick={() => setOpen(false)} className="block text-gray-400 hover:text-white transition-colors text-sm font-medium py-2">
            Transactions
          </Link>
          <Link href="/merchants" onClick={() => setOpen(false)} className="block text-gray-400 hover:text-white transition-colors text-sm font-medium py-2">
            Merchants
          </Link>
          <Link href="/agora" onClick={() => setOpen(false)} className="block text-gray-400 hover:text-white transition-colors text-sm font-medium py-2">
            Agora
          </Link>
          <Link href="/resources/register" onClick={() => setOpen(false)} className="block text-gray-400 hover:text-white transition-colors text-sm font-medium py-2">
            Register Resource
          </Link>
        </div>
      )}
    </div>
  );
}
