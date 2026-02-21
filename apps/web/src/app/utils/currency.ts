/**
 * Decode XRPL currency codes.
 * Standard codes are 3 chars (e.g. "XRP", "USD").
 * Non-standard are 160-bit (40 hex chars) where the ASCII name is
 * in the first bytes, padded with zeros.
 */
export function formatCurrency(code: string): string {
  if (!code) return "???";
  if (code === "XRP") return "XRP";
  if (code.length <= 3) return code;

  if (code.length === 40 && /^[0-9A-Fa-f]+$/.test(code)) {
    const ascii = code
      .match(/.{2}/g)!
      .map((h) => parseInt(h, 16))
      .filter((c) => c > 0 && c < 128)
      .map((c) => String.fromCharCode(c))
      .join("");
    return ascii || code.substring(0, 8) + "...";
  }

  return code;
}
