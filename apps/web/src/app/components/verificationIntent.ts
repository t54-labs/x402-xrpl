// Pure helper kept out of the "use client" badge module so server components can import it.
export function isVerifiedIntent(tx: { verifiableIntent?: boolean | null; riskChecked?: boolean | null }) {
  return Boolean(tx.riskChecked || tx.verifiableIntent);
}
