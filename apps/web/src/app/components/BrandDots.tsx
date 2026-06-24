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
