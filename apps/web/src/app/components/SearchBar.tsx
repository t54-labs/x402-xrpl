"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    if (q.startsWith("r") && q.length >= 25 && q.length <= 35) {
      router.push(`/address/${q}`);
    } else if (q.length === 64 || q.length > 40) {
      router.push(`/tx/${q}`);
    } else {
      router.push(`/search?q=${encodeURIComponent(q)}`);
    }
    setQuery("");
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <div className={`flex items-center bg-white/5 border rounded-lg transition-all ${
        focused ? "border-cyan-400/50 shadow-[0_0_10px_rgba(34,211,238,0.1)]" : "border-white/10"
      }`}>
        <svg className="w-4 h-4 text-gray-500 ml-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search by address or tx hash..."
          className="w-full bg-transparent text-sm text-white px-3 py-2 outline-none placeholder:text-gray-600 min-w-[240px]"
        />
      </div>
    </form>
  );
}
