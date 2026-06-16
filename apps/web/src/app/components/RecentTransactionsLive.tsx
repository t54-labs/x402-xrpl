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
  merchant?: { address: string; name: string | null } | null;
};

export function RecentTransactionsLive({
  transactions,
}: {
  transactions: TransactionRow[];
}) {
  const [freshHashes, setFreshHashes] = useState<Set<string>>(new Set());
  const knownHashesRef = useRef<Set<string>>(new Set(transactions.map((tx) => tx.hash)));

  useEffect(() => {
    if (freshHashes.size === 0) return;
    const timer = window.setTimeout(() => {
      setFreshHashes(new Set());
    }, 3200);
    return () => window.clearTimeout(timer);
  }, [freshHashes]);

  useEffect(() => {
    let mounted = true;
    const incomingHashes = transactions.map((tx) => tx.hash);
    const newOnes = incomingHashes.filter((hash) => !knownHashesRef.current.has(hash));

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
      }, 2500);
    }

    knownHashesRef.current = new Set(incomingHashes);
    return () => {
      mounted = false;
    };
  }, [transactions]);

  const rows = useMemo(() => transactions.slice(0, 5), [transactions]);

  return (
    <div>
      {rows.length === 0 ? (
        <div className="px-6 py-12 text-center text-[var(--text-muted)] text-sm">
          No transactions indexed yet.
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
          <AnimatePresence initial={false}>
          {rows.map((tx) => {
            const isFresh = freshHashes.has(tx.hash);
            return (
              <motion.div
                key={tx.hash}
                layout
                initial={isFresh ? { opacity: 0, x: -56, scale: 0.985, filter: "blur(1.5px)" } : false}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: 1,
                  filter: "blur(0px)",
                  backgroundColor: isFresh
                    ? [
                        "rgba(0, 140, 255, 0.24)",
                        "rgba(0, 140, 255, 0.12)",
                        "rgba(0, 0, 0, 0)",
                      ]
                    : "rgba(0, 0, 0, 0)",
                }}
                transition={{
                  duration: isFresh ? 0.7 : 0.35,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                className="px-5 sm:px-6 py-4 border-r border-[var(--border)] border-b sm:border-b-0 min-h-[136px]"
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-2 min-w-0">
                    <Link href={`/tx/${tx.hash}`} className="font-mono text-sm text-[var(--text-primary)] hover:text-[var(--brand-blue)] transition-colors truncate">
                      {tx.hash.substring(0, 16)}...
                    </Link>
                    <motion.span
                      initial={false}
                      animate={{ opacity: isFresh ? 1 : 0, x: isFresh ? 0 : -2 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="inline-flex items-center justify-center w-[40px] px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide bg-[rgba(0,140,255,0.16)] text-[var(--brand-blue)] border border-[rgba(0,140,255,0.35)]"
                      aria-hidden={!isFresh}
                    >
                      NEW
                    </motion.span>
                  </div>

                  <Link href={`/address/${tx.merchant?.address || ""}`} className="mt-4 block text-sm text-[var(--text-secondary)] hover:text-[var(--brand-blue)] transition-colors truncate">
                    {tx.merchant?.name || `${(tx.merchant?.address || "").substring(0, 10)}...`}
                  </Link>

                  <div className="mt-auto flex items-end justify-between gap-2 pt-3">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                      <AnimatedTransactionAmount amount={tx.amount} />{" "}
                      <span className="text-[var(--text-muted)] text-xs">{formatCurrency(tx.asset)}</span>
                    </p>
                    <p className="text-sm text-[var(--text-secondary)] whitespace-nowrap">
                      <RelativeTime date={tx.timestamp} />
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

function AnimatedTransactionAmount({ amount }: { amount: string }) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return amount;

  const fraction = amount.split(".")[1] ?? "";
  const decimals = Math.min(Math.max(fraction.length, value > 0 && value < 1 ? 4 : 0), 6);

  return <AnimatedNumber value={value} decimals={decimals} duration={1400} />;
}
