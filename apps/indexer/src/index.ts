import { Client } from "xrpl";
import { createServer } from "http";
import { prisma } from "@x402-xrpl/database";
import * as dotenv from "dotenv";
import cron from "node-cron";
import { runAutoDiscoverySync } from "./bazaarSync";

dotenv.config();

const XRPL_WSS = process.env.XRPL_WSS || "wss://s.altnet.rippletest.net:51233";
const HEALTH_PORT = parseInt(process.env.HEALTH_PORT || "4000", 10);
const FLUSH_INTERVAL_MS = 500;
const QUEUE_WARN_SIZE = 10_000;

let indexerHealthy = false;
let lastLedger = 0;

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

function decodeMemoData(tx: any): string {
  if (!tx.Memos || !Array.isArray(tx.Memos)) return "";
  for (const m of tx.Memos) {
    const hex = m?.Memo?.MemoData;
    if (typeof hex === "string" && hex.length > 0) {
      try { return Buffer.from(hex, "hex").toString("utf-8"); } catch { /* skip */ }
    }
  }
  return "";
}

function parseEarliestAvailableLedger(completeLedgers?: string): number | null {
  if (!completeLedgers) return null;
  const firstRange = completeLedgers.split(",")[0]?.trim();
  if (!firstRange) return null;
  const start = parseInt(firstRange.split("-")[0] || "", 10);
  return Number.isFinite(start) && start > 0 ? start : null;
}

// ── Write queue types ───────────────────────────────────────
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

// ── Write queue ─────────────────────────────────────────────
const writeQueue: QueuedTx[] = [];
let highestQueuedLedger = 0;
let flushing = false;

async function flushQueue() {
  if (flushing || writeQueue.length === 0) return;
  flushing = true;

  const batch = writeQueue.splice(0);
  const batchLedger = highestQueuedLedger;

  const uniqueMerchants = [...new Set(batch.map((tx) => tx.merchantAddr))];

  try {
    await prisma.$transaction([
      prisma.merchant.createMany({
        data: uniqueMerchants.map((addr) => ({ address: addr })),
        skipDuplicates: true,
      }),
      prisma.transaction.createMany({
        data: batch.map((tx) => ({
          hash: tx.hash,
          ledgerIndex: tx.ledgerIndex,
          timestamp: tx.timestamp,
          buyerAddress: tx.buyerAddress,
          merchantAddr: tx.merchantAddr,
          amount: tx.amount,
          asset: tx.asset,
          assetIssuer: tx.assetIssuer,
          facilitator: tx.facilitator,
          sourceTag: tx.sourceTag,
          destinationTag: tx.destinationTag,
          invoiceId: tx.invoiceId,
          rawMemo: tx.rawMemo,
        })),
        skipDuplicates: true,
      }),
      prisma.indexerState.upsert({
        where: { id: "default" },
        update: { lastLedgerIndex: batchLedger },
        create: { id: "default", lastLedgerIndex: batchLedger },
      }),
    ]);

    lastLedger = batchLedger;
    console.log(`✅ Flushed ${batch.length} tx(s), ${uniqueMerchants.length} merchant(s) — ledger ${batchLedger}`);
  } catch (err) {
    console.error(`❌ Flush failed (${batch.length} txs):`, err);
    writeQueue.unshift(...batch);
  } finally {
    flushing = false;
  }
}

// ── Transaction detection (no DB calls, pushes to queue) ────
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

  let amountPaid: string;
  if (typeof tx.Amount === "string") {
    const drops = Number(tx.Amount);
    if (!Number.isFinite(drops) || drops <= 0) return;
    amountPaid = (drops / 1_000_000).toString();
  } else {
    amountPaid = String(tx.Amount?.value ?? "");
  }
  if (!amountPaid || amountPaid === "0") return;

  const asset = typeof tx.Amount === "string" ? "XRP" : tx.Amount?.currency || "UNKNOWN";
  const assetIssuer = typeof tx.Amount === "string" ? null : tx.Amount?.issuer || null;
  const destinationTag = typeof tx.DestinationTag === "number" ? tx.DestinationTag : null;
  const invoiceId = tx.InvoiceID || null;
  const rawMemo = decodeMemoData(tx);
  const ledgerIndex = txStream.ledger_index ?? 0;

  writeQueue.push({
    hash: tx.hash,
    ledgerIndex,
    timestamp: new Date(txStream.date ? (txStream.date + 946684800) * 1000 : Date.now()),
    buyerAddress: tx.Account,
    merchantAddr: receiver,
    amount: amountPaid,
    asset,
    assetIssuer,
    facilitator: facilitatorName,
    sourceTag,
    destinationTag,
    invoiceId,
    rawMemo: rawMemo || null,
  });

  if (ledgerIndex > highestQueuedLedger) {
    highestQueuedLedger = ledgerIndex;
  }

  if (writeQueue.length >= QUEUE_WARN_SIZE) {
    console.warn(`⚠️  Write queue size: ${writeQueue.length} — DB may be slow`);
  }
}

// ── Backfill ────────────────────────────────────────────────
async function backfillLedgers(
  client: Client,
  currentLiveIndex: number,
  earliestAvailableLedger: number | null
) {
  let state = await prisma.indexerState.findUnique({
    where: { id: "default" }
  });

  if (!state) {
    const configuredStartRaw = process.env.BACKFILL_START_LEDGER;
    const configuredStart = configuredStartRaw ? parseInt(configuredStartRaw, 10) : NaN;
    const firstRunStart = Number.isFinite(configuredStart) && configuredStart >= 0
      ? configuredStart
      : (earliestAvailableLedger ?? currentLiveIndex);
    const initialLedger = Math.min(firstRunStart, currentLiveIndex);

    state = await prisma.indexerState.create({
      data: { id: "default", lastLedgerIndex: initialLedger }
    });

    if (initialLedger >= currentLiveIndex) {
      console.log(`[Backfill] First run detected. Starting tracking at ledger ${currentLiveIndex}`);
      return;
    }

    console.log(
      `[Backfill] First run detected. Backfilling from ledger ${initialLedger} to ${currentLiveIndex}. ` +
      `Set BACKFILL_START_LEDGER to override.`
    );
  }

  const startLedger = state.lastLedgerIndex;

  if (startLedger >= currentLiveIndex) {
    console.log(`✅ Indexer is up to date at ledger ${currentLiveIndex}. No backfill needed.`);
    return;
  }

  console.log(`⏳ Backfilling ledgers from ${startLedger} to ${currentLiveIndex}...`);

  for (let i = startLedger + 1; i <= currentLiveIndex; i++) {
    try {
      const response = await client.request({
        command: "ledger",
        ledger_index: i,
        transactions: true,
        expand: true
      });

      const ledger = response.result.ledger;
      if (ledger.transactions) {
        for (const tx of ledger.transactions as any[]) {
          const txStreamWrapper = { ledger_index: i, date: ledger.close_time };
          processTransaction(txStreamWrapper, tx);
        }
      }

      if (i % 10 === 0 || i === currentLiveIndex) {
        highestQueuedLedger = Math.max(highestQueuedLedger, i);
        await flushQueue();
        console.log(`[Backfill] Processed up to ledger ${i}`);
      }

    } catch (err) {
      console.error(`❌ Failed to fetch ledger ${i}:`, err);
      break;
    }
  }

  await flushQueue();
  console.log(`✅ Backfill complete.`);
}

// ── Main ────────────────────────────────────────────────────
async function startIndexer() {
  console.log(`Starting x402 XRPL Indexer on ${XRPL_WSS}...`);

  await loadFacilitatorTags();
  if (knownSourceTags.size === 0) {
    console.warn("⚠️  No facilitator tags in database. The indexer won't detect any x402 payments.");
    console.warn("   Insert a row into FacilitatorTag (e.g. sourceTag=804681468) to start indexing.");
  }

  const client = new Client(XRPL_WSS);

  client.on("error", (error) => {
    console.error("XRPL Client Error:", error);
  });

  await client.connect();
  console.log("Connected to XRPL Node.");

  const serverInfo = await client.request({ command: "server_info" });
  const currentLedger = serverInfo.result.info.validated_ledger?.seq || 0;
  const earliestAvailableLedger = parseEarliestAvailableLedger(serverInfo.result.info.complete_ledgers);

  if (currentLedger > 0) {
    await backfillLedgers(client, currentLedger, earliestAvailableLedger);
  }

  console.log("Subscribing to live ledger stream...");
  await client.request({
    command: "subscribe",
    streams: ["transactions"],
  }).catch((err) => {
    console.error("❌ Failed to subscribe to transaction stream:", err);
    process.exit(1);
  });

  client.on("transaction", (txStream: any) => {
    if (!txStream.validated) return;
    processTransaction(txStream, txStream.transaction);
  });

  // Flush the write queue every 500ms
  setInterval(() => { flushQueue().catch(console.error); }, FLUSH_INTERVAL_MS);

  indexerHealthy = true;

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
        xrplNode: XRPL_WSS,
      }));
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  server.listen(HEALTH_PORT, () => {
    console.log(`Health check server listening on :${HEALTH_PORT}/health`);
  });
}

startHealthServer();
startIndexer().catch(console.error);
