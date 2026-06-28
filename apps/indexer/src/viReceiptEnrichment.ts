import { prisma, type PrismaClient } from "@x402-xrpl/database";
import {
  lookupViReceiptStatuses,
  type ViLookupTransaction,
  type ViReceiptLookupConfig,
  type ViReceiptStatus,
} from "./viReceiptLookup";

export type ViReceiptEnrichmentConfig = ViReceiptLookupConfig & {
  batchSize: number;
  intervalMs: number;
  lookbackHours: number;
};

export type ViReceiptScanCursor = {
  timestamp: Date;
  hash: string;
};

const DEFAULT_TIMEOUT_MS = 5_000;
const DEFAULT_BATCH_SIZE = 50;
const DEFAULT_INTERVAL_MS = 60_000;
const DEFAULT_LOOKBACK_HOURS = 24;

function positiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

export function loadViReceiptEnrichmentConfig(
  env: NodeJS.ProcessEnv = process.env,
): ViReceiptEnrichmentConfig | null {
  const url = env.VI_RECEIPT_LOOKUP_URL?.trim();
  if (!url) return null;

  return {
    url,
    token: env.VI_RECEIPT_LOOKUP_TOKEN?.trim() || undefined,
    timeoutMs: positiveInt(env.VI_RECEIPT_LOOKUP_TIMEOUT_MS, DEFAULT_TIMEOUT_MS),
    batchSize: positiveInt(env.VI_RECEIPT_ENRICHMENT_BATCH_SIZE, DEFAULT_BATCH_SIZE),
    intervalMs: positiveInt(env.VI_RECEIPT_ENRICHMENT_INTERVAL_MS, DEFAULT_INTERVAL_MS),
    lookbackHours: positiveInt(env.VI_RECEIPT_ENRICHMENT_LOOKBACK_HOURS, DEFAULT_LOOKBACK_HOURS),
  };
}

type TransactionStore = Pick<PrismaClient, "transaction">;

function sinceDate(lookbackHours: number): Date {
  return new Date(Date.now() - lookbackHours * 60 * 60 * 1000);
}

async function pendingTransactions(
  db: TransactionStore,
  config: ViReceiptEnrichmentConfig,
  cursor?: ViReceiptScanCursor,
): Promise<Array<ViLookupTransaction & { timestamp: Date }>> {
  const rows = await db.transaction.findMany({
    where: {
      sourceTag: { not: null },
      timestamp: { gte: sinceDate(config.lookbackHours) },
      OR: [{ verifiableIntent: false }, { riskChecked: false }],
      ...(cursor
        ? {
          AND: [
            {
              OR: [
                { timestamp: { lt: cursor.timestamp } },
                { timestamp: cursor.timestamp, hash: { lt: cursor.hash } },
              ],
            },
          ],
        }
        : {}),
    },
    orderBy: [{ timestamp: "desc" }, { hash: "desc" }],
    take: config.batchSize,
    select: {
      hash: true,
      invoiceId: true,
      rawMemo: true,
      timestamp: true,
    },
  });

  return rows.map((row) => ({
    hash: row.hash,
    invoiceId: row.invoiceId,
    rawMemo: row.rawMemo,
    timestamp: row.timestamp,
  }));
}

function updateData(status: ViReceiptStatus) {
  const data: { verifiableIntent?: true; riskChecked?: true } = {};
  if (status.verifiableIntent || status.riskChecked) data.verifiableIntent = true;
  if (status.riskChecked) data.riskChecked = true;
  return data;
}

export async function enrichViReceiptStatuses(
  config: ViReceiptEnrichmentConfig,
  db: TransactionStore = prisma,
  cursor?: ViReceiptScanCursor,
): Promise<{ checked: number; updated: number; nextCursor: ViReceiptScanCursor | null }> {
  const transactions = await pendingTransactions(db, config, cursor);
  if (transactions.length === 0) return { checked: 0, updated: 0, nextCursor: null };

  const statuses = await lookupViReceiptStatuses(config, transactions);
  let updated = 0;

  for (const tx of transactions) {
    const status = statuses.get(tx.hash.toUpperCase());
    if (!status) continue;

    const data = updateData(status);
    if (Object.keys(data).length === 0) continue;

    const result = await db.transaction.updateMany({
      where: {
        hash: tx.hash,
        OR: [{ verifiableIntent: false }, { riskChecked: false }],
      },
      data,
    });
    updated += result.count;
  }

  const last = transactions[transactions.length - 1];
  return {
    checked: transactions.length,
    updated,
    nextCursor: { timestamp: last.timestamp, hash: last.hash },
  };
}

export function startViReceiptEnrichmentLoop(
  config: ViReceiptEnrichmentConfig,
  db: TransactionStore = prisma,
): void {
  let running = false;
  let cursor: ViReceiptScanCursor | undefined;

  const tick = async () => {
    if (running) return;
    running = true;
    try {
      const result = await enrichViReceiptStatuses(config, db, cursor);
      cursor = result.nextCursor ?? undefined;
      if (result.checked > 0 || result.updated > 0) {
        console.log(
          `VI receipt enrichment checked ${result.checked} tx(s), updated ${result.updated}.`,
        );
      }
    } catch (err) {
      console.warn("VI receipt enrichment failed:", err);
    } finally {
      running = false;
    }
  };

  tick().catch((err) => console.warn("VI receipt enrichment failed:", err));
  setInterval(() => {
    tick().catch((err) => console.warn("VI receipt enrichment failed:", err));
  }, config.intervalMs);
}
