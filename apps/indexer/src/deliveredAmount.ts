// tfPartialPayment (0x00020000): when set, a Payment succeeds (tesSUCCESS) while
// delivering LESS than tx.Amount. See https://xrpl.org/partial-payments.html
const PARTIAL_PAYMENT_FLAG = 0x00020000;

export type DeliveredAmount = {
  amount: string;
  asset: string;
  assetIssuer: string | null;
};

/**
 * Resolve the amount a Payment ACTUALLY delivered.
 *
 * tx.Amount / tx.DeliverMax is the amount the sender *requested*, not what was received:
 * a tfPartialPayment Payment still returns tesSUCCESS while delivering as little as 1 drop.
 * The authoritative value is metadata.delivered_amount — a drops string for native XRP, or
 * a { currency, issuer, value } object for issued currencies (RLUSD etc.). It is the literal
 * string "unavailable" for a small number of pre-2014 partial payments.
 *
 * Trusting tx.Amount here let anyone inflate every displayed volume: a 1-drop partial
 * payment with Amount="1000000000000" would be recorded as 1,000,000 XRP settled.
 *
 * Returns null when there is no trustworthy positive amount to record.
 */
export function resolveDeliveredAmount(txStream: unknown, tx: unknown): DeliveredAmount | null {
  const meta = pick(txStream, "meta") ?? pick(tx, "meta") ?? pick(tx, "metaData");
  const delivered = pick(meta, "delivered_amount") ?? pick(meta, "DeliveredAmount");
  const flagsValue = pick(tx, "Flags");
  const flags = typeof flagsValue === "number" ? flagsValue : 0;
  const isPartial = (flags & PARTIAL_PAYMENT_FLAG) !== 0;

  let rawAmount: unknown;
  if (delivered !== undefined && delivered !== null && delivered !== "unavailable") {
    rawAmount = delivered;
  } else if (isPartial) {
    // Partial payment with no usable delivered_amount: tx.Amount is a ceiling, not a
    // receipt. Refuse to guess an amount.
    return null;
  } else {
    rawAmount = pick(tx, "Amount") ?? pick(tx, "DeliverMax");
  }

  if (typeof rawAmount === "string") {
    const drops = Number(rawAmount);
    if (!Number.isFinite(drops) || drops <= 0) return null;
    return { amount: (drops / 1_000_000).toString(), asset: "XRP", assetIssuer: null };
  }

  if (rawAmount && typeof rawAmount === "object") {
    const value = String(pick(rawAmount, "value") ?? "");
    if (!value || value === "0") return null;
    const currency = pick(rawAmount, "currency");
    const issuer = pick(rawAmount, "issuer");
    return {
      amount: value,
      asset: typeof currency === "string" && currency ? currency : "UNKNOWN",
      assetIssuer: typeof issuer === "string" && issuer ? issuer : null,
    };
  }

  return null;
}

function pick(obj: unknown, key: string): unknown {
  return obj && typeof obj === "object" ? (obj as Record<string, unknown>)[key] : undefined;
}
