/**
 * One-off rescue: backfill merchant display names that were never captured at
 * row-creation time.
 *
 * Why this is needed: the indexer and auto-discovery create merchant rows from
 * on-ledger activity with only an `address` (no name), and /verify identity is
 * WRITE-ONCE (its upsert `update` is a no-op, to stop an unauthenticated caller
 * from overwriting another merchant's public identity). So when a nameless row
 * already exists, a later legitimate registration can't fill the name in — the
 * merchant shows as "Unknown merchant" forever.
 *
 * Each `name` below is the top-level `name` from that merchant's own
 * /.well-known/x402 (the exact value /verify would have captured), so this only
 * writes back what the merchant already declares about itself.
 *
 * SAFE BY DESIGN: only writes when the stored name is currently null/blank, so it
 * never clobbers an owner-provided identity and is idempotent (re-running is a
 * no-op once the name is set).
 *
 * Run against the target DB (e.g. via `kubectl port-forward`):
 *   DATABASE_URL="postgresql://.../x402_xrpl?sslmode=disable" \
 *     pnpm --filter @x402-xrpl/indexer exec ts-node src/backfill-merchant-name.ts
 */
import { prisma } from "@x402-xrpl/database";

const BACKFILL: Array<{ address: string; name: string }> = [
  // BitBooth — app.heinrichstech.com; top-level name from its /.well-known/x402.
  { address: "rfryheo6yzFdLWj8qUQtZc7zG9MKkBkUEy", name: "BitBooth" },
];

async function main() {
  for (const { address, name } of BACKFILL) {
    const merchant = await prisma.merchant.findUnique({
      where: { address },
      select: { address: true, name: true },
    });

    if (!merchant) {
      console.warn(`skip ${address}: no merchant row exists`);
      continue;
    }
    if (merchant.name && merchant.name.trim()) {
      console.log(`skip ${address}: already named "${merchant.name}"`);
      continue;
    }

    await prisma.merchant.update({ where: { address }, data: { name } });
    console.log(`set  ${address} -> "${name}"`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
