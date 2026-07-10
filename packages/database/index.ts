import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export * from "@prisma/client";

/**
 * Normalize an x402 `accepts[].amount` before it is stored as Resource.priceAmount.
 *
 * Under the exact_xrpl scheme XRP amounts are advertised in *drops* (an integer
 * string; 1 XRP = 1_000_000 drops); IOU amounts (RLUSD etc.) are already decimal.
 *
 * EVERY write path to priceAmount must go through this. The API's /verify and the
 * indexer's hourly auto-discovery previously diverged — auto-discovery stored the
 * raw drops, so each re-crawl overwrote converted prices (e.g. "22000 XRP" for
 * what is really 0.022 XRP).
 */
export function normalizeX402Price(rawAmount: unknown, asset: string): string {
  const raw = String(rawAmount ?? "0");
  if (asset === "XRP" && /^\d+$/.test(raw)) {
    return (Number(raw) / 1_000_000).toString();
  }
  return raw;
}

/**
 * Inverse of normalizeX402Price, for re-exporting a stored price in x402 wire format.
 *
 * Resource.priceAmount is stored as decimal XRP, but the exact_xrpl scheme requires XRP
 * amounts in accepts[].amount to be an integer *drops* string. IOU amounts (RLUSD etc.)
 * stay decimal. Rounding absorbs float artifacts (0.022 * 1e6 = 22000.000000000004).
 */
export function toX402WireAmount(amount: string, asset: string): string {
  if (asset === "XRP") {
    const xrp = Number(amount);
    if (Number.isFinite(xrp)) return String(Math.round(xrp * 1_000_000));
  }
  return amount;
}
