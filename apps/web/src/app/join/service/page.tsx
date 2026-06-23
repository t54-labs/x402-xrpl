"use client";

import { useState } from "react";

const CATEGORIES = ["AI Agent / Skill", "Data / Analytics", "Inference", "LLM gateway", "Dev tool / CLI", "Wallet / Infra", "Agentic commerce"];
const ASSETS = ["RLUSD", "XRP", "IOU"];

export default function JoinServicePage() {
  const [form, setForm] = useState({ name: "", website: "", tagline: "", description: "", category: CATEGORIES[0], useCase: "Pay-per-use APIs", asset: ASSETS[0], contactEmail: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok?: boolean; error?: string } | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/join/service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setResult(res.ok && data.success ? { ok: true } : { error: data.error || "Failed to submit." });
    } catch {
      setResult({ error: "Network error." });
    } finally {
      setLoading(false);
    }
  };

  const input = "ui-control w-full bg-[rgba(255,255,255,0.03)] text-[var(--text-primary)] px-4 py-3 border border-[var(--border)] rounded-lg focus:border-[var(--brand-blue)] focus:outline-none transition-colors text-sm placeholder:text-[var(--text-muted)]";
  const label = "block text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-2";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <header className="mb-10 animate-fade-up">
        <span className="text-[10px] font-mono uppercase tracking-[0.28em] text-[var(--paper-mute)]">Join · Directory</span>
        <h1 className="mt-5 text-4xl sm:text-5xl font-medium tracking-[-0.03em] leading-[1.02] text-[var(--paper)]">List your<br />service.</h1>
        <p className="text-[15px] text-[var(--text-secondary)] mt-5 max-w-lg leading-relaxed">
          Add your AI service, agent, or tool to the XRPL AI Community directory. Submissions are reviewed before they go live.
        </p>
      </header>

      <form onSubmit={submit} className="dashboard-panel bg-[var(--bg-surface)] border border-[var(--border)] p-6 sm:p-8 space-y-5 animate-fade-up" style={{ animationDelay: "80ms" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={label}>Name</label>
            <input className={input} required value={form.name} onChange={set("name")} placeholder="Your service" />
          </div>
          <div>
            <label className={label}>Website</label>
            <input className={input} value={form.website} onChange={set("website")} placeholder="https://yourservice.ai" />
          </div>
        </div>
        <div>
          <label className={label}>Tagline</label>
          <input className={input} value={form.tagline} onChange={set("tagline")} placeholder="One line on what you do." />
        </div>
        <div>
          <label className={label}>Description</label>
          <textarea className={input} rows={3} value={form.description} onChange={set("description")} placeholder="A short description." />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className={label}>Category</label>
            <select className={input} value={form.category} onChange={set("category")}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={label}>Use case</label>
            <input className={input} value={form.useCase} onChange={set("useCase")} placeholder="Pay-per-use APIs" />
          </div>
          <div>
            <label className={label}>Asset</label>
            <select className={input} value={form.asset} onChange={set("asset")}>
              {ASSETS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className={label}>Contact email</label>
          <input className={input} type="email" value={form.contactEmail} onChange={set("contactEmail")} placeholder="you@yourservice.ai" />
        </div>

        <button type="submit" disabled={loading} className="ui-control w-full bg-[var(--brand-blue)] text-white font-medium py-3 px-4 rounded-lg transition-all disabled:opacity-50">
          {loading ? "Submitting…" : "Submit for review"}
        </button>

        {result?.ok ? (
          <div className="p-4 rounded-lg text-sm border bg-[var(--success)]/10 border-[var(--success)]/20 text-[var(--success)]">
            Submitted. We&rsquo;ll review your listing and publish it to the directory.
          </div>
        ) : null}
        {result?.error ? (
          <div className="p-4 rounded-lg text-sm border bg-red-500/10 border-red-500/20 text-red-400">{result.error}</div>
        ) : null}
      </form>
    </div>
  );
}
