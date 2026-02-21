import { Client, Wallet, xrpToDrops } from "xrpl";
import { prisma } from "@x402-xrpl/database";
import * as dotenv from "dotenv";

dotenv.config();

const XRPL_WSS = process.env.XRPL_WSS || "wss://s.altnet.rippletest.net:51233";

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

  // Register the mock merchant in our local DB so the indexer tracks it
  console.log("Registering merchant in local PostgreSQL DB...");
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
  
  // Also log it directly to DB to ensure the dashboard has data immediately
  // (In a real scenario, the running indexer app would catch this via WebSocket)
  console.log("Inserting into database directly for immediate dashboard viewing...");
  await prisma.transaction.create({
    data: {
      hash: txResult.result.hash,
      ledgerIndex: txResult.result.ledger_index as number,
      timestamp: new Date(),
      buyerAddress: buyerWallet.classicAddress,
      merchantAddr: merchantWallet.classicAddress,
      resourceId: (await prisma.resource.findFirst({ where: { url: mockResourceUrl } }))?.id,
      amount: "0.5",
      asset: "XRP",
      rawMemo: mockResourceUrl,
    }
  });

  console.log("Done! You can now view the dashboard to see the transaction.");
  await client.disconnect();
}

runMock().catch(console.error);