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
// SvgDotMark fills an SVG silhouette with a t54 dot field by CLIPPING a dot grid
// to the path(s) — the browser does the exact point-in-path test, so the dots
// always match the artwork precisely (no hand-sampled geometry to drift). Drop
// in any path data + viewBox to retheme it. A soft coral band sweeps the mark
// to carry the motion.
export function SvgDotMark({
  paths,
  viewBox = [0, 0, 512, 424],
  className = "",
  size = 760,
  gap = 16,
  dotR = 2.6,
  animated = true,
  clipId = "svg-dot-clip",
}: {
  paths: string[];
  viewBox?: number[];
  className?: string;
  size?: number;
  gap?: number;
  dotR?: number;
  animated?: boolean;
  clipId?: string;
}) {
  const [vx, vy, W, H] = viewBox;
  const dots: React.ReactElement[] = [];
  let k = 0;
  for (let y = vy + gap / 2; y < vy + H; y += gap) {
    for (let x = vx + gap / 2; x < vx + W; x += gap) {
      const ix = Math.round(x);
      const iy = Math.round(y);
      // sparse, deterministic coral accents + a little size texture (SSR-safe)
      const coral = (ix * 7 + iy * 13) % 37 === 0;
      const r = (dotR + ((ix * 31 + iy * 17) % 3) * 0.4).toFixed(2);
      dots.push(
        <circle
          key={k}
          cx={x.toFixed(1)}
          cy={y.toFixed(1)}
          r={r}
          fill={coral ? "var(--t54-coral)" : "currentColor"}
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
      <defs>
        <clipPath id={clipId}>
          {paths.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </clipPath>
        <linearGradient id={`${clipId}-glow`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--t54-coral)" stopOpacity="0" />
          <stop offset="50%" stopColor="var(--t54-coral)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--t54-coral)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        {dots}
        {animated && (
          <rect
            className="xrp-sweep"
            x={vx}
            y={vy}
            width={W}
            height={H * 0.42}
            fill={`url(#${clipId}-glow)`}
            style={{ mixBlendMode: "screen" }}
          />
        )}
      </g>
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
  dotR?: number;
  animated?: boolean;
}) {
  return <SvgDotMark paths={XRP_MARK_PATHS} viewBox={[0, 0, 512, 424]} clipId="xrpl-mark-clip" {...props} />;
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
