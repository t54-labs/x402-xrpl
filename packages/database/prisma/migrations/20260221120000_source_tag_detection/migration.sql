-- CreateTable: Registry of known x402 facilitator source tags
CREATE TABLE "FacilitatorTag" (
    "id" TEXT NOT NULL,
    "sourceTag" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FacilitatorTag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FacilitatorTag_sourceTag_key" ON "FacilitatorTag"("sourceTag");

-- AlterTable: Add invoiceId, add sourceTag index
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "invoiceId" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Transaction_sourceTag_idx" ON "Transaction"("sourceTag");

-- DropIndex: Remove old tagId-based detection (no longer used)
DROP INDEX IF EXISTS "Resource_merchantAddr_tagId_key";

-- AlterTable: Remove tagId from Resource
ALTER TABLE "Resource" DROP COLUMN IF EXISTS "tagId";

-- AlterTable: Remove detectedVia from Transaction (no longer needed)
ALTER TABLE "Transaction" DROP COLUMN IF EXISTS "detectedVia";

-- Seed: Insert default t54 facilitator tag
INSERT INTO "FacilitatorTag" ("id", "sourceTag", "name", "url", "isActive", "updatedAt")
VALUES (
    'default-t54',
    804681468,
    't54 XRPL Facilitator',
    'https://xrpl-facilitator-mainnet.t54.ai',
    true,
    CURRENT_TIMESTAMP
) ON CONFLICT ("sourceTag") DO NOTHING;
