const API_URL = process.env.API_URL || "http://localhost:4001";

type FetchInit = RequestInit & { next?: { revalidate?: number | false; tags?: string[] } };

export async function apiFetch<T>(path: string, init?: FetchInit): Promise<T> {
  const { cache, next, signal, headers, ...rest } = init ?? {};
  const opts: FetchInit = {
    ...rest,
    headers: { "Content-Type": "application/json", ...headers },
    // Fast-fail under load: a slow/overloaded API degrades to the empty-state
    // shell in a few seconds instead of pinning a render slot for 25s (which,
    // under a traffic spike, cascades into handler exhaustion). Callers override
    // with an explicit `signal` when they can afford to wait (e.g. ISR revalidation).
    signal: signal ?? AbortSignal.timeout(6000),
  };
  // Uncached by default; callers opt into ISR/edge caching via `next` (revalidate)
  // or an explicit `cache` so a spike doesn't fan out one render per visitor.
  if (next) opts.next = next;
  else opts.cache = cache ?? "no-store";

  const res = await fetch(`${API_URL}${path}`, opts);
  if (!res.ok) {
    throw new Error(`API ${path} returned ${res.status}`);
  }
  return res.json() as Promise<T>;
}
