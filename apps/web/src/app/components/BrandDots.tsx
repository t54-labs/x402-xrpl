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

// --- XRP Ledger "X" mark, reconstructed from the official logo outline ---
// (viewBox 0 0 512 424). The mark is two horizontally-ended curved bands: a top
// valley that dips to the center and a bottom caret that rises to it. We sample
// the exact bezier/arc outline into polygons so the dot fill lands precisely
// inside the real silhouette — horizontal tips and all.
type Pt = [number, number];

function cubicPts(p0: Pt, p1: Pt, p2: Pt, p3: Pt, n: number): Pt[] {
  const out: Pt[] = [];
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    const mt = 1 - t;
    out.push([
      mt * mt * mt * p0[0] + 3 * mt * mt * t * p1[0] + 3 * mt * t * t * p2[0] + t * t * t * p3[0],
      mt * mt * mt * p0[1] + 3 * mt * mt * t * p1[1] + 3 * mt * t * t * p2[1] + t * t * t * p3[1],
    ]);
  }
  return out;
}

// SVG elliptical-arc (endpoint param) → sampled points, per the W3C conversion.
function arcPts(x1: number, y1: number, rx: number, ry: number, sweep: number, x2: number, y2: number, n: number): Pt[] {
  const dx = (x1 - x2) / 2;
  const dy = (y1 - y2) / 2;
  const x1p = dx;
  const y1p = dy;
  let rx2 = rx * rx;
  let ry2 = ry * ry;
  const x1p2 = x1p * x1p;
  const y1p2 = y1p * y1p;
  const lam = x1p2 / rx2 + y1p2 / ry2;
  if (lam > 1) {
    const s = Math.sqrt(lam);
    rx *= s;
    ry *= s;
    rx2 = rx * rx;
    ry2 = ry * ry;
  }
  let num = rx2 * ry2 - rx2 * y1p2 - ry2 * x1p2;
  if (num < 0) num = 0;
  const co = (0 !== sweep ? -1 : 1) * Math.sqrt(num / (rx2 * y1p2 + ry2 * x1p2));
  const cxp = (co * rx * y1p) / ry;
  const cyp = (-co * ry * x1p) / rx;
  const cx = cxp + (x1 + x2) / 2;
  const cy = cyp + (y1 + y2) / 2;
  const ang = (ux: number, uy: number, vx: number, vy: number) => {
    const d = ux * vx + uy * vy;
    const l = Math.hypot(ux, uy) * Math.hypot(vx, vy);
    let a = Math.acos(Math.max(-1, Math.min(1, d / l)));
    if (ux * vy - uy * vx < 0) a = -a;
    return a;
  };
  const ux = (x1p - cxp) / rx;
  const uy = (y1p - cyp) / ry;
  const th1 = ang(1, 0, ux, uy);
  let dth = ang(ux, uy, (-x1p - cxp) / rx, (-y1p - cyp) / ry);
  if (!sweep && dth > 0) dth -= 2 * Math.PI;
  if (sweep && dth < 0) dth += 2 * Math.PI;
  const out: Pt[] = [];
  for (let i = 1; i <= n; i++) {
    const t = th1 + dth * (i / n);
    out.push([rx * Math.cos(t) + cx, ry * Math.sin(t) + cy]);
  }
  return out;
}

const XRP_TOP: Pt[] = [
  [437, 0], [511, 0], [357, 152.48],
  ...cubicPts([357, 152.48], [301.23, 207.67], [210.81, 207.67], [155, 152.48], 16),
  [0.94, 0], [75, 0], [192, 115.83],
  ...arcPts(192, 115.83, 91.11, 91.11, 0, 319.91, 115.83, 16),
];
const XRP_BOTTOM: Pt[] = [
  [74.05, 424], [0, 424], [155, 270.58],
  ...cubicPts([155, 270.58], [210.77, 215.39], [301.19, 215.39], [357, 270.58], 16),
  [512, 424], [438, 424], [320, 307.23],
  ...arcPts(320, 307.23, 91.11, 91.11, 0, 192.09, 307.23, 16),
];

function inPoly(x: number, y: number, poly: Pt[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function edgeDist(x: number, y: number, poly: Pt[]): number {
  let md = Infinity;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const x1 = poly[j][0], y1 = poly[j][1], x2 = poly[i][0], y2 = poly[i][1];
    const ax = x2 - x1, ay = y2 - y1;
    const l2 = ax * ax + ay * ay;
    let t = l2 ? ((x - x1) * ax + (y - y1) * ay) / l2 : 0;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    const d = Math.hypot(x - (x1 + t * ax), y - (y1 + t * ay));
    if (d < md) md = d;
  }
  return md;
}

// XRPL × t54 — the official XRP "X" silhouette rendered as a t54 dot field:
// halftone (dots grow toward each band's spine), sparse coral accents, and a
// pulse rippling out from the center waist. Deterministic (SSR-safe).
export function XrplDotMark({
  className = "",
  size = 720,
  gap = 13,
  animated = true,
}: {
  className?: string;
  size?: number;
  gap?: number;
  animated?: boolean;
}) {
  const W = 512;
  const H = 424;
  const cx = 256;
  const cy = 212;
  const maxR = Math.hypot(cx, cy);
  const dots: React.ReactElement[] = [];
  let k = 0;
  for (let y = gap / 2; y < H; y += gap) {
    for (let x = gap / 2; x < W; x += gap) {
      const top = inPoly(x, y, XRP_TOP);
      const inside = top || inPoly(x, y, XRP_BOTTOM);
      if (!inside) continue;
      const ed = edgeDist(x, y, top ? XRP_TOP : XRP_BOTTOM);
      const t = Math.min(ed / 24, 1); // 0 at the band edge → 1 deep on the spine
      const r = (1.7 + t * 2.6).toFixed(2);
      const ix = Math.round(x);
      const iy = Math.round(y);
      const coral = ed > 11 && (ix * 7 + iy * 13) % 31 === 0;
      const dist = Math.hypot(x - cx, y - cy);
      const delay = -((dist / maxR) * 2.0 + ((ix + iy) % 5) * 0.12).toFixed(2);
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
    <svg
      width={size}
      height={Math.round((size * H) / W)}
      viewBox={`0 0 ${W} ${H}`}
      fill="none"
      aria-hidden
      className={className}
    >
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
