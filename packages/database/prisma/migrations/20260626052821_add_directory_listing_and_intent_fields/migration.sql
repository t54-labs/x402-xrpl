-- AlterTable
ALTER TABLE "FacilitatorTag" ADD COLUMN     "assets" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "description" TEXT,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "networks" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'listed',
ADD COLUMN     "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "website" TEXT;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "riskChecked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verifiableIntent" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "DirectoryListing" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT,
    "description" TEXT,
    "website" TEXT,
    "logoUrl" TEXT,
    "category" TEXT,
    "useCase" TEXT,
    "asset" TEXT,
    "merchantAddr" TEXT,
    "contactEmail" TEXT,
    "verified402" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "partnerType" TEXT NOT NULL DEFAULT 'service',
    "reviewComment" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DirectoryListing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DirectoryListing_status_partnerType_idx" ON "DirectoryListing"("status", "partnerType");
