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
const LINKS = ["L1·TRUSTLINE", "L2·DELEGATION", "L3·AGENT-SIGNED"];

function stateOf(tx: TransactionRow): ChainState {
  if (tx.riskChecked) return "sealed";
  if (tx.verifiableIntent) return "verified";
  return "idle";
}

// Shared SVG glow (newly authored — feGaussianBlur + feMerge). Rendered once.
function SpineDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" className="absolute">
      <defs>
        <filter id="spine-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}

function VerificationChain({ state, fresh }: { state: ChainState; fresh: boolean }) {
  const reduce = useReducedMotion();
  const animateIn = fresh && !reduce;
  const active = state === "sealed" || state === "verified";
  const stroke = state === "idle" ? "var(--paper-faint)" : "var(--brand-blue)";
  const nodeX = [12, 150, 250];
  return (
    <div>
      <svg viewBox="0 0 300 24" width="100%" height="22" fill="none" aria-label="verification chain" role="img">
        {[0, 1].map((i) => (
          <motion.line
            key={i}
            x1={nodeX[i] + 8}
            y1="12"
            x2={nodeX[i + 1] - 8}
            y2="12"
            stroke={stroke}
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={state === "idle" ? "3 5" : undefined}
            initial={animateIn ? { pathLength: 0, opacity: 0.4 } : false}
            animate={{ pathLength: active ? 1 : state === "idle" ? 1 : 0, opacity: active ? 1 : 0.4 }}
            transition={{ ...SPRING, delay: 0.1 + i * 0.16 }}
          />
        ))}
        {nodeX.map((x, i) => (
          <motion.circle
            key={x}
            cx={x}
            cy="12"
            r="5"
            fill="none"
            stroke={stroke}
            strokeWidth="2"
            initial={animateIn ? { scale: 0.5, opacity: 0 } : false}
            animate={{ scale: active ? 1 : 0.74, opacity: active ? 1 : 0.4 }}
            transition={{ ...SPRING, delay: 0.05 + i * 0.16 }}
          />
        ))}
        {state === "sealed" ? (
          <motion.path
            d="M285 4 l9 3.4 v5.4 c0 4.6 -3.2 8.6 -9 10.2 c-5.8 -1.6 -9 -5.6 -9 -10.2 V7.4 z"
            fill="var(--brand-blue)"
            stroke="var(--brand-blue)"
            strokeWidth="2.4"
            filter="url(#spine-glow)"
            initial={animateIn ? { scale: 0.6, opacity: 0 } : false}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...SPRING, delay: 0.5 }}
          />
        ) : (
          <path
            d="M285 5 l8 3 v5 c0 4 -2.8 7.6 -8 9 c-5.2 -1.4 -8 -5 -8 -9 V8 z"
            fill="none"
            stroke="var(--paper-faint)"
            strokeWidth="1.5"
          />
        )}
      </svg>
      <div className="mt-1.5 grid grid-cols-3 gap-2">
        {LINKS.map((l) => (
          <span
            key={l}
            className="text-[9px] uppercase tracking-[0.16em] font-mono"
            style={{ color: active ? "var(--paper-mute)" : "var(--paper-faint)" }}
          >
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

function SettlementCard({ tx, fresh }: { tx: TransactionRow; fresh: boolean }) {
  const state = stateOf(tx);
  const sealed = state === "sealed";
  const verified = state !== "idle";
  const reduce = useReducedMotion();
  const merchantName = tx.merchant?.name || `${(tx.merchant?.address || "agent").substring(0, 10)}…`;
  return (
    <motion.article
      layout
      initial={fresh && !reduce ? { y: -16, opacity: 0 } : false}
      animate={{
        opacity: verified ? 1 : 0.42,
        y: 0,
        backgroundColor: fresh
          ? sealed
            ? ["rgba(0,140,255,0.16)", "rgba(0,140,255,0.05)", "rgba(0,0,0,0)"]
            : ["rgba(201,70,46,0.16)", "rgba(201,70,46,0.05)", "rgba(0,0,0,0)"]
          : "rgba(0,0,0,0)",
      }}
      exit={{ opacity: 0, y: 8, transition: { duration: 0.24 } }}
      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-[14px] border px-4 py-3.5 ml-9"
      style={{
        background: sealed
          ? "linear-gradient(180deg, var(--blue-08), rgba(0,0,0,0))"
          : "var(--ink-surface)",
        borderColor: sealed ? "var(--blue-28)" : "var(--rule)",
      }}
    >
      {/* fixed-blue hash stripe (left rail of the card) */}
      <span className="absolute left-0 top-3 bottom-3 w-[2px] rounded-full" style={{ background: "var(--brand-blue)" }} />
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-1.5 min-w-0">
          <Link href={`/tx/${tx.hash}`} className="font-mono tabular-nums text-[22px] leading-none text-[var(--paper)] hover:text-[var(--brand-blue)] transition-colors">
            <AnimatedTransactionAmount amount={tx.amount} />
          </Link>
          <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-[var(--paper-mute)]">{formatCurrency(tx.asset)}</span>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[11px] font-mono text-[var(--t54-coral)] truncate max-w-[120px]">{merchantName}</p>
          <p className="text-[10px] font-mono text-[var(--paper-faint)]"><RelativeTime date={tx.timestamp} /></p>
        </div>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="flex-1 min-w-0 max-w-[300px]">
          <VerificationChain state={state} fresh={fresh} />
        </div>
        {sealed ? (
          <span className="inline-flex items-center gap-1.5 shrink-0 mb-3 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-[0.16em] text-[var(--paper)]" style={{ borderWidth: 1, borderStyle: "solid", borderColor: "var(--blue-28)" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            Sealed
          </span>
        ) : (
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] shrink-0 mb-3 text-[var(--paper-faint)]">
            {verified ? "Verified" : "Unverified"}
          </span>
        )}
      </div>
      <p className="mt-2 text-[10px] font-mono text-[var(--paper-faint)] truncate">
        {tx.hash.substring(0, 8)}… {sealed ? "· risk-checked · pre-execution" : verified ? "· intent verified" : ""}
      </p>
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

  const rows = transactions.slice(0, 6);

  if (rows.length === 0) {
    return <div className="px-6 py-12 text-center text-[var(--text-muted)] text-sm">No settlements indexed yet.</div>;
  }

  return (
    <div className="relative px-4 sm:px-5 py-5">
      <SpineDefs />
      {/* the spine — breathing blue centerline (no box-shadow; pure gradient) */}
      <div
        className="spine-line absolute left-[18px] top-2 bottom-2 w-px"
        style={{ background: "linear-gradient(180deg, transparent, var(--blue-28) 12%, var(--blue-28) 88%, transparent)" }}
      />
      <motion.div layout className="flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {rows.map((tx) => {
            const fresh = freshHashes.has(tx.hash);
            const sealed = !!tx.riskChecked;
            const verified = !!tx.verifiableIntent;
            return (
              <div key={tx.hash} className="relative">
                {/* node sitting on the spine */}
                <span
                  className="absolute left-[13px] top-4 w-[12px] h-[12px] rounded-full z-10"
                  style={
                    sealed
                      ? { background: "var(--brand-blue)" }
                      : verified
                        ? { background: "var(--ink-base)", border: "2px solid var(--t54-coral)" }
                        : { background: "var(--ink-base)", border: "1.5px solid var(--paper-faint)" }
                  }
                />
                <SettlementCard tx={tx} fresh={fresh} />
              </div>
            );
          })}
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
