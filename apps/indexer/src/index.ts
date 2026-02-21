import { Client } from "xrpl";
import { createServer } from "http";
import { prisma } from "@x402-xrpl/database";
import * as dotenv from "dotenv";
import cron from "node-cron";
import { runAutoDiscoverySync } from "./bazaarSync";

dotenv.config();

const XRPL_WSS = process.env.XRPL_WSS || "wss://s.altnet.rippletest.net:51233";
const HEALTH_PORT = parseInt(process.env.HEALTH_PORT || "4000", 10);

let indexerHealthy = false;
let lastLedger = 0;

// In-memory cache of known x402 facilitator source tags.
// Loaded from the database on startup and refreshed periodically.
let knownSourceTags = new Map<number, string>(); // sourceTag → facilitator name

async function loadFacilitatorTags() {
  const tags = await prisma.facilitatorTag.findMany({ where: { isActive: true } });
  const fresh = new Map<number, string>();
  for (const t of tags) fresh.set(t.sourceTag, t.name);
  knownSourceTags = fresh;
  console.log(`Loaded ${fresh.size} facilitator tag(s): ${[...fresh.entries()].map(([k, v]) => `${k} (${v})`).join(", ") || "none"}`);
}

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

// -------------------------------------------------------------
// Core Transaction Processing Logic
//
// Detection: A Payment is an x402 payment if its SourceTag
// matches a known facilitator tag in our FacilitatorTag table.
//
// Per the XRPL x402 Exact Scheme, the facilitator embeds a
// fixed SourceTag (e.g. 804681468) into every settlement tx.
// This is the on-chain fingerprint for x402 payments on XRPL.
// -------------------------------------------------------------
async function processTransaction(txStream: any, tx: any) {
  if (!tx || tx.TransactionType !== "Payment") return;

  const txResult = getTxResult(txStream, tx);
  if (txResult && txResult !== "tesSUCCESS") return;

  const sourceTag = typeof tx.SourceTag === "number" ? tx.SourceTag : null;
  if (sourceTag === null) return;

  const facilitatorName = knownSourceTags.get(sourceTag);
  if (!facilitatorName) return;

  const receiver = tx.Destination;
  if (!receiver || typeof receiver !== "string") return;

  console.log(`🚨 x402 payment detected (facilitator: ${facilitatorName})! Hash: ${tx.hash}`);

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

  try {
    await prisma.merchant.upsert({
      where: { address: receiver },
      update: {},
      create: { address: receiver },
    });

    await prisma.transaction.upsert({
      where: { hash: tx.hash },
      update: {},
      create: {
        hash: tx.hash,
        ledgerIndex: txStream.ledger_index,
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
      },
    });
    console.log(`✅ Saved x402 transaction ${tx.hash}`);
  } catch (err) {
    console.error(`❌ Failed to persist transaction ${tx.hash}:`, err);
  }
}

// -------------------------------------------------------------
// Backfill Logic
// -------------------------------------------------------------
async function backfillLedgers(
  client: Client,
  currentLiveIndex: number,
  earliestAvailableLedger: number | null
) {
  // Try to find the existing state
  let state = await prisma.indexerState.findUnique({
    where: { id: "default" }
  });

  // If none exists, this is a fresh db. Choose a sensible starting point.
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
          const txStreamWrapper = {
            ledger_index: i,
            date: ledger.close_time
          };
          await processTransaction(txStreamWrapper, tx);
        }
      }

      if (i % 10 === 0 || i === currentLiveIndex) {
        await prisma.indexerState.update({
          where: { id: "default" },
          data: { lastLedgerIndex: i }
        });
        console.log(`[Backfill] Processed up to ledger ${i}`);
      }

    } catch (err) {
      console.error(`❌ Failed to fetch ledger ${i}:`, err);
      break; 
    }
  }

  console.log(`✅ Backfill complete.`);
}

// -------------------------------------------------------------
// Main Loop
// -------------------------------------------------------------
async function startIndexer() {
  console.log(`Starting x402 XRPL Indexer on ${XRPL_WSS}...`);

  await loadFacilitatorTags();
  if (knownSourceTags.size === 0) {
    console.warn("⚠️  No facilitator tags in database. The indexer won't detect any x402 payments.");
    console.warn("   Insert a row into FacilitatorTag (e.g. sourceTag=804681468) to start indexing.");
  }

  const client = new Client(XRPL_WSS);
  
  client.on("error", (errorCode, errorMessage) => {
    console.error("XRPL Client Error:", errorCode, errorMessage);
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
  client.request({
    command: "subscribe",
    streams: ["transactions"],
  });

  client.on("transaction", (txStream: any) => {
    if (!txStream.validated) return;

    void (async () => {
      try {
        await processTransaction(txStream, txStream.transaction);

        lastLedger = txStream.ledger_index;
        await prisma.indexerState.upsert({
          where: { id: "default" },
          update: { lastLedgerIndex: txStream.ledger_index },
          create: { id: "default", lastLedgerIndex: txStream.ledger_index }
        });
      } catch (err) {
        console.error("❌ Failed processing live transaction:", err);
      }
    })();
  });

  indexerHealthy = true;

  // Refresh facilitator tags and run auto-discovery every hour
  cron.schedule("0 * * * *", () => {
    loadFacilitatorTags().catch(console.error);
    runAutoDiscoverySync().catch(console.error);
  });
}

function startHealthServer() {
  const server = createServer(async (_req, res) => {
    if (_req.url === "/health") {
      const state = await prisma.indexerState.findUnique({ where: { id: "default" } }).catch(() => null);
      res.writeHead(indexerHealthy ? 200 : 503, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        status: indexerHealthy ? "healthy" : "starting",
        lastLedgerIndex: state?.lastLedgerIndex ?? lastLedger,
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