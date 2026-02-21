import { Client, xrpToDrops } from "xrpl";
import { prisma } from "@x402-xrpl/database";
import * as dotenv from "dotenv";

dotenv.config();

const XRPL_WSS = process.env.XRPL_WSS || "wss://s.altnet.rippletest.net:51233";

async function waitForIndexerRecord(
  txHash: string,
  timeoutMs = 60_000,
  pollMs = 2_000
): Promise<boolean> {
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    const existing = await prisma.transaction.findUnique({
      where: { hash: txHash },
      select: { hash: true },
    });

    if (existing) {
      return true;
    }

    await new Promise((resolve) => setTimeout(resolve, pollMs));
  }

  return false;
}

// Helper to hex encode strings for XRPL Memos
function stringToHex(str: string): string {
  return Buffer.from(str, "utf8").toString("hex").toUpperCase();
}

async function runMock() {
  console.log(`Connecting to ${XRPL_WSS}...`);
  const client = new Client(XRPL_WSS);
  await client.connect();

  console.log("Funding mock merchant wallet on Testnet...");
  const merchantWallet = (await client.fundWallet()).wallet;
  console.log(`Merchant Address: ${merchantWallet.classicAddress}`);

  console.log("Funding mock buyer wallet on Testnet...");
  const buyerWallet = (await client.fundWallet()).wallet;
  console.log(`Buyer Address: ${buyerWallet.classicAddress}`);

  // Optional metadata seeding for local dashboard readability.
  console.log("Seeding merchant/resource metadata in local PostgreSQL...");
  const mockResourceUrl = "https://mock-api.x402scan.com/v1/generate";
  
  await prisma.merchant.upsert({
    where: { address: merchantWallet.classicAddress },
    update: {},
    create: {
      address: merchantWallet.classicAddress,
      name: "Mock API Provider",
    }
  });

  await prisma.resource.upsert({
    where: {
      merchantAddr_url: {
        merchantAddr: merchantWallet.classicAddress,
        url: mockResourceUrl
      }
    },
    update: {},
    create: {
      merchantAddr: merchantWallet.classicAddress,
      url: mockResourceUrl,
      priceAmount: "0.5",
      priceAsset: "XRP",
      schema: "x402",
      network: "xrpl"
    }
  });

  console.log("Sending an x402 formatted XRPL Payment from buyer to merchant...");

  // The x402 payload data for the Memo
  const memoDataJson = JSON.stringify({
    res: mockResourceUrl,
    req: "mock_request_hash_12345"
  });

  const tx: any = {
    TransactionType: "Payment",
    Account: buyerWallet.classicAddress,
    Amount: xrpToDrops("0.5"), // Paying 0.5 XRP for the API call
    Destination: merchantWallet.classicAddress,
    DestinationTag: 402, // An example destination tag for routing
    SourceTag: 999, // An example source tag 
    Memos: [
      {
        Memo: {
          MemoType: stringToHex("x402"),
          MemoData: stringToHex(memoDataJson)
        }
      }
    ]
  };

  const prepared = await client.autofill(tx);
  const signed = buyerWallet.sign(prepared);
  
  console.log("Submitting transaction...");
  const txResult = await client.submitAndWait(signed.tx_blob);
  
  console.log("Transaction validated!");
  console.log(`Hash: ${txResult.result.hash}`);
  
  console.log("Waiting for running indexer to ingest this transaction...");
  const indexed = await waitForIndexerRecord(txResult.result.hash);
  if (indexed) {
    console.log("✅ Indexer detected and saved the transaction.");
  } else {
    console.warn("⚠️ Timed out waiting for indexer ingestion. Keep indexer running and re-check /api/transactions.");
  }

  console.log("Done.");
  await client.disconnect();
  await prisma.$disconnect();
}

runMock().catch(console.error);