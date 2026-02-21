export const facilitators: Record<string, string> = {
  // Known XRPL Testnet Facilitator Addreses (Mocked for demonstration)
  "rCoinbaseFacilitator123456789": "Coinbase",
  "rDexterFacilitator987654321": "Dexter",
};

export function identifyFacilitator(tx: any, resourceUrl?: string): string | null {
  // 1. Check if the sender is a known facilitator hot wallet
  if (facilitators[tx.Account]) {
    return facilitators[tx.Account];
  }
  
  // 2. Check if the memo explicitly declares a facilitator
  // Some x402 clients might include a "fac" tag in the payload
  if (tx.Memos) {
    try {
      for (const m of tx.Memos) {
        if (!m.Memo) continue;
        const memoData = m.Memo.MemoData ? Buffer.from(m.Memo.MemoData, "hex").toString("utf8") : "";
        if (memoData.includes(`"fac":`)) {
          const payload = JSON.parse(memoData);
          if (payload.fac) return payload.fac;
        }
      }
    } catch {
      // ignore
    }
  }

  // 3. Fallback heuristic based on resource URL
  if (resourceUrl?.includes("coinbase.com")) return "Coinbase";

  return null;
}