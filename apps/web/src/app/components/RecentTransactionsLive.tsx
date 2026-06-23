"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatedNumber } from "./AnimatedNumber";
import { RelativeTime } from "./RelativeTime";
import { formatCurrency } from "../utils/currency";

type TransactionRow = {
  hash: string;
  amount: string;
  asset: string;
  timestamp: string;
  sourceTag?: number | null;
  verifiableIntent?: boolean;
  riskChecked?: boolean;
  merchant?: { address: string; name: string | null } | null;
};

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l7 3v6c0 4.6-3.1 8.7-7 10-3.9-1.3-7-5.4-7-10V5l7-3z" />
    </svg>
  );
}

export function RecentTransactionsLive({ transactions }: { transactions: TransactionRow[] }) {
  const [freshHashes, setFreshHashes] = useState<Set<string>>(new Set());
  const knownHashesRef = useRef<Set<string>>(new Set(transactions.map((tx) => tx.hash)));

  useEffect(() => {
    let mounted = true;
    const incoming = transactions.map((tx) => tx.hash);
    const newOnes = incoming.filter((hash) => !knownHashesRef.current.has(hash));
    if (newOnes.length > 0) {
      setFreshHashes((prev) => {
        const next = new Set(prev);
        newOnes.forEach((hash) => next.add(hash));
        return next;
      });
      window.setTimeout(() => {
        if (!mounted) return;
        setFreshHashes((prev) => {
          const next = new Set(prev);
          newOnes.forEach((hash) => next.delete(hash));
          return next;
        });
      }, 2600);
    }
    knownHashesRef.current = new Set(incoming);
    return () => {
      mounted = false;
    };
  }, [transactions]);

  const rows = useMemo(() => transactions.slice(0, 6), [transactions]);

  if (rows.length === 0) {
    return <div className="px-6 py-12 text-center text-[var(--text-muted)] text-sm">No transactions indexed yet.</div>;
  }

  return (
    <motion.div layout className="divide-y divide-[var(--border)]">
      <AnimatePresence initial={false}>
        {rows.map((tx) => {
          const isFresh = freshHashes.has(tx.hash);
          const secure = !!tx.riskChecked;
          const verified = tx.sourceTag != null;
          const vi = !!tx.verifiableIntent;
          return (
            <motion.div
              key={tx.hash}
              layout
              initial={isFresh ? { opacity: 0, y: -18, filter: "blur(2px)" } : false}
              animate={{
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                backgroundColor: isFresh
                  ? secure
                    ? ["rgba(16,185,129,0.22)", "rgba(16,185,129,0.07)", "rgba(0,0,0,0)"]
                    : ["rgba(0,140,255,0.20)", "rgba(0,140,255,0.07)", "rgba(0,0,0,0)"]
                  : "rgba(0,0,0,0)",
              }}
              exit={{ opacity: 0, y: 8, transition: { duration: 0.2 } }}
              transition={{ duration: isFresh ? 0.7 : 0.35, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
              className={`relative px-5 sm:px-6 py-3.5 border-l-2 ${
                secure ? "border-l-emerald-400/70 bg-[rgba(16,185,129,0.04)]" : "border-l-transparent"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Link
                      href={`/tx/${tx.hash}`}
                      className="font-mono text-[13px] text-[var(--text-primary)] hover:text-[var(--brand-blue)] transition-colors"
                    >
                      {tx.hash.substring(0, 14)}…
                    </Link>
                    {verified ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/8 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                        <CheckIcon /> Verified
                      </span>
                    ) : null}
                    {vi ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[var(--brand-blue)] bg-[rgba(0,140,255,0.08)] border border-[rgba(0,140,255,0.2)] px-1.5 py-0.5 rounded">
                        <ShieldIcon /> Intent
                      </span>
                    ) : null}
                    {secure ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-300 bg-emerald-500/[0.14] border border-emerald-400/40 px-1.5 py-0.5 rounded">
                        <ShieldIcon /> X402 Secure
                      </span>
                    ) : null}
                    <motion.span
                      initial={false}
                      animate={{ opacity: isFresh ? 1 : 0, x: isFresh ? 0 : -2 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="text-[10px] font-semibold tracking-wide text-[var(--brand-blue)]"
                      aria-hidden={!isFresh}
                    >
                      NEW
                    </motion.span>
                  </div>
                  <Link
                    href={`/address/${tx.merchant?.address || ""}`}
                    className="mt-1.5 block text-[13px] text-[var(--text-secondary)] hover:text-[var(--brand-blue)] transition-colors truncate"
                  >
                    {tx.merchant?.name || `${(tx.merchant?.address || "").substring(0, 12)}…`}
                  </Link>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    <AnimatedTransactionAmount amount={tx.amount} />{" "}
                    <span className="text-[var(--text-muted)] text-xs">{formatCurrency(tx.asset)}</span>
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    <RelativeTime date={tx.timestamp} />
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}

function AnimatedTransactionAmount({ amount }: { amount: string }) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return amount;
  const fraction = amount.split(".")[1] ?? "";
  const decimals = Math.min(Math.max(fraction.length, value > 0 && value < 1 ? 4 : 0), 6);
  return <AnimatedNumber value={value} decimals={decimals} duration={1400} />;
}
