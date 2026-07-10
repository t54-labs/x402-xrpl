import { prisma, normalizeX402Price } from "@x402-xrpl/database";
import { assertSafeHttpUrl, safeHttpRequest } from "./safeFetch";

type XrplRequirement = {
  payTo?: string;
  amount?: string | number;
  asset?: string;
  network?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeDiscoveryResourceUrl(resourceEntry: string, origin: string): string | null {
  const value = resourceEntry.trim();
  if (!value) return null;

  const methodAndPath = value.match(/^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+(.+)$/i);
  const maybeUrl = methodAndPath ? methodAndPath[2].trim() : value;

  try {
    const parsed = new URL(maybeUrl, origin);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export type CatalogEntry = { url: string; name?: string; description?: string };

/**
 * Parse one /.well-known/x402 resource entry (a string URL or an object) into a normalized
 * catalog entry, or null if it has no usable URL. This defines what the merchant "advertises"
 * — the authoritative set that pruning keys on, independent of whether the endpoint answers a
 * probe this run.
 */
export function parseCatalogEntry(res: unknown, origin: string): CatalogEntry | null {
  const obj = res && typeof res === "object" ? (res as Record<string, unknown>) : null;
  const candidate = typeof res === "string" ? res : (obj?.url ?? obj?.id ?? obj?.resource);
  if (!candidate || typeof candidate !== "string") return null;
  const url = normalizeDiscoveryResourceUrl(candidate, origin);
  if (!url) return null;
  const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);
  return { url, name: str(obj?.name) ?? str(obj?.title), description: str(obj?.description) };
}

function parsePaymentRequired(headerValue: unknown): unknown {
  if (typeof headerValue !== "string") return null;
  try {
    const decodedStr = Buffer.from(headerValue, "base64").toString("utf-8");
    return JSON.parse(decodedStr);
  } catch {
    return null;
  }
}

export function extractXrplRequirement(paymentRequired: unknown): XrplRequirement | null {
  const requirements = Array.isArray(paymentRequired)
    ? paymentRequired
    : isRecord(paymentRequired) && Array.isArray(paymentRequired.accepts)
      ? paymentRequired.accepts
      : [];

  for (const req of requirements) {
    if (!isRecord(req)) continue;
    const network = String(req.network || "").toLowerCase();
    if (network !== "xrpl" && !network.startsWith("xrpl:") && network !== "testnet") continue;

    return {
      payTo: typeof req.payTo === "string" ? req.payTo : undefined,
      amount: typeof req.amount === "number" || typeof req.amount === "string" ? req.amount : undefined,
      asset: typeof req.asset === "string" ? req.asset : undefined,
      network: typeof req.network === "string" ? req.network : undefined,
    };
  }

  return null;
}

async function upsertDiscoveredResource(input: {
  resourceUrl: string;
  merchantAddress: string;
  amount: string;
  asset: string;
  network: string;
  origin: string;
  name?: string;
  description?: string;
}) {
  await prisma.merchant.upsert({
    where: { address: input.merchantAddress },
    update: { website: input.origin },
    create: { address: input.merchantAddress, website: input.origin },
  });

  await prisma.resource.upsert({
    where: {
      merchantAddr_url: {
        merchantAddr: input.merchantAddress,
        url: input.resourceUrl,
      },
    },
    update: {
      name: input.name,
      description: input.description,
      priceAmount: input.amount,
      priceAsset: input.asset,
      network: input.network,
      isDiscovered: true,
      isActive: true,
      schema: "x402",
    },
    create: {
      merchantAddr: input.merchantAddress,
      url: input.resourceUrl,
      name: input.name,
      description: input.description,
      priceAmount: input.amount,
      priceAsset: input.asset,
      network: input.network,
      schema: "x402",
      isDiscovered: true,
      isActive: true,
    },
  });
}

async function verifyAndUpsertResource(
  resourceUrl: string,
  origin: string,
  metadata: {
    name?: string;
    description?: string;
  } = {}
) {
  try {
    const response = await safeHttpRequest(resourceUrl, {
      method: "GET",
      timeout: 7000,
    });

    if (response.status === 402) {
      const paymentHeaderBase64 = response.headers["payment-required"];
      const paymentRequired = parsePaymentRequired(paymentHeaderBase64);
      const xrplRequirement = extractXrplRequirement(paymentRequired);

      if (xrplRequirement?.payTo) {
        const asset = xrplRequirement.asset || "XRP";
        await upsertDiscoveredResource({
          resourceUrl,
          merchantAddress: xrplRequirement.payTo,
          // XRP arrives in drops per exact_xrpl — normalize exactly like /verify does.
          amount: normalizeX402Price(xrplRequirement.amount, asset),
          asset,
          network: xrplRequirement.network || "xrpl",
          origin,
          name: metadata.name,
          description: metadata.description,
        });
        return true;
      }
    }
  } catch {
    // Ignore resource-level fetch errors and continue processing others.
  }

  return false;
}

// Function to sync a specific merchant's /.well-known/x402 file
export async function syncMerchantBazaar(merchantAddress: string, website: string) {
  if (!website) return;
  
  // Ensure the website is just the domain, then append the well-known path
  try {
    const url = new URL(website);
    const discoveryUrl = `${url.origin}/.well-known/x402`;
    await assertSafeHttpUrl(discoveryUrl);
    
    console.log(`[Auto-Discovery] Fetching ${discoveryUrl} for ${merchantAddress}...`);
    
    const response = await safeHttpRequest(discoveryUrl, { method: "GET", timeout: 5000 });
    if (response.status !== 200) {
      // Fetch failed — do NOT prune on an untrusted view of the catalog.
      console.log(`[Auto-Discovery] Discovery returned ${response.status} for ${merchantAddress}; skipping (no prune).`);
      return;
    }
    const bazaarData = response.data;

    // Only a well-formed catalog (an array, or { resources: [...] }) is trustworthy. An
    // unparseable 200 body (e.g. an error/HTML page) must NOT be read as "zero resources" and
    // trigger a full retire — treat it like a failed fetch.
    const isValidCatalog =
      Array.isArray(bazaarData) || Array.isArray((bazaarData as { resources?: unknown })?.resources);
    if (!isValidCatalog) {
      console.log(`[Auto-Discovery] Unparseable catalog for ${merchantAddress}; skipping (no prune).`);
      return;
    }
    const resources = (Array.isArray(bazaarData)
      ? bazaarData
      : (bazaarData as { resources?: unknown[] }).resources ?? []) as unknown[];

    // The set the merchant CURRENTLY advertises — the authoritative basis for pruning,
    // independent of whether each endpoint answers a probe this run.
    const entries = resources
      .map((res) => parseCatalogEntry(res, url.origin))
      .filter((e): e is CatalogEntry => e !== null);
    const catalogUrls = entries.map((e) => e.url);

    console.log(`[Auto-Discovery] Found ${catalogUrls.length} resources for ${merchantAddress}. Syncing...`);

    // Refresh price/status for endpoints that answer 402. verifyAndUpsertResource swallows its
    // own errors (timeout / 5xx / non-402 / unsafe URL — safeHttpRequest validates internally)
    // and returns false, leaving the last-known row untouched; it stays active because its URL
    // remains in catalogUrls. No per-resource call throws out of this loop.
    let syncedCount = 0;
    for (const e of entries) {
      if (await verifyAndUpsertResource(e.url, url.origin, { name: e.name, description: e.description })) {
        syncedCount++;
      }
    }

    // Retire ONLY endpoints the merchant no longer advertises, and ONLY on the origin we just
    // crawled — the same payTo may serve x402 from more than one domain, and this run only saw
    // one (Merchant.website). Scoping by origin stops a crawl of domain A from retiring the
    // merchant's live domain-B endpoints. A transient probe failure keeps its URL in catalogUrls
    // (not retired); a genuinely emptied catalog (200 + []) retires this origin's resources.
    const originPrefix = `${url.origin}/`;
    const pruned = catalogUrls.length === 0
      ? await prisma.resource.updateMany({
          where: { merchantAddr: merchantAddress, isDiscovered: true, isActive: true, url: { startsWith: originPrefix } },
          data: { isActive: false },
        })
      : await prisma.resource.updateMany({
          where: { merchantAddr: merchantAddress, isDiscovered: true, isActive: true, url: { startsWith: originPrefix, notIn: catalogUrls } },
          data: { isActive: false },
        });

    console.log(`[Auto-Discovery] Synced ${syncedCount}/${catalogUrls.length} resources for ${merchantAddress}; retired ${pruned.count}.`);

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[Auto-Discovery] Failed to sync ${website}: ${message}`);
  }
}

// Global cron job function to sync ALL registered merchants with a known website
export async function runAutoDiscoverySync() {
  console.log(`[Auto-Discovery] Starting background sync job...`);
  
  // Find all merchants that have a website listed (they might have registered it manually initially)
  const merchants = await prisma.merchant.findMany({
    where: { website: { not: null } }
  });

  for (const merchant of merchants) {
    if (merchant.website) {
      await syncMerchantBazaar(merchant.address, merchant.website);
    }
  }
  
  console.log(`[Auto-Discovery] Sync job complete.`);
}
