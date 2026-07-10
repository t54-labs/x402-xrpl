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
