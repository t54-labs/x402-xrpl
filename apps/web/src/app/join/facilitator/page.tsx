"use client";

import { useState } from "react";
import { PageHalftone } from "@/app/components/BrandDots";

export default function JoinFacilitatorPage() {
  const [form, setForm] = useState({ name: "", sourceTag: "", website: "", url: "", description: "", networks: "xrpl:0", assets: "XRP, RLUSD" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok?: boolean; error?: string } | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/join/facilitator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          sourceTag: Number(form.sourceTag),
          website: form.website,
          url: form.url,
          description: form.description,
          networks: form.networks.split(",").map((s) => s.trim()).filter(Boolean),
          assets: form.assets.split(",").map((s) => s.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      setResult(res.ok && data.success ? { ok: true } : { error: data.error || "Failed to register." });
    } catch {
      setResult({ error: "Network error." });
    } finally {
      setLoading(false);
    }
  };

  const input = "ui-control w-full bg-[rgba(255,255,255,0.03)] text-[var(--text-primary)] px-4 py-3 border border-[var(--border)] rounded-lg focus:border-[var(--brand-blue)] focus:outline-none transition-colors text-sm placeholder:text-[var(--text-muted)]";
  const label = "block text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-2";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 relative isolate overflow-hidden">
      <PageHalftone />
      <header className="mb-10 animate-fade-up">
        <span className="text-[10px] font-plek uppercase tracking-[0.28em] text-[var(--paper-mute)]">Join · Facilitator</span>
        <h1 className="mt-5 text-4xl sm:text-5xl font-medium tracking-[-0.03em] leading-[1.02] text-[var(--paper)]">Register your<br />facilitator.</h1>
        <p className="text-[15px] text-[var(--text-secondary)] mt-5 max-w-lg leading-relaxed">
          Submit your facilitator and its SourceTag. We index every XRPL Payment carrying that tag, so your settled volume appears on the Index. No ownership proof required.
        </p>
      </header>

      <form onSubmit={submit} className="dashboard-panel bg-[var(--bg-surface)] border border-[var(--border)] p-6 sm:p-8 space-y-5 animate-fade-up" style={{ animationDelay: "80ms" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={label}>Facilitator name</label>
            <input className={input} required value={form.name} onChange={set("name")} placeholder="Acme Facilitator" />
          </div>
          <div>
            <label className={label}>SourceTag</label>
            <input className={input} required type="number" value={form.sourceTag} onChange={set("sourceTag")} placeholder="804681468" />
          </div>
        </div>
        <div>
          <label className={label}>Website</label>
          <input className={input} value={form.website} onChange={set("website")} placeholder="https://facilitator.example" />
        </div>
        <div>
          <label className={label}>Facilitator URL</label>
          <input className={input} value={form.url} onChange={set("url")} placeholder="https://facilitator.example/api" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={label}>Networks (comma-separated)</label>
            <input className={input} value={form.networks} onChange={set("networks")} placeholder="xrpl:0, xrpl:1" />
          </div>
          <div>
            <label className={label}>Assets (comma-separated)</label>
            <input className={input} value={form.assets} onChange={set("assets")} placeholder="XRP, RLUSD" />
          </div>
        </div>
        <div>
          <label className={label}>Description</label>
          <textarea className={input} rows={3} value={form.description} onChange={set("description")} placeholder="What your facilitator does." />
        </div>

        <button type="submit" disabled={loading} className="ui-control w-full bg-[var(--brand-blue)] text-white font-medium py-3 px-4 rounded-lg transition-all disabled:opacity-50">
          {loading ? "Registering…" : "Register facilitator"}
        </button>

        {result?.ok ? (
          <div className="p-4 rounded-lg text-sm border bg-[var(--success)]/10 border-[var(--success)]/20 text-[var(--success)]">
            Registered. Your SourceTag is now indexed — settled payments will appear on the Index.
          </div>
        ) : null}
        {result?.error ? (
          <div className="p-4 rounded-lg text-sm border bg-red-500/10 border-red-500/20 text-red-400">{result.error}</div>
        ) : null}
      </form>
    </div>
  );
}
