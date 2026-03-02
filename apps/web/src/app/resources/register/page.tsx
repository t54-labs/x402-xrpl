"use client";

import { useState } from "react";

export default function RegisterResourcePage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    error?: string;
    registeredCount?: number;
    discoveryChecked?: boolean;
    discoveryFound?: number;
    failed?: Array<{ url: string; error: string }>;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      setResult(data);
      if (res.ok) setUrl("");
    } catch {
      setResult({ error: "Network error occurred." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100svh-80px)] flex items-center justify-center px-4 sm:px-6 py-8">
      <div className="w-full max-w-2xl">
      <div className="mb-10 text-center animate-fade-up">
        <img src="/icon.png" alt="" aria-hidden className="mx-auto mb-6 h-14 w-14 object-contain opacity-[0.18]" />
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">Join the x402 Economy</h1>
        <p className="text-[var(--text-muted)] mt-2 text-sm max-w-md mx-auto leading-relaxed">
          Register your API resource to make it discoverable in the Agora. We will verify your HTTP 402 configuration and XRPL requirements instantly.
        </p>
      </div>

      <div className="dashboard-panel bg-[var(--bg-surface)] border border-[var(--border)] p-6 sm:p-8 animate-fade-up" style={{ animationDelay: "80ms" }}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-2">
              Origin or API Endpoint URL
            </label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.yourdomain.com"
              className="ui-control w-full bg-[rgba(255,255,255,0.03)] text-[var(--text-primary)] px-4 py-3 border border-[var(--border)] rounded-lg focus:border-[var(--brand-blue)] focus:outline-none transition-colors font-mono text-sm placeholder:text-[var(--text-muted)]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="ui-control w-full bg-[var(--brand-blue)] text-white font-medium py-3 px-4 rounded-lg transition-all disabled:opacity-50"
          >
            {loading ? "Verifying Endpoint..." : "Verify & Register"}
          </button>
        </form>

        {result && (
          <div className="mt-6 space-y-3">
            {result.success ? (
              <div className="p-4 rounded-lg text-sm border bg-[var(--success)]/10 border-[var(--success)]/20 text-[var(--success)]">
                <p className="font-medium">
                  Successfully registered {result.registeredCount} resource{result.registeredCount !== 1 ? "s" : ""} on the XRPL x402 Network!
                </p>
                {result.discoveryChecked && (
                  <p className="text-xs mt-1 opacity-80">
                    Auto-discovery found {result.discoveryFound} endpoint{result.discoveryFound !== 1 ? "s" : ""} via .well-known/x402.
                  </p>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-lg text-sm border bg-red-500/10 border-red-500/20 text-red-400">
                {result.error || "Failed to register resource."}
              </div>
            )}

            {result.failed && result.failed.length > 0 && (
              <div className="p-4 rounded-lg text-sm border border-amber-500/20 bg-amber-500/5 text-amber-400">
                <p className="font-medium text-xs uppercase tracking-wider mb-2">Failed Endpoints</p>
                {result.failed.map((f, i) => (
                  <div key={i} className="text-xs mt-1">
                    <span className="font-mono text-amber-300">{f.url}</span>
                    <span className="text-amber-500/80 ml-2">&mdash; {f.error}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 text-center text-xs text-[var(--text-muted)] animate-fade-up" style={{ animationDelay: "150ms" }}>
        <p>
          Submit an origin URL to auto-discover <code className="text-[var(--text-secondary)]">/.well-known/x402</code>, or submit a direct endpoint URL.
          Every registered endpoint must return <code className="text-[var(--text-secondary)]">HTTP 402</code> with a valid <code className="text-[var(--text-secondary)]">PAYMENT-REQUIRED</code> header containing{" "}
          <code className="text-[var(--text-secondary)]">{`{"network":"xrpl"}`}</code>.
        </p>
      </div>
      </div>
    </div>
  );
}