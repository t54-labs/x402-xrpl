import { describe, expect, it } from "vitest";
import {
  extractXrplRequirement,
  normalizeDiscoveredResource,
  parsePaymentRequired,
} from "./helpers";

describe("verify helpers", () => {
  it("parses PAYMENT-REQUIRED base64 payload", () => {
    const encoded = Buffer.from(
      JSON.stringify([{ network: "xrpl", payTo: "rABC", amount: "0.5", asset: "XRP" }]),
      "utf-8"
    ).toString("base64");

    const parsed = parsePaymentRequired(encoded);
    const req = extractXrplRequirement(parsed);

    expect(req?.network).toBe("xrpl");
    expect(req?.payTo).toBe("rABC");
    expect(req?.amount).toBe("0.5");
  });

  it("normalizes method+path discovery entries", () => {
    const normalized = normalizeDiscoveredResource("GET /api/v1/ping", "https://merchant.example");
    expect(normalized).toBe("https://merchant.example/api/v1/ping");
  });

  it("rejects unsupported protocols", () => {
    const normalized = normalizeDiscoveredResource("ftp://merchant.example/resource", "https://merchant.example");
    expect(normalized).toBeNull();
  });
});
