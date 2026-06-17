import { describe, expect, it } from "vitest";
import { selectNewTransactions, sumXrpVolume } from "./ledgerState";

describe("ledgerState", () => {
  it("filters duplicate transaction hashes before aggregate updates", () => {
    const batch = [
      { hash: "A", amount: "1", asset: "XRP" },
      { hash: "B", amount: "2", asset: "XRP" },
    ];

    expect(selectNewTransactions(batch, new Set(["A"]))).toEqual([
      { hash: "B", amount: "2", asset: "XRP" },
    ]);
  });

  it("sums only valid XRP amounts", () => {
    expect(sumXrpVolume([
      { hash: "A", amount: "1.5", asset: "XRP" },
      { hash: "B", amount: "10", asset: "RLUSD" },
      { hash: "C", amount: "not-a-number", asset: "XRP" },
    ])).toBe(1.5);
  });
});
