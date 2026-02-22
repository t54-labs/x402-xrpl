-- Composite indexes for common query patterns

-- Transaction: merchant page sorted by time
CREATE INDEX "Transaction_merchantAddr_timestamp_idx" ON "Transaction"("merchantAddr", "timestamp" DESC);

-- Transaction: buyer page sorted by time
CREATE INDEX "Transaction_buyerAddress_timestamp_idx" ON "Transaction"("buyerAddress", "timestamp" DESC);

-- Resource: bazaar listing (active resources sorted by createdAt)
CREATE INDEX "Resource_isActive_createdAt_idx" ON "Resource"("isActive", "createdAt" DESC);

-- Drop old single-column indexes that are now covered by composites
DROP INDEX IF EXISTS "Transaction_buyerAddress_idx";
DROP INDEX IF EXISTS "Transaction_merchantAddr_idx";
