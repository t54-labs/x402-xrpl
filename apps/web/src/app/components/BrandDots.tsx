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

// --- t54 dot mark from any SVG path ---------------------------------------
// SvgDotMark fills an SVG silhouette with a t54 dot field. It parses the path
// data into polygons (flattening curves/arcs), keeps every dot whose center
// lands inside — so the edge is a clean ring of whole dots — and grows each dot
// toward the shape's spine (distance to the nearest edge) for a halftone
// gradient. Per-dot size pulses ripple out from the center as a sine wave. Drop
// in any path(s) + viewBox to retheme it; the silhouette follows the artwork.
type Pt = [number, number];

function cubicPts(p0: Pt, p1: Pt, p2: Pt, p3: Pt, n: number): Pt[] {
  const out: Pt[] = [];
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    const m = 1 - t;
    out.push([
      m * m * m * p0[0] + 3 * m * m * t * p1[0] + 3 * m * t * t * p2[0] + t * t * t * p3[0],
      m * m * m * p0[1] + 3 * m * m * t * p1[1] + 3 * m * t * t * p2[1] + t * t * t * p3[1],
    ]);
  }
  return out;
}

// SVG elliptical arc → points, via the W3C endpoint-to-center conversion.
function arcPts(x1: number, y1: number, rx: number, ry: number, rotDeg: number, laf: number, sf: number, x2: number, y2: number, n: number): Pt[] {
  if (rx === 0 || ry === 0) return [[x2, y2]];
  const phi = (rotDeg * Math.PI) / 180;
  const cp = Math.cos(phi);
  const sp = Math.sin(phi);
  const dx = (x1 - x2) / 2;
  const dy = (y1 - y2) / 2;
  const x1p = cp * dx + sp * dy;
  const y1p = -sp * dx + cp * dy;
  rx = Math.abs(rx);
  ry = Math.abs(ry);
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
  const sign = laf !== sf ? 1 : -1; // W3C: +1 when largeArc != sweep
  const co = sign * Math.sqrt(num / (rx2 * y1p2 + ry2 * x1p2));
  const cxp = co * ((rx * y1p) / ry);
  const cyp = co * (-((ry * x1p) / rx));
  const cx = cp * cxp - sp * cyp + (x1 + x2) / 2;
  const cy = sp * cxp + cp * cyp + (y1 + y2) / 2;
  const ang = (ux: number, uy: number, vx: number, vy: number) => {
    let a = Math.acos(Math.max(-1, Math.min(1, (ux * vx + uy * vy) / (Math.hypot(ux, uy) * Math.hypot(vx, vy)))));
    if (ux * vy - uy * vx < 0) a = -a;
    return a;
  };
  const ux = (x1p - cxp) / rx;
  const uy = (y1p - cyp) / ry;
  const th1 = ang(1, 0, ux, uy);
  let dth = ang(ux, uy, (-x1p - cxp) / rx, (-y1p - cyp) / ry);
  if (!sf && dth > 0) dth -= 2 * Math.PI;
  if (sf && dth < 0) dth += 2 * Math.PI;
  const out: Pt[] = [];
  for (let i = 1; i <= n; i++) {
    const t = th1 + dth * (i / n);
    const ex = Math.cos(t) * rx;
    const ey = Math.sin(t) * ry;
    out.push([cp * ex - sp * ey + cx, sp * ex + cp * ey + cy]);
  }
  return out;
}

// Minimal path-data → polygons (M/L/H/V/C/A/Z, absolute + relative). Curves are
// flattened; the result feeds point-in-polygon + edge-distance, not rendering.
function pathToPolys(d: string): Pt[][] {
  const toks = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e-?\d+)?/g);
  if (!toks) return [];
  let i = 0;
  const num = () => parseFloat(toks[i++]);
  const polys: Pt[][] = [];
  let cur: Pt[] = [];
  let x = 0;
  let y = 0;
  let sx = 0;
  let sy = 0;
  let cmd = "";
  while (i < toks.length) {
    if (/[a-zA-Z]/.test(toks[i])) cmd = toks[i++];
    const rel = cmd >= "a";
    const C = cmd.toUpperCase();
    if (C === "M") {
      let px = num();
      let py = num();
      if (rel) { px += x; py += y; }
      if (cur.length) polys.push(cur);
      cur = [[px, py]];
      x = px; y = py; sx = px; sy = py;
      cmd = rel ? "l" : "L";
    } else if (C === "L") {
      let px = num();
      let py = num();
      if (rel) { px += x; py += y; }
      cur.push([px, py]); x = px; y = py;
    } else if (C === "H") {
      let px = num();
      if (rel) px += x;
      cur.push([px, y]); x = px;
    } else if (C === "V") {
      let py = num();
      if (rel) py += y;
      cur.push([x, py]); y = py;
    } else if (C === "C") {
      let a1 = num(), b1 = num(), a2 = num(), b2 = num(), px = num(), py = num();
      if (rel) { a1 += x; b1 += y; a2 += x; b2 += y; px += x; py += y; }
      for (const pt of cubicPts([x, y], [a1, b1], [a2, b2], [px, py], 20)) cur.push(pt);
      x = px; y = py;
    } else if (C === "A") {
      const rx = num(), ry = num(), rot = num(), laf = num(), sf = num();
      let px = num(), py = num();
      if (rel) { px += x; py += y; }
      for (const pt of arcPts(x, y, rx, ry, rot, laf, sf, px, py, 22)) cur.push(pt);
      x = px; y = py;
    } else if (C === "Z") {
      cur.push([sx, sy]); polys.push(cur); cur = []; x = sx; y = sy;
    } else {
      i++;
    }
  }
  if (cur.length) polys.push(cur);
  return polys;
}

function ptInPolys(x: number, y: number, polys: Pt[][]): boolean {
  let inside = false;
  for (const poly of polys) {
    for (let a = 0, b = poly.length - 1; a < poly.length; b = a++) {
      const xi = poly[a][0], yi = poly[a][1], xj = poly[b][0], yj = poly[b][1];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
  }
  return inside;
}

function distToEdges(x: number, y: number, segs: number[][]): number {
  let md = Infinity;
  for (const s of segs) {
    const ax = s[2] - s[0];
    const ay = s[3] - s[1];
    const l2 = ax * ax + ay * ay;
    let t = l2 ? ((x - s[0]) * ax + (y - s[1]) * ay) / l2 : 0;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    const d = Math.hypot(x - (s[0] + t * ax), y - (s[1] + t * ay));
    if (d < md) md = d;
  }
  return md;
}

export function SvgDotMark({
  paths,
  viewBox = [0, 0, 512, 424],
  className = "",
  size = 760,
  gap = 11,
  animated = true,
  spine = 18,
}: {
  paths: string[];
  viewBox?: number[];
  className?: string;
  size?: number;
  gap?: number;
  animated?: boolean;
  spine?: number;
}) {
  const [vx, vy, W, H] = viewBox;
  const polys = paths.flatMap((d) => pathToPolys(d));
  const segs: number[][] = [];
  for (const poly of polys) {
    for (let a = 0; a < poly.length - 1; a++) segs.push([poly[a][0], poly[a][1], poly[a + 1][0], poly[a + 1][1]]);
  }
  const cx = vx + W / 2;
  const cy = vy + H / 2;
  const maxR = Math.hypot(W / 2, H / 2);
  const dots: React.ReactElement[] = [];
  let k = 0;
  for (let y = vy + gap / 2; y < vy + H; y += gap) {
    for (let x = vx + gap / 2; x < vx + W; x += gap) {
      if (!ptInPolys(x, y, polys)) continue;
      const ed = distToEdges(x, y, segs);
      const t = Math.min(ed / spine, 1); // 0 at the edge -> 1 on the spine
      const r = (1.15 + t * 2.05).toFixed(2);
      const ix = Math.round(x);
      const iy = Math.round(y);
      const coral = t > 0.45 && (ix * 7 + iy * 13) % 41 === 0;
      const dist = Math.hypot(x - cx, y - cy);
      const delay = -((dist / maxR) * 3.2 + ((ix + iy) % 5) * 0.18).toFixed(2);
      dots.push(
        <circle
          key={k}
          cx={x.toFixed(1)}
          cy={y.toFixed(1)}
          r={r}
          fill={coral ? "var(--t54-coral)" : "currentColor"}
          className={animated ? "dot-throb" : undefined}
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
      viewBox={`${vx} ${vy} ${W} ${H}`}
      fill="none"
      aria-hidden
      className={className}
    >
      {dots}
    </svg>
  );
}

// The official XRP Ledger "X" mark (two horizontally-ended curved bands), as a
// t54 dot field. Paths copied verbatim from the official logo SVG (viewBox
// 0 0 512 424) so the silhouette is exact.
const XRP_MARK_PATHS = [
  "M437,0h74L357,152.48c-55.77,55.19-146.19,55.19-202,0L.94,0H75L192,115.83a91.11,91.11,0,0,0,127.91,0Z",
  "M74.05,424H0L155,270.58c55.77-55.19,146.19-55.19,202,0L512,424H438L320,307.23a91.11,91.11,0,0,0-127.91,0Z",
];

export function XrplDotMark(props: {
  className?: string;
  size?: number;
  gap?: number;
  animated?: boolean;
}) {
  return <SvgDotMark paths={XRP_MARK_PATHS} viewBox={[0, 0, 512, 424]} {...props} />;
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
