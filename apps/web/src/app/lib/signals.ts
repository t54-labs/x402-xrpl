// Ecosystem Signals — XRPL/RLUSD × AI news + allow-list tweets.
//
// Every item is REAL and verified against its live source (headline, date and
// og:image fetched from the article itself) — seeded Jun 2026, refreshed Jul 2026. In
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
    id: "utoday-mastercard-verifiable-intent",
    kind: "news",
    source: "U.Today",
    headline: "Big Win for XRP Ledger as Mastercard Payment Standard Goes Live",
    shortTitle: "Mastercard standard live on XRPL",
    url: "https://u.today/big-win-for-xrp-ledger-as-mastercard-payment-standard-goes-live",
    image: "https://u.today/sites/default/files/styles/twitterwithoutlogo/public/2026-07/100801.jpg",
    tag: "Mastercard · verifiable intent",
    publishedAt: "2026-07-25",
  },
  {
    id: "finbold-1-4m-agentic",
    kind: "news",
    source: "Finbold",
    headline: "XRP Ledger surpasses 1.4 million in agentic transactions",
    shortTitle: "1.4M agentic transactions",
    url: "https://finbold.com/xrp-ledger-surpasses-1-4-million-in-agentic-transactions/",
    image: "https://assets.finbold.com/uploads/2026/07/XRP-Ledger-surpasses-1.4-million-in-agentic-transactions-scaled.webp",
    tag: "XRPL · milestone",
    publishedAt: "2026-07-22",
  },
  {
    id: "theblock-10m-agentic",
    kind: "news",
    source: "The Block",
    headline: "Ripple sees XRP Ledger agentic transactions hitting 10-million mark soon",
    shortTitle: "Ripple eyes 10M agentic txs",
    url: "https://www.theblock.co/post/408987/ripplex-sees-xrp-ledger-agentic-transactions-hitting-10-million-mark-soon",
    image: "https://www.tbstat.com/wp/uploads/2026/01/20260108_Ripple_News_3-1200x675.jpg",
    tag: "XRPL · agentic growth",
    publishedAt: "2026-07-21",
  },
  {
    id: "coindesk-x402-foundation",
    kind: "news",
    source: "CoinDesk",
    headline: "AI agentic payments enter mainstream as Visa, Mastercard, Ripple back x402 standard",
    shortTitle: "Visa, Mastercard & Ripple back x402",
    url: "https://www.coindesk.com/tech/2026/07/15/visa-mastercard-and-ripple-join-the-standard-letting-ai-agents-pay-in-stablecoins",
    image: "https://cdn.sanity.io/images/s3y3vcno/production/46755685f5e11aa30feec15f1afcf981d4ca73ad-4500x3001.jpg?auto=format&w=960&h=540&fit=crop&q=75&fm=jpg",
    tag: "x402 · standards",
    publishedAt: "2026-07-15",
  },
  {
    id: "linuxfoundation-x402-foundation",
    kind: "news",
    source: "Linux Foundation",
    verified: true,
    headline:
      "Linux Foundation Announces Operational Launch of x402 Foundation to Standardize Internet-Native Payments for AI Agents and Applications",
    shortTitle: "x402 Foundation goes live",
    url: "https://www.linuxfoundation.org/press/linux-foundation-announces-operational-launch-of-x402-foundation-to-standardize-internet-native-payments-for-ai-agents-and-applications",
    image:
      "https://www.linuxfoundation.org/hs-fs/hubfs/Press%20Release%20(18).png?width=911&height=477&name=Press%20Release%20(18).png",
    tag: "x402 · foundation",
    publishedAt: "2026-07-14",
  },
  {
    id: "cryptonews-hub-launch-1m",
    kind: "news",
    source: "crypto.news",
    headline: "XRP Ledger hits 1M AI payments as Ripple-backed t54.ai launches hub",
    shortTitle: "1M AI payments, hub launches",
    url: "https://crypto.news/xrp-ledger-hits-1m-ai-payments-as-t54-ai-launches-hub/",
    image: "https://media.crypto.news/2026/06/Xrp1-1380x776.webp",
    tag: "t54 · XRPL AI Hub",
    publishedAt: "2026-07-08",
  },
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
];
