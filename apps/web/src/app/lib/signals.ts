// Ecosystem Signals — XRPL/RLUSD × AI news + allow-list tweets.
//
// v1 seed = REAL items gathered from the live web (Jun 2026). In phase 2 this is
// replaced by a cron pipeline (allow-list X accounts via a tweet API + publisher
// RSS → Claude relevance filter → Postgres); the Signal shape below is the
// contract that pipeline fills. The /api/signals route serves this list today.

export type Signal = {
  id: string;
  kind: "news" | "tweet";
  source: string; // publisher name, or @handle for tweets
  handle?: string; // X handle (tweets)
  verified?: boolean; // X verified / official source
  headline: string; // the real headline or (trimmed) tweet text
  url: string; // link to the original article / tweet
  tag: string; // short relevance tag, e.g. "RLUSD · agents"
  publishedAt: string; // ISO date
};

// Allow-list of X accounts whose AI-related posts we surface (phase-2 fetch).
export const SIGNAL_ACCOUNTS = ["Ripple", "RippleXDev", "XRPLF", "BankXRP", "xrpl_commons", "t54ai"] as const;

export const SIGNALS: Signal[] = [
  {
    id: "coindesk-agents-xrp-rlusd",
    kind: "news",
    source: "CoinDesk",
    headline: "Ripple wants AI agents to pay in XRP and RLUSD — the market is still mostly USDC",
    url: "https://www.coindesk.com/tech/2026/06/11/ripple-wants-ai-agents-to-pay-in-xrp-and-rlusd-the-market-is-still-mostly-usdc",
    tag: "RLUSD · agents",
    publishedAt: "2026-06-13",
  },
  {
    id: "cryptoslate-machine-economy",
    kind: "news",
    source: "CryptoSlate",
    headline: "Ripple chases AI's machine economy as XRPL stablecoins near $1 billion",
    url: "https://cryptoslate.com/ripple-chases-ais-machine-economy-as-xrpl-stablecoins-near-1-billion/",
    tag: "RLUSD · machine economy",
    publishedAt: "2026-06-12",
  },
  {
    id: "americanbanker-crowded",
    kind: "news",
    source: "American Banker",
    headline: "Ripple makes its play as agentic payments get crowded",
    url: "https://www.americanbanker.com/payments/news/ripple-launches-agentic-payment-tech-toolkit",
    tag: "RLUSD · agentic commerce",
    publishedAt: "2026-06-11",
  },
  {
    id: "ripple-insights-starter-kit",
    kind: "news",
    source: "Ripple Insights",
    verified: true,
    headline: "Building the future of agentic payments: introducing the XRP Ledger AI Starter Kit",
    url: "https://ripple.com/insights/xrpl-ai-starter-kit/",
    tag: "XRPL · RLUSD · agents",
    publishedAt: "2026-06-10",
  },
  {
    id: "ripple-tweet-trust",
    kind: "tweet",
    source: "@Ripple",
    handle: "Ripple",
    verified: true,
    headline:
      "As AI agents begin transacting on behalf of businesses, payments need more than speed — they need trust, controls, and clear rules. We're building the rails with the XRP Ledger and RLUSD.",
    url: "https://x.com/Ripple/status/2064705883972780321",
    tag: "RLUSD · trust",
    publishedAt: "2026-06-10",
  },
  {
    id: "theblock-toolkit",
    kind: "news",
    source: "The Block",
    headline: "Ripple launches toolkit for agentic payments on XRPL",
    url: "https://www.theblock.co/post/404243/ripple-launches-toolkit-for-agentic-payments-on-xrpl",
    tag: "XRPL · x402",
    publishedAt: "2026-06-10",
  },
  {
    id: "defiant-mastercard-partner",
    kind: "news",
    source: "The Defiant",
    headline: "Ripple deploys XRPL AI Starter Kit as Mastercard names it an agentic-commerce partner",
    url: "https://thedefiant.io/converge/tradfi-and-fintech/ripple-xrpl-ai-starter-kit-mastercard-agent-pay-machines",
    tag: "Mastercard · XRPL",
    publishedAt: "2026-06-10",
  },
  {
    id: "xrplorg-agentic-tx",
    kind: "news",
    source: "xrpl.org",
    verified: true,
    headline: "Agentic transactions on the XRP Ledger — autonomous blockchain payments and financial automation",
    url: "https://xrpl.org/docs/agents/agentic-transactions",
    tag: "XRPL · agents",
    publishedAt: "2026-06-10",
  },
  {
    id: "pymnts-starter-kit",
    kind: "news",
    source: "PYMNTS",
    headline: "Ripple targets the agentic payments market with an XRPL starter kit",
    url: "https://www.pymnts.com/blockchain/2026/ripple-targets-agentic-payments-market-with-xrpl-starter-kit/",
    tag: "XRPL · agentic payments",
    publishedAt: "2026-06-10",
  },
  {
    id: "xrplcommons-tweet",
    kind: "tweet",
    source: "@xrpl_commons",
    handle: "xrpl_commons",
    verified: true,
    headline: "A project you should have a look at — XRPL × x402: enabling agentic finance on the XRP Ledger.",
    url: "https://x.com/xrpl_commons/status/2016179549734592902",
    tag: "XRPL · x402",
    publishedAt: "2026-05-28",
  },
  {
    id: "theblock-t54-seed",
    kind: "news",
    source: "The Block",
    headline: "Ripple, Franklin Templeton join $5 million seed round for AI-agent trust startup t54 Labs",
    url: "https://www.theblock.co/post/391273/ripple-franklin-templeton-ai-agent-trust-startup-t54-labs",
    tag: "t54 · agentic finance",
    publishedAt: "2026-05-20",
  },
  {
    id: "bankxrp-tweet",
    kind: "tweet",
    source: "@BankXRP",
    handle: "BankXRP",
    headline:
      "Huge for XRP — @RippleXDev amplified @t54ai's trust layer on the XRP Ledger: autonomous AI agents can pay and trade on their own, with built-in fraud checks and safety controls.",
    url: "https://x.com/BankXRP/status/2011810271132529056",
    tag: "XRP · agents",
    publishedAt: "2026-05-16",
  },
  {
    id: "t54ai-tweet-x402secure",
    kind: "tweet",
    source: "@t54ai",
    handle: "t54ai",
    verified: true,
    headline:
      "Introducing x402 Secure — the essential trust layer for agentic payments. It augments x402 with programmable trust and verifiability, so your agent payments stay safe.",
    url: "https://x.com/t54ai/status/1982809581962052083",
    tag: "x402 · trust",
    publishedAt: "2026-04-25",
  },
];
