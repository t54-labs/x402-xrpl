"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const STAGES = [
  { label: "Agent requests", note: "plain GET — no payment yet" },
  { label: "x402 · RLUSD / XRP", note: "402 PAYMENT-REQUIRED" },
  { label: "Facilitator verifies", note: "signature + intent + risk" },
  { label: "Settled · XRPL", note: "~4s · tx hash returned" },
];

// The end-to-end x402-on-XRPL flow as a live "settlement pulse": a glowing energy
// band sweeps the rail left→right and ignites each node in turn (coral request →
// blue verify → sealed), rippling as it lands — like settlements clearing in real
// time. Loops continuously; collapses to a static lit state for reduced motion.
export function X402Flow() {
  const reduce = useReducedMotion();
  const CYCLE = 3.2;
  // cycle fraction at which the sweep head reaches each node (≈ its column position)
  const tNode = [0.03, 0.22, 0.41, 0.6];
  return (
    <div className="dashboard-panel bg-[var(--ink-surface)] border border-[var(--border)] p-5 sm:p-7 overflow-hidden">
      <div className="relative">
        {/* rail — faint base + a persistent blue tint so the pipeline always reads as live */}
        <div className="absolute left-0 right-0 top-[7px] h-px bg-[var(--rule)]" />
        <div className="absolute left-0 right-0 top-[7px] h-px" style={{ background: "linear-gradient(90deg, transparent, var(--blue-16) 8%, var(--blue-16) 92%, transparent)" }} />

        {/* sweeping energy band + comet head */}
        {!reduce && (
          <motion.div
            className="absolute top-[7px] h-px w-[26%] -translate-y-1/2 pointer-events-none"
            initial={{ left: "-26%" }}
            animate={{ left: ["-26%", "100%"] }}
            transition={{ duration: CYCLE, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, transparent, var(--blue-28) 55%, var(--brand-blue))" }} />
            <span
              className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--brand-blue)", filter: "drop-shadow(0 0 5px var(--brand-blue)) drop-shadow(0 0 2px var(--brand-blue))" }}
            />
          </motion.div>
        )}

        {/* nodes */}
        <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-y-6">
          {STAGES.map((s, i) => {
            const sealed = i === STAGES.length - 1;
            const color = i === 0 ? "var(--t54-coral)" : "var(--brand-blue)";
            const delay = tNode[i] * CYCLE;
            return (
              <div key={s.label} className="relative flex flex-col items-start pr-3">
                <span className="relative block w-3.5 h-3.5">
                  {/* ripple ring when the sweep lands */}
                  {!reduce && (
                    <motion.span
                      className="absolute inset-0 rounded-full border"
                      style={{ borderColor: color }}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: [0.5, 2.6], opacity: [0.7, 0] }}
                      transition={{ duration: 1.0, repeat: Infinity, repeatDelay: CYCLE - 1.0, delay, ease: "easeOut" }}
                    />
                  )}
                  {/* node ring (pops on ignition) */}
                  <motion.span
                    className="absolute inset-0 rounded-full border-2"
                    style={{ borderColor: color, background: "var(--ink-surface)" }}
                    animate={reduce ? undefined : { scale: [1, 1.4, 1] }}
                    transition={reduce ? undefined : { duration: 0.6, repeat: Infinity, repeatDelay: CYCLE - 0.6, delay, ease: "easeOut" }}
                  />
                  {/* ignition glow-fill (drop-shadow, not box-shadow) */}
                  {!reduce && (
                    <motion.span
                      className="absolute inset-[3px] rounded-full"
                      style={{ background: color, filter: `drop-shadow(0 0 ${sealed ? 8 : 5}px ${color})` }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: sealed ? [0, 1, 0.55, 0.55, 0] : [0, 1, 0] }}
                      transition={{ duration: sealed ? 1.3 : 0.7, repeat: Infinity, repeatDelay: CYCLE - (sealed ? 1.3 : 0.7), delay, ease: "easeOut" }}
                    />
                  )}
                </span>
                <span className="mt-3 text-[10px] font-plek uppercase tracking-[0.14em] text-[var(--paper)] leading-tight">{s.label}</span>
                <span className="mt-1 text-[11px] text-[var(--text-muted)] leading-snug">{s.note}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

type Line = { t: string; c?: "cmd" | "ok" | "mut" };
type Lang = "ts" | "py";
type TabKey = "Server" | "Agent" | "Verifiable Intent";

const CODE: Record<TabKey, Record<Lang, Line[]>> = {
  Server: {
    ts: [
      { t: "$ npm i x402-xrpl", c: "cmd" },
      { t: "import { requirePayment } from 'x402-xrpl/express';" },
      { t: "" },
      { t: "app.use(requirePayment({" },
      { t: "  path: '/ai-news'," },
      { t: "  price: '0.02', asset: 'RLUSD'," },
      { t: "  issuer: 'rMxCK...',        // RLUSD issuer", c: "mut" },
      { t: "  payToAddress: 'rYourMerchant...'," },
      { t: "  network: 'xrpl:0',         // mainnet", c: "mut" },
      { t: "  facilitatorUrl:" },
      { t: "    'https://xrpl-facilitator-mainnet.t54.ai'," },
      { t: "}));" },
      { t: "// unpaid GET → 402 PAYMENT-REQUIRED", c: "mut" },
    ],
    py: [
      { t: "$ pip install x402-xrpl", c: "cmd" },
      { t: "from x402_xrpl.server import require_payment" },
      { t: "" },
      { t: "app.middleware('http')(require_payment(" },
      { t: "    path='/ai-news'," },
      { t: "    price='0.02', asset='RLUSD'," },
      { t: "    issuer='rMxCK...',        # RLUSD issuer", c: "mut" },
      { t: "    pay_to_address='rYourMerchant...'," },
      { t: "    network='xrpl:0'," },
      { t: "    facilitator_url=" },
      { t: "      'https://xrpl-facilitator-mainnet.t54.ai'," },
      { t: "))" },
    ],
  },
  Agent: {
    ts: [
      { t: "import { Wallet } from 'xrpl';" },
      { t: "import { x402Fetch } from 'x402-xrpl';" },
      { t: "" },
      { t: "const pay = x402Fetch({" },
      { t: "  wallet: Wallet.fromSeed(seed), network: 'xrpl:0'," },
      { t: "});" },
      { t: "const res = await pay('https://api.you.xyz/ai-news');" },
      { t: "→ 402 · x402 · pay 0.02 RLUSD", c: "mut" },
      { t: "✓ signed Payment · settled r…8f2 · 4.2s", c: "ok" },
      { t: "const news = await res.json();" },
    ],
    py: [
      { t: "from xrpl.wallet import Wallet" },
      { t: "from x402_xrpl.clients import x402_requests" },
      { t: "" },
      { t: "s = x402_requests(" },
      { t: "    Wallet.from_seed(seed), network_filter='xrpl:0')" },
      { t: "res = s.get('https://api.you.xyz/ai-news')" },
      { t: "# → 402 · x402 · pay 0.02 RLUSD", c: "mut" },
      { t: "# ✓ settled · r…8f2 · 4.2s", c: "ok" },
      { t: "news = res.json()" },
    ],
  },
  "Verifiable Intent": {
    ts: [
      { t: "// L1 credential → L2 owner→agent delegation → L3 sig", c: "mut" },
      { t: "import { x402Fetch, RemoteIssuerProvider } from 'x402-xrpl';" },
      { t: "" },
      { t: "const provider = new RemoteIssuerProvider({" },
      { t: "  issueRequest: {" },
      { t: "    allowedChains: ['xrpl'], allowedAssets: ['XRP', 'RLUSD']," },
      { t: "    spendingCeiling: '250', validitySeconds: 3600," },
      { t: "  }," },
      { t: "  constraints: { per_transaction_max: '0.02' }," },
      { t: "});" },
      { t: "x402Fetch({ wallet, network: 'xrpl:0'," },
      { t: "  verifiableIntentProvider: provider });" },
      { t: "// facilitator checks the chain + risk BEFORE it settles", c: "ok" },
    ],
    py: [
      { t: "# L1 credential → L2 delegation → L3 agent signature", c: "mut" },
      { t: "from x402_xrpl.vi import RemoteIssuerProvider" },
      { t: "from x402_xrpl.clients import x402_requests" },
      { t: "" },
      { t: "provider = RemoteIssuerProvider(" },
      { t: "  issue_request={" },
      { t: "    'allowedChains': ['xrpl']," },
      { t: "    'allowedAssets': ['XRP', 'RLUSD']," },
      { t: "    'spendingCeiling': '250', 'validitySeconds': 3600," },
      { t: "  }," },
      { t: "  constraints={'per_transaction_max': '0.02'})" },
      { t: "x402_requests(wallet, verifiable_intent_provider=provider)" },
    ],
  },
};

function lineColor(c?: Line["c"]) {
  if (c === "cmd") return "var(--brand-blue)";
  if (c === "ok") return "var(--success)";
  if (c === "mut") return "var(--paper-faint)";
  return "var(--text-secondary)";
}

export function BuildConsole() {
  const [tab, setTab] = useState<TabKey>("Server");
  const [lang, setLang] = useState<Lang>("ts");
  const lines = CODE[tab][lang];

  return (
    <div className="dashboard-panel bg-[var(--ink-surface)] border border-[var(--border)] overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-3 pt-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-1">
          {(Object.keys(CODE) as TabKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`px-3 py-2 text-[11px] font-plek uppercase tracking-[0.14em] transition-colors border-b-2 -mb-px ${
                tab === k ? "text-[var(--paper)] border-[var(--brand-blue)]" : "text-[var(--paper-mute)] border-transparent hover:text-[var(--paper)]"
              }`}
            >
              {k}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-0.5 pb-2 shrink-0">
          {(["ts", "py"] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-2 py-1 rounded text-[10px] font-plek uppercase tracking-[0.12em] transition-colors ${
                lang === l ? "text-[var(--paper)] bg-[rgba(0,140,255,0.1)]" : "text-[var(--paper-mute)] hover:text-[var(--paper)]"
              }`}
            >
              {l === "ts" ? "TS" : "PY"}
            </button>
          ))}
        </div>
      </div>
      <pre className="p-5 text-[12.5px] font-mono leading-relaxed overflow-x-auto min-h-[280px]">
        {lines.map((l, i) => (
          <div key={i} style={{ color: lineColor(l.c), minHeight: "1.2em" }}>{l.t}</div>
        ))}
      </pre>
    </div>
  );
}
