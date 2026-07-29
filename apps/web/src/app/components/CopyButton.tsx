"use client";

import { useState } from "react";
import { useT } from "@/app/components/useT";

export function CopyButton({ text }: { text: string }) {
  const t = useT();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard API unavailable (e.g. non-HTTPS) */
    }
  };

  return (
    <button
      onClick={handleCopy}
      aria-label={copied ? t("Copied") : t("Copy to clipboard")}
      className="!rounded-md text-gray-500 hover:text-gray-300 transition-colors p-1 rounded hover:bg-white/5"
      title={t("Copy to clipboard")}
    >
      {copied ? (
        <svg aria-hidden="true" className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  );
}
