"use client";

import Link from "@/app/components/LocaleLink";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useT } from "@/app/components/useT";

export { isVerifiedIntent } from "./verificationIntent";

type VerificationBadgeProps = {
  verifiableIntent?: boolean | null;
  riskChecked?: boolean | null;
  showIdle?: boolean;
  compact?: boolean;
  className?: string;
};

const POPOVER_WIDTH = 288; // matches the previous w-72
const GAP = 8;

type Pos = { top: number; left: number; placement: "top" | "bottom" };

export function VerificationBadge({
  verifiableIntent,
  riskChecked,
  showIdle = false,
  compact = false,
  className = "",
}: VerificationBadgeProps) {
  const t = useT();
  const triggerRef = useRef<HTMLSpanElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [pos, setPos] = useState<Pos | null>(null);

  // Position the popover with viewport (fixed) coordinates so it can be portaled out of the
  // transactions table's overflow-x-auto container, which would otherwise clip it. Clamp to
  // the viewport horizontally, and flip above the badge when there is no room below.
  const place = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const margin = 8;
    const left = Math.max(margin, Math.min(r.left, window.innerWidth - POPOVER_WIDTH - margin));
    const placement: "top" | "bottom" = window.innerHeight - r.bottom < 180 ? "top" : "bottom";
    const top = placement === "bottom" ? r.bottom + GAP : r.top - GAP;
    setPos({ top, left, placement });
  }, []);

  const show = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    place();
  }, [place]);

  // Small grace period so moving the cursor from the badge across the gap onto the popover
  // (to click the link) doesn't dismiss it.
  const hide = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setPos(null), 120);
  }, []);

  useEffect(() => {
    if (!pos) return;
    const reposition = () => place();
    // capture=true so scrolling the inner table container repositions the fixed popover too.
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [pos, place]);

  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  const verified = Boolean(riskChecked || verifiableIntent);
  if (!verified && !showIdle) return null;

  const label = verified ? t("Verified") : t("Unverified");
  const heading = verified ? t("Verifiable Intent — verified") : t("Unverified intent");
  const body = verified
    ? riskChecked
      ? t("This payment carried a Mastercard Verifiable Intent chain — a signed, consent-bound authorization from the paying agent — and cleared t54's x402 Secure risk checks before it settled on the XRP Ledger.")
      : t("This payment carried a Mastercard Verifiable Intent chain — a signed, consent-bound authorization from the paying agent — verified before it settled on the XRP Ledger.")
    : t("A valid XRPL x402 payment, but it settled without a Mastercard Verifiable Intent chain — no signed authorization or x402 Secure risk gating was attached.");
  const linkText = verified ? t("How to get your payments verified") : t("Add Verifiable Intent to your payments");

  return (
    <span
      ref={triggerRef}
      className={["relative inline-flex", className].filter(Boolean).join(" ")}
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      <span
        aria-label={verified ? t("Verifiable Intent verified") : t("Unverified intent")}
        className={[
          "inline-flex items-center gap-1.5 rounded-md border font-plek uppercase tracking-[0.14em] cursor-default",
          compact ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-1 text-[10px]",
          verified
            ? "border-[var(--blue-28)] bg-[var(--blue-08)] text-[var(--paper)]"
            : "border-[var(--border)] bg-[rgba(255,255,255,0.02)] text-[var(--paper-faint)]",
        ].filter(Boolean).join(" ")}
      >
        {verified ? (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 2.5 19 5v5.4c0 4.5-2.8 8.5-7 10.1-4.2-1.6-7-5.6-7-10.1V5l7-2.5Z"
              fill="var(--brand-blue)"
              stroke="var(--brand-blue)"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path d="m8.7 12.1 2.1 2.1 4.7-5" stroke="white" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--paper-faint)]" aria-hidden />
        )}
        {label}
      </span>

      {pos && typeof document !== "undefined" && createPortal(
        <div
          role="tooltip"
          onMouseEnter={show}
          onMouseLeave={hide}
          style={{
            position: "fixed",
            left: pos.left,
            width: POPOVER_WIDTH,
            ...(pos.placement === "bottom"
              ? { top: pos.top }
              : { bottom: window.innerHeight - pos.top }),
          }}
          className="z-[100]"
        >
          <div className="rounded-lg border border-[var(--border)] bg-[var(--ink-raised)] p-3 text-left normal-case tracking-normal shadow-[0_12px_32px_rgba(0,0,0,0.55)]">
            <div className="flex items-center gap-2 text-[12px] font-semibold text-[var(--paper)]">
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${verified ? "bg-[var(--brand-blue)]" : "bg-[var(--paper-faint)]"}`} aria-hidden />
              {heading}
            </div>
            <p className="mt-1.5 text-[12px] font-normal leading-relaxed text-[var(--text-secondary)]">{body}</p>
            <Link
              href="/build"
              className="mt-2.5 inline-flex items-center gap-1 text-[12px] font-medium text-[var(--brand-blue)] hover:underline"
            >
              {linkText} <span aria-hidden>&#8599;</span>
            </Link>
          </div>
        </div>,
        document.body
      )}
    </span>
  );
}
