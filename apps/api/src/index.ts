import express from "express";
import cors from "cors";
import { prisma } from "@x402-xrpl/database";
import * as dotenv from "dotenv";

dotenv.config();

const PORT = parseInt(process.env.PORT || "4001", 10);
const app = express();

app.use(cors());
app.use(express.json());

// ── Health ──────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// ── Stats ───────────────────────────────────────────────────
app.get("/stats", async (_req, res) => {
  try {
    const [totalTransactions, totalMerchants, totalResources, indexerState] = await Promise.all([
      prisma.transaction.count(),
      prisma.merchant.count(),
      prisma.resource.count({ where: { isActive: true } }),
      prisma.indexerState.findUnique({ where: { id: "default" } }),
    ]);

    const volumeResult = await prisma.$queryRawUnsafe<[{ total: string }]>(
      `SELECT COALESCE(SUM(CAST(amount AS DOUBLE PRECISION)), 0) as total FROM "Transaction" WHERE asset = 'XRP'`
    );

    res.json({
      totalTransactions,
      totalMerchants,
      totalResources,
      totalVolumeXrp: parseFloat(volumeResult[0]?.total || "0"),
      lastLedgerIndex: indexerState?.lastLedgerIndex ?? 0,
      updatedAt: indexerState?.updatedAt ?? null,
    });
  } catch (err) {
    console.error("GET /stats error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// ── Dashboard (combined stats + recent data) ────────────────
app.get("/dashboard", async (_req, res) => {
  try {
    const [totalTransactions, totalMerchants, totalResources, recentTransactions, recentResources] = await Promise.all([
      prisma.transaction.count(),
      prisma.merchant.count(),
      prisma.resource.count({ where: { isActive: true } }),
      prisma.transaction.findMany({
        take: 10,
        orderBy: { timestamp: "desc" },
        include: { merchant: { select: { address: true, name: true } } },
      }),
      prisma.resource.findMany({
        take: 5,
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const volumeResult = await prisma.$queryRawUnsafe<[{ total: string }]>(
      `SELECT COALESCE(SUM(CAST(amount AS DOUBLE PRECISION)), 0) as total FROM "Transaction" WHERE asset = 'XRP'`
    );

    res.json({
      totalTransactions,
      totalMerchants,
      totalResources,
      totalVolumeXrp: parseFloat(volumeResult[0]?.total || "0"),
      recentTransactions,
      recentResources,
    });
  } catch (err) {
    console.error("GET /dashboard error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard" });
  }
});

// ── Transactions (paginated) ────────────────────────────────
app.get("/transactions", async (req, res) => {
  try {
    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = Math.min(parseInt((req.query.limit as string) || "25", 10), 100);
    const skip = (page - 1) * limit;
    const merchant = req.query.merchant as string | undefined;
    const buyer = req.query.buyer as string | undefined;

    const where: Record<string, unknown> = {};
    if (merchant) where.merchantAddr = merchant;
    if (buyer) where.buyerAddress = buyer;

    const [items, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { timestamp: "desc" },
        take: limit,
        skip,
        include: {
          merchant: { select: { address: true, name: true } },
          resource: { select: { id: true, url: true, name: true } },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    res.json({ items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    console.error("GET /transactions error:", err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// ── Single transaction ──────────────────────────────────────
app.get("/transactions/:hash", async (req, res) => {
  try {
    const tx = await prisma.transaction.findUnique({
      where: { hash: req.params.hash },
      include: { merchant: true, resource: true },
    });
    if (!tx) return res.status(404).json({ error: "Transaction not found" });
    res.json(tx);
  } catch (err) {
    console.error("GET /transactions/:hash error:", err);
    res.status(500).json({ error: "Failed to fetch transaction" });
  }
});

// ── Address (merchant or buyer) ─────────────────────────────
app.get("/address/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const page = parseInt((req.query.page as string) || "1", 10);
    const pageSize = 20;
    const skip = (page - 1) * pageSize;

    const [merchant, buyerTxCount] = await Promise.all([
      prisma.merchant.findUnique({ where: { address }, include: { resources: true } }),
      prisma.transaction.count({ where: { buyerAddress: address } }),
    ]);

    const isMerchant = !!merchant;
    if (!isMerchant && buyerTxCount === 0) {
      return res.status(404).json({ error: "Address not found" });
    }

    if (isMerchant) {
      const [transactions, totalTxCount, volumeResult] = await Promise.all([
        prisma.transaction.findMany({
          where: { merchantAddr: address },
          take: pageSize,
          skip,
          orderBy: { timestamp: "desc" },
          include: { resource: true, merchant: { select: { address: true, name: true } } },
        }),
        prisma.transaction.count({ where: { merchantAddr: address } }),
        prisma.$queryRawUnsafe<[{ total: string }]>(
          `SELECT COALESCE(SUM(CAST(amount AS DOUBLE PRECISION)), 0) as total FROM "Transaction" WHERE "merchantAddr" = $1 AND asset = 'XRP'`,
          address
        ),
      ]);

      return res.json({
        type: "merchant",
        merchant,
        totalTxCount,
        totalVolume: parseFloat(volumeResult[0]?.total || "0"),
        transactions,
        pagination: { page, pageSize, totalPages: Math.ceil(totalTxCount / pageSize) },
      });
    }

    const [transactions, volumeResult, uniqueMerchantResult] = await Promise.all([
      prisma.transaction.findMany({
        where: { buyerAddress: address },
        take: pageSize,
        skip,
        orderBy: { timestamp: "desc" },
        include: { merchant: { select: { address: true, name: true } }, resource: true },
      }),
      prisma.$queryRawUnsafe<[{ total: string }]>(
        `SELECT COALESCE(SUM(CAST(amount AS DOUBLE PRECISION)), 0) as total FROM "Transaction" WHERE "buyerAddress" = $1 AND asset = 'XRP'`,
        address
      ),
      prisma.transaction.groupBy({ by: ["merchantAddr"], where: { buyerAddress: address } }),
    ]);

    res.json({
      type: "buyer",
      address,
      txCount: buyerTxCount,
      totalSpent: parseFloat(volumeResult[0]?.total || "0"),
      uniqueMerchants: uniqueMerchantResult.length,
      transactions,
      pagination: { page, pageSize, totalPages: Math.ceil(buyerTxCount / pageSize) },
    });
  } catch (err) {
    console.error("GET /address/:address error:", err);
    res.status(500).json({ error: "Failed to fetch address" });
  }
});

// ── Merchants (paginated) ───────────────────────────────────
app.get("/merchants", async (req, res) => {
  try {
    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = Math.min(parseInt((req.query.limit as string) || "25", 10), 100);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.merchant.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
        include: { _count: { select: { resources: true, transactions: true } } },
      }),
      prisma.merchant.count(),
    ]);

    res.json({ items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    console.error("GET /merchants error:", err);
    res.status(500).json({ error: "Failed to fetch merchants" });
  }
});

// ── Resources / Bazaar (paginated) ──────────────────────────
app.get("/resources", async (req, res) => {
  try {
    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = Math.min(parseInt((req.query.limit as string) || "12", 10), 100);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.resource.findMany({
        where: { isActive: true },
        include: { merchant: true, _count: { select: { transactions: true } } },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      prisma.resource.count({ where: { isActive: true } }),
    ]);

    res.json({ items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    console.error("GET /resources error:", err);
    res.status(500).json({ error: "Failed to fetch resources" });
  }
});

// ── Discovery (x402 spec format) ────────────────────────────
app.get("/discovery/resources", async (req, res) => {
  try {
    const limit = Math.min(parseInt((req.query.limit as string) || "20", 10), 100);
    const offset = parseInt((req.query.offset as string) || "0", 10);

    const [resources, total] = await Promise.all([
      prisma.resource.findMany({
        where: { isActive: true },
        orderBy: { updatedAt: "desc" },
        take: limit,
        skip: offset,
        include: { merchant: { select: { address: true, name: true } } },
      }),
      prisma.resource.count({ where: { isActive: true } }),
    ]);

    const items = resources.map((r) => ({
      resource: r.url,
      type: "http",
      x402Version: 1,
      accepts: [{
        scheme: r.schema || "x402",
        network: r.network || "xrpl",
        amount: r.priceAmount,
        asset: r.priceAsset,
        payTo: r.merchantAddr,
      }],
      lastUpdated: r.updatedAt.toISOString(),
      metadata: { name: r.name, description: r.description, merchant: r.merchant?.name || r.merchantAddr },
    }));

    res.json({ x402Version: 1, items, pagination: { limit, offset, total } });
  } catch (err) {
    console.error("GET /discovery/resources error:", err);
    res.status(500).json({ error: "Failed to fetch resources" });
  }
});

// ── Search ──────────────────────────────────────────────────
app.get("/search", async (req, res) => {
  try {
    const q = ((req.query.q as string) || "").trim();
    if (!q) return res.json({ merchants: [], transactions: [], resources: [] });

    const [merchants, transactions, resources] = await Promise.all([
      prisma.merchant.findMany({
        where: { OR: [{ address: { contains: q, mode: "insensitive" } }, { name: { contains: q, mode: "insensitive" } }] },
        take: 10,
      }),
      prisma.transaction.findMany({
        where: { OR: [{ hash: { contains: q, mode: "insensitive" } }, { buyerAddress: { contains: q, mode: "insensitive" } }] },
        include: { merchant: { select: { address: true, name: true } } },
        take: 10,
        orderBy: { timestamp: "desc" },
      }),
      prisma.resource.findMany({
        where: { OR: [{ url: { contains: q, mode: "insensitive" } }, { name: { contains: q, mode: "insensitive" } }] },
        take: 10,
      }),
    ]);

    res.json({ merchants, transactions, resources });
  } catch (err) {
    console.error("GET /search error:", err);
    res.status(500).json({ error: "Search failed" });
  }
});

// ── Start ───────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`x402 API server listening on :${PORT}`);
});
