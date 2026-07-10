import { describe, expect, it } from "vitest";
import { normalizeX402Price } from "@x402-xrpl/database";
import { extractXrplRequirement } from "./bazaarSync";

// Regression: auto-discovery used to store raw drops, so an hourly re-crawl
// overwrote /verify's converted prices ("22000 XRP" instead of 0.022 XRP).
describe("normalizeX402Price", () => {
  it("converts integer XRP amounts from drops", () => {
    expect(normalizeX402Price("22000", "XRP")).toBe("0.022");
    expect(normalizeX402Price("10000", "XRP")).toBe("0.01");
    expect(normalizeX402Price("1000000", "XRP")).toBe("1");
  });

  it("leaves already-decimal XRP amounts alone", () => {
    expect(normalizeX402Price("0.022", "XRP")).toBe("0.022");
  });

  it("leaves IOU (RLUSD) amounts alone", () => {
    expect(normalizeX402Price("0.0011", "524C555344000000000000000000000000000000")).toBe("0.0011");
  });

  it("defaults missing amounts to 0", () => {
    expect(normalizeX402Price(undefined, "XRP")).toBe("0");
  });
});

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
