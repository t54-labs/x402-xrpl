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
    <div className="fixed inset-x-0 bottom-0 z-[100] border-t-2 border-[var(--t54-coral)] bg-[rgba(10,8,6,0.98)] backdrop-blur-[16px] cookie-rise">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-5 sm:py-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
        <div className="flex-1 min-w-0">
          <p className="flex items-center gap-2 text-[15px] font-semibold text-[var(--paper)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--t54-coral)] shrink-0" />
            Cookies &amp; analytics
          </p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--text-secondary)] max-w-2xl">
            We use Google Analytics to understand how the hub is used so we can improve it. It&rsquo;s
            anonymous, there is no advertising, and we never sell or share your data. Accept to help us, or
            decline to keep analytics off — you can change your choice anytime. See our{" "}
            <Link
              href="/privacy"
              className="text-[var(--paper)] underline underline-offset-2 hover:text-[var(--brand-blue)] transition-colors"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => choose(false)}
            className="ui-control px-5 py-2.5 text-[13px] font-medium border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.04)] transition-colors"
          >
            Decline
          </button>
          <button
            onClick={() => choose(true)}
            className="ui-control px-6 py-2.5 text-[13px] font-semibold bg-[var(--brand-blue)] text-white hover:opacity-90 transition-opacity"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
