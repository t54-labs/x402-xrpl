// xrpl-x402-standard.md
# XRPL x402 Payment Standard Specification (Draft)

## 1. Overview
The x402 standard enables machine-to-machine HTTP payments. While EVM chains rely on ERC-3009 or smart contracts, the XRP Ledger (XRPL) is UTXO/Account based and does not support arbitrary smart contracts natively.

To adapt x402 to the XRPL, we must define a standardized way to embed the HTTP 402 payment requirements (the "Receipt" or "Payload") into a standard XRPL `Payment` transaction.

## 2. Transaction Structure

When a Client receives an HTTP 402 Payment Required header, it constructs an XRPL transaction with the following properties:

### 2.1 Core Fields
- `TransactionType`: `"Payment"`
- `Account`: The Buyer's XRPL address.
- `Destination`: The Merchant/Server's XRPL address (as specified in the `payTo` field of the x402 payload).
- `Amount`: The exact amount specified in the `amount` field, either in drops (for XRP) or as an Issued Currency object.

### 2.2 The Memos Field
To prove what resource the payment is for, the client MUST include a `Memos` array with at least one Memo object structured as follows:

- `MemoType`: Hex encoded string of `"x402"` (i.e., `78343032`)
- `MemoData`: Hex encoded JSON string containing the payment payload.
  
#### MemoData JSON Structure
```json
{
  "res": "https://api.domain.com/v1/data", // The resource URL
  "req": "b64_payment_requirement_string"  // Optional: A hash or signature to tie this to a specific request
}
```

*Note: XRPL Memos are limited to 1KB. The `MemoData` must be kept extremely concise. If the `res` URL is too long, a hash of the URL or a short resource ID should be used instead.*

## 3. Verification Flow (Facilitator / Merchant)
When the Merchant or Facilitator verifies the payment:
1. They monitor the XRPL for incoming `Payment` transactions to their `Destination` address.
2. They decode the `Memos` array.
3. If `MemoType === "x402"`, they parse `MemoData`.
4. They match the `Amount`, `Asset`, and `res` (resource) against the pending HTTP request.
5. If valid, they return the resource to the client.

## 4. Indexer Flow (x402scan)
The block explorer (x402scan) identifies ecosystem activity by:
1. Connecting to the XRPL WebSocket.
2. Filtering for all validated `Payment` transactions.
3. Checking if `Memos` contains `MemoType: "x402"`.
4. If yes, it decodes the `MemoData` to find the Resource URL and logs the transaction as an x402 event.
