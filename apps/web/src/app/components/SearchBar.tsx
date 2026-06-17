"use client";

import { useState, useEffect, useRef, type FormEvent, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useRouter } from "next/navigation";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const submitSearch = (rawQuery = inputRef.current?.value || query) => {
    const q = rawQuery.trim();
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

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    submitSearch();
  };

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    submitSearch(e.currentTarget.value);
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <div className={`flex items-center bg-[rgba(255,255,255,0.04)] border rounded-lg transition-all duration-200 ${
        focused ? "border-[rgba(0,140,255,0.3)] bg-[rgba(255,255,255,0.06)]" : "border-[rgba(255,255,255,0.06)]"
      }`}>
        <button
          type="submit"
          aria-label="Search"
          className="ml-3 shrink-0 appearance-none border-0 bg-transparent p-0 text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search by address or tx hash..."
          className="w-full bg-transparent text-[13px] text-[var(--text-primary)] px-2.5 py-1.5 outline-none placeholder:text-[var(--text-muted)] min-w-[220px] 2xl:min-w-[260px]"
        />
        {!focused && (
          <kbd className="hidden sm:inline-flex items-center mr-2 px-1.5 py-0.5 text-[10px] text-[var(--text-muted)] border border-[rgba(255,255,255,0.08)] rounded bg-[rgba(255,255,255,0.03)] font-mono">
            /
          </kbd>
        )}
      </div>
    </form>
  );
}
