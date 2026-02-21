import { prisma } from "@x402-xrpl/database";
import { NextRequest, NextResponse } from "next/server";

/**
 * x402 Bazaar Discovery API - compatible with the x402 discovery spec.
 * GET /api/discovery/resources?type=http&limit=20&offset=0
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const [resources, total] = await Promise.all([
      prisma.resource.findMany({
        where: { isActive: true },
        orderBy: { updatedAt: "desc" },
        take: limit,
        skip: offset,
        include: {
          merchant: { select: { address: true, name: true } },
        },
      }),
      prisma.resource.count({ where: { isActive: true } }),
    ]);

    const items = resources.map((r) => ({
      resource: r.url,
      type: "http",
      x402Version: 1,
      accepts: [
        {
          scheme: r.schema || "x402",
          network: r.network || "xrpl",
          amount: r.priceAmount,
          asset: r.priceAsset,
          payTo: r.merchantAddr,
        },
      ],
      lastUpdated: r.updatedAt.toISOString(),
      metadata: {
        name: r.name,
        description: r.description,
        merchant: r.merchant?.name || r.merchantAddr,
      },
    }));

    return NextResponse.json({
      x402Version: 1,
      items,
      pagination: { limit, offset, total },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch resources" }, { status: 500 });
  }
}
