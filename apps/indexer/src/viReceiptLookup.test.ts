import { describe, expect, it } from "vitest";
import { normalizeViReceiptLookupResponse } from "./viReceiptLookup";

describe("normalizeViReceiptLookupResponse", () => {
  it("accepts Trustline-style VI chain fields", () => {
    const statuses = normalizeViReceiptLookupResponse({
      items: [
        {
          transaction_hash: "aa824",
          vi: { chain_verified: true },
          decision: "allow",
        },
      ],
    });

    expect(statuses.get("AA824")).toEqual({
      hash: "AA824",
      verifiableIntent: true,
      riskChecked: true,
    });
  });

  it("accepts hash-keyed lookup maps", () => {
    const statuses = normalizeViReceiptLookupResponse({
      "77bca": {
        verifiableIntent: true,
        riskChecked: false,
      },
    });

    expect(statuses.get("77BCA")).toEqual({
      hash: "77BCA",
      verifiableIntent: true,
      riskChecked: false,
    });
  });

  it("does not mark a receipt verified from settlement status alone", () => {
    const statuses = normalizeViReceiptLookupResponse({
      results: [
        {
          hash: "plain-settlement",
          status: "success",
        },
      ],
    });

    expect(statuses.size).toBe(0);
  });

  it("does not infer riskChecked from settlement status on a chain-verified receipt", () => {
    const statuses = normalizeViReceiptLookupResponse({
      items: [{ transaction_hash: "vi-no-risk", vi: { chain_verified: true }, status: "success" }],
    });

    expect(statuses.get("VI-NO-RISK")).toEqual({
      hash: "VI-NO-RISK",
      verifiableIntent: true,
      riskChecked: false,
    });
  });

  it("does not treat receipt-storage 'recorded' as a risk decision", () => {
    const statuses = normalizeViReceiptLookupResponse({
      items: [{ hash: "vi-recorded", vi: { chain_verified: true }, receiptStatus: "recorded" }],
    });

    expect(statuses.get("VI-RECORDED")?.riskChecked).toBe(false);
  });

  it("treats riskChecked as implying verifiableIntent", () => {
    const statuses = normalizeViReceiptLookupResponse([
      {
        txHash: "risk-only",
        riskChecked: true,
      },
    ]);

    expect(statuses.get("RISK-ONLY")).toEqual({
      hash: "RISK-ONLY",
      verifiableIntent: true,
      riskChecked: true,
    });
  });
});
