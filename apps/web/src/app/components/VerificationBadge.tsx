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
  const title = verified
    ? riskChecked
      ? "Verifiable Intent chain verified and risk checked"
      : "Verifiable Intent chain verified"
    : "No Verifiable Intent receipt indexed";

  return (
    <span
      title={title}
      className={[
        "inline-flex items-center gap-1.5 rounded-md border font-plek uppercase tracking-[0.14em]",
        compact ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-1 text-[10px]",
        verified
          ? "border-[var(--blue-28)] bg-[var(--blue-08)] text-[var(--paper)]"
          : "border-[var(--border)] bg-[rgba(255,255,255,0.02)] text-[var(--paper-faint)]",
        className,
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
  );
}
