import { describe, expect, it } from "vitest";
import { resolveDeliveredAmount } from "./deliveredAmount";

const PARTIAL_PAYMENT_FLAG = 0x00020000;

// Regression: the indexer used to store tx.Amount, so a tfPartialPayment Payment that
// delivered 1 drop but advertised 1,000,000 XRP inflated every displayed volume.
describe("resolveDeliveredAmount", () => {
  it("uses meta.delivered_amount for XRP, ignoring an inflated tx.Amount", () => {
    const txStream = { meta: { delivered_amount: "1" } }; // 1 drop actually delivered
    const tx = { Amount: "1000000000000", Flags: PARTIAL_PAYMENT_FLAG }; // claims 1M XRP
    expect(resolveDeliveredAmount(txStream, tx)).toEqual({
      amount: "0.000001",
      asset: "XRP",
      assetIssuer: null,
    });
  });

  it("converts a full XRP delivery from drops", () => {
    const txStream = { meta: { delivered_amount: "22000" } };
    expect(resolveDeliveredAmount(txStream, { Amount: "22000" })).toEqual({
      amount: "0.022",
      asset: "XRP",
      assetIssuer: null,
    });
  });

  it("reads an IOU (RLUSD) delivered_amount object", () => {
    const delivered_amount = {
      currency: "524C555344000000000000000000000000000000",
      issuer: "rIssuerAddr",
      value: "0.5",
    };
    expect(resolveDeliveredAmount({ meta: { delivered_amount } }, { Amount: delivered_amount })).toEqual({
      amount: "0.5",
      asset: "524C555344000000000000000000000000000000",
      assetIssuer: "rIssuerAddr",
    });
  });

  it("falls back to tx.Amount for a non-partial payment missing delivered_amount", () => {
    expect(resolveDeliveredAmount({ meta: {} }, { Amount: "5000000" })).toEqual({
      amount: "5",
      asset: "XRP",
      assetIssuer: null,
    });
  });

  it("refuses a partial payment whose delivered_amount is unavailable", () => {
    const tx = { Amount: "1000000000000", Flags: PARTIAL_PAYMENT_FLAG };
    expect(resolveDeliveredAmount({ meta: { delivered_amount: "unavailable" } }, tx)).toBeNull();
  });

  it("rejects zero / non-positive deliveries", () => {
    expect(resolveDeliveredAmount({ meta: { delivered_amount: "0" } }, { Amount: "0" })).toBeNull();
  });

  it("supports the capitalized DeliveredAmount alias", () => {
    const tx = { Amount: "9999999999", Flags: PARTIAL_PAYMENT_FLAG };
    expect(resolveDeliveredAmount({ meta: { DeliveredAmount: "3000000" } }, tx)).toEqual({
      amount: "3",
      asset: "XRP",
      assetIssuer: null,
    });
  });
});
