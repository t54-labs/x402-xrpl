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
  animated = false,
}: {
  className?: string;
  size?: number;
  cell?: number;
  animated?: boolean;
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
          className={animated ? "ht-dot" : undefined}
          style={
            animated
              ? { animationDelay: `${(-(dist * 2 + ((row * 7 + col * 13) % 5) * 0.12)).toFixed(2)}s` }
              : undefined
          }
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

// XRPL × t54 — the XRP Ledger "X" mark rendered in t54 dots. The X is two
// curved ribbons crossing; we fill that silhouette with a halftone dot field
// (size-graded toward each ribbon's centerline, sparse coral accents) and let
// the pulse ripple outward from the crossing. Deterministic (SSR-safe).
export function XrplDotMark({
  className = "",
  size = 620,
  gap = 3.4,
  animated = true,
}: {
  className?: string;
  size?: number;
  gap?: number;
  animated?: boolean;
}) {
  const VB = 120;
  const cx = 60;
  const cy = 60;
  // two S-curved ribbons (top-left↔bottom-right, top-right↔bottom-left)
  const ribbonA = [
    [16, 17], [30, 31], [44, 46], [54, 56], [60, 60], [66, 64], [76, 74], [90, 89], [104, 103],
  ];
  const ribbonB = [
    [104, 17], [90, 31], [76, 46], [66, 56], [60, 60], [54, 64], [44, 74], [30, 89], [16, 103],
  ];
  const half = 7.6; // ribbon half-width (VB units)
  const segs: number[][] = [];
  for (const rb of [ribbonA, ribbonB]) {
    for (let i = 0; i < rb.length - 1; i++) segs.push([rb[i][0], rb[i][1], rb[i + 1][0], rb[i + 1][1]]);
  }
  const distToSeg = (px: number, py: number, x1: number, y1: number, x2: number, y2: number) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const l2 = dx * dx + dy * dy;
    let t = l2 ? ((px - x1) * dx + (py - y1) * dy) / l2 : 0;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
  };

  const dots: React.ReactElement[] = [];
  let k = 0;
  const maxR = Math.hypot(VB / 2, VB / 2);
  for (let y = gap / 2; y < VB; y += gap) {
    for (let x = gap / 2; x < VB; x += gap) {
      let md = Infinity;
      for (const s of segs) {
        const d = distToSeg(x, y, s[0], s[1], s[2], s[3]);
        if (d < md) md = d;
      }
      if (md > half) continue;
      const edge = 1 - md / half; // 1 at the centerline, 0 at the ribbon edge
      const r = (0.55 + edge * 1.2).toFixed(2);
      const ix = Math.round(x);
      const iy = Math.round(y);
      const coral = edge > 0.35 && (ix * 7 + iy * 13) % 23 === 0;
      const dist = Math.hypot(x - cx, y - cy);
      const delay = -((dist / maxR) * 2.1 + ((ix + iy) % 5) * 0.12).toFixed(2);
      dots.push(
        <circle
          key={k}
          cx={x.toFixed(1)}
          cy={y.toFixed(1)}
          r={r}
          fill={coral ? "var(--t54-coral)" : "currentColor"}
          className={animated ? "ht-dot" : undefined}
          style={animated ? { animationDelay: `${delay}s` } : undefined}
        />,
      );
      k++;
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${VB} ${VB}`} fill="none" aria-hidden className={className}>
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
