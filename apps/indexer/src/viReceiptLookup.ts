import axios from "axios";

export type ViLookupTransaction = {
  hash: string;
  invoiceId: string | null;
  rawMemo: string | null;
};

export type ViReceiptLookupConfig = {
  url: string;
  token?: string;
  timeoutMs: number;
};

export type ViReceiptStatus = {
  hash: string;
  verifiableIntent: boolean;
  riskChecked: boolean;
};

type AnyRecord = Record<string, unknown>;

function asRecord(value: unknown): AnyRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as AnyRecord)
    : null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeHash(value: unknown): string | null {
  const s = asString(value);
  return s ? s.toUpperCase() : null;
}

function boolFromAliases(source: AnyRecord, aliases: string[]): boolean | null {
  for (const alias of aliases) {
    const value = source[alias];
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const lower = value.trim().toLowerCase();
      if (["true", "yes", "1"].includes(lower)) return true;
      if (["false", "no", "0"].includes(lower)) return false;
    }
  }
  return null;
}

function positiveDecision(value: unknown): boolean {
  if (typeof value !== "string") return false;
  return ["allow", "approve", "approved", "success", "recorded"].includes(
    value.trim().toLowerCase(),
  );
}

function extractHash(item: AnyRecord, fallbackHash?: string): string | null {
  return normalizeHash(
    item.hash
    ?? item.txHash
    ?? item.tx_hash
    ?? item.transactionHash
    ?? item.transaction_hash
    ?? fallbackHash
  );
}

function extractVerifiableIntent(item: AnyRecord): boolean {
  const vi = asRecord(item.vi);
  const chain = asRecord(item.chain);

  return boolFromAliases(item, [
    "verifiableIntent",
    "verifiable_intent",
    "chainVerified",
    "chain_verified",
    "verified",
  ])
    ?? (vi ? boolFromAliases(vi, ["verified", "chain_verified", "chainVerified"]) : null)
    ?? (chain ? boolFromAliases(chain, ["verified", "chain_verified", "chainVerified"]) : null)
    ?? false;
}

function extractRiskChecked(item: AnyRecord, verifiableIntent: boolean): boolean {
  const explicit = boolFromAliases(item, [
    "riskChecked",
    "risk_checked",
    "riskApproved",
    "risk_approved",
  ]);
  if (explicit !== null) return explicit;

  const vi = asRecord(item.vi);
  const nestedViDecision = vi
    ? vi.decision ?? vi.status ?? vi.result
    : undefined;

  return verifiableIntent && (
    positiveDecision(item.decision)
    || positiveDecision(item.status)
    || positiveDecision(item.receiptStatus)
    || positiveDecision(item.receipt_status)
    || positiveDecision(nestedViDecision)
  );
}

function normalizeItem(item: unknown, fallbackHash?: string): ViReceiptStatus | null {
  const record = asRecord(item);
  if (!record) return null;

  const hash = extractHash(record, fallbackHash);
  if (!hash) return null;

  const verifiableIntent = extractVerifiableIntent(record);
  const riskChecked = extractRiskChecked(record, verifiableIntent);

  if (!verifiableIntent && !riskChecked) return null;

  return {
    hash,
    verifiableIntent: verifiableIntent || riskChecked,
    riskChecked,
  };
}

function candidateItems(data: unknown): Array<{ item: unknown; fallbackHash?: string }> {
  if (Array.isArray(data)) {
    return data.map((item) => ({ item }));
  }

  const record = asRecord(data);
  if (!record) return [];

  for (const key of ["items", "results", "receipts", "transactions"]) {
    const value = record[key];
    if (Array.isArray(value)) {
      return value.map((item) => ({ item }));
    }
  }

  const out: Array<{ item: unknown; fallbackHash?: string }> = [];
  for (const [key, value] of Object.entries(record)) {
    if (asRecord(value)) out.push({ item: value, fallbackHash: key });
  }
  return out;
}

export function normalizeViReceiptLookupResponse(data: unknown): Map<string, ViReceiptStatus> {
  const statuses = new Map<string, ViReceiptStatus>();
  for (const { item, fallbackHash } of candidateItems(data)) {
    const status = normalizeItem(item, fallbackHash);
    if (status) statuses.set(status.hash, status);
  }
  return statuses;
}

export async function lookupViReceiptStatuses(
  config: ViReceiptLookupConfig,
  transactions: ViLookupTransaction[],
): Promise<Map<string, ViReceiptStatus>> {
  if (transactions.length === 0) return new Map();

  const response = await axios.post(
    config.url,
    { transactions },
    {
      timeout: config.timeoutMs,
      headers: {
        "Content-Type": "application/json",
        ...(config.token ? { Authorization: `Bearer ${config.token}` } : {}),
      },
    },
  );

  return normalizeViReceiptLookupResponse(response.data);
}
