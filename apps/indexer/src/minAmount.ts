function parseFloor(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

// Minimum DELIVERED value (in the asset's own decimal units) at or above which a
// facilitator-tagged payment is recorded. Below the floor it is ignored — no Merchant row,
// no Transaction.
//
// A facilitator SourceTag is published unauthenticated on /facilitators, so without a floor
// anyone could stamp ~1-drop (near-free) dust payments with it, minting arbitrary merchants
// and inflating the public Top Merchants leaderboard. Defaults sit well below the smallest
// known legitimate x402 micropayments (0.001 XRP, 0.0011 RLUSD) and above 1 drop
// (0.000001 XRP); tune per asset via env if a genuine sub-floor merchant appears.
export const DEFAULT_MIN_XRP = parseFloor(process.env.MIN_INDEX_AMOUNT_XRP, 0.0001);
export const DEFAULT_MIN_IOU = parseFloor(process.env.MIN_INDEX_AMOUNT_IOU, 0.0001);

/**
 * True if `amount` (a decimal string in the asset's own units) meets the minimum floor for
 * its asset. XRP uses `minXrp`; every issued currency (RLUSD etc.) uses `minIou`.
 */
export function meetsMinAmount(
  amount: string,
  asset: string,
  minXrp: number = DEFAULT_MIN_XRP,
  minIou: number = DEFAULT_MIN_IOU,
): boolean {
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) return false;
  const floor = asset === "XRP" ? minXrp : minIou;
  return value >= floor;
}
