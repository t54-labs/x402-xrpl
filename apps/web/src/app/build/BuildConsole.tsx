"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const STAGES = ["Agent requests", "402 · RLUSD", "Facilitator verifies", "Settled · XRPL"];

type Line = { t: string; c?: "cmd" | "ok" | "mut" };
const TABS: Record<string, Line[]> = {
  Server: [
    { t: "$ npm i x402-xrpl express", c: "cmd" },
    { t: "import { requirePayment } from 'x402-xrpl/express';" },
    { t: "app.use(requirePayment({" },
    { t: "  path: '/ai-news', price: '0.02', asset: 'RLUSD'," },
    { t: "  payToAddress: 'r…', network: 'xrpl:0'," },
    { t: "  facilitatorUrl: 'https://xrpl-facilitator-mainnet.t54.ai'," },
    { t: "}));" },
  ],
  Agent: [
    { t: "import { x402Fetch } from 'x402-xrpl';" },
    { t: "const pay = x402Fetch({ wallet, network: 'xrpl:0' });" },
    { t: "const res = await pay('https://api.you.xyz/ai-news');" },
    { t: "→ 402 · xrpl · pay in RLUSD", c: "mut" },
    { t: "✓ settled · r…8f2 · 4.2s", c: "ok" },
  ],
  "Verifiable Intent": [
    { t: "// L1 Trustline cred → L2 owner delegation → L3 agent sig", c: "mut" },
    { t: "const provider = new RemoteIssuerProvider({" },
    { t: "  issueRequest: { allowedChains: ['xrpl'], allowedAssets: ['RLUSD']," },
    { t: "    spendingCeiling: '250', validitySeconds: 3600 }, ..." },
    { t: "});" },
    { t: "x402Fetch({ wallet, verifiableIntentProvider: provider });" },
  ],
};

function lineColor(c?: Line["c"]) {
  if (c === "cmd") return "var(--brand-blue)";
  if (c === "ok") return "var(--brand-blue)";
  if (c === "mut") return "var(--paper-faint)";
  return "var(--text-secondary)";
}

export function BuildConsole() {
  const [tab, setTab] = useState<keyof typeof TABS>("Server");
  const reduce = useReducedMotion();

  return (
    <div className="space-y-6">
      {/* live x402 flow */}
      <div className="dashboard-panel bg-[var(--ink-surface)] border border-[var(--border)] p-5 sm:p-6">
        <div className="relative">
          <div className="absolute left-0 right-0 top-[7px] h-px bg-[var(--rule)]" />
          {!reduce ? (
            <motion.div
              className="absolute top-[3px] w-2 h-2 rounded-full"
              style={{ background: "var(--brand-blue)", filter: "blur(0.5px)" }}
              initial={{ left: "0%" }}
              animate={{ left: ["0%", "100%"] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            />
          ) : null}
          <div className="relative grid grid-cols-4">
            {STAGES.map((s, i) => (
              <div key={s} className="flex flex-col items-start">
                <span
                  className="w-3.5 h-3.5 rounded-full border-2"
                  style={{ borderColor: i === 0 ? "var(--t54-coral)" : "var(--brand-blue)", background: "var(--ink-surface)" }}
                />
                <span className="mt-3 text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--paper-mute)] leading-tight">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* tabs + code */}
      <div className="dashboard-panel bg-[var(--ink-surface)] border border-[var(--border)] overflow-hidden">
        <div className="flex items-center gap-1 px-3 pt-3 border-b border-[var(--border)]">
          {(Object.keys(TABS) as Array<keyof typeof TABS>).map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`px-3 py-2 text-[11px] font-mono uppercase tracking-[0.14em] transition-colors border-b-2 -mb-px ${
                tab === k
                  ? "text-[var(--paper)] border-[var(--brand-blue)]"
                  : "text-[var(--paper-mute)] border-transparent hover:text-[var(--paper)]"
              }`}
            >
              {k}
            </button>
          ))}
        </div>
        <pre className="p-5 text-[12.5px] font-mono leading-relaxed overflow-x-auto">
          {TABS[tab].map((l, i) => (
            <div key={i} style={{ color: lineColor(l.c) }}>{l.t}</div>
          ))}
        </pre>
      </div>
    </div>
  );
}
