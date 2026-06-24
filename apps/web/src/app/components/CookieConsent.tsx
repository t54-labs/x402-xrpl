"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// Cookie consent banner wired to Google Consent Mode v2. Analytics storage is
// defaulted to "denied" in layout.tsx before gtag loads; this banner records the
// visitor's choice in localStorage and flips analytics_storage to "granted" only
// on Accept. No advertising signals are ever requested.
export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem("cookie-consent")) setShow(true);
    } catch {
      /* localStorage blocked — leave analytics denied, don't show the banner */
    }
  }, []);

  const choose = (granted: boolean) => {
    try {
      localStorage.setItem("cookie-consent", granted ? "granted" : "denied");
    } catch {
      /* ignore */
    }
    if (granted) {
      window.gtag?.("consent", "update", { analytics_storage: "granted" });
    }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] border-t border-[rgba(255,255,255,0.08)] bg-[rgba(10,8,6,0.92)] backdrop-blur-[12px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3">
        <p className="flex-1 text-[12px] leading-relaxed text-[var(--text-secondary)]">
          We use cookies for anonymous analytics (Google Analytics) to understand how the hub is used — no advertising, and we don&rsquo;t sell or share your data. See our{" "}
          <Link href="/privacy" className="text-[var(--text-primary)] underline underline-offset-2 hover:text-[var(--brand-blue)] transition-colors">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => choose(false)}
            className="ui-control px-3.5 py-1.5 text-[12px] font-medium border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.04)] transition-colors"
          >
            Reject
          </button>
          <button
            onClick={() => choose(true)}
            className="ui-control px-3.5 py-1.5 text-[12px] font-medium bg-[var(--brand-blue)] text-white hover:opacity-90 transition-opacity"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
