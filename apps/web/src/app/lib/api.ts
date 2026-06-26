const API_URL = process.env.API_URL || "http://localhost:4001";

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
    // Never let an unreachable/slow API hang server rendering indefinitely.
    // 25s headroom: the all-time dashboard aggregate over the full (production-
    // scale) ledger can take several seconds; 8s was too tight once real data
    // is connected. (The real fix is to pre-aggregate / cache that query.)
    signal: init?.signal ?? AbortSignal.timeout(25000),
  });
  if (!res.ok) {
    throw new Error(`API ${path} returned ${res.status}`);
  }
  return res.json() as Promise<T>;
}
