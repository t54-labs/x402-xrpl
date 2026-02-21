import { Client } from "xrpl";
import { createServer } from "http";
import { prisma } from "@x402-xrpl/database";
import * as dotenv from "dotenv";
import cron from "node-cron";
import { runAutoDiscoverySync } from "./bazaarSync";
import { identifyFacilitator } from "./facilitators";

dotenv.config();

const XRPL_WSS = process.env.XRPL_WSS || "wss://s.altnet.rippletest.net:51233";
const HEALTH_PORT = parseInt(process.env.HEALTH_PORT || "4000", 10);

let indexerHealthy = false;
let lastLedger = 0;

function decodeMemo(hex: string): string {
  try {
    return Buffer.from(hex, "hex").toString("utf-8");
  } catch {
    return "";
  }
}

function getTxResult(txStream: any, tx: any): string | undefined {
  return txStream?.meta?.TransactionResult
    || tx?.meta?.TransactionResult
    || tx?.metaData?.TransactionResult;
}

// -------------------------------------------------------------
// Core Transaction Processing Logic
//
// Detection: A Payment is an x402 payment if and only if one of
// its Memos has MemoType that hex-decodes to "x402".
// Per the XRPL x402 standard, MemoType 78343032 is canonical.
// -------------------------------------------------------------
async function processTransaction(txStream: any, tx: any) {
  if (!tx || tx.TransactionType !== "Payment") return;

  const txResult = getTxResult(txStream, tx);
  if (txResult && txResult !== "tesSUCCESS") return;

  let isX402 = false;
  let resourceUrl = "";

  if (tx.Memos && tx.Memos.length > 0) {
    for (const m of tx.Memos) {
      if (!m.Memo) continue;
      const memoType = m.Memo.MemoType ? decodeMemo(m.Memo.MemoType) : "";

      if (memoType.toLowerCase() !== "x402") continue;

      isX402 = true;
      const memoData = m.Memo.MemoData ? decodeMemo(m.Memo.MemoData) : "";
      try {
        const payload = JSON.parse(memoData);
        resourceUrl = typeof payload?.res === "string" ? payload.res : "";
      } catch {
        resourceUrl = memoData;
      }
      break;
    }
  }

  if (!isX402) return;

  const receiver = tx.Destination;
  if (!receiver || typeof receiver !== "string") return;

  console.log(`🚨 Detected x402 payment! Hash: ${tx.hash}`);

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
  const facilitator = identifyFacilitator(tx, resourceUrl);
  const destinationTag = typeof tx.DestinationTag === "number" ? tx.DestinationTag : null;
  const sourceTag = typeof tx.SourceTag === "number" ? tx.SourceTag : null;

  await prisma.merchant.upsert({
    where: { address: receiver },
    update: {},
    create: { address: receiver },
  });

  let resourceId: string | undefined;
  if (resourceUrl) {
    const resource = await prisma.resource.upsert({
      where: {
        merchantAddr_url: {
          merchantAddr: receiver,
          url: resourceUrl,
        },
      },
      update: {
        priceAmount: amountPaid,
        priceAsset: asset,
        isActive: true,
      },
      create: {
        merchantAddr: receiver,
        url: resourceUrl,
        priceAmount: amountPaid,
        priceAsset: asset,
        schema: "x402",
        network: "xrpl",
        name: "Discovered Resource",
        isActive: true,
      },
    });
    resourceId = resource.id;
  }

  try {
    await prisma.transaction.upsert({
      where: { hash: tx.hash },
      update: {},
      create: {
        hash: tx.hash,
        ledgerIndex: txStream.ledger_index,
        timestamp: new Date(txStream.date ? (txStream.date + 946684800) * 1000 : Date.now()),
        buyerAddress: tx.Account,
        merchantAddr: receiver,
        resourceId,
        amount: amountPaid,
        asset,
        assetIssuer,
        facilitator,
        destinationTag,
        sourceTag,
        rawMemo: resourceUrl,
      },
    });
    console.log(`✅ Saved x402 transaction ${tx.hash}`);
  } catch (err) {
    console.error(`❌ Failed to save transaction ${tx.hash}:`, err);
  }
}

// -------------------------------------------------------------
// Backfill Logic
// -------------------------------------------------------------
async function backfillLedgers(client: Client, currentLiveIndex: number) {
  // Try to find the existing state
  let state = await prisma.indexerState.findUnique({
    where: { id: "default" }
  });

  // If none exists, this is a fresh db, start from now
  if (!state) {
    state = await prisma.indexerState.create({
      data: { id: "default", lastLedgerIndex: currentLiveIndex }
    });
    console.log(`[Backfill] First run detected. Starting tracking at ledger ${currentLiveIndex}`);
    return;
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

  const client = new Client(XRPL_WSS);
  
  client.on("error", (errorCode, errorMessage) => {
    console.error("XRPL Client Error:", errorCode, errorMessage);
  });

  await client.connect();
  console.log("Connected to XRPL Node.");

  const serverInfo = await client.request({ command: "server_info" });
  const currentLedger = serverInfo.result.info.validated_ledger?.seq || 0;

  if (currentLedger > 0) {
    await backfillLedgers(client, currentLedger);
  }

  console.log("Subscribing to live ledger stream...");
  client.request({
    command: "subscribe",
    streams: ["transactions"],
  });

  client.on("transaction", async (txStream: any) => {
    if (!txStream.validated) return;
    
    await processTransaction(txStream, txStream.transaction);

    lastLedger = txStream.ledger_index;
    await prisma.indexerState.upsert({
      where: { id: "default" },
      update: { lastLedgerIndex: txStream.ledger_index },
      create: { id: "default", lastLedgerIndex: txStream.ledger_index }
    });
  });

  indexerHealthy = true;

  cron.schedule("0 * * * *", () => {
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