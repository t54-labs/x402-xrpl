import { prisma } from "@x402-xrpl/database";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
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
    const totalVolumeXrp = parseFloat(volumeResult[0]?.total || "0");

    return NextResponse.json({
      totalTransactions,
      totalMerchants,
      totalResources,
      totalVolumeXrp,
      lastLedgerIndex: indexerState?.lastLedgerIndex ?? 0,
      updatedAt: indexerState?.updatedAt ?? null,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
