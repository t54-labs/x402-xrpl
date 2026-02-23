import express from "express";
import cors from "cors";
import { prisma } from "@x402-xrpl/database";
import * as dotenv from "dotenv";

dotenv.config();

const PORT = parseInt(process.env.PORT || "4001", 10);
const app = express();

app.use(cors());
app.use(express.json());

// ── In-memory cache ─────────────────────────────────────────
const cache = new Map<string, { data: unknown; expiresAt: number }>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry || Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache(key: string, data: unknown, ttlMs: number) {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

// ── Health ──────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// ── Stats (cached 10s) ──────────────────────────────────────
app.get("/stats", async (_req, res) => {
  try {
    const cached = getCached("stats");
    if (cached) return res.json(cached);

    const [totalMerchants, totalResources, indexerState] = await Promise.all([
      prisma.merchant.count(),
      prisma.resource.count({ where: { isActive: true } }),
      prisma.indexerState.findUnique({ where: { id: "default" } }),
    ]);

    const data = {
      totalTransactions: indexerState?.totalTxCount ?? 0,
      totalMerchants,
      totalResources,
      totalVolumeXrp: indexerState?.totalVolumeXrp ?? 0,
      lastLedgerIndex: indexerState?.lastLedgerIndex ?? 0,
      updatedAt: indexerState?.updatedAt ?? null,
    };
    setCache("stats", data, 10_000);
    res.json(data);
  } catch (err) {
    console.error("GET /stats error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// ── Dashboard (cached 10s) ───────────────────────────────────
app.get("/dashboard", async (_req, res) => {
  try {
    const cached = getCached("dashboard");
    if (cached) return res.json(cached);

    const [indexerState, totalMerchants, totalResources, recentTransactions, recentResources, topMerchantsRaw, volumeByAssetRaw] = await Promise.all([
      prisma.indexerState.findUnique({ where: { id: "default" } }),
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
      prisma.$queryRawUnsafe<Array<{ merchantAddr: string; tx_count: bigint }>>(
        `SELECT "merchantAddr", COUNT(*) as tx_count
         FROM "Transaction" GROUP BY "merchantAddr" ORDER BY tx_count DESC LIMIT 5`
      ),
      prisma.$queryRawUnsafe<Array<{ asset: string; total: string }>>(
        `SELECT asset, COALESCE(SUM(CAST(amount AS DOUBLE PRECISION)), 0) as total FROM "Transaction" GROUP BY asset ORDER BY total DESC`
      ),
    ]);

    const merchantAddrs = topMerchantsRaw.map((m) => m.merchantAddr);
    const [merchantDetails, merchantVolumes] = merchantAddrs.length > 0
      ? await Promise.all([
          prisma.merchant.findMany({ where: { address: { in: merchantAddrs } }, select: { address: true, name: true } }),
          prisma.$queryRawUnsafe<Array<{ merchantAddr: string; asset: string; total: string }>>(
            `SELECT "merchantAddr", asset, COALESCE(SUM(CAST(amount AS DOUBLE PRECISION)), 0) as total
             FROM "Transaction" WHERE "merchantAddr" = ANY($1::text[])
             GROUP BY "merchantAddr", asset ORDER BY total DESC`,
            merchantAddrs
          ),
        ])
      : [[], []];
    const nameMap = new Map(merchantDetails.map((m) => [m.address, m.name]));
    const volumeMap = new Map<string, Array<{ asset: string; total: number }>>();
    for (const v of merchantVolumes) {
      const list = volumeMap.get(v.merchantAddr) || [];
      list.push({ asset: v.asset, total: parseFloat(v.total || "0") });
      volumeMap.set(v.merchantAddr, list);
    }

    const topMerchants = topMerchantsRaw.map((m) => ({
      address: m.merchantAddr,
      name: nameMap.get(m.merchantAddr) || null,
      txCount: Number(m.tx_count),
      volume: volumeMap.get(m.merchantAddr)?.find((v) => v.asset === "XRP")?.total ?? 0,
      volumeByAsset: volumeMap.get(m.merchantAddr) || [],
    }));

    const volumeByAsset = volumeByAssetRaw.map((v) => ({ asset: v.asset, total: parseFloat(v.total || "0") }));

    const data = {
      totalTransactions: indexerState?.totalTxCount ?? 0,
      totalMerchants,
      totalResources,
      totalVolumeXrp: indexerState?.totalVolumeXrp ?? 0,
      volumeByAsset,
      recentTransactions,
      recentResources,
      topMerchants,
    };
    setCache("dashboard", data, 10_000);
    res.json(data);
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

// ── Address (cached 10s per address+page) ───────────────────
app.get("/address/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const page = parseInt((req.query.page as string) || "1", 10);
    const cacheKey = `address:${address}:${page}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

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
        prisma.$queryRawUnsafe<Array<{ asset: string; total: string }>>(
          `SELECT asset, COALESCE(SUM(CAST(amount AS DOUBLE PRECISION)), 0) as total FROM "Transaction" WHERE "merchantAddr" = $1 GROUP BY asset ORDER BY total DESC`,
          address
        ),
      ]);

      const volumeByAsset = volumeResult.map((v) => ({ asset: v.asset, total: parseFloat(v.total || "0") }));

      const data = {
        type: "merchant",
        merchant,
        totalTxCount,
        totalVolume: volumeByAsset.find((v) => v.asset === "XRP")?.total ?? 0,
        volumeByAsset,
        transactions,
        pagination: { page, pageSize, totalPages: Math.ceil(totalTxCount / pageSize) },
      };
      setCache(cacheKey, data, 10_000);
      return res.json(data);
    }

    const [transactions, volumeResult, uniqueMerchantResult] = await Promise.all([
      prisma.transaction.findMany({
        where: { buyerAddress: address },
        take: pageSize,
        skip,
        orderBy: { timestamp: "desc" },
        include: { merchant: { select: { address: true, name: true } }, resource: true },
      }),
      prisma.$queryRawUnsafe<Array<{ asset: string; total: string }>>(
        `SELECT asset, COALESCE(SUM(CAST(amount AS DOUBLE PRECISION)), 0) as total FROM "Transaction" WHERE "buyerAddress" = $1 GROUP BY asset ORDER BY total DESC`,
        address
      ),
      prisma.transaction.groupBy({ by: ["merchantAddr"], where: { buyerAddress: address } }),
    ]);

    const spentByAsset = volumeResult.map((v) => ({ asset: v.asset, total: parseFloat(v.total || "0") }));

    const data = {
      type: "buyer",
      address,
      txCount: buyerTxCount,
      totalSpent: spentByAsset.find((v) => v.asset === "XRP")?.total ?? 0,
      spentByAsset,
      uniqueMerchants: uniqueMerchantResult.length,
      transactions,
      pagination: { page, pageSize, totalPages: Math.ceil(buyerTxCount / pageSize) },
    };
    setCache(cacheKey, data, 10_000);
    res.json(data);
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

// ── Verify / Register ───────────────────────────────────────
app.post("/verify", async (req, res) => {
  try {
    const { default: axios } = await import("axios");
    const { url } = req.body;

    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "URL is required" });
    }

    let parsedInput: URL;
    try { parsedInput = new URL(url); } catch {
      return res.status(400).json({ error: "Invalid URL format" });
    }
    if (parsedInput.protocol !== "http:" && parsedInput.protocol !== "https:") {
      return res.status(400).json({ error: "Only http/https URLs are supported" });
    }
    const origin = parsedInput.origin;

    const failed: Array<{ url: string; error: string }> = [];
    const discoveredUrls = new Set<string>();
    let discoveryChecked = false;
    let discoveryFound = 0;
    let discoveredMerchantName: string | null = null;
    let discoveredMerchantDescription: string | null = null;

    try {
      const discoveryResp = await axios.get(`${origin}/.well-known/x402`, {
        timeout: 5000,
        validateStatus: (status: number) => status === 200 || status === 404,
      });
      if (discoveryResp.status === 200) {
        discoveryChecked = true;
        const discoveryData = discoveryResp.data;

        if (typeof discoveryData?.name === "string") discoveredMerchantName = discoveryData.name;
        if (typeof discoveryData?.description === "string") discoveredMerchantDescription = discoveryData.description;

        const resources = Array.isArray(discoveryData?.resources) ? discoveryData.resources : [];
        for (const entry of resources) {
          if (typeof entry === "string") {
            try {
              const normalized = new URL(entry.replace(/^(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\s+/i, "").trim(), origin);
              if (normalized.protocol === "http:" || normalized.protocol === "https:") discoveredUrls.add(normalized.toString());
            } catch { /* skip */ }
          } else if (entry && typeof entry === "object") {
            const resUrl = entry.url || entry.id || entry.resource;
            if (typeof resUrl === "string") {
              try {
                const normalized = new URL(resUrl.replace(/^(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\s+/i, "").trim(), origin);
                if (normalized.protocol === "http:" || normalized.protocol === "https:") discoveredUrls.add(normalized.toString());
              } catch { /* skip */ }
            }
          }
        }
        discoveryFound = discoveredUrls.size;
      }
    } catch { /* continue */ }

    if (discoveredUrls.size === 0 || parsedInput.pathname !== "/" || parsedInput.search) {
      discoveredUrls.add(parsedInput.toString());
    }

    async function verifyAndRegister(resourceUrl: string) {
      const response = await axios.get(resourceUrl, {
        timeout: 7000,
        validateStatus: (status: number) => status === 402 || status === 200,
      });
      if (response.status !== 402) throw new Error(`Returned ${response.status}, not 402`);
      const headerVal = response.headers["payment-required"];
      if (!headerVal) throw new Error("Missing PAYMENT-REQUIRED header");
      const decoded = JSON.parse(Buffer.from(headerVal, "base64").toString("utf-8"));
      const reqs = Array.isArray(decoded) ? decoded : Array.isArray(decoded?.accepts) ? decoded.accepts : [];
      const xrplReq = reqs.find((r: any) => {
        const n = String(r?.network || "").toLowerCase();
        return n === "xrpl" || n.startsWith("xrpl:") || n === "testnet";
      });
      if (!xrplReq?.payTo) throw new Error("No valid XRPL payTo address");

      const rawAmount = String(xrplReq.amount ?? "0");
      const asset = xrplReq.asset || "XRP";
      let priceAmount = rawAmount;
      if (asset === "XRP" && /^\d+$/.test(rawAmount)) {
        priceAmount = (Number(rawAmount) / 1_000_000).toString();
      }

      const resDescription = decoded?.resource?.description;
      const resourceName = typeof resDescription === "string" && resDescription
        ? resDescription
        : (typeof decoded?.description === "string" ? decoded.description : null);

      const merchantUpdate: Record<string, string> = { website: origin };
      if (discoveredMerchantName) merchantUpdate.name = discoveredMerchantName;
      if (discoveredMerchantDescription) merchantUpdate.description = discoveredMerchantDescription;

      await prisma.merchant.upsert({
        where: { address: xrplReq.payTo },
        update: merchantUpdate,
        create: { address: xrplReq.payTo, ...merchantUpdate },
      });
      return prisma.resource.upsert({
        where: { merchantAddr_url: { merchantAddr: xrplReq.payTo, url: resourceUrl } },
        update: { priceAmount, priceAsset: asset, isActive: true, ...(resourceName ? { name: resourceName } : {}) },
        create: {
          merchantAddr: xrplReq.payTo, url: resourceUrl,
          priceAmount, priceAsset: asset,
          schema: "x402", network: xrplReq.network || "xrpl",
          name: resourceName || "Registered Resource",
        },
      });
    }

    const results = await Promise.allSettled(
      [...discoveredUrls].map((url) => verifyAndRegister(url))
    );

    const registered = [];
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const url = [...discoveredUrls][i];
      if (result.status === "fulfilled") {
        registered.push(result.value);
      } else {
        failed.push({ url, error: result.reason instanceof Error ? result.reason.message : "Unknown error" });
      }
    }

    if (registered.length === 0) {
      return res.status(400).json({ error: "Could not verify any x402 resources", discoveryChecked, failed });
    }
    res.json({ success: true, registeredCount: registered.length, discoveryChecked, discoveryFound, failed, resources: registered });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── Start ───────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`x402 API server listening on :${PORT}`);
});
