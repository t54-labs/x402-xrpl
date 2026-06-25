// Shared brand-logo chip. Merchant logos are app-icon style and built for dark,
// so a black tile lets baked-in dark backgrounds blend and light/transparent
// marks pop. Falls back to a monogram tile when there's no logo.
export function BrandLogo({
  logoUrl,
  name,
  className = "h-9 w-9",
}: {
  logoUrl?: string | null;
  name?: string | null;
  className?: string;
}) {
  if (logoUrl) {
    return (
      <span className={`flex ${className} shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--border)] bg-black`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
      </span>
    );
  }
  return (
    <span className={`flex ${className} shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,0.04)] font-plek text-[12px] text-[var(--paper-mute)]`}>
      {(name?.match(/[A-Za-z0-9]/)?.[0] ?? "·").toUpperCase()}
    </span>
  );
}
