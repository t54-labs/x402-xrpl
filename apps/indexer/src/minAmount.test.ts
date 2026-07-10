import { describe, expect, it } from "vitest";
import { meetsMinAmount } from "./minAmount";

const RLUSD = "524C555344000000000000000000000000000000";

// Pass explicit floors so the test doesn't depend on env.
describe("meetsMinAmount", () => {
  it("rejects a near-free 1-drop XRP dust payment", () => {
    expect(meetsMinAmount("0.000001", "XRP", 0.0001, 0.0001)).toBe(false);
  });

  it("accepts a legitimate 0.001 XRP micropayment", () => {
    expect(meetsMinAmount("0.001", "XRP", 0.0001, 0.0001)).toBe(true);
  });

  it("accepts exactly the floor", () => {
    expect(meetsMinAmount("0.0001", "XRP", 0.0001, 0.0001)).toBe(true);
  });

  it("applies the IOU floor to RLUSD amounts", () => {
    expect(meetsMinAmount("0.00001", RLUSD, 0.0001, 0.0001)).toBe(false);
    expect(meetsMinAmount("0.0011", RLUSD, 0.0001, 0.0001)).toBe(true);
  });

  it("rejects zero, negative, and non-numeric amounts", () => {
    expect(meetsMinAmount("0", "XRP", 0.0001, 0.0001)).toBe(false);
    expect(meetsMinAmount("-1", "XRP", 0.0001, 0.0001)).toBe(false);
    expect(meetsMinAmount("abc", "XRP", 0.0001, 0.0001)).toBe(false);
  });
});
