const API_URL = process.env.API_URL || "http://localhost:4001";

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
    // Never let an unreachable/slow API hang server rendering indefinitely.
    signal: init?.signal ?? AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    throw new Error(`API ${path} returned ${res.status}`);
  }
  return res.json() as Promise<T>;
}
