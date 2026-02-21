import { prisma } from "@x402-xrpl/database";
import { NextResponse } from "next/server";
import axios from "axios";
import {
  extractXrplRequirement,
  normalizeDiscoveredResource,
  parsePaymentRequired,
} from "./helpers";

async function verifyResource(resourceUrl: string) {
  const response = await axios.get(resourceUrl, {
    timeout: 7000,
    validateStatus: (status) => status === 402 || status === 200,
  });

  if (response.status !== 402) {
    throw new Error(`URL did not return HTTP 402. Returned ${response.status}`);
  }

  const paymentHeaderBase64 =
    response.headers["payment-required"] || response.headers["Payment-Required"];

  if (!paymentHeaderBase64) {
    throw new Error("Missing PAYMENT-REQUIRED header in 402 response");
  }

  const paymentRequired = parsePaymentRequired(paymentHeaderBase64);
  const xrplRequirement = extractXrplRequirement(paymentRequired);

  if (!xrplRequirement?.payTo) {
    throw new Error("Resource does not expose a valid XRPL payTo address");
  }

  return {
    merchantAddress: xrplRequirement.payTo,
    amount: String(xrplRequirement.amount ?? "0"),
    asset: xrplRequirement.asset || "XRP",
    network: xrplRequirement.network || "xrpl",
  };
}

async function upsertResource(input: {
  origin: string;
  resourceUrl: string;
  merchantAddress: string;
  amount: string;
  asset: string;
  network: string;
  isDiscovered: boolean;
}) {
  await prisma.merchant.upsert({
    where: { address: input.merchantAddress },
    update: { website: input.origin },
    create: {
      address: input.merchantAddress,
      website: input.origin,
    },
  });

  return prisma.resource.upsert({
    where: {
      merchantAddr_url: {
        merchantAddr: input.merchantAddress,
        url: input.resourceUrl,
      },
    },
    update: {
      priceAmount: input.amount,
      priceAsset: input.asset,
      network: input.network,
      isActive: true,
      isDiscovered: input.isDiscovered,
    },
    create: {
      merchantAddr: input.merchantAddress,
      url: input.resourceUrl,
      priceAmount: input.amount,
      priceAsset: input.asset,
      schema: "x402",
      network: input.network,
      name: input.isDiscovered ? "Discovered Resource" : "Registered Resource",
      isDiscovered: input.isDiscovered,
    },
  });
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    let parsedInput: URL;
    try {
      parsedInput = new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }
    if (parsedInput.protocol !== "http:" && parsedInput.protocol !== "https:") {
      return NextResponse.json({ error: "Only http/https URLs are supported" }, { status: 400 });
    }
    const origin = parsedInput.origin;

    const discoveredUrls = new Set<string>();
    const failed: Array<{ url: string; error: string }> = [];
    let discoveryChecked = false;
    let discoveryFound = 0;

    try {
      const discoveryUrl = `${origin}/.well-known/x402`;
      const discoveryResp = await axios.get(discoveryUrl, {
        timeout: 5000,
        validateStatus: (status) => status === 200 || status === 404,
      });

      if (discoveryResp.status === 200) {
        discoveryChecked = true;
        const resources = Array.isArray(discoveryResp.data?.resources)
          ? discoveryResp.data.resources
          : [];

        for (const resourceEntry of resources) {
          if (typeof resourceEntry !== "string") continue;
          const normalized = normalizeDiscoveredResource(resourceEntry, origin);
          if (normalized) discoveredUrls.add(normalized);
        }
        discoveryFound = discoveredUrls.size;
      }
    } catch {
      // We still continue with direct endpoint verification.
    }

    // If the submitted URL is a specific endpoint (or discovery had nothing), verify it directly too.
    if (
      discoveredUrls.size === 0 ||
      parsedInput.pathname !== "/" ||
      Boolean(parsedInput.search)
    ) {
      discoveredUrls.add(parsedInput.toString());
    }

    const registered = [];
    for (const resourceUrl of discoveredUrls) {
      try {
        const verified = await verifyResource(resourceUrl);
        const resource = await upsertResource({
          origin,
          resourceUrl,
          merchantAddress: verified.merchantAddress,
          amount: verified.amount,
          asset: verified.asset,
          network: verified.network,
          isDiscovered: resourceUrl !== parsedInput.toString() || discoveryFound > 0,
        });
        registered.push(resource);
      } catch (error: unknown) {
        failed.push({
          url: resourceUrl,
          error: error instanceof Error ? error.message : "Unknown verification error",
        });
      }
    }

    if (registered.length === 0) {
      return NextResponse.json(
        {
          error: "Could not verify any x402 resources from the provided URL/origin",
          discoveryChecked,
          failed,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      registeredCount: registered.length,
      discoveryChecked,
      discoveryFound,
      failed,
      resources: registered,
    });

  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
