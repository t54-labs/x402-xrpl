"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const STAGES = [
  { label: "Agent requests", note: "plain GET — no payment yet" },
  { label: "x402 · RLUSD / XRP", note: "402 PAYMENT-REQUIRED" },
  { label: "Facilitator verifies", note: "signature + intent + risk" },
  { label: "Settled · XRPL", note: "~4s · tx hash returned" },
];

// The end-to-end x402-on-XRPL flow, as a static instrument with one travelling pulse.
export function X402Flow() {
  const reduce = useReducedMotion();
  return (
    <div className="dashboard-panel bg-[var(--ink-surface)] border border-[var(--border)] p-5 sm:p-7">
      <div className="relative">
        <div className="absolute left-0 right-0 top-[7px] h-px bg-[var(--rule)]" />
        {!reduce ? (
          <motion.div
            className="absolute top-[3px] w-2 h-2 rounded-full"
            style={{ background: "var(--brand-blue)", filter: "blur(0.5px)" }}
            initial={{ left: "0%" }}
            animate={{ left: ["0%", "100%"] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
          />
        ) : null}
        <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-y-6">
          {STAGES.map((s, i) => (
            <div key={s.label} className="flex flex-col items-start pr-3">
              <span
                className="w-3.5 h-3.5 rounded-full border-2"
                style={{ borderColor: i === 0 ? "var(--t54-coral)" : "var(--brand-blue)", background: "var(--ink-surface)" }}
              />
              <span className="mt-3 text-[10px] font-plek uppercase tracking-[0.14em] text-[var(--paper)] leading-tight">{s.label}</span>
              <span className="mt-1 text-[11px] text-[var(--text-muted)] leading-snug">{s.note}</span>
            </div>
          ))}
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
      { t: "    allowedChains: ['xrpl'], allowedAssets: ['RLUSD']," },
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
      { t: "    'allowedAssets': ['RLUSD']," },
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
