// Ecosystem Signals — XRPL/RLUSD × AI news + allow-list tweets.
//
// v1 seed = REAL items gathered from the live web (Jun 2026): real headlines,
// real source URLs, and real og:image posters scraped from the articles. In
// phase 2 this is replaced by a cron pipeline (allow-list tweet API + publisher
// RSS → Claude relevance filter + short-title + poster → Postgres); the Signal
// shape below is the contract that pipeline fills. /api/signals serves this list.

export type Signal = {
  id: string;
  kind: "news" | "tweet";
  source: string; // publisher name, or @handle for tweets
  handle?: string; // X handle (tweets)
  verified?: boolean; // X verified / official source
  headline: string; // the real headline or (trimmed) tweet text
  shortTitle: string; // a punchy extracted title for the poster card overlay
  url: string; // link to the original article / tweet
  image?: string; // poster image (og:image); falls back to a branded bg when absent
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
    shortTitle: "Agents to pay in XRP & RLUSD",
    url: "https://www.coindesk.com/tech/2026/06/11/ripple-wants-ai-agents-to-pay-in-xrp-and-rlusd-the-market-is-still-mostly-usdc",
    image: "https://cdn.sanity.io/images/s3y3vcno/production/3fdb04bd3eb1c1413ad0d70e8d1e464ee4866ad9-1500x1000.jpg?auto=format&w=960&h=540&crop=focalpoint&fit=clip&q=75&fm=jpg",
    tag: "RLUSD · agents",
    publishedAt: "2026-06-13",
  },
  {
    id: "cryptoslate-machine-economy",
    kind: "news",
    source: "CryptoSlate",
    headline: "Ripple chases AI's machine economy as XRPL stablecoins near $1 billion",
    shortTitle: "XRPL stablecoins near $1B",
    url: "https://cryptoslate.com/ripple-chases-ais-machine-economy-as-xrpl-stablecoins-near-1-billion/",
    image: "https://cryptoslate.com/wp-content/uploads/2026/06/xrp-ai-agent.jpg",
    tag: "RLUSD · machine economy",
    publishedAt: "2026-06-12",
  },
  {
    id: "americanbanker-crowded",
    kind: "news",
    source: "American Banker",
    headline: "Ripple makes its play as agentic payments get crowded",
    shortTitle: "Ripple's agentic payments play",
    url: "https://www.americanbanker.com/payments/news/ripple-launches-agentic-payment-tech-toolkit",
    image: "https://arizent.brightspotcdn.com/dims4/default/a053796/2147483647/strip/true/crop/4000x2100+0+284/resize/1200x630!/quality/90/?url=https%3A%2F%2Fsource-media-brightspot.s3.us-east-1.amazonaws.com%2Fac%2F64%2Facfd4d194ab689aa404013d9bc20%2F330681362-1-4.jpg",
    tag: "RLUSD · agentic commerce",
    publishedAt: "2026-06-11",
  },
  {
    id: "ripple-insights-starter-kit",
    kind: "news",
    source: "Ripple Insights",
    verified: true,
    headline: "Building the future of agentic payments: introducing the XRP Ledger AI Starter Kit",
    shortTitle: "XRP Ledger AI Starter Kit",
    url: "https://ripple.com/insights/xrpl-ai-starter-kit/",
    image: "https://cdn.sanity.io/images/ior4a5y3/production/d014e4bdc5333e4121b3aca442259c0936c4f327-2304x1296.png",
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
    shortTitle: "Agent payments need trust",
    url: "https://x.com/Ripple/status/2064705883972780321",
    tag: "RLUSD · trust",
    publishedAt: "2026-06-10",
  },
  {
    id: "theblock-toolkit",
    kind: "news",
    source: "The Block",
    headline: "Ripple launches toolkit for agentic payments on XRPL",
    shortTitle: "Agentic payments on XRPL",
    url: "https://www.theblock.co/post/404243/ripple-launches-toolkit-for-agentic-payments-on-xrpl",
    image: "https://www.tbstat.com/wp/uploads/2026/01/20260108_Ripple_News-1200x675.jpg",
    tag: "XRPL · x402",
    publishedAt: "2026-06-10",
  },
  {
    id: "defiant-mastercard-partner",
    kind: "news",
    source: "The Defiant",
    headline: "Ripple deploys XRPL AI Starter Kit as Mastercard names it an agentic-commerce partner",
    shortTitle: "Mastercard names Ripple a partner",
    url: "https://thedefiant.io/converge/tradfi-and-fintech/ripple-xrpl-ai-starter-kit-mastercard-agent-pay-machines",
    image: "https://cdn.sanity.io/images/6oftkxoa/production/9f21c93fd731b1414565228b97a7f864ae0dde8f-2048x1152.png",
    tag: "Mastercard · XRPL",
    publishedAt: "2026-06-10",
  },
  {
    id: "pymnts-starter-kit",
    kind: "news",
    source: "PYMNTS",
    headline: "Ripple targets the agentic payments market with an XRPL starter kit",
    shortTitle: "Ripple's XRPL starter kit",
    url: "https://www.pymnts.com/blockchain/2026/ripple-targets-agentic-payments-market-with-xrpl-starter-kit/",
    image: "https://www.pymnts.com/wp-content/uploads/2023/07/ripple-xrp.jpg",
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
    shortTitle: "XRPL × x402 = agentic finance",
    url: "https://x.com/xrpl_commons/status/2016179549734592902",
    tag: "XRPL · x402",
    publishedAt: "2026-01-27",
  },
  {
    id: "theblock-t54-seed",
    kind: "news",
    source: "The Block",
    headline: "Ripple, Franklin Templeton join $5 million seed round for AI-agent trust startup t54 Labs",
    shortTitle: "t54 raises $5M for agent trust",
    url: "https://www.theblock.co/post/391273/ripple-franklin-templeton-ai-agent-trust-startup-t54-labs",
    image: "https://www.tbstat.com/wp/uploads/2022/06/20220603_Funding-Roundup-1200x675.jpg",
    tag: "t54 · agentic finance",
    publishedAt: "2026-02-25",
  },
  {
    id: "bankxrp-tweet",
    kind: "tweet",
    source: "@BankXRP",
    handle: "BankXRP",
    headline:
      "Huge for XRP — @RippleXDev amplified @t54ai's trust layer on the XRP Ledger: autonomous AI agents can pay and trade on their own, with built-in fraud checks and safety controls.",
    shortTitle: "A trust layer on the XRP Ledger",
    url: "https://x.com/BankXRP/status/2011810271132529056",
    tag: "XRP · agents",
    publishedAt: "2026-01-15",
  },
  {
    id: "t54ai-tweet-x402secure",
    kind: "tweet",
    source: "@t54ai",
    handle: "t54ai",
    verified: true,
    headline:
      "Introducing x402 Secure — the essential trust layer for agentic payments. It augments x402 with programmable trust and verifiability, so your agent payments stay safe.",
    shortTitle: "x402 Secure: the trust layer",
    url: "https://x.com/t54ai/status/1982809581962052083",
    tag: "x402 · trust",
    publishedAt: "2025-10-27",
  },
];
