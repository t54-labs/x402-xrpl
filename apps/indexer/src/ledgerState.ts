export type IndexedTransaction = {
  hash: string;
  amount: string;
  asset: string;
};

export function selectNewTransactions<T extends IndexedTransaction>(
  batch: T[],
  existingHashes: Set<string>
) {
  return batch.filter((tx) => !existingHashes.has(tx.hash));
}

export function sumXrpVolume(transactions: IndexedTransaction[]) {
  return transactions
    .filter((tx) => tx.asset === "XRP")
    .reduce((sum, tx) => {
      const amount = Number(tx.amount);
      return Number.isFinite(amount) ? sum + amount : sum;
    }, 0);
}
