/**
 * Decode XRPL currency codes.
 * Standard codes are 3 chars (e.g. "XRP", "USD").
 * Non-standard are 160-bit (40 hex chars) where the ASCII name is
 * in the first bytes, padded with zeros.
 */
export function formatCurrency(code: string): string {
  if (!code) return "???";
  if (code === "XRP") return "XRP";
  // Handle "currency.issuer" format from API
  const currency = code.includes(".") ? code.split(".")[0] : code;
  if (currency.length <= 3) return currency;

  if (currency.length === 40 && /^[0-9A-Fa-f]+$/.test(currency)) {
    const ascii = currency
      .match(/.{2}/g)!
      .map((h) => parseInt(h, 16))
      .filter((c) => c > 0 && c < 128)
      .map((c) => String.fromCharCode(c))
      .join("");
    return ascii || currency.substring(0, 8) + "...";
  }

  return currency;
}
