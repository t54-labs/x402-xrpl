"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ADMIN_USER = "admin";
const ADMIN_PASS = "x402xrpl2026";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    setTimeout(() => {
      if (username === ADMIN_USER && password === ADMIN_PASS) {
        sessionStorage.setItem("admin_auth", "true");
        router.push("/admin");
      } else {
        setError("Invalid credentials");
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[var(--brand-blue)]/10 border border-[var(--brand-blue)]/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[var(--brand-blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">Admin Console</h1>
          <p className="text-sm text-[var(--text-muted)] mt-2">Sign in to access the dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-control)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-blue)] transition-colors"
              placeholder="Enter username"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-control)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-blue)] transition-colors"
              placeholder="Enter password"
            />
          </div>

          {error && (
            <div className="px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-[var(--radius-tag)] text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[var(--brand-blue)] hover:brightness-110 text-white font-semibold rounded-[var(--radius-control)] transition-all disabled:opacity-50 text-sm"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
