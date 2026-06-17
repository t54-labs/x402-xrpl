import { prisma } from "@x402-xrpl/database";
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
        await upsertDiscoveredResource({
          resourceUrl,
          merchantAddress: xrplRequirement.payTo,
          amount: String(xrplRequirement.amount ?? "0"),
          asset: xrplRequirement.asset || "XRP",
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
      console.log(`[Auto-Discovery] Discovery returned ${response.status} for ${merchantAddress}.`);
      return;
    }
    const bazaarData = response.data as { resources?: unknown };

    // Discovery docs typically store resources as string URLs; support both string and object entries.
    const resources = Array.isArray(bazaarData)
      ? bazaarData
      : Array.isArray(bazaarData?.resources)
        ? bazaarData.resources
        : [];
    
    if (!Array.isArray(resources) || resources.length === 0) {
      console.log(`[Auto-Discovery] No resources found for ${merchantAddress}.`);
      return;
    }

    console.log(`[Auto-Discovery] Found ${resources.length} resources for ${merchantAddress}. Syncing...`);

    let syncedCount = 0;
    const syncedUrls: string[] = [];
    
    for (const res of resources) {
      const resourceCandidate =
        typeof res === "string"
          ? res
          : res?.url || res?.id || res?.resource;
      if (!resourceCandidate || typeof resourceCandidate !== "string") continue;

      const resourceUrl = normalizeDiscoveryResourceUrl(resourceCandidate, url.origin);
      if (!resourceUrl) continue;
      await assertSafeHttpUrl(resourceUrl);

      const synced = await verifyAndUpsertResource(resourceUrl, url.origin, {
        name: res?.name || res?.title,
        description: res?.description,
      });

      if (synced) {
        syncedCount++;
        syncedUrls.push(resourceUrl);
      }
    }

    // Deactivate any resources previously associated with this merchant that are no longer in the discovery file
    await prisma.resource.updateMany({
      where: {
        merchantAddr: merchantAddress,
        isDiscovered: true,
        url: { notIn: syncedUrls }
      },
      data: { isActive: false }
    });

    console.log(`[Auto-Discovery] Synced ${syncedCount}/${resources.length} resources for ${merchantAddress}.`);

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
