import { beforeEach, describe, expect, it, vi } from "vitest";
import { runViReceiptEnrichmentTick, type ViReceiptEnrichmentConfig } from "./viReceiptEnrichment";
import { lookupViReceiptStatuses } from "./viReceiptLookup";

vi.mock("./viReceiptLookup", () => ({
  lookupViReceiptStatuses: vi.fn(),
}));

const config: ViReceiptEnrichmentConfig = {
  url: "https://x402-secure.example/lookup",
  timeoutMs: 5_000,
  batchSize: 1,
  intervalMs: 30_000,
  lookbackHours: 48,
};

describe("runViReceiptEnrichmentTick", () => {
  beforeEach(() => {
    vi.mocked(lookupViReceiptStatuses).mockReset();
  });

  it("always checks the newest pending transactions before continuing the backlog cursor", async () => {
    const newest = {
      hash: "NEWEST",
      invoiceId: "invoice-newest",
      rawMemo: "memo-newest",
      timestamp: new Date("2026-06-28T20:00:00.000Z"),
    };
    const older = {
      hash: "OLDER",
      invoiceId: "invoice-older",
      rawMemo: "memo-older",
      timestamp: new Date("2026-06-28T19:00:00.000Z"),
    };

    const findMany = vi.fn()
      .mockResolvedValueOnce([newest])
      .mockResolvedValueOnce([older]);
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    const db = { transaction: { findMany, updateMany } } as any;

    vi.mocked(lookupViReceiptStatuses)
      .mockResolvedValueOnce(new Map([
        ["NEWEST", { hash: "NEWEST", verifiableIntent: true, riskChecked: true }],
      ]))
      .mockResolvedValueOnce(new Map());

    const result = await runViReceiptEnrichmentTick(config, db, {
      backlogCursor: { timestamp: new Date("2026-06-27T00:00:00.000Z"), hash: "STALE" },
    });

    expect(findMany).toHaveBeenCalledTimes(2);
    expect(findMany.mock.calls[0][0].where.AND).toBeUndefined();
    expect(findMany.mock.calls[1][0].where.AND).toBeDefined();
    expect(updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ hash: "NEWEST" }),
      data: { verifiableIntent: true, riskChecked: true },
    }));
    expect(result).toEqual({ checked: 2, updated: 1 });
  });
});
