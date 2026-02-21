import { prisma } from "@x402-xrpl/database";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "25", 10), 100);
    const skip = (page - 1) * limit;

    const [merchants, totalCount] = await Promise.all([
      prisma.merchant.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
        include: {
          _count: {
            select: { resources: true, transactions: true },
          },
        },
      }),
      prisma.merchant.count(),
    ]);

    return NextResponse.json({
      items: merchants,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch merchants" }, { status: 500 });
  }
}
