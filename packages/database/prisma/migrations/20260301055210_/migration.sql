-- DropIndex
DROP INDEX "Resource_isActive_createdAt_idx";

-- DropIndex
DROP INDEX "Transaction_buyerAddress_timestamp_idx";

-- DropIndex
DROP INDEX "Transaction_merchantAddr_timestamp_idx";

-- AlterTable
ALTER TABLE "Merchant" ADD COLUMN     "logoUrl" TEXT;

-- CreateIndex
CREATE INDEX "Resource_isActive_createdAt_idx" ON "Resource"("isActive", "createdAt");

-- CreateIndex
CREATE INDEX "Transaction_merchantAddr_timestamp_idx" ON "Transaction"("merchantAddr", "timestamp");

-- CreateIndex
CREATE INDEX "Transaction_buyerAddress_timestamp_idx" ON "Transaction"("buyerAddress", "timestamp");
