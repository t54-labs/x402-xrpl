import { describe, expect, it } from "vitest";
import { normalizeX402Price, toX402WireAmount } from "@x402-xrpl/database";

const RLUSD = "524C555344000000000000000000000000000000";

// GET /discovery/resources must re-export XRP prices in integer drops (exact_xrpl wire
// format), not the decimal XRP we store — otherwise spec-compliant clients build malformed
// or 10^6-off Payments.
describe("toX402WireAmount", () => {
  it("converts decimal XRP back to integer drops", () => {
    expect(toX402WireAmount("0.022", "XRP")).toBe("22000");
    expect(toX402WireAmount("0.001", "XRP")).toBe("1000");
    expect(toX402WireAmount("1", "XRP")).toBe("1000000");
  });

  it("absorbs float artifacts", () => {
    expect(toX402WireAmount("0.666666", "XRP")).toBe("666666");
  });

  it("leaves IOU (RLUSD) amounts decimal", () => {
    expect(toX402WireAmount("0.5", RLUSD)).toBe("0.5");
  });

  it("round-trips with normalizeX402Price", () => {
    expect(normalizeX402Price(toX402WireAmount("0.022", "XRP"), "XRP")).toBe("0.022");
  });
});
