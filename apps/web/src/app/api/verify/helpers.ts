export type XrplRequirement = {
  payTo?: string;
  amount?: string | number;
  asset?: string;
  network?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toXrplRequirement(value: unknown): XrplRequirement | null {
  if (!isRecord(value)) return null;
  return {
    payTo: typeof value.payTo === "string" ? value.payTo : undefined,
    amount: typeof value.amount === "string" || typeof value.amount === "number" ? value.amount : undefined,
    asset: typeof value.asset === "string" ? value.asset : undefined,
    network: typeof value.network === "string" ? value.network : undefined,
  };
}

export function parsePaymentRequired(headerValue: unknown): unknown {
  if (typeof headerValue !== "string") return null;
  try {
    const decodedStr = Buffer.from(headerValue, "base64").toString("utf-8");
    return JSON.parse(decodedStr);
  } catch {
    return null;
  }
}

export function extractXrplRequirement(paymentRequired: unknown): XrplRequirement | null {
  const requirements = Array.isArray(paymentRequired)
    ? paymentRequired
    : isRecord(paymentRequired) && Array.isArray(paymentRequired.accepts)
      ? paymentRequired.accepts
      : [];

  for (const req of requirements) {
    const parsed = toXrplRequirement(req);
    if (!parsed) continue;

    const network = String(parsed.network || "").toLowerCase();
    if (network === "xrpl" || network === "testnet") {
      return parsed;
    }
  }

  return null;
}

export function normalizeDiscoveredResource(resourceEntry: string, origin: string): string | null {
  const value = resourceEntry.trim();
  if (!value) return null;

  // Supports discovery entries like "GET /api/foo" or "/api/foo".
  const methodAndPath = value.match(/^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+(.+)$/i);
  const maybeUrl = methodAndPath ? methodAndPath[2].trim() : value;

  try {
    const parsed = new URL(maybeUrl, origin);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.toString();
  } catch {
    return null;
  }
}
