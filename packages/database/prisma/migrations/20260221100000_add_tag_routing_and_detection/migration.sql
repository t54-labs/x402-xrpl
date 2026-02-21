-- AlterTable: Add tagId to Resource for DestinationTag-based routing
ALTER TABLE "Resource" ADD COLUMN "tagId" INTEGER;

-- CreateIndex: Each merchant can only map one resource per tag
CREATE UNIQUE INDEX "Resource_merchantAddr_tagId_key" ON "Resource"("merchantAddr", "tagId");

-- AlterTable: Add detectedVia to Transaction for audit trail
ALTER TABLE "Transaction" ADD COLUMN "detectedVia" TEXT;
