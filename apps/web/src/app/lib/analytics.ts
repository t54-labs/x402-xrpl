// Thin wrapper over gtag for GA4 custom events (conversions). No-op on the
// server and when gtag isn't present (e.g. analytics consent denied / blocked).
export function track(name: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  try {
    w.gtag?.("event", name, params ?? {});
  } catch {
    /* analytics must never break the app */
  }
}
