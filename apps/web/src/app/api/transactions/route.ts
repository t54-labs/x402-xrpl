import { prisma } from "@x402-xrpl/database";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "25", 10), 100);
    const skip = (page - 1) * limit;
    const merchant = searchParams.get("merchant");
    const buyer = searchParams.get("buyer");

    const where: Record<string, unknown> = {};
    if (merchant) where.merchantAddr = merchant;
    if (buyer) where.buyerAddress = buyer;

    const [transactions, totalCount] = await Promise.all([
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

    return NextResponse.json({
      items: transactions,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}
