// t54 brand dot motif. The dot — solid, occasionally coral — is a core t54
// branding element. Two pieces:
//   • BrandDots — a short accent cluster (the "·· ·" signature, one coral dot).
//   • DotField  — a faint halftone grid for subtle background texture.
// Positions are deterministic so SSR and client render identically.

export function BrandDots({ className = "", count = 4 }: { className?: string; count?: number }) {
  const coralIndex = Math.max(0, count - 2); // a single coral accent near the end
  const gap = 11;
  const w = count * gap;
  return (
    <svg width={w} height="8" viewBox={`0 0 ${w} 8`} fill="none" aria-hidden className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <circle
          key={i}
          cx={4 + i * gap}
          cy="4"
          r="2.5"
          fill={i === coralIndex ? "var(--t54-coral)" : "var(--paper-faint)"}
        />
      ))}
    </svg>
  );
}

// Halftone aperture — the t54 "shape built from graded dots" motif. A radial
// ring of dots whose size swells toward a mid-radius band (an iris/lens), with a
// small center dot and sparse coral accents along the ring. Base dot color is
// currentColor so the parent controls it. Deterministic (SSR-safe).
export function Halftone({
  className = "",
  size = 360,
  cell = 12,
}: {
  className?: string;
  size?: number;
  cell?: number;
}) {
  const n = Math.floor(size / cell);
  const center = (n - 1) / 2;
  const dots: React.ReactElement[] = [];
  let k = 0;
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      const dx = col - center;
      const dy = row - center;
      const dist = Math.sqrt(dx * dx + dy * dy) / center; // 0 at center → ~1 at edge
      if (dist > 1.04) continue; // clip to a circle
      // gaussian ring peaking around dist 0.66 (the iris band) + a small pupil
      const ring = Math.exp(-Math.pow((dist - 0.66) / 0.24, 2));
      const pupil = dist < 0.1 ? 0.85 : 0;
      const intensity = Math.max(ring, pupil);
      if (intensity < 0.05) continue;
      const r = 0.6 + intensity * (cell * 0.46);
      const onRing = Math.abs(dist - 0.66) < 0.18;
      const coral = onRing && (row * 31 + col * 17) % 17 === 0;
      dots.push(
        <circle
          key={k}
          cx={col * cell + cell / 2}
          cy={row * cell + cell / 2}
          r={r}
          fill={coral ? "var(--t54-coral)" : "currentColor"}
        />,
      );
      k++;
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" aria-hidden className={className}>
      {dots}
    </svg>
  );
}

// Standard page-header accent — a faint halftone aperture in the top-right,
// sitting behind content. The parent container must be `relative isolate`
// (and usually `overflow-hidden`) so the z-[-1] graphic stays behind the text
// but above the page background.
export function PageHalftone({ className = "" }: { className?: string }) {
  return (
    <Halftone
      size={300}
      className={`pointer-events-none absolute -top-10 right-0 z-[-1] hidden lg:block text-[var(--paper-faint)] opacity-40 ${className}`}
    />
  );
}

export function DotField({
  className = "",
  cols = 16,
  rows = 6,
  gap = 13,
}: {
  className?: string;
  cols?: number;
  rows?: number;
  gap?: number;
}) {
  const dots = [];
  let k = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // sparse, deterministic coral accents (~1 in 23)
      const coral = (k * 7 + 3) % 23 === 0;
      dots.push(
        <circle
          key={k}
          cx={c * gap + gap / 2}
          cy={r * gap + gap / 2}
          r={coral ? 1.5 : 1.15}
          fill={coral ? "var(--t54-coral)" : "currentColor"}
          opacity={coral ? 0.85 : 1}
        />,
      );
      k++;
    }
  }
  const w = cols * gap;
  const h = rows * gap;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" aria-hidden className={className}>
      {dots}
    </svg>
  );
}
