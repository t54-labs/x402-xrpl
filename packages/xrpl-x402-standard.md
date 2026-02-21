# XRPL x402 Payment Detection Specification

## 1. Overview

The x402 protocol enables machine-to-machine HTTP payments. On EVM chains, x402 payments are identified by `transferWithAuthorization` calls on ERC-3009 token contracts. On XRPL, there are no smart contracts — payments are native `Payment` transactions.

This document describes how x402scan detects x402 payments on the XRP Ledger, based on the [XRPL Exact Scheme](https://xrpl-x402.t54.ai/docs/xrpl-scheme) defined by the t54 XRPL Facilitator.

## 2. How x402 Payments Work on XRPL

The x402 flow on XRPL uses **presigned Payment transactions**:

1. Client requests a resource from a server.
2. Server responds with HTTP 402 and a `PAYMENT-REQUIRED` header containing payment requirements (amount, asset, payTo address, invoiceId, sourceTag).
3. Client signs an XRPL Payment transaction (without submitting it) and sends the signed blob back in the `PAYMENT-SIGNATURE` header.
4. Server forwards the signed blob to a **facilitator** for verification and on-chain settlement.
5. Facilitator submits the signed transaction to the XRP Ledger.
6. Once confirmed, server delivers the resource.

## 3. On-Chain Transaction Structure

When the facilitator submits the payment to XRPL, the on-chain transaction looks like:

| Field | Value | Purpose |
|---|---|---|
| `TransactionType` | `"Payment"` | Standard XRPL payment |
| `Account` | Buyer's address | Who is paying |
| `Destination` | Merchant's address | Who receives payment |
| `Amount` | Drops (XRP) or IOU object | How much is paid |
| `SourceTag` | Facilitator tag (e.g. `804681468`) | **x402 identifier** |
| `DestinationTag` | Optional | Merchant routing (if required) |
| `InvoiceID` | SHA-256 of invoice ID | Replay protection |
| `Memos[0].MemoData` | Hex-encoded invoice ID | Alternative invoice binding |

## 4. Detection: The SourceTag Signal

The **SourceTag** is the on-chain fingerprint for x402 payments on XRPL.

Each x402 facilitator uses a fixed SourceTag value in every payment it settles. The t54 XRPL Facilitator uses `804681468`. Other facilitators would use different values.

### Detection algorithm:

```
For every validated Payment transaction on XRPL:
  1. Check: does it have a SourceTag?
  2. Check: is that SourceTag in our FacilitatorTag registry?
  3. If yes → this is an x402 payment. Record it.
  4. If no  → skip. It's a regular payment.
```

### Known facilitator tags:

| SourceTag | Facilitator | URL |
|---|---|---|
| `804681468` | t54 XRPL Facilitator | https://xrpl-facilitator-mainnet.t54.ai |

## 5. Network Identifiers (CAIP-2)

| Network | CAIP-2 ID |
|---|---|
| XRPL Mainnet | `xrpl:0` |
| XRPL Testnet | `xrpl:1` |
| XRPL Devnet | `xrpl:2` |

## 6. Supported Assets

| Asset | Amount Format | Example |
|---|---|---|
| XRP | Drops (string integer) | `"1000000"` = 1 XRP |
| RLUSD / IOU | Decimal string + issuer | `"0.01"` with issuer address |

## 7. Invoice Binding (Replay Protection)

Every x402 payment must bind to an invoice to prevent replay attacks. Two methods:

- **Method A (Memos):** `MemoData` = hex-encoded UTF-8 of the invoice ID
- **Method B (InvoiceID):** `InvoiceID` = SHA-256 hash of the invoice ID

The facilitator rejects transactions missing valid invoice binding.

## 8. References

- [XRPL x402 Facilitator](https://xrpl-x402.t54.ai/)
- [XRPL Exact Scheme Spec](https://xrpl-x402.t54.ai/docs/xrpl-scheme)
- [x402 Protocol (Coinbase)](https://github.com/coinbase/x402)
- [XRPL Payment Transaction](https://xrpl.org/docs/references/protocol/transactions/types/payment)
- [XRPL Source and Destination Tags](https://xrpl.org/docs/concepts/transactions/source-and-destination-tags)
