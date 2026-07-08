import Link from "next/link";

type VerificationBadgeProps = {
  verifiableIntent?: boolean | null;
  riskChecked?: boolean | null;
  showIdle?: boolean;
  compact?: boolean;
  className?: string;
};

export function isVerifiedIntent(tx: { verifiableIntent?: boolean | null; riskChecked?: boolean | null }) {
  return Boolean(tx.riskChecked || tx.verifiableIntent);
}

export function VerificationBadge({
  verifiableIntent,
  riskChecked,
  showIdle = false,
  compact = false,
  className = "",
}: VerificationBadgeProps) {
  const verified = Boolean(riskChecked || verifiableIntent);

  if (!verified && !showIdle) return null;

  const label = verified ? "Verified" : "Unverified";
  const heading = verified ? "Verifiable Intent — verified" : "Unverified intent";
  const body = verified
    ? riskChecked
      ? "This payment carried a Mastercard Verifiable Intent chain — a signed, consent-bound authorization from the paying agent — and cleared t54's x402 Secure risk checks before it settled on the XRP Ledger."
      : "This payment carried a Mastercard Verifiable Intent chain — a signed, consent-bound authorization from the paying agent — verified before it settled on the XRP Ledger."
    : "A valid XRPL x402 payment, but it settled without a Mastercard Verifiable Intent chain — no signed authorization or x402 Secure risk gating was attached.";
  const linkText = verified ? "How to get your payments verified" : "Add Verifiable Intent to your payments";

  return (
    <span className={["relative inline-flex group/vbadge", className].filter(Boolean).join(" ")}>
      <span
        aria-label={verified ? "Verifiable Intent verified" : "Unverified intent"}
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

      {/* Custom hover popover — the pt-2 bridge keeps it open while moving onto it,
          and the link is clickable (pointer-events re-enabled once shown). */}
      <span
        role="tooltip"
        className="pointer-events-none absolute left-0 top-full z-50 w-72 max-w-[calc(100vw-2rem)] pt-2 opacity-0 translate-y-1 transition-all duration-150 ease-out group-hover/vbadge:pointer-events-auto group-hover/vbadge:opacity-100 group-hover/vbadge:translate-y-0 hover:pointer-events-auto hover:opacity-100 hover:translate-y-0"
      >
        <span className="block rounded-lg border border-[var(--border)] bg-[var(--ink-raised)] p-3 text-left normal-case tracking-normal shadow-[0_12px_32px_rgba(0,0,0,0.55)]">
          <span className="flex items-center gap-2 text-[12px] font-semibold text-[var(--paper)]">
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${verified ? "bg-[var(--brand-blue)]" : "bg-[var(--paper-faint)]"}`} aria-hidden />
            {heading}
          </span>
          <span className="mt-1.5 block text-[12px] font-normal leading-relaxed text-[var(--text-secondary)]">{body}</span>
          <Link
            href="/build"
            className="mt-2.5 inline-flex items-center gap-1 text-[12px] font-medium text-[var(--brand-blue)] hover:underline"
          >
            {linkText} <span aria-hidden>&#8599;</span>
          </Link>
        </span>
      </span>
    </span>
  );
}
