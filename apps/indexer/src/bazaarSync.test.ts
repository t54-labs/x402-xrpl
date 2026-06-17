import { describe, expect, it } from "vitest";
import { extractXrplRequirement } from "./bazaarSync";

describe("extractXrplRequirement", () => {
  it("accepts CAIP-style XRPL networks", () => {
    expect(extractXrplRequirement({
      accepts: [{ network: "xrpl:0", payTo: "rMerchant", amount: "0.001", asset: "XRP" }],
    })).toEqual({
      network: "xrpl:0",
      payTo: "rMerchant",
      amount: "0.001",
      asset: "XRP",
    });
  });

  it("ignores non-XRPL networks", () => {
    expect(extractXrplRequirement({
      accepts: [{ network: "base", payTo: "0xMerchant", amount: "1", asset: "USDC" }],
    })).toBeNull();
  });
});
