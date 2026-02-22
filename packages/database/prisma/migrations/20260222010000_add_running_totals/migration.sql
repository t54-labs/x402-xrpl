-- Add running totals to IndexerState (eliminates full-table SUM scans)
ALTER TABLE "IndexerState" ADD COLUMN "totalTxCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "IndexerState" ADD COLUMN "totalVolumeXrp" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Seed the running totals from existing data
UPDATE "IndexerState" SET
  "totalTxCount" = (SELECT COUNT(*) FROM "Transaction"),
  "totalVolumeXrp" = COALESCE((SELECT SUM(CAST(amount AS DOUBLE PRECISION)) FROM "Transaction" WHERE asset = 'XRP'), 0)
WHERE id = 'default';
