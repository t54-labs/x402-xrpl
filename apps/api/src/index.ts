import express from "express";
import cors from "cors";
import { prisma, normalizeX402Price, toX402WireAmount } from "@x402-xrpl/database";
import * as dotenv from "dotenv";
import {
  canIssueAdminSessions,
  createAdminSession,
  loadAdminConfig,
  requireAdminAuth,
  verifyAdminCredentials,
} from "./adminAuth";
import { createRateLimit } from "./rateLimit";
import { assertSafeHttpUrl, safeHttpRequest } from "./safeFetch";

dotenv.config();

const PORT = parseInt(process.env.PORT || "4001", 10);
const app = express();
const MAX_LOGO_BYTES = 256 * 1024;
const MAX_DISCOVERY_RESOURCES = 100;
const LOGO_DATA_URL_RE = /^data:(image\/(?:png|jpeg|webp|gif));base64,([a-z0-9+/=\s]+)$/i;
const verifyRateLimit = createRateLimit({ keyPrefix: "verify", windowMs: 60_000, max: 30 });
const logoRateLimit = createRateLimit({ keyPrefix: "merchant-logo", windowMs: 60_000, max: 10 });
const adminLoginRateLimit = createRateLimit({ keyPrefix: "admin-login", windowMs: 60_000, max: 10 });

app.set("trust proxy", 1);
app.use(cors());
app.use(express.json({ limit: "1mb" }));

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

function clearDashboardCaches() {
  cache.clear();
}

function parseHttpUrl(input: unknown): URL | null {
  if (!input || typeof input !== "string") return null;
  try {
    const parsed = new URL(input);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed : null;
  } catch {
    return null;
  }
}

function normalizeResourceUrl(input: string, origin: string) {
  const stripped = input.replace(/^(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\s+/i, "").trim();
  const parsed = new URL(stripped, origin);
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
  return parsed.toString();
}

async function resolveX402ResourceUrls(parsedInput: URL) {
  await assertSafeHttpUrl(parsedInput);

  const origin = parsedInput.origin;
  const discoveredUrls = new Set<string>();
  const discoveredMeta = new Map<string, { name: string | null; description: string | null }>();
  let discoveryChecked = false;
  let discoveryFound = 0;
  let discoveredMerchantName: string | null = null;
  let discoveredMerchantDescription: string | null = null;

  try {
    const discoveryUrl = await assertSafeHttpUrl(new URL("/.well-known/x402", origin));
    const discoveryResp = await safeHttpRequest(discoveryUrl, {
      timeout: 5000,
    });
    if (discoveryResp.status === 200) {
      discoveryChecked = true;
      const discoveryData = discoveryResp.data as {
        name?: unknown;
        description?: unknown;
        resources?: unknown;
      };

      if (typeof discoveryData?.name === "string") discoveredMerchantName = discoveryData.name;
      if (typeof discoveryData?.description === "string") discoveredMerchantDescription = discoveryData.description;

      const resources = Array.isArray(discoveryData?.resources) ? discoveryData.resources : [];
      for (const entry of resources) {
        const resUrl = typeof entry === "string"
          ? entry
          : entry && typeof entry === "object"
            ? entry.url || entry.id || entry.resource
            : null;
        if (typeof resUrl !== "string") continue;
        try {
          const normalized = normalizeResourceUrl(resUrl, origin);
          if (normalized) {
            await assertSafeHttpUrl(normalized);
            discoveredUrls.add(normalized);
            // Carry the catalog's own name/description so a listing reads as
            // "Exa Search" instead of a bare "Registered Resource".
            if (entry && typeof entry === "object") {
              discoveredMeta.set(normalized, {
                name: typeof entry.name === "string" ? entry.name.slice(0, 120) : null,
                description: typeof entry.description === "string" ? entry.description.slice(0, 500) : null,
              });
            }
          }
          if (discoveredUrls.size >= MAX_DISCOVERY_RESOURCES) break;
        } catch { /* skip invalid discovery entries */ }
      }
      discoveryFound = discoveredUrls.size;
    }
  } catch { /* continue with the submitted URL */ }

  if (discoveredUrls.size === 0 || parsedInput.pathname !== "/" || parsedInput.search) {
    discoveredUrls.add(parsedInput.toString());
  }

  // Prune only on a full re-crawl of the origin root (not a single-endpoint
  // submit), so entries advertised in an earlier run but gone from the catalog retire.
  const discoveryComplete =
    discoveryChecked && discoveryFound > 0 && parsedInput.pathname === "/" && !parsedInput.search;

  return {
    origin,
    discoveredUrls,
    discoveredMeta,
    discoveryChecked,
    discoveryFound,
    discoveryComplete,
    discoveredMerchantName,
    discoveredMerchantDescription,
  };
}

async function fetchX402Requirement(resourceUrl: string) {
  let response = await safeHttpRequest(resourceUrl, {
    method: "GET",
    timeout: 7000,
  });
  if (response.status !== 402) {
    response = await safeHttpRequest(resourceUrl, {
      method: "POST",
      data: {},
      timeout: 7000,
    });
  }
  if (response.status !== 402) throw new Error(`Request failed with status code ${response.status}`);

  const headerVal = response.headers["payment-required"];
  if (!headerVal) throw new Error("Missing PAYMENT-REQUIRED header");

  const decoded = JSON.parse(Buffer.from(headerVal, "base64").toString("utf-8"));
  const reqs = Array.isArray(decoded) ? decoded : Array.isArray(decoded?.accepts) ? decoded.accepts : [];
  const xrplReq = reqs.find((r: any) => {
    const n = String(r?.network || "").toLowerCase();
    return n === "xrpl" || n.startsWith("xrpl:") || n === "testnet";
  });
  if (!xrplReq?.payTo) throw new Error("No valid XRPL payTo address");

  return { decoded, xrplReq };
}

function parseLogoDataUrl(input: unknown) {
  if (typeof input !== "string") return null;
  const match = input.match(LOGO_DATA_URL_RE);
  if (!match) return null;

  const mime = match[1].toLowerCase();
  const bytes = Buffer.from(match[2].replace(/\s/g, ""), "base64");
  if (bytes.length === 0 || bytes.length > MAX_LOGO_BYTES) return null;

  return `data:${mime};base64,${bytes.toString("base64")}`;
}

function publicErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Invalid request";
}

// ── Health ──────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/admin/login", adminLoginRateLimit, (req, res) => {
  const config = loadAdminConfig();
  if (!canIssueAdminSessions(config)) {
    return res.status(503).json({ error: "Admin login is not configured" });
  }

  const { username, password } = req.body || {};
  if (!verifyAdminCredentials(config, username, password)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  res.json({
    token: createAdminSession(config),
    expiresIn: config.ttlSeconds,
  });
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
app.get("/dashboard", async (req, res) => {
  try {
    const range = req.query.range === "7d" ? "7d" : req.query.range === "30d" ? "30d" : "all";
    const days = range === "7d" ? 7 : range === "30d" ? 30 : 0;
    const tf = days ? `WHERE "timestamp" >= NOW() - INTERVAL '${days} days'` : "";
    const cacheKey = `dashboard:${range}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    const [indexerState, totalMerchantsAll, totalResources, recentTransactions, recentResources, topMerchantsRaw, volumeByAssetRaw, activeAgentsRaw, facilitatorTxRaw, facilitatorVolRaw, windowCountsRaw, tsRows, tsAssetRows] = await Promise.all([
      prisma.indexerState.findUnique({ where: { id: "default" } }),
      prisma.merchant.count(),
      prisma.resource.count({ where: { isActive: true } }),
      prisma.transaction.findMany({
        take: 10,
        orderBy: { timestamp: "desc" },
        include: { merchant: { select: { address: true, name: true, logoUrl: true } } },
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
        `SELECT asset, COALESCE(SUM(CAST(amount AS DOUBLE PRECISION)), 0) as total FROM "Transaction" ${tf} GROUP BY asset ORDER BY total DESC`
      ),
      prisma.$queryRawUnsafe<Array<{ c: bigint }>>(
        `SELECT COUNT(DISTINCT "buyerAddress") as c FROM "Transaction" ${tf}`
      ),
      prisma.$queryRawUnsafe<Array<{ sourceTag: number; name: string | null; tx_count: bigint }>>(
        `SELECT t."sourceTag" as "sourceTag", f.name as name, COUNT(*) as tx_count
         FROM "Transaction" t JOIN "FacilitatorTag" f ON f."sourceTag" = t."sourceTag"
         WHERE t."sourceTag" IS NOT NULL
         GROUP BY t."sourceTag", f.name ORDER BY tx_count DESC`
      ),
      prisma.$queryRawUnsafe<Array<{ sourceTag: number; asset: string; total: string }>>(
        `SELECT t."sourceTag" as "sourceTag", t.asset as asset, COALESCE(SUM(CAST(t.amount AS DOUBLE PRECISION)), 0) as total
         FROM "Transaction" t WHERE t."sourceTag" IS NOT NULL
         GROUP BY t."sourceTag", t.asset`
      ),
      prisma.$queryRawUnsafe<Array<{ tx: bigint; merchants: bigint }>>(
        `SELECT COUNT(*) as tx, COUNT(DISTINCT "merchantAddr") as merchants FROM "Transaction" ${tf}`
      ),
      prisma.$queryRawUnsafe<Array<{ bucket: Date; tx: number; vol: number; merchants: number }>>(
        `SELECT date_trunc('hour', "timestamp") AS bucket, COUNT(*)::int AS tx, COALESCE(SUM(CAST(amount AS DOUBLE PRECISION)),0) AS vol, COUNT(DISTINCT "merchantAddr")::int AS merchants
         FROM "Transaction" ${tf} GROUP BY 1 ORDER BY 1 ASC`
      ),
      prisma.$queryRawUnsafe<Array<{ bucket: Date; asset: string; vol: number }>>(
        `SELECT date_trunc('hour', "timestamp") AS bucket, asset, COALESCE(SUM(CAST(amount AS DOUBLE PRECISION)),0) AS vol
         FROM "Transaction" ${tf} GROUP BY 1, asset ORDER BY 1 ASC`
      ),
    ]);

    const merchantAddrs = topMerchantsRaw.map((m) => m.merchantAddr);
    let merchantDetails: Array<{ address: string; name: string | null; logoUrl?: string | null }> = [];
    let merchantVolumes: Array<{ merchantAddr: string; asset: string; total: string }> = [];
    if (merchantAddrs.length > 0) {
      const placeholders = merchantAddrs.map((_, i) => `$${i + 1}`).join(",");
      [merchantDetails, merchantVolumes] = await Promise.all([
        prisma.merchant.findMany({ where: { address: { in: merchantAddrs } }, select: { address: true, name: true, logoUrl: true } }),
        prisma.$queryRawUnsafe<Array<{ merchantAddr: string; asset: string; total: string }>>(
          `SELECT "merchantAddr", asset, COALESCE(SUM(CAST(amount AS DOUBLE PRECISION)), 0) as total
           FROM "Transaction" WHERE "merchantAddr" IN (${placeholders})
           GROUP BY "merchantAddr", asset ORDER BY total DESC`,
          ...merchantAddrs
        ),
      ]);
    }
    const nameMap = new Map(merchantDetails.map((m) => [m.address, m.name]));
    const logoMap = new Map(merchantDetails.map((m) => [m.address, m.logoUrl]));
    const volumeMap = new Map<string, Array<{ asset: string; total: number }>>();
    for (const v of merchantVolumes) {
      const list = volumeMap.get(v.merchantAddr) || [];
      list.push({ asset: v.asset, total: parseFloat(v.total || "0") });
      volumeMap.set(v.merchantAddr, list);
    }

    const topMerchants = topMerchantsRaw.map((m) => ({
      address: m.merchantAddr,
      name: nameMap.get(m.merchantAddr) || null,
      logoUrl: logoMap.get(m.merchantAddr) || null,
      txCount: Number(m.tx_count),
      volume: volumeMap.get(m.merchantAddr)?.find((v) => v.asset === "XRP")?.total ?? 0,
      volumeByAsset: volumeMap.get(m.merchantAddr) || [],
    }));

    const volumeByAsset = volumeByAssetRaw.map((v) => ({ asset: v.asset, total: parseFloat(v.total || "0") }));

    const facVolMap = new Map<number, Array<{ asset: string; total: number }>>();
    for (const v of facilitatorVolRaw) {
      const tag = Number(v.sourceTag);
      const list = facVolMap.get(tag) || [];
      list.push({ asset: v.asset, total: parseFloat(v.total || "0") });
      facVolMap.set(tag, list);
    }
    const facilitators = facilitatorTxRaw.map((f) => ({
      sourceTag: Number(f.sourceTag),
      name: f.name,
      txCount: Number(f.tx_count),
      volumeByAsset: facVolMap.get(Number(f.sourceTag)) || [],
    }));
    const activeAgents = Number(activeAgentsRaw[0]?.c ?? 0);
    const timeSeries = buildDashSeries(tsRows, tsAssetRows);

    const data = {
      range,
      totalTransactions: days ? Number(windowCountsRaw[0]?.tx ?? 0) : (indexerState?.totalTxCount ?? 0),
      totalMerchants: days ? Number(windowCountsRaw[0]?.merchants ?? 0) : totalMerchantsAll,
      totalResources,
      totalVolumeXrp: indexerState?.totalVolumeXrp ?? 0,
      volumeByAsset,
      activeAgents,
      facilitators,
      timeSeries,
      recentTransactions,
      recentResources,
      topMerchants,
    };
    setCache(cacheKey, data, 10_000);
    res.json(data);
  } catch (err) {
    console.error("GET /dashboard error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard" });
  }
});

// ── Facilitator registry ─────────────────────────────────────
app.get("/facilitators", async (_req, res) => {
  try {
    const cached = getCached("facilitators");
    if (cached) return res.json(cached);
    const [tags, stats, vol] = await Promise.all([
      prisma.facilitatorTag.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.$queryRawUnsafe<Array<{ sourceTag: number; tx_count: bigint; buyers: bigint }>>(
        `SELECT "sourceTag" as "sourceTag", COUNT(*) as tx_count, COUNT(DISTINCT "buyerAddress") as buyers
         FROM "Transaction" WHERE "sourceTag" IS NOT NULL GROUP BY "sourceTag"`
      ),
      prisma.$queryRawUnsafe<Array<{ sourceTag: number; asset: string; total: string }>>(
        `SELECT "sourceTag" as "sourceTag", asset, COALESCE(SUM(CAST(amount AS DOUBLE PRECISION)),0) as total
         FROM "Transaction" WHERE "sourceTag" IS NOT NULL GROUP BY "sourceTag", asset`
      ),
    ]);
    const statMap = new Map(stats.map((s) => [Number(s.sourceTag), { txCount: Number(s.tx_count), buyers: Number(s.buyers) }]));
    const volMap = new Map<number, Array<{ asset: string; total: number }>>();
    for (const v of vol) {
      const t = Number(v.sourceTag);
      const list = volMap.get(t) || [];
      list.push({ asset: v.asset, total: parseFloat(v.total || "0") });
      volMap.set(t, list);
    }
    const data = tags
      .map((t) => ({
        sourceTag: t.sourceTag,
        name: t.name,
        url: t.url,
        website: t.website,
        description: t.description,
        logoUrl: t.logoUrl,
        networks: t.networks,
        assets: t.assets,
        isActive: t.isActive,
        txCount: statMap.get(t.sourceTag)?.txCount ?? 0,
        activeBuyers: statMap.get(t.sourceTag)?.buyers ?? 0,
        volumeByAsset: volMap.get(t.sourceTag) ?? [],
      }))
      .sort((a, b) => b.txCount - a.txCount);
    setCache("facilitators", data, 10_000);
    res.json(data);
  } catch (err) {
    console.error("GET /facilitators error:", err);
    res.status(500).json({ error: "Failed to fetch facilitators" });
  }
});

app.post("/join/facilitator", verifyRateLimit, async (req, res) => {
  try {
    const { name, sourceTag, url, website, description, networks, assets } = req.body ?? {};
    const tag = Number(sourceTag);
    if (!name || typeof name !== "string" || !Number.isInteger(tag) || tag < 0 || tag > 4294967295) {
      return res.status(400).json({ error: "name and a valid integer sourceTag (0–4294967295) are required" });
    }
    const common = {
      name: name.trim().slice(0, 120),
      url: typeof url === "string" ? url.slice(0, 300) : null,
      website: typeof website === "string" ? website.slice(0, 300) : null,
      description: typeof description === "string" ? description.slice(0, 500) : null,
      networks: Array.isArray(networks) ? networks.slice(0, 4).map(String) : [],
      assets: Array.isArray(assets) ? assets.slice(0, 8).map(String) : [],
      isActive: true,
    };
    const created = await prisma.facilitatorTag.upsert({
      where: { sourceTag: tag },
      update: common,
      create: { sourceTag: tag, status: "listed", ...common },
    });
    clearDashboardCaches();
    res.json({ success: true, facilitator: { sourceTag: created.sourceTag, name: created.name } });
  } catch (err) {
    console.error("POST /join/facilitator error:", err);
    res.status(500).json({ error: "Failed to register facilitator" });
  }
});

// ── Directory ────────────────────────────────────────────────
app.get("/directory", async (req, res) => {
  try {
    const partnerType = typeof req.query.type === "string" ? req.query.type : undefined;
    const listings = await prisma.directoryListing.findMany({
      where: { status: "approved", ...(partnerType ? { partnerType } : {}) },
      orderBy: { submittedAt: "desc" },
    });
    res.json(listings);
  } catch (err) {
    console.error("GET /directory error:", err);
    res.status(500).json({ error: "Failed to fetch directory" });
  }
});

app.post("/join/service", verifyRateLimit, async (req, res) => {
  try {
    const { name, tagline, description, website, category, useCase, asset, contactEmail, merchantAddr } = req.body ?? {};
    if (!name || typeof name !== "string") return res.status(400).json({ error: "name is required" });
    const created = await prisma.directoryListing.create({
      data: {
        name: name.trim().slice(0, 120),
        tagline: typeof tagline === "string" ? tagline.slice(0, 160) : null,
        description: typeof description === "string" ? description.slice(0, 600) : null,
        website: typeof website === "string" ? website.slice(0, 300) : null,
        category: typeof category === "string" ? category.slice(0, 60) : null,
        useCase: typeof useCase === "string" ? useCase.slice(0, 60) : null,
        asset: typeof asset === "string" ? asset.slice(0, 20) : null,
        contactEmail: typeof contactEmail === "string" ? contactEmail.slice(0, 160) : null,
        merchantAddr: typeof merchantAddr === "string" ? merchantAddr.slice(0, 60) : null,
        status: "pending",
        partnerType: "service",
      },
    });
    res.json({ success: true, id: created.id, status: created.status });
  } catch (err) {
    console.error("POST /join/service error:", err);
    res.status(500).json({ error: "Failed to submit listing" });
  }
});

// ── Directory admin review queue ─────────────────────────────
app.get("/admin/directory", requireAdminAuth, async (req, res) => {
  try {
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const listings = await prisma.directoryListing.findMany({
      where: status ? { status } : {},
      orderBy: { submittedAt: "desc" },
    });
    res.json(listings);
  } catch (err) {
    console.error("GET /admin/directory error:", err);
    res.status(500).json({ error: "Failed to fetch listings" });
  }
});

app.post("/admin/directory/approve", requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.body ?? {};
    if (!id || typeof id !== "string") return res.status(400).json({ error: "id is required" });
    const updated = await prisma.directoryListing.update({ where: { id }, data: { status: "approved", reviewComment: null } });
    clearDashboardCaches();
    res.json({ success: true, id: updated.id, status: updated.status });
  } catch (err) {
    console.error("POST /admin/directory/approve error:", err);
    res.status(500).json({ error: "Failed to approve listing" });
  }
});

app.post("/admin/directory/reject", requireAdminAuth, async (req, res) => {
  try {
    const { id, comment } = req.body ?? {};
    if (!id || typeof id !== "string") return res.status(400).json({ error: "id is required" });
    const updated = await prisma.directoryListing.update({
      where: { id },
      data: { status: "rejected", reviewComment: typeof comment === "string" ? comment.slice(0, 300) : null },
    });
    res.json({ success: true, id: updated.id, status: updated.status });
  } catch (err) {
    console.error("POST /admin/directory/reject error:", err);
    res.status(500).json({ error: "Failed to reject listing" });
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
          merchant: { select: { address: true, name: true, logoUrl: true } },
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

// Build a continuous, 0-filled transaction-count series for a sparkline.
// Granularity adapts to the active span: hourly when it fits ~3 days (so a
// short, dense history still draws a real curve), otherwise daily. 0-fills
// gaps so the time axis stays linear, capped to the most recent ~120 buckets.
function buildTxSeries(rows: Array<{ bucket: Date | string; count: number | bigint }>): Array<{ t: string; count: number }> {
  if (rows.length === 0) return [];
  const hourMs = 3_600_000;
  const dayMs = 86_400_000;
  const first = new Date(rows[0].bucket).getTime();
  const last = new Date(rows[rows.length - 1].bucket).getTime();
  const hourly = last - first <= 3 * dayMs;
  const step = hourly ? hourMs : dayMs;
  const sliceLen = hourly ? 13 : 10; // YYYY-MM-DDTHH | YYYY-MM-DD
  const keyOf = (ms: number) => new Date(ms).toISOString().slice(0, sliceLen);

  const counts = new Map<string, number>();
  for (const r of rows) {
    const ms = Math.floor(new Date(r.bucket).getTime() / step) * step;
    counts.set(keyOf(ms), (counts.get(keyOf(ms)) ?? 0) + Number(r.count));
  }

  const MAX = 120;
  const startTrunc = Math.floor(first / step) * step;
  const endTrunc = Math.floor(last / step) * step;
  let cursor = Math.max(startTrunc, endTrunc - (MAX - 1) * step);
  const series: Array<{ t: string; count: number }> = [];
  while (cursor <= endTrunc) {
    series.push({ t: new Date(cursor).toISOString(), count: counts.get(keyOf(cursor)) ?? 0 });
    cursor += step;
  }
  return series;
}

// Decode an XRPL currency code to its display label (mirror of the web's
// formatCurrency): "XRP" stays; 40-char hex codes decode to ASCII (e.g. RLUSD).
function decodeAsset(code: string): string {
  if (!code) return "???";
  if (code === "XRP") return "XRP";
  const cur = code.includes(".") ? code.split(".")[0] : code;
  if (cur.length <= 3) return cur;
  if (cur.length === 40 && /^[0-9A-Fa-f]+$/.test(cur)) {
    const ascii = cur
      .match(/.{2}/g)!
      .map((h) => parseInt(h, 16))
      .filter((c) => c > 0 && c < 128)
      .map((c) => String.fromCharCode(c))
      .join("");
    return ascii || cur.slice(0, 8);
  }
  return cur;
}

// Build the home dashboard time-series: hourly buckets, 0-filled between the
// first and last active hour (capped to the most recent 720), each carrying tx
// count, total volume, distinct active merchants, and volume per decoded asset.
function buildDashSeries(
  rows: Array<{ bucket: Date | string; tx: number | bigint; vol: number; merchants: number | bigint }>,
  assetRows: Array<{ bucket: Date | string; asset: string; vol: number }>,
): Array<{ t: string; txCount: number; volume: number; merchants: number; byAsset: Record<string, number> }> {
  if (rows.length === 0) return [];
  const stepMs = 3_600_000;
  const keyOf = (ms: number) => new Date(ms).toISOString().slice(0, 13);
  const baseMs = (b: Date | string) => Math.floor(new Date(b).getTime() / stepMs) * stepMs;

  const main = new Map<string, { txCount: number; volume: number; merchants: number }>();
  for (const r of rows) main.set(keyOf(baseMs(r.bucket)), { txCount: Number(r.tx), volume: Number(r.vol), merchants: Number(r.merchants) });

  const assets = new Map<string, Record<string, number>>();
  for (const r of assetRows) {
    const k = keyOf(baseMs(r.bucket));
    const rec = assets.get(k) ?? {};
    const label = decodeAsset(r.asset);
    rec[label] = (rec[label] ?? 0) + Number(r.vol);
    assets.set(k, rec);
  }

  const first = baseMs(rows[0].bucket);
  const last = baseMs(rows[rows.length - 1].bucket);
  const MAX = 720;
  let cursor = Math.max(first, last - (MAX - 1) * stepMs);
  const out: Array<{ t: string; txCount: number; volume: number; merchants: number; byAsset: Record<string, number> }> = [];
  while (cursor <= last) {
    const k = keyOf(cursor);
    const m = main.get(k);
    out.push({ t: new Date(cursor).toISOString(), txCount: m?.txCount ?? 0, volume: m?.volume ?? 0, merchants: m?.merchants ?? 0, byAsset: assets.get(k) ?? {} });
    cursor += stepMs;
  }
  return out;
}

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
      const [transactions, totalTxCount, volumeResult, txHourlyRaw] = await Promise.all([
        prisma.transaction.findMany({
          where: { merchantAddr: address },
          take: pageSize,
          skip,
          orderBy: { timestamp: "desc" },
          include: { resource: true, merchant: { select: { address: true, name: true, logoUrl: true } } },
        }),
        prisma.transaction.count({ where: { merchantAddr: address } }),
        prisma.$queryRawUnsafe<Array<{ asset: string; total: string }>>(
          `SELECT asset, COALESCE(SUM(CAST(amount AS DOUBLE PRECISION)), 0) as total FROM "Transaction" WHERE "merchantAddr" = $1 GROUP BY asset ORDER BY total DESC`,
          address
        ),
        prisma.$queryRawUnsafe<Array<{ bucket: Date; count: number }>>(
          `SELECT date_trunc('hour', "timestamp") as bucket, COUNT(*)::int as count
           FROM "Transaction" WHERE "merchantAddr" = $1
           GROUP BY 1 ORDER BY 1 ASC`,
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
        txSeries: buildTxSeries(txHourlyRaw),
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
        include: { merchant: { select: { address: true, name: true, logoUrl: true } }, resource: true },
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

// Directory "Services" — one entry per provider (merchant) with a representative
// endpoint + total endpoint count, so a provider with many endpoints (e.g. a
// 50-endpoint gateway) shows as a single card instead of flooding the list and
// crowding smaller providers out of a flat, limit-capped resource fetch.
app.get("/services", async (_req, res) => {
  try {
    const cached = getCached("services_grouped");
    if (cached) return res.json(cached);

    const merchants = await prisma.merchant.findMany({
      where: { resources: { some: { isActive: true } } },
      include: {
        _count: { select: { transactions: true } },
        resources: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
          select: { url: true, name: true, description: true, priceAmount: true, priceAsset: true, isDiscovered: true },
        },
      },
    });

    const items = merchants.flatMap((m) => {
      const list = m.resources;
      if (list.length === 0) return [];
      // Cheapest endpoint as the "from" price; first with copy for the blurb.
      // Unparseable/non-positive prices sort LAST (Infinity), not first — otherwise
      // parseFloat(garbage)||0 made a malformed price win and show as the "from" value.
      // (Cross-asset comparison is still numeric — a true value sort needs FX rates.)
      const priceValue = (s: string) => {
        const n = parseFloat(s);
        return Number.isFinite(n) && n > 0 ? n : Infinity;
      };
      const rep = [...list].sort((a, b) => priceValue(a.priceAmount) - priceValue(b.priceAmount))[0];
      const descRes = list.find((r) => r.description || r.name) || rep;
      return [{
        id: m.address,
        merchantAddr: m.address,
        merchant: { name: m.name, logoUrl: m.logoUrl },
        name: descRes.name,
        description: descRes.description,
        url: rep.url,
        priceAmount: rep.priceAmount,
        priceAsset: rep.priceAsset,
        isDiscovered: rep.isDiscovered,
        endpointCount: list.length,
        txCount: m._count.transactions,
      }];
    });
    items.sort((a, b) => (b.txCount - a.txCount) || (b.endpointCount - a.endpointCount));

    const data = { items };
    setCache("services_grouped", data, 10_000);
    res.json(data);
  } catch (err) {
    console.error("GET /services error:", err);
    res.status(500).json({ error: "Failed to fetch services" });
  }
});

// Top merchants ranked by transaction count within a window (24h / 7d / all).
app.get("/top-merchants", async (req, res) => {
  try {
    const raw = String(req.query.range || "24h");
    const range = raw === "7d" || raw === "all" ? raw : "24h";
    const cacheKey = `top_merchants_${range}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    let rows: Array<{ merchantAddr: string; tx_count: bigint }>;
    if (range === "all") {
      rows = await prisma.$queryRawUnsafe(
        `SELECT "merchantAddr", COUNT(*) as tx_count FROM "Transaction" GROUP BY "merchantAddr" ORDER BY tx_count DESC LIMIT 5`,
      );
    } else {
      const cutoff = new Date(Date.now() - (range === "7d" ? 7 : 1) * 24 * 3600 * 1000);
      rows = await prisma.$queryRawUnsafe(
        `SELECT "merchantAddr", COUNT(*) as tx_count FROM "Transaction" WHERE "timestamp" >= $1 GROUP BY "merchantAddr" ORDER BY tx_count DESC LIMIT 5`,
        cutoff,
      );
    }

    const addrs = rows.map((r) => r.merchantAddr);
    const details = addrs.length
      ? await prisma.merchant.findMany({ where: { address: { in: addrs } }, select: { address: true, name: true, logoUrl: true } })
      : [];
    const nameMap = new Map(details.map((m) => [m.address, m.name]));
    const logoMap = new Map(details.map((m) => [m.address, m.logoUrl]));
    const items = rows.map((r) => ({
      address: r.merchantAddr,
      name: nameMap.get(r.merchantAddr) ?? null,
      logoUrl: logoMap.get(r.merchantAddr) ?? null,
      txCount: Number(r.tx_count),
    }));

    const data = { items, range };
    setCache(cacheKey, data, 30_000);
    res.json(data);
  } catch (err) {
    console.error("GET /top-merchants error:", err);
    res.status(500).json({ error: "Failed to fetch top merchants" });
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
        include: { merchant: { select: { address: true, name: true, logoUrl: true } } },
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
        // exact_xrpl advertises XRP in integer drops; priceAmount is stored as decimal XRP.
        amount: toX402WireAmount(r.priceAmount, r.priceAsset),
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
        include: { merchant: { select: { address: true, name: true, logoUrl: true } } },
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
app.post("/verify", verifyRateLimit, async (req, res) => {
  try {
    const { url } = req.body;
    const displayName = typeof req.body?.name === "string" ? req.body.name.trim().slice(0, 80) : "";

    const parsedInput = parseHttpUrl(url);
    if (!parsedInput) return res.status(400).json({ error: "Only valid http/https URLs are supported" });

    const failed: Array<{ url: string; error: string }> = [];
    let resolvedResources: Awaited<ReturnType<typeof resolveX402ResourceUrls>>;
    try {
      resolvedResources = await resolveX402ResourceUrls(parsedInput);
    } catch (error) {
      return res.status(400).json({ error: publicErrorMessage(error) });
    }

    const {
      origin,
      discoveredUrls,
      discoveredMeta,
      discoveryChecked,
      discoveryFound,
      discoveryComplete,
      discoveredMerchantName,
      discoveredMerchantDescription,
    } = resolvedResources;

    async function verifyAndRegister(resourceUrl: string) {
      const { decoded, xrplReq } = await fetchX402Requirement(resourceUrl);

      const asset = xrplReq.asset || "XRP";
      const priceAmount = normalizeX402Price(xrplReq.amount, asset);

      // Prefer the catalog's declared name/description; fall back to the live 402.
      const meta = discoveredMeta.get(resourceUrl);
      const resDescription = decoded?.resource?.description;
      const liveName = typeof resDescription === "string" && resDescription
        ? resDescription
        : (typeof decoded?.description === "string" ? decoded.description : null);
      const resourceName = meta?.name || liveName || null;
      const resourceDescription = meta?.description || (typeof resDescription === "string" ? resDescription : null);

      const merchantIdentity: Record<string, string> = { website: origin };
      if (discoveredMerchantName) merchantIdentity.name = discoveredMerchantName;
      else if (displayName) merchantIdentity.name = displayName;
      if (discoveredMerchantDescription) merchantIdentity.description = discoveredMerchantDescription;

      await prisma.merchant.upsert({
        where: { address: xrplReq.payTo },
        // Merchant identity is WRITE-ONCE. payTo comes from the fetched endpoint's own 402
        // header, so anyone can serve a 402 declaring another merchant's payTo — letting an
        // unauthenticated /verify overwrite that merchant's public name/website/description
        // was a defacement/phishing vector. Identity is set only when the row is first
        // created; changing it later must go through an ownership-proven channel.
        update: {},
        create: { address: xrplReq.payTo, ...merchantIdentity },
      });
      return prisma.resource.upsert({
        where: { merchantAddr_url: { merchantAddr: xrplReq.payTo, url: resourceUrl } },
        update: {
          priceAmount, priceAsset: asset, isActive: true,
          ...(resourceName ? { name: resourceName } : {}),
          ...(resourceDescription ? { description: resourceDescription } : {}),
        },
        create: {
          merchantAddr: xrplReq.payTo, url: resourceUrl,
          priceAmount, priceAsset: asset,
          schema: "x402", network: xrplReq.network || "xrpl",
          name: resourceName || "Registered Resource",
          description: resourceDescription,
        },
      });
    }

    const verifiedUrls = [...discoveredUrls];
    const results = await Promise.allSettled(
      verifiedUrls.map((url) => verifyAndRegister(url))
    );

    const registered = [];
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const url = verifiedUrls[i];
      if (result.status === "fulfilled") {
        registered.push(result.value);
      } else {
        failed.push({ url, error: result.reason instanceof Error ? result.reason.message : "Unknown error" });
      }
    }

    if (registered.length === 0) {
      return res.status(400).json({ error: "Could not verify any x402 resources", discoveryChecked, failed });
    }
    const merchantAddresses = [...new Set(registered.map((resource) => resource.merchantAddr))];

    // Retire stale endpoints: on a full catalog re-crawl, deactivate this origin's
    // resources that are no longer advertised (prunes entries that now 404).
    let pruned = 0;
    if (discoveryComplete) {
      const liveUrls = [...discoveredUrls];
      for (const addr of merchantAddresses) {
        const r = await prisma.resource.updateMany({
          where: { merchantAddr: addr, isActive: true, url: { startsWith: origin }, NOT: { url: { in: liveUrls } } },
          data: { isActive: false },
        });
        pruned += r.count;
      }
    }

    const merchants = await prisma.merchant.findMany({
      where: { address: { in: merchantAddresses } },
      select: { address: true, name: true, logoUrl: true },
    });
    clearDashboardCaches();
    res.json({ success: true, registeredCount: registered.length, discoveryChecked, discoveryFound, pruned, failed, resources: registered, merchants });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/merchant-logo", logoRateLimit, async (req, res) => {
  try {
    const { url, merchantAddress, logoDataUrl } = req.body;
    const parsedInput = parseHttpUrl(url);
    if (!parsedInput) return res.status(400).json({ error: "Only valid http/https URLs are supported" });
    if (!merchantAddress || typeof merchantAddress !== "string") {
      return res.status(400).json({ error: "Merchant address is required" });
    }

    const normalizedLogo = parseLogoDataUrl(logoDataUrl);
    if (!normalizedLogo) {
      return res.status(400).json({ error: "Logo must be a PNG, JPG, WebP, or GIF under 256KB" });
    }

    let resolvedResources: Awaited<ReturnType<typeof resolveX402ResourceUrls>>;
    try {
      resolvedResources = await resolveX402ResourceUrls(parsedInput);
    } catch (error) {
      return res.status(400).json({ error: publicErrorMessage(error) });
    }

    const { origin, discoveredUrls } = resolvedResources;
    const verifiedMerchantAddresses = new Set<string>();
    const failures: Array<{ url: string; error: string }> = [];

    for (const resourceUrl of discoveredUrls) {
      try {
        const { xrplReq } = await fetchX402Requirement(resourceUrl);
        verifiedMerchantAddresses.add(String(xrplReq.payTo));
      } catch (error) {
        failures.push({ url: resourceUrl, error: error instanceof Error ? error.message : "Unknown error" });
      }
    }

    if (!verifiedMerchantAddresses.has(merchantAddress)) {
      return res.status(403).json({
        error: "Endpoint verification does not prove control of this merchant address",
        failed: failures,
      });
    }

    const merchant = await prisma.merchant.upsert({
      where: { address: merchantAddress },
      // Only the logo is updatable here — never overwrite an existing merchant's website
      // (a logo upload must not rewrite where their listing links to; that was a phishing
      // vector, since the endpoint's payTo "ownership" check is spoofable by design).
      update: { logoUrl: normalizedLogo },
      create: { address: merchantAddress, logoUrl: normalizedLogo, website: origin },
      select: { address: true, name: true, logoUrl: true },
    });
    clearDashboardCaches();

    res.json({ success: true, merchant });
  } catch (error) {
    console.error("POST /merchant-logo error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── Admin Stats ─────────────────────────────────────────────
app.get("/admin/stats", requireAdminAuth, async (_req, res) => {
  try {
    const cached = getCached("admin_stats");
    if (cached) return res.json(cached);

    const [
      indexerState,
      totalMerchants,
      totalResources,
      totalBuyers,
      dailyTxs,
      volumeByAsset,
      txsByMerchant,
      topBuyers,
      recentTxs,
    ] = await Promise.all([
      prisma.indexerState.findUnique({ where: { id: "default" } }),
      prisma.merchant.count(),
      prisma.resource.count({ where: { isActive: true } }),
      prisma.$queryRawUnsafe<[{ count: string }]>(
        `SELECT COUNT(DISTINCT "buyerAddress") as count FROM "Transaction"`
      ),
      prisma.$queryRawUnsafe<Array<{ day: string; tx_count: string; volume: string }>>(
        `SELECT DATE("timestamp") as day, COUNT(*) as tx_count,
         COALESCE(SUM(CAST(amount AS DOUBLE PRECISION)), 0) as volume
         FROM "Transaction"
         GROUP BY DATE("timestamp")
         ORDER BY day ASC`
      ),
      prisma.$queryRawUnsafe<Array<{ asset: string; tx_count: string; total: string }>>(
        `SELECT asset, COUNT(*) as tx_count, COALESCE(SUM(CAST(amount AS DOUBLE PRECISION)), 0) as total
         FROM "Transaction" GROUP BY asset ORDER BY tx_count DESC`
      ),
      prisma.$queryRawUnsafe<Array<{ merchantAddr: string; tx_count: string; volume: string }>>(
        `SELECT "merchantAddr", COUNT(*) as tx_count,
         COALESCE(SUM(CAST(amount AS DOUBLE PRECISION)), 0) as volume
         FROM "Transaction" GROUP BY "merchantAddr" ORDER BY tx_count DESC`
      ),
      prisma.$queryRawUnsafe<Array<{ buyerAddress: string; tx_count: string; volume: string }>>(
        `SELECT "buyerAddress", COUNT(*) as tx_count,
         COALESCE(SUM(CAST(amount AS DOUBLE PRECISION)), 0) as volume
         FROM "Transaction" GROUP BY "buyerAddress" ORDER BY tx_count DESC LIMIT 10`
      ),
      prisma.transaction.findMany({
        take: 20,
        orderBy: { timestamp: "desc" },
        include: { merchant: { select: { address: true, name: true, logoUrl: true } } },
      }),
    ]);

    const merchantAddrs = txsByMerchant.map((m) => m.merchantAddr);
    const merchantDetails = merchantAddrs.length > 0
      ? await prisma.merchant.findMany({ where: { address: { in: merchantAddrs } }, select: { address: true, name: true, logoUrl: true } })
      : [];
    const merchantMap = new Map(merchantDetails.map((m) => [m.address, m]));

    const data = {
      overview: {
        totalTransactions: indexerState?.totalTxCount ?? 0,
        totalMerchants,
        totalResources,
        totalBuyers: parseInt(totalBuyers[0]?.count || "0"),
        lastLedgerIndex: indexerState?.lastLedgerIndex ?? 0,
        updatedAt: indexerState?.updatedAt ?? null,
      },
      dailyTxs: dailyTxs.map((d) => ({
        day: d.day,
        txCount: parseInt(d.tx_count),
        volume: parseFloat(d.volume),
      })),
      volumeByAsset: volumeByAsset.map((v) => ({
        asset: v.asset,
        txCount: parseInt(v.tx_count),
        total: parseFloat(v.total),
      })),
      merchantBreakdown: txsByMerchant.map((m) => ({
        address: m.merchantAddr,
        name: merchantMap.get(m.merchantAddr)?.name || null,
        logoUrl: merchantMap.get(m.merchantAddr)?.logoUrl || null,
        txCount: parseInt(m.tx_count),
        volume: parseFloat(m.volume),
      })),
      topBuyers: topBuyers.map((b) => ({
        address: b.buyerAddress,
        txCount: parseInt(b.tx_count),
        volume: parseFloat(b.volume),
      })),
      recentTransactions: recentTxs,
    };
    setCache("admin_stats", data, 30_000);
    res.json(data);
  } catch (err) {
    console.error("GET /admin/stats error:", err);
    res.status(500).json({ error: "Failed to fetch admin stats" });
  }
});

// ── Start ───────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`x402 API server listening on :${PORT}`);
});
