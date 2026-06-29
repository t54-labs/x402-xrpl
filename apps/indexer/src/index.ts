import { Client } from "xrpl";
import { createServer } from "http";
import { prisma } from "@x402-xrpl/database";
import * as dotenv from "dotenv";
import cron from "node-cron";
import { runAutoDiscoverySync } from "./bazaarSync";
import { selectNewTransactions, sumXrpVolume } from "./ledgerState";
import { loadViReceiptEnrichmentConfig, startViReceiptEnrichmentLoop } from "./viReceiptEnrichment";

dotenv.config();

const XRPL_NODES = (process.env.XRPL_WSS || "wss://xrplcluster.com,wss://s1.ripple.com:51233").split(",").map(s => s.trim());
const HEALTH_PORT = parseInt(process.env.HEALTH_PORT || "4000", 10);
const FLUSH_INTERVAL_MS = 500;
const QUEUE_WARN_SIZE = 10_000;
const CONNECT_TIMEOUT_MS = 15_000;
const MAX_BACKFILL_GAP = 500;

let indexerHealthy = false;
let lastLedger = 0;
let currentNodeIndex = 0;

// ── Facilitator tag cache ───────────────────────────────────
let knownSourceTags = new Map<number, string>();

async function loadFacilitatorTags() {
  const tags = await prisma.facilitatorTag.findMany({ where: { isActive: true } });
  const fresh = new Map<number, string>();
  for (const t of tags) fresh.set(t.sourceTag, t.name);
  knownSourceTags = fresh;
  console.log(`Loaded ${fresh.size} facilitator tag(s): ${[...fresh.entries()].map(([k, v]) => `${k} (${v})`).join(", ") || "none"}`);
}

// ── Helpers ─────────────────────────────────────────────────
function getTxResult(txStream: any, tx: any): string | undefined {
  return txStream?.meta?.TransactionResult
    || tx?.meta?.TransactionResult
    || tx?.metaData?.TransactionResult;
}

function sanitizeForPg(str: string): string {
  return str.replace(/\x00/g, "");
}

function decodeMemoData(tx: any): string {
  if (!tx.Memos || !Array.isArray(tx.Memos)) return "";
  for (const m of tx.Memos) {
    const hex = m?.Memo?.MemoData;
    if (typeof hex === "string" && hex.length > 0) {
      try { return sanitizeForPg(Buffer.from(hex, "hex").toString("utf-8")); } catch { /* skip */ }
    }
  }
  return "";
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

// ── Write queue ─────────────────────────────────────────────
type QueuedTx = {
  hash: string;
  ledgerIndex: number;
  timestamp: Date;
  buyerAddress: string;
  merchantAddr: string;
  amount: string;
  asset: string;
  assetIssuer: string | null;
  facilitator: string;
  sourceTag: number;
  destinationTag: number | null;
  invoiceId: string | null;
  rawMemo: string | null;
};

const writeQueue: QueuedTx[] = [];
let highestProcessedLedger = 0;
let flushing = false;
const LEDGER_CHECKPOINT_INTERVAL_MS = 5 * 60_000;
let lastCheckpointTime = Date.now();

async function flushQueue() {
  if (flushing) return;

  const now = Date.now();
  const hasData = writeQueue.length > 0;
  const needsCheckpoint = !hasData
    && highestProcessedLedger > lastLedger
    && (now - lastCheckpointTime) >= LEDGER_CHECKPOINT_INTERVAL_MS;

  if (!hasData && !needsCheckpoint) return;

  flushing = true;

  try {
    if (hasData) {
      const batch = writeQueue.splice(0);
      const batchLedger = Math.max(highestProcessedLedger, ...batch.map(tx => tx.ledgerIndex));
      const uniqueMerchants = [...new Set(batch.map((tx) => tx.merchantAddr))];

      try {
        const result = await prisma.$transaction(async (db) => {
          await db.merchant.createMany({
            data: uniqueMerchants.map((addr) => ({ address: addr })),
            skipDuplicates: true,
          });

          const existingRows = await db.transaction.findMany({
            where: { hash: { in: batch.map((tx) => tx.hash) } },
            select: { hash: true },
          });
          const txsToInsert = selectNewTransactions(batch, new Set(existingRows.map((tx) => tx.hash)));
          const insertedVolumeXrp = sumXrpVolume(txsToInsert);
          const inserted = txsToInsert.length > 0
            ? await db.transaction.createMany({
              data: txsToInsert.map((tx) => ({
                hash: tx.hash, ledgerIndex: tx.ledgerIndex, timestamp: tx.timestamp,
                buyerAddress: tx.buyerAddress, merchantAddr: tx.merchantAddr,
                amount: tx.amount, asset: tx.asset, assetIssuer: tx.assetIssuer,
                facilitator: tx.facilitator, sourceTag: tx.sourceTag,
                destinationTag: tx.destinationTag, invoiceId: tx.invoiceId,
                rawMemo: tx.rawMemo,
              })),
              skipDuplicates: true,
            })
            : { count: 0 };

          await db.$executeRawUnsafe(
            `UPDATE "IndexerState" SET "lastLedgerIndex" = $1, "totalTxCount" = "totalTxCount" + $2, "totalVolumeXrp" = "totalVolumeXrp" + $3, "updatedAt" = NOW() WHERE id = 'default'`,
            batchLedger, inserted.count, insertedVolumeXrp
          );

          return { insertedCount: inserted.count };
        });

        lastLedger = batchLedger;
        lastCheckpointTime = now;
        console.log(`✅ Flushed ${result.insertedCount}/${batch.length} new tx(s), ${uniqueMerchants.length} merchant(s) — ledger ${batchLedger}`);
      } catch (err) {
        console.error(`❌ Flush failed (${batch.length} txs):`, err);
        writeQueue.unshift(...batch);
      }
    } else {
      await prisma.$executeRawUnsafe(
        `UPDATE "IndexerState" SET "lastLedgerIndex" = $1, "updatedAt" = NOW() WHERE id = 'default'`,
        highestProcessedLedger
      );
      lastLedger = highestProcessedLedger;
      lastCheckpointTime = now;
      console.log(`📍 Checkpoint — ledger ${highestProcessedLedger} (no x402 txs)`);
    }
  } finally {
    flushing = false;
  }
}

// ── Transaction detection ───────────────────────────────────
function processTransaction(txStream: any, tx: any) {
  if (!tx || tx.TransactionType !== "Payment") return;

  const txResult = getTxResult(txStream, tx);
  if (txResult && txResult !== "tesSUCCESS") return;

  const sourceTag = typeof tx.SourceTag === "number" ? tx.SourceTag : null;
  if (sourceTag === null) return;

  const facilitatorName = knownSourceTags.get(sourceTag);
  if (!facilitatorName) return;

  const receiver = tx.Destination;
  if (!receiver || typeof receiver !== "string") return;

  const rawAmount = tx.Amount ?? tx.DeliverMax;
  let amountPaid: string;
  if (typeof rawAmount === "string") {
    const drops = Number(rawAmount);
    if (!Number.isFinite(drops) || drops <= 0) return;
    amountPaid = (drops / 1_000_000).toString();
  } else {
    amountPaid = String(rawAmount?.value ?? "");
  }
  if (!amountPaid || amountPaid === "0") return;

  const txHash = tx.hash || txStream.hash;
  const timestamp = txStream.close_time_iso
    ? new Date(txStream.close_time_iso)
    : txStream.date
      ? new Date((txStream.date + 946684800) * 1000)
      : new Date();

  writeQueue.push({
    hash: txHash,
    ledgerIndex: txStream.ledger_index ?? 0,
    timestamp,
    buyerAddress: tx.Account,
    merchantAddr: receiver,
    amount: amountPaid,
    asset: typeof rawAmount === "string" ? "XRP" : rawAmount?.currency || "UNKNOWN",
    assetIssuer: typeof rawAmount === "string" ? null : rawAmount?.issuer || null,
    facilitator: facilitatorName,
    sourceTag,
    destinationTag: typeof tx.DestinationTag === "number" ? tx.DestinationTag : null,
    invoiceId: tx.InvoiceID ? sanitizeForPg(tx.InvoiceID) : null,
    rawMemo: decodeMemoData(tx) || null,
  });

  const ledgerIndex = txStream.ledger_index ?? 0;
  if (ledgerIndex > highestProcessedLedger) highestProcessedLedger = ledgerIndex;
  if (writeQueue.length >= QUEUE_WARN_SIZE) console.warn(`⚠️  Write queue: ${writeQueue.length}`);
}

// ── Connect with failover ───────────────────────────────────
async function connectToXrpl(): Promise<Client> {
  for (let attempt = 0; attempt < XRPL_NODES.length * 2; attempt++) {
    const nodeUrl = XRPL_NODES[currentNodeIndex % XRPL_NODES.length];
    console.log(`Connecting to ${nodeUrl} (attempt ${attempt + 1})...`);

    const client = new Client(nodeUrl, { connectionTimeout: CONNECT_TIMEOUT_MS });
    try {
      await client.connect();
      console.log(`Connected to ${nodeUrl}`);
      return client;
    } catch (err) {
      console.error(`Failed to connect to ${nodeUrl}:`, (err as Error).message);
      currentNodeIndex++;
      await sleep(2000);
    }
  }
  throw new Error("Could not connect to any XRPL node");
}

// ── Backfill (capped, with rate-limit handling) ─────────────
async function backfillLedgers(client: Client, currentLiveIndex: number) {
  let state = await prisma.indexerState.findUnique({ where: { id: "default" } });

  if (!state) {
    state = await prisma.indexerState.create({
      data: { id: "default", lastLedgerIndex: currentLiveIndex }
    });
    console.log(`[Backfill] First run. Starting at ledger ${currentLiveIndex}`);
    return;
  }

  const gap = currentLiveIndex - state.lastLedgerIndex;

  if (gap <= 0) {
    console.log(`✅ Indexer up to date at ledger ${currentLiveIndex}`);
    return;
  }

  if (gap > MAX_BACKFILL_GAP) {
    console.log(`[Backfill] Gap is ${gap} ledgers. Skipping to ${currentLiveIndex - MAX_BACKFILL_GAP} (max backfill: ${MAX_BACKFILL_GAP})`);
    await prisma.indexerState.update({
      where: { id: "default" },
      data: { lastLedgerIndex: currentLiveIndex - MAX_BACKFILL_GAP }
    });
    state = await prisma.indexerState.findUnique({ where: { id: "default" } });
    if (!state) return;
  }

  const startLedger = state.lastLedgerIndex;
  console.log(`⏳ Backfilling ${currentLiveIndex - startLedger} ledgers (${startLedger} → ${currentLiveIndex})...`);

  let retryDelay = 1000;
  for (let i = startLedger + 1; i <= currentLiveIndex; i++) {
    try {
      const response = await client.request({
        command: "ledger",
        ledger_index: i,
        transactions: true,
        expand: true,
      });

      const ledger = response.result.ledger;
      if (ledger.transactions) {
        for (const rawTx of ledger.transactions as any[]) {
          const tx = rawTx.tx_json ?? rawTx;
          const envelope = {
            ledger_index: i,
            date: ledger.close_time,
            close_time_iso: rawTx.close_time_iso,
            meta: rawTx.meta ?? rawTx.metaData,
            hash: rawTx.hash,
          };
          processTransaction(envelope, tx);
        }
      }

      if (i % 10 === 0 || i === currentLiveIndex) {
        highestProcessedLedger = Math.max(highestProcessedLedger, i);
        await flushQueue();
      }

      retryDelay = 1000;
    } catch (err: any) {
      const isRateLimit = err?.data?.error === "slowDown" || err?.message?.includes("slowDown");
      if (isRateLimit) {
        console.warn(`[Backfill] Rate limited at ledger ${i}. Waiting ${retryDelay / 1000}s...`);
        await sleep(retryDelay);
        retryDelay = Math.min(retryDelay * 2, 30_000);
        i--;
        continue;
      }
      console.error(`❌ Backfill error at ledger ${i}:`, err?.message || err);
      break;
    }
  }

  await flushQueue();
  console.log(`✅ Backfill complete.`);
}

// ── Main ────────────────────────────────────────────────────
async function startIndexer() {
  console.log(`Starting x402 XRPL Indexer...`);
  console.log(`Nodes: ${XRPL_NODES.join(", ")}`);

  await loadFacilitatorTags();
  if (knownSourceTags.size === 0) {
    console.warn("⚠️  No facilitator tags. Insert a FacilitatorTag row to start indexing.");
  }

  const viReceiptEnrichment = loadViReceiptEnrichmentConfig();
  if (viReceiptEnrichment) {
    console.log(`VI receipt enrichment enabled: ${viReceiptEnrichment.url}`);
    startViReceiptEnrichmentLoop(viReceiptEnrichment);
  } else {
    console.log("VI receipt enrichment disabled. Set VI_RECEIPT_LOOKUP_URL to enable.");
  }

  const client = await connectToXrpl();

  client.on("error", (error) => {
    console.error("XRPL Client Error:", error);
  });

  client.on("disconnected", async (code) => {
    console.warn(`XRPL disconnected (code ${code}). Reconnecting in 5s...`);
    indexerHealthy = false;
    await sleep(5000);
    try {
      await client.connect();
      await client.request({ command: "subscribe", streams: ["transactions"] });
      indexerHealthy = true;
      console.log("Reconnected and resubscribed.");
    } catch (err) {
      console.error("Reconnection failed. Process will restart via systemd.", err);
      process.exit(1);
    }
  });

  const serverInfo = await client.request({ command: "server_info" });
  const currentLedger = serverInfo.result.info.validated_ledger?.seq || 0;

  if (currentLedger > 0) {
    await backfillLedgers(client, currentLedger);
  }

  console.log("Subscribing to live transaction stream...");
  await client.request({
    command: "subscribe",
    streams: ["transactions"],
  }).catch((err) => {
    console.error("❌ Failed to subscribe:", err);
    process.exit(1);
  });

  client.on("transaction", (txStream: any) => {
    if (!txStream.validated) return;

    const tx = txStream.tx_json ?? txStream.transaction ?? txStream;
    processTransaction(txStream, tx);

    const li = txStream.ledger_index ?? 0;
    if (li > highestProcessedLedger) highestProcessedLedger = li;
  });

  setInterval(() => { flushQueue().catch(console.error); }, FLUSH_INTERVAL_MS);

  indexerHealthy = true;
  console.log("🟢 Indexer is live and tracking transactions.");

  cron.schedule("0 * * * *", () => {
    loadFacilitatorTags().catch(console.error);
    runAutoDiscoverySync().catch(console.error);
  });
}

// ── Health check ────────────────────────────────────────────
function startHealthServer() {
  const server = createServer(async (_req, res) => {
    if (_req.url === "/health") {
      const state = await prisma.indexerState.findUnique({ where: { id: "default" } }).catch(() => null);
      res.writeHead(indexerHealthy ? 200 : 503, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        status: indexerHealthy ? "healthy" : "starting",
        lastLedgerIndex: state?.lastLedgerIndex ?? lastLedger,
        queueSize: writeQueue.length,
        updatedAt: state?.updatedAt ?? null,
        xrplNode: XRPL_NODES[currentNodeIndex % XRPL_NODES.length],
      }));
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  server.listen(HEALTH_PORT, () => {
    console.log(`Health check on :${HEALTH_PORT}/health`);
  });
}

startHealthServer();
startIndexer().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
