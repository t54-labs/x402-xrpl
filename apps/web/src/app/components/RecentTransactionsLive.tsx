"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
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

type ChainState = "idle" | "verified" | "sealed";
const SPRING = { type: "spring", stiffness: 120, damping: 24, mass: 1 } as const;

function stateOf(tx: TransactionRow): ChainState {
  if (tx.riskChecked) return "sealed";
  if (tx.verifiableIntent) return "verified";
  return "idle";
}

function SpineDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" className="absolute">
      <defs>
        <filter id="spine-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}

// Verification readout with a deliberate t54 dot rhythm — NOT three even dots.
// A TIGHT PAIR (the owner→agent delegation, bound together) — a clear gap — a
// SINGLE dot (the agent's signature) that locks into the shield (the seal).
// The spacing carries the meaning: what is bound, what acts, what is sealed.
function CompactChain({ state, fresh }: { state: ChainState; fresh: boolean }) {
  const reduce = useReducedMotion();
  const animateIn = fresh && !reduce;
  const active = state !== "idle";
  const sealed = state === "sealed";
  const dotFill = active ? "var(--brand-blue)" : "var(--paper-faint)";
  const dots = [14, 25, 64]; // pair (14,25 — tight) · gap · signature (64) → seal
  return (
    <svg viewBox="0 0 112 16" width="100%" height="16" fill="none" role="img" aria-label="verification: delegation pair, signature, seal">
      {dots.map((x, i) => (
        <motion.circle
          key={x}
          cx={x}
          cy="8"
          r={active ? 4 : 3.4}
          fill={dotFill}
          initial={animateIn ? { scale: 0, opacity: 0 } : false}
          animate={{ scale: 1, opacity: active ? 1 : 0.5 }}
          transition={{ ...SPRING, delay: 0.05 + i * 0.1 }}
        />
      ))}
      {sealed ? (
        <motion.path
          d="M97 0.5 l7.5 2.8 v4.4 c0 3.7 -2.6 6.9 -7.5 8.3 c-4.9 -1.4 -7.5 -4.6 -7.5 -8.3 V3.3 z"
          fill="var(--brand-blue)"
          stroke="var(--brand-blue)"
          strokeWidth="2"
          filter="url(#spine-glow)"
          initial={animateIn ? { scale: 0.6, opacity: 0 } : false}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ ...SPRING, delay: 0.38 }}
        />
      ) : (
        <path d="M97 1 l6.8 2.5 v4 c0 3.3 -2.3 6.2 -6.8 7.5 c-4.5 -1.3 -6.8 -4.2 -6.8 -7.5 V3.5 z" fill="none" stroke="var(--paper-faint)" strokeWidth="1.4" />
      )}
    </svg>
  );
}

function SettlementCard({ tx, fresh }: { tx: TransactionRow; fresh: boolean }) {
  const state = stateOf(tx);
  const sealed = state === "sealed";
  const verified = state !== "idle";
  const reduce = useReducedMotion();
  const merchantName = tx.merchant?.name || `${(tx.merchant?.address || "agent").substring(0, 8)}…`;
  return (
    <motion.article
      layout
      initial={fresh && !reduce ? { x: -28, opacity: 0 } : false}
      animate={{
        opacity: verified ? 1 : 0.5,
        x: 0,
        backgroundColor: fresh
          ? sealed
            ? ["rgba(0,140,255,0.16)", "rgba(0,140,255,0.05)", "rgba(0,0,0,0)"]
            : ["rgba(201,70,46,0.16)", "rgba(201,70,46,0.05)", "rgba(0,0,0,0)"]
          : "rgba(0,0,0,0)",
      }}
      exit={{ opacity: 0, x: 16, transition: { duration: 0.22 } }}
      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      className="relative shrink-0 w-[236px] rounded-[14px] border overflow-hidden"
      style={{
        background: sealed ? "linear-gradient(180deg, var(--blue-08), rgba(0,0,0,0))" : "var(--ink-surface)",
        borderColor: sealed ? "var(--blue-28)" : "var(--rule)",
      }}
    >
      {/* fixed-blue hash stripe along the top */}
      <span className="absolute left-0 right-0 top-0 h-[2px]" style={{ background: "var(--brand-blue)" }} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/tx/${tx.hash}`} className="flex items-baseline gap-1 min-w-0 hover:opacity-80 transition-opacity">
            <span className="font-mono tabular-nums text-[20px] leading-none text-[var(--paper)]">
              <AnimatedTransactionAmount amount={tx.amount} />
            </span>
            <span className="text-[9px] uppercase tracking-[0.2em] font-plek text-[var(--paper-mute)]">{formatCurrency(tx.asset)}</span>
          </Link>
          <span className="text-[10px] font-mono text-[var(--t54-coral)] truncate max-w-[72px] text-right">{merchantName}</span>
        </div>

        <div className="mt-3.5">
          <CompactChain state={state} fresh={fresh} />
        </div>

        <div className="mt-3 flex items-center justify-between">
          {sealed ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-plek uppercase tracking-[0.14em] text-[var(--paper)]" style={{ border: "1px solid var(--blue-28)" }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              Sealed
            </span>
          ) : (
            <span className="text-[9px] font-plek uppercase tracking-[0.14em] text-[var(--paper-faint)]">{verified ? "Verified" : "Unverified"}</span>
          )}
          <span className="text-[10px] font-mono text-[var(--paper-faint)]"><RelativeTime date={tx.timestamp} /></span>
        </div>
      </div>
    </motion.article>
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

  const rows = transactions.slice(0, 12);

  if (rows.length === 0) {
    return <div className="px-6 py-10 text-center text-[var(--text-muted)] text-sm">No settlements indexed yet.</div>;
  }

  return (
    <div className="relative px-5 sm:px-6 py-5">
      <SpineDefs />
      <motion.div layout className="hide-scrollbar relative flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
        <AnimatePresence initial={false}>
          {rows.map((tx) => (
            <SettlementCard key={tx.hash} tx={tx} fresh={freshHashes.has(tx.hash)} />
          ))}
        </AnimatePresence>
      </motion.div>
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
