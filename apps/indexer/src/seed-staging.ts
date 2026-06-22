/**
 * Seed the STAGING database with realistic sample data so the explorer / Index,
 * Agora, Merchants, and Transactions pages render non-zero, demo-able content
 * without running an indexer.
 *
 * Safety: refuses to run unless DATABASE_URL points at a "staging" database.
 *
 * Run (with the staging DB reachable, e.g. via `kubectl port-forward`):
 *   DATABASE_URL="postgresql://postgres:<pw>@127.0.0.1:55432/x402_xrpl_staging?sslmode=disable" \
 *     pnpm --filter @x402-xrpl/indexer exec ts-node src/seed-staging.ts
 */
import { prisma } from "@x402-xrpl/database";

const DB = process.env.DATABASE_URL ?? "";
if (!/staging/i.test(DB)) {
  console.error(
    "Refusing to seed: DATABASE_URL does not look like a staging database.\n" +
      "Point DATABASE_URL at the x402_xrpl_staging database before running."
  );
  process.exit(1);
}

// Deterministic, 32-bit-safe PRNG (Math.imul avoids float overflow past 2^53).
let _s = 1337 >>> 0;
function rand(): number {
  _s = (Math.imul(_s, 1664525) + 1013904223) >>> 0;
  return _s / 4294967296;
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}
function addr(prefix: string, i: number): string {
  const alphabet = "rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz";
  let out = "r";
  let x = (Math.imul(i + 1, 2654435761) ^ Math.imul(prefix.charCodeAt(0), 40503)) >>> 0;
  for (let k = 0; k < 32; k++) {
    x = (Math.imul(x, 1664525) + 1013904223) >>> 0;
    out += alphabet[x % alphabet.length];
  }
  return out;
}
function hexHash(i: number): string {
  const hex = "0123456789ABCDEF";
  // First 8 chars encode i, guaranteeing uniqueness across the run.
  let out = (i >>> 0).toString(16).toUpperCase().padStart(8, "0").slice(-8);
  let x = Math.imul(i + 7, 2654435761) >>> 0;
  for (let k = 0; k < 56; k++) {
    x = (Math.imul(x, 1664525) + 1013904223) >>> 0;
    out += hex[(x >>> (k % 24)) & 15];
  }
  return out.slice(0, 64);
}

const RLUSD_ISSUER = "rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De";

const FACILITATORS = [
  { sourceTag: 804681468, name: "t54 XRPL Facilitator", url: "https://xrpl-facilitator-mainnet.t54.ai", weight: 0.6 },
  { sourceTag: 612345678, name: "Catalyst Pay", url: "https://catalyst.example", weight: 0.25 },
  { sourceTag: 913572468, name: "LedgerGate", url: "https://ledgergate.example", weight: 0.15 },
];

const MERCHANTS = [
  { name: "AskSurf", website: "https://asksurf.ai", logoUrl: "/merchants/asksurf.ico", description: "AI-powered conversational search and crypto data skills, payable per query over x402." },
  { name: "LucyOS", website: "https://lucyos.ai", logoUrl: "/merchants/lucy.ico", description: "Real-time token analytics for the XRPL ecosystem, metered by call." },
  { name: "Heurist", website: "https://heurist.xyz", logoUrl: "/merchants/heurist.ico", description: "Decentralized AI inference — LLMs and image generation, pay-per-use." },
  { name: "BlockRunAI", website: "https://blockrun.ai", logoUrl: null, description: "Per-call LLM gateway across 30+ models, settled on XRPL." },
  { name: "NofaAI", website: "https://nofa.ai", logoUrl: "/merchants/nofa.png", description: "Agent memory and retrieval API for autonomous workflows." },
  { name: "Virtuals on XRPL", website: "https://virtuals.io", logoUrl: null, description: "Agent Commerce Protocol settlement via the t54 facilitator." },
];

const RESOURCES: Record<string, Array<{ name: string; url: string; priceAmount: string; priceAsset: string }>> = {
  AskSurf: [
    { name: "Conversational Search", url: "https://api.asksurf.ai/v1/search", priceAmount: "0.02", priceAsset: "RLUSD" },
    { name: "Crypto Data Skill", url: "https://api.asksurf.ai/v1/data", priceAmount: "0.01", priceAsset: "RLUSD" },
  ],
  LucyOS: [{ name: "Token Analysis", url: "https://api.lucyos.ai/v1/analyze", priceAmount: "0.5", priceAsset: "XRP" }],
  Heurist: [
    { name: "LLM Inference (Llama-3)", url: "https://api.heurist.xyz/v1/chat", priceAmount: "0.05", priceAsset: "RLUSD" },
    { name: "Image Generation", url: "https://api.heurist.xyz/v1/image", priceAmount: "0.10", priceAsset: "RLUSD" },
  ],
  BlockRunAI: [
    { name: "GPT-4o Gateway", url: "https://api.blockrun.ai/v1/openai", priceAmount: "0.03", priceAsset: "RLUSD" },
    { name: "Claude Gateway", url: "https://api.blockrun.ai/v1/anthropic", priceAmount: "0.04", priceAsset: "RLUSD" },
  ],
  NofaAI: [{ name: "Agent Memory API", url: "https://api.nofa.ai/v1/memory", priceAmount: "0.2", priceAsset: "XRP" }],
  "Virtuals on XRPL": [{ name: "ACP Settlement", url: "https://api.virtuals.io/acp/settle", priceAmount: "1.0", priceAsset: "RLUSD" }],
};

const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = Date.now();
const TX_COUNT = 160;
const BASE_LEDGER = 94_250_000;

function weightedFacilitator() {
  const r = rand();
  let acc = 0;
  for (const f of FACILITATORS) {
    acc += f.weight;
    if (r <= acc) return f;
  }
  return FACILITATORS[0];
}

async function main() {
  console.log(`Seeding staging DB: ${DB.replace(/:[^:@/]+@/, ":****@")}`);

  // Clean slate (staging only — guarded above).
  await prisma.transaction.deleteMany({});
  await prisma.resource.deleteMany({});
  await prisma.merchant.deleteMany({});
  await prisma.facilitatorTag.deleteMany({});

  for (const f of FACILITATORS) {
    await prisma.facilitatorTag.create({
      data: { sourceTag: f.sourceTag, name: f.name, url: f.url, isActive: true },
    });
  }

  const merchantAddrs: Record<string, string> = {};
  for (let i = 0; i < MERCHANTS.length; i++) {
    const m = MERCHANTS[i];
    const address = addr("M", i);
    merchantAddrs[m.name] = address;
    await prisma.merchant.create({
      data: { address, name: m.name, website: m.website, logoUrl: m.logoUrl, description: m.description },
    });
  }

  // Resources keyed by id so transactions can reference them.
  const resourcePool: Array<{ id: string; merchantAddr: string; priceAsset: string; priceAmount: string }> = [];
  for (const m of MERCHANTS) {
    const list = RESOURCES[m.name] ?? [];
    for (let j = 0; j < list.length; j++) {
      const r = list[j];
      const created = await prisma.resource.create({
        data: {
          merchantAddr: merchantAddrs[m.name],
          url: r.url,
          name: r.name,
          priceAmount: r.priceAmount,
          priceAsset: r.priceAsset,
          schema: "x402",
          network: "xrpl",
          isDiscovered: rand() > 0.5,
          isActive: true,
        },
      });
      resourcePool.push({ id: created.id, merchantAddr: merchantAddrs[m.name], priceAsset: r.priceAsset, priceAmount: r.priceAmount });
    }
  }

  // ~30 distinct buyer ("agent") wallets.
  const buyers = Array.from({ length: 30 }, (_, i) => addr("B", i));

  let totalXrp = 0;
  let maxLedger = BASE_LEDGER;
  for (let i = 0; i < TX_COUNT; i++) {
    const res = pick(resourcePool);
    const fac = weightedFacilitator();
    // Weight timestamps toward recent so 1d/7d/1m deltas all show activity.
    const ageDays = Math.floor(Math.pow(rand(), 1.8) * 35);
    const ts = new Date(NOW - ageDays * DAY_MS - Math.floor(rand() * DAY_MS));
    const ledgerIndex = BASE_LEDGER + Math.floor((NOW - ts.getTime()) / 4000) * -1 + 1_000_000 + i;
    maxLedger = Math.max(maxLedger, ledgerIndex);

    const isXrp = res.priceAsset === "XRP";
    // Vary around the list price.
    const base = parseFloat(res.priceAmount);
    const amountNum = Math.max(0.001, base * (0.5 + rand() * 3));
    const amount = isXrp ? amountNum.toFixed(6) : amountNum.toFixed(2);
    if (isXrp) totalXrp += amountNum;

    await prisma.transaction.create({
      data: {
        hash: hexHash(i),
        ledgerIndex,
        timestamp: ts,
        buyerAddress: pick(buyers),
        merchantAddr: res.merchantAddr,
        resourceId: res.id,
        amount,
        asset: isXrp ? "XRP" : "RLUSD",
        assetIssuer: isXrp ? null : RLUSD_ISSUER,
        facilitator: fac.name,
        sourceTag: fac.sourceTag,
        invoiceId: hexHash(i + 9000).slice(0, 32),
      },
    });
  }

  await prisma.indexerState.upsert({
    where: { id: "default" },
    update: { lastLedgerIndex: maxLedger, totalTxCount: TX_COUNT, totalVolumeXrp: totalXrp },
    create: { id: "default", lastLedgerIndex: maxLedger, totalTxCount: TX_COUNT, totalVolumeXrp: totalXrp },
  });

  const merchants = await prisma.merchant.count();
  const resources = await prisma.resource.count();
  const txs = await prisma.transaction.count();
  console.log(`✅ Seeded: ${merchants} merchants, ${resources} resources, ${txs} transactions, ${FACILITATORS.length} facilitators.`);
  console.log(`   XRP volume ≈ ${totalXrp.toFixed(2)} XRP, last ledger ${maxLedger}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
