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
    <div className="max-w-2xl mx-auto px-6 py-16">
      
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 mb-6 neon-glow">
          <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        </div>
        <h1 className="text-3xl font-light tracking-tight text-white">Join the x402 Economy</h1>
        <p className="text-gray-400 mt-3 text-sm max-w-md mx-auto leading-relaxed">
          Register your API resource to make it discoverable in the Agora. We will verify your HTTP 402 configuration and XRPL requirements instantly.
        </p>
      </div>

      <div className="bg-[#131518] rounded-2xl border border-white/5 p-8 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
              Origin or API Endpoint URL
            </label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.yourdomain.com"
              className="w-full bg-[#0b0d10] text-white px-4 py-3 border border-white/10 rounded-lg focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all font-mono text-sm placeholder:text-gray-700"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(34,211,238,0.2)] disabled:shadow-none"
          >
            {loading ? "Verifying Endpoint..." : "Verify & Register"}
          </button>
        </form>

        {result && (
          <div className="mt-6 space-y-3">
            {result.success ? (
              <div className="p-4 rounded-lg text-sm border bg-[#2ee076]/10 border-[#2ee076]/20 text-[#2ee076]">
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
              <div className="p-4 rounded-lg text-sm border bg-[#ff4a68]/10 border-[#ff4a68]/20 text-[#ff4a68]">
                {result.error || "Failed to register resource."}
              </div>
            )}

            {result.failed && result.failed.length > 0 && (
              <div className="p-4 rounded-lg text-sm border border-yellow-500/20 bg-yellow-500/5 text-yellow-400">
                <p className="font-medium text-xs uppercase tracking-wider mb-2">Failed Endpoints</p>
                {result.failed.map((f, i) => (
                  <div key={i} className="text-xs mt-1">
                    <span className="font-mono text-yellow-300">{f.url}</span>
                    <span className="text-yellow-600 ml-2">&mdash; {f.error}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 text-center text-xs text-gray-600">
        <p>
          Submit an origin URL to auto-discover <code className="text-gray-400">/.well-known/x402</code>, or submit a direct endpoint URL.
          Every registered endpoint must return <code className="text-gray-400">HTTP 402</code> with a valid <code className="text-gray-400">PAYMENT-REQUIRED</code> header containing{" "}
          <code className="text-gray-400">{`{"network":"xrpl"}`}</code>.
        </p>
      </div>
    </div>
  );
}