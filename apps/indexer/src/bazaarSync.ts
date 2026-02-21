import axios from "axios";
import { prisma } from "@x402-xrpl/database";

type XrplRequirement = {
  payTo?: string;
  amount?: string | number;
  asset?: string;
  network?: string;
};

function parsePaymentRequired(headerValue: unknown): unknown {
  if (typeof headerValue !== "string") return null;
  try {
    const decodedStr = Buffer.from(headerValue, "base64").toString("utf-8");
    return JSON.parse(decodedStr);
  } catch {
    return null;
  }
}

function extractXrplRequirement(paymentRequired: unknown): XrplRequirement | null {
  const requirements = Array.isArray(paymentRequired)
    ? paymentRequired
    : Array.isArray((paymentRequired as any)?.accepts)
      ? (paymentRequired as any).accepts
      : [];

  const match = requirements.find((req: any) => {
    const network = String(req?.network || "").toLowerCase();
    return network === "xrpl" || network === "testnet";
  });

  return match || null;
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
  fallback: {
    merchantAddress?: string;
    amount?: string;
    asset?: string;
    network?: string;
    name?: string;
    description?: string;
  } = {}
) {
  try {
    const response = await axios.get(resourceUrl, {
      timeout: 7000,
      validateStatus: (status) => status === 402 || status === 200,
    });

    if (response.status === 402) {
      const paymentHeaderBase64 =
        response.headers["payment-required"] || response.headers["Payment-Required"];
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
          name: fallback.name,
          description: fallback.description,
        });
        return true;
      }
    }
  } catch (error) {
    // Fall through to fallback registration path.
  }

  if (fallback.merchantAddress) {
    await upsertDiscoveredResource({
      resourceUrl,
      merchantAddress: fallback.merchantAddress,
      amount: fallback.amount || "0",
      asset: fallback.asset || "XRP",
      network: fallback.network || "xrpl",
      origin,
      name: fallback.name,
      description: fallback.description,
    });
    return true;
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
    
    console.log(`[Auto-Discovery] Fetching ${discoveryUrl} for ${merchantAddress}...`);
    
    const response = await axios.get(discoveryUrl, { timeout: 5000 });
    const bazaarData = response.data;

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
      const resourceUrl =
        typeof res === "string"
          ? res
          : res?.url || res?.id || res?.resource;
      if (!resourceUrl || typeof resourceUrl !== "string") continue;

      const accepts = Array.isArray(res?.accepts)
        ? res.accepts
        : Array.isArray(res?.accept)
          ? res.accept
          : [];
      const xrplAccept = accepts.find((a: any) => {
        const network = String(a?.network || "").toLowerCase();
        return network === "xrpl" || network === "testnet";
      });

      const synced = await verifyAndUpsertResource(resourceUrl, url.origin, {
        merchantAddress: xrplAccept?.payTo || merchantAddress,
        amount: xrplAccept?.amount ? String(xrplAccept.amount) : undefined,
        asset: xrplAccept?.asset || "XRP",
        network: xrplAccept?.network || "xrpl",
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
        url: { notIn: syncedUrls }
      },
      data: { isActive: false }
    });

    console.log(`[Auto-Discovery] Synced ${syncedCount}/${resources.length} resources for ${merchantAddress}.`);

  } catch (error: any) {
    console.error(`[Auto-Discovery] Failed to sync ${website}: ${error.message}`);
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