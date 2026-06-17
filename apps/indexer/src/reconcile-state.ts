import { prisma } from "@x402-xrpl/database";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const [totals] = await prisma.$queryRaw<Array<{
    tx_count: bigint;
    total_xrp: number | null;
    last_ledger: number | null;
  }>>`
    SELECT
      COUNT(*) AS tx_count,
      COALESCE(SUM(CAST(amount AS DOUBLE PRECISION)) FILTER (WHERE asset = 'XRP'), 0) AS total_xrp,
      MAX("ledgerIndex") AS last_ledger
    FROM "Transaction"
  `;

  await prisma.indexerState.upsert({
    where: { id: "default" },
    update: {
      totalTxCount: Number(totals?.tx_count ?? 0),
      totalVolumeXrp: Number(totals?.total_xrp ?? 0),
      lastLedgerIndex: Number(totals?.last_ledger ?? 0),
    },
    create: {
      id: "default",
      totalTxCount: Number(totals?.tx_count ?? 0),
      totalVolumeXrp: Number(totals?.total_xrp ?? 0),
      lastLedgerIndex: Number(totals?.last_ledger ?? 0),
    },
  });

  console.log(JSON.stringify({
    totalTxCount: Number(totals?.tx_count ?? 0),
    totalVolumeXrp: Number(totals?.total_xrp ?? 0),
    lastLedgerIndex: Number(totals?.last_ledger ?? 0),
  }));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
