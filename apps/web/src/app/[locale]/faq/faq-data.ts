// Engineering FAQ content. Every answer is grounded in the shipped code/docs of the
// t54 stack (x402-xrpl SDKs, hosted facilitator, x402 Secure, RLUSD CLI/Skills) and
// the hub's own indexer/API — keep claims consistent with those sources when editing.

export type FaqBlock =
  | { kind: "p"; text: string }
  | { kind: "code"; lang?: string; body: string };

export type FaqLink = { label: string; href: string };

export type FaqItem = {
  id: string;
  q: string;
  a: FaqBlock[];
  links?: FaqLink[];
  keywords?: string[];
};

export type FaqCategory = {
  id: string;
  title: string;
  blurb: string;
  items: FaqItem[];
};

const p = (text: string): FaqBlock => ({ kind: "p", text });
const code = (body: string, lang?: string): FaqBlock => ({ kind: "code", body, lang });

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: "protocol",
    title: "Protocol & architecture",
    blurb: "What x402 on XRPL actually is, and what an agent payment looks like on the wire and on the ledger.",
    items: [
      {
        id: "what-is-x402-xrpl",
        q: "What is x402, and how does it work on XRPL?",
        a: [
          p(
            "x402 turns HTTP status 402 into a real payment handshake: a server answers a request with a price, the client pays, and the request succeeds on retry. On EVM chains this rides on smart contracts; on XRPL there are no contracts to call — payments are native `Payment` transactions, so the XRPL scheme uses a **presigned transaction blob** instead.",
          ),
          p(
            "The full flow: (1) the agent requests your endpoint; (2) your server responds `402` with a `PAYMENT-REQUIRED` header carrying the requirements (scheme, network, asset, amount, `payTo`, a one-time `invoiceId`); (3) the agent signs an XRPL `Payment` binding that invoice and retries with a `PAYMENT-SIGNATURE` header; (4) your server forwards the signed blob to a facilitator, which verifies it and submits it to XRPL; (5) once validated, your server returns the resource plus a `PAYMENT-RESPONSE` header with the settled transaction hash.",
          ),
        ],
        links: [
          { label: "How it works, step by step", href: "/build" },
          { label: "XRPL scheme spec", href: "https://xrpl-x402.t54.ai/docs/xrpl-scheme" },
          { label: "x402 protocol", href: "https://github.com/coinbase/x402" },
        ],
        keywords: ["402", "http", "handshake", "payment required", "overview", "basics"],
      },
      {
        id: "wire-format",
        q: "What exactly goes over the wire — headers, payloads, versions?",
        a: [
          p(
            "Three messages, all base64-encoded canonical JSON. The 402 response body (mirrored in the `PAYMENT-REQUIRED` header) is an x402 **v2** `PaymentRequired`: `{ x402Version: 2, resource, accepts: [PaymentRequirements], extensions }`. The retry carries `PAYMENT-SIGNATURE` = base64 of a v2 `PaymentPayload` — `{ x402Version: 2, accepted, payload: { signedTxBlob, invoiceId }, extensions }`. The success response carries `PAYMENT-RESPONSE` = base64 of `{ success, transaction, network, payer }`.",
          ),
          p(
            "Each `PaymentRequirements` entry is `{ scheme: \"exact\", network: \"xrpl:0|1|2\", payTo, asset, amount, maxTimeoutSeconds, extra }` — `extra` carries the `invoiceId` and, for issued assets, the `issuer`. The SDKs export encode/decode helpers for every header so you never hand-roll the JSON.",
          ),
        ],
        keywords: ["headers", "payment-required", "payment-signature", "payment-response", "schema", "v2", "wire"],
      },
      {
        id: "onchain-footprint",
        q: "What does an x402 payment look like on-chain?",
        a: [
          p("It settles as a completely standard XRPL `Payment` — inspectable in any explorer:"),
          code(
            `TransactionType  "Payment"
Account          buyer (the agent's address)
Destination      payTo (the merchant's address)
Amount           drops for XRP · { currency, issuer, value } for RLUSD/IOUs
SourceTag        the facilitator's tag (t54 hosted: 804681468)
InvoiceID        SHA-256 of the invoiceId          ┐ replay
Memos[0]         hex-encoded invoiceId             ┘ protection
LastLedgerSequence  bounds how long the blob stays valid`,
          ),
          p(
            "The `SourceTag` is the on-chain fingerprint that lets anyone — including this hub's indexer — attribute a payment to the facilitator that settled it. No wrapped tokens, no contract events, no off-chain settlement layer.",
          ),
        ],
        links: [{ label: "XRPL Payment reference", href: "https://xrpl.org/docs/references/protocol/transactions/types/payment" }],
        keywords: ["sourcetag", "invoiceid", "memos", "transaction", "explorer", "on-chain"],
      },
      {
        id: "why-presigned",
        q: "Why presigned transactions? Why does a facilitator exist at all?",
        a: [
          p(
            "Presigning keeps the trust model minimal: the payer signs a fully-formed `Payment` locally and hands over only the **signed blob**. The facilitator can submit it or drop it — it cannot alter the amount, destination, fee, or anything else without breaking the signature. Keys never leave the signer; nobody takes custody at any point.",
          ),
          p(
            "The facilitator exists so every resource server doesn't have to run XRPL infrastructure: it decodes the blob, checks the scheme's invariants (amount matches the invoice, invoice binding present, fee under the cap, correct network), submits to XRPL, and waits for validation. Merchants get a two-endpoint contract — `/verify` and `/settle` — instead of running ledger nodes and retry logic.",
          ),
        ],
        keywords: ["presigned", "custody", "trust model", "facilitator", "architecture", "keys"],
      },
      {
        id: "networks-assets",
        q: "Which networks and assets are supported?",
        a: [
          p(
            "Networks use CAIP-2 identifiers: `xrpl:0` (mainnet), `xrpl:1` (testnet), `xrpl:2` (devnet). t54 operates hosted facilitators for mainnet (`xrpl-facilitator-mainnet.t54.ai`) and testnet (`xrpl-facilitator-testnet.t54.ai`); testnet has a public faucet, so end-to-end integration testing costs nothing.",
          ),
          p(
            "Assets: **XRP**, priced in drops (`\"1000000\"` = 1 XRP), and any **issued token (IOU)** — including RLUSD — priced as a decimal value string plus the issuer address. A requirement pins one asset; a server can advertise several options in `accepts[]` (e.g. XRP and RLUSD) and let the payer pick.",
          ),
        ],
        keywords: ["mainnet", "testnet", "devnet", "caip-2", "xrp", "rlusd", "iou", "assets", "networks"],
      },
      {
        id: "replay-protection",
        q: "How are replay and double-spend prevented?",
        a: [
          p(
            "Three independent layers. **Invoice binding**: every payment must embed the one-time `invoiceId` — as hex in `Memos`, as a SHA-256 hash in `InvoiceID`, or both (the SDK default is both); the facilitator rejects a blob whose binding doesn't match the invoice being paid. **Single-use invoices**: the server middleware consumes the invoice after a successful settle, so the same signed blob can't buy the resource twice. **Ledger-level**: an XRPL transaction has one sequence number and a `LastLedgerSequence` — once validated (or expired) it can never execute again.",
          ),
          p(
            "On top of that, `/settle` is idempotent: retrying the same settle request returns the cached result instead of double-submitting, and a concurrent duplicate gets an HTTP 409 while the first attempt is in flight.",
          ),
        ],
        keywords: ["replay", "double spend", "idempotent", "invoice", "security"],
      },
      {
        id: "is-it-standard",
        q: "Is this compatible with the broader x402 ecosystem, or an XRPL fork?",
        a: [
          p(
            "It's the x402 v2 protocol with an XRPL-specific scheme. The HTTP handshake, header names, `PaymentRequired` / `PaymentPayload` / `SettlementResponse` shapes, and the facilitator's `/verify` · `/settle` · `/supported` contract follow the x402 spec; what's XRPL-specific is the `exact` scheme's payload — a presigned native `Payment` blob instead of an EVM `transferWithAuthorization`. A client that already speaks x402 needs only the XRPL scheme module, not a new protocol.",
          ),
          p(
            "The scheme is publicly documented and versioned at the facilitator docs site, and the hub publishes an x402-format discovery feed of live XRPL endpoints, so multi-chain x402 tooling can list them alongside EVM services.",
          ),
        ],
        links: [
          { label: "XRPL scheme spec", href: "https://xrpl-x402.t54.ai/docs/xrpl-scheme" },
          { label: "x402 spec (Coinbase)", href: "https://github.com/coinbase/x402" },
        ],
        keywords: ["standard", "compatible", "coinbase", "spec", "interop", "fork"],
      },
    ],
  },
  {
    id: "integration",
    title: "Integrating: SDKs & code",
    blurb: "Charging for an endpoint and paying as an agent, in TypeScript or Python — plus what to do on any other stack.",
    items: [
      {
        id: "sdks",
        q: "What SDKs exist, and what do they ship?",
        a: [
          p(
            "One SDK, two languages, same ergonomics. **TypeScript** — `npm i x402-xrpl` (Node 18+, MIT, ESM + CJS): Express `requirePayment` middleware, the `x402Fetch` buyer client, currency helpers, header codecs, and the Verifiable Intent chain builders. **Python** — `pip install x402-xrpl` (Python 3.11+, import as `x402_xrpl`): FastAPI/Starlette `require_payment` middleware, a `requests`-session buyer client, and a one-shot `x402_purchase` helper.",
          ),
          p(
            "Both sides of the protocol are covered: gate a route as a merchant, or pay a 402 as an agent — each in a few lines.",
          ),
        ],
        links: [
          { label: "npm: x402-xrpl", href: "https://www.npmjs.com/package/x402-xrpl" },
          { label: "PyPI: x402-xrpl", href: "https://pypi.org/project/x402-xrpl/" },
        ],
        keywords: ["sdk", "typescript", "python", "npm", "pypi", "install", "packages"],
      },
      {
        id: "charge-for-api",
        q: "How do I charge for an API route?",
        a: [
          p(
            "Wrap the route with the middleware, set a price and your payout address, and point it at a facilitator. Unpaid requests get a 402 automatically; your handler only runs after payment has settled, with the settlement details available on the request context.",
          ),
          code(
            `import { requirePayment } from "x402-xrpl/express";

app.use(requirePayment({
  path: "/ai-news",
  price: "1000",                       // XRP drops; IOUs use a value string like "1.25"
  payToAddress: "rYourAddress...",
  network: "xrpl:0",
  asset: "XRP",
  facilitatorUrl: "https://xrpl-facilitator-mainnet.t54.ai",
}));`,
            "ts",
          ),
          p(
            "Python mirrors this: `require_payment(path=..., price=..., pay_to_address=..., facilitator_url=...)` registered as FastAPI/Starlette HTTP middleware. Useful knobs on both: multiple payment options per route (e.g. XRP **and** RLUSD), invoice TTL (default 900s), `settle: false` for verify-only mode, and a pluggable invoice store (use Redis/DB in production instead of the in-memory default).",
          ),
        ],
        keywords: ["server", "merchant", "middleware", "express", "fastapi", "requirepayment", "charge", "sell"],
      },
      {
        id: "pay-as-agent",
        q: "How does an agent pay a 402?",
        a: [
          p(
            "Give the buyer client a wallet and call the URL like `fetch`. On a 402 it parses `accepts[]`, picks a requirement that passes your filters, signs the `Payment` locally, and retries once — the whole exchange in one await. The client never talks to the facilitator; it only needs XRPL WebSocket access for account info.",
          ),
          code(
            `import { x402Fetch } from "x402-xrpl";
import { Wallet } from "xrpl";

const fetchPaid = x402Fetch({
  wallet: Wallet.fromSeed(process.env.XRPL_SEED!),
  network: "xrpl:0",
  maxValue: "1000000",   // refuse anything above 1 XRP
});
const res = await fetchPaid("https://api.example.com/ai-news");`,
            "ts",
          ),
          p(
            "Guard rails are built in: `maxValue` caps spend per call, `networkFilter`/`schemeFilter` constrain what it will accept, and `confirmationMode` can require human confirmation before signing. In Python, `x402_requests(wallet, ...)` returns a drop-in `requests` session with the same behavior.",
          ),
        ],
        keywords: ["client", "buyer", "agent", "x402fetch", "pay", "fetch", "wallet"],
      },
      {
        id: "rlusd-charge",
        q: "How do I price a route in RLUSD specifically?",
        a: [
          p(
            "RLUSD is an issued token, so a requirement needs three things: the **40-hex currency code** (`524C555344000000000000000000000000000000` — \"RLUSD\" is 5 characters, over XRPL's 3-character limit for plain codes), the **issuer address**, and the **price as a decimal value string** (e.g. `\"1.25\"`). The SDK converts display symbols for you:",
          ),
          code(
            `import { resolveCurrencyCode } from "x402-xrpl";

const asset = resolveCurrencyCode("RLUSD", { allowUtf8Symbol: true });
// → "524C555344000000000000000000000000000000"

app.use(requirePayment({
  path: "/report", price: "1.25", asset,
  issuer: "rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De",   // RLUSD mainnet issuer
  payToAddress: "rYourAddress...", network: "xrpl:0",
  facilitatorUrl: "https://xrpl-facilitator-mainnet.t54.ai",
}));`,
            "ts",
          ),
          p(
            "Amounts must match exactly at verification (decimal-equal for IOUs, integer drops for XRP) — no rounding surprises. Remember the payer needs a trust line to the issuer before it can hold or send RLUSD (see the wallets section).",
          ),
        ],
        keywords: ["rlusd", "iou", "issuer", "currency code", "40-hex", "stablecoin", "price"],
      },
      {
        id: "testnet-story",
        q: "What's the testnet / local development story?",
        a: [
          p(
            "Full parity with production. Point everything at `xrpl:1` and the hosted testnet facilitator (`xrpl-facilitator-testnet.t54.ai`), fund wallets from the public XRPL testnet faucet, and run the identical code you'll ship to mainnet — the SDK defaults its network to `xrpl:1` precisely so nothing accidentally spends real funds during development.",
          ),
          p(
            "The hosted testnet facilitator is the development environment — there's nothing to install or operate, and the whole loop (402, signing, `/verify`, `/settle`) runs against it from your machine. For RLUSD-like flows on testnet you mint your own test IOU from a throwaway issuer — the facilitator docs show the pattern — which also lets QA exercise trust-line edge cases realistically.",
          ),
        ],
        links: [{ label: "Facilitator docs", href: "https://xrpl-x402.t54.ai/docs/overview" }],
        keywords: ["testnet", "faucet", "local", "development", "sandbox", "qa", "devnet"],
      },
      {
        id: "other-stacks",
        q: "We're not on Express or FastAPI — Kotlin, Swift, Go, Rust, Java?",
        a: [
          p(
            "The protocol is plain HTTP plus a documented scheme, so nothing requires our SDKs. On the server you need to: return a 402 with a `PAYMENT-REQUIRED` header, then relay the incoming `PAYMENT-SIGNATURE` payload to the facilitator's `/verify` and `/settle` JSON endpoints — two POST calls. On the client you need to: parse `accepts[]`, build and sign a standard XRPL `Payment` with the invoice binding (every major language has an XRPL library — xrpl.js, xrpl-py, xrpl4j, and community Swift/Go/Rust clients), and retry with the header.",
          ),
          p(
            "The XRPL Exact Scheme spec documents every field and invariant, and the TypeScript/Python sources are the reference implementations to check behavior against. If you're building a native mobile wallet integration and hit a gap in the spec, tell us — we treat that as a spec bug.",
          ),
        ],
        links: [
          { label: "XRPL scheme spec", href: "https://xrpl-x402.t54.ai/docs/xrpl-scheme" },
          { label: "Ask engineering", href: "mailto:support@t54.ai" },
        ],
        keywords: ["kotlin", "swift", "go", "rust", "java", "mobile", "native", "framework", "other languages"],
      },
    ],
  },
  {
    id: "wallets",
    title: "Wallets, keys & custody",
    blurb: "The questions wallet teams ask first: who holds what, what the user sees, and the XRPL-specific mechanics.",
    items: [
      {
        id: "custody",
        q: "Who holds keys or funds at any point in the flow?",
        a: [
          p(
            "Only the payer. The signing key stays in the wallet or agent runtime — the SDK signs locally and transmits a **signed blob**, which is submit-or-drop: the facilitator physically cannot change the destination, amount, or fee without invalidating the signature. Funds move in a single atomic ledger transaction from buyer to merchant; there is no escrow account, no pooled balance, no facilitator wallet in the middle, and no API key that could leak.",
          ),
          p(
            "This is why the stack is non-custodial by construction rather than by policy: at no step does any t54 system have the ability to move user funds on its own.",
          ),
        ],
        keywords: ["custody", "keys", "non-custodial", "funds", "trust", "signing"],
      },
      {
        id: "wallet-402-ux",
        q: "We build a wallet. What should we render when we intercept a 402?",
        a: [
          p(
            "Decode the `PAYMENT-REQUIRED` header (base64 → JSON) and you have everything a confirmation screen needs, per option in `accepts[]`: `amount` + `asset` (+ `issuer` for IOUs), the `payTo` destination, the `network`, `maxTimeoutSeconds`, and the resource's URL and description. If multiple options are offered (XRP and RLUSD, say), that's a user choice or a wallet policy — the payload is explicitly designed to be rendered, not blindly signed.",
          ),
          p(
            "After settlement, surface the transaction hash from `PAYMENT-RESPONSE` — it links straight to any XRPL explorer, which is a genuinely better receipt than most payment rails can offer. For display, the SDK ships `displayCurrencyCode` and friends to turn 40-hex codes back into human-readable symbols.",
          ),
        ],
        keywords: ["wallet", "ux", "confirmation", "screen", "render", "display", "receipt"],
      },
      {
        id: "trust-lines",
        q: "How do trust lines and reserves work for RLUSD payers?",
        a: [
          p(
            "Before an account can hold or send RLUSD it needs a **trust line** to the RLUSD issuer — a one-time `TrustSet` transaction that ties up a small owner reserve (currently 0.2 XRP) while it exists. For a wallet, the right UX is a preflight: check the trust line when the user first encounters an RLUSD requirement, and offer the one-tap setup before the payment rather than failing mid-flow.",
          ),
          p(
            "Tooling exists for exactly this: the RLUSD CLI ships `rlusd xrpl trustline setup / status / remove` plus prepare/execute variants for agents, and its payment preflight fails with a typed `TRUSTLINE_MISSING` error if the destination can't receive RLUSD — the same check your wallet should make against the payer.",
          ),
        ],
        links: [{ label: "RLUSD CLI", href: "https://github.com/t54-labs/rlusd-cli" }],
        keywords: ["trust line", "trustset", "reserve", "rlusd", "onboarding", "preflight"],
      },
      {
        id: "issuer-safety",
        q: "How do we protect users from fake-RLUSD issuers?",
        a: [
          p(
            "On XRPL a currency code is just a label — anyone can issue a token whose code decodes to \"RLUSD\" — so the **issuer address is the identity** of a token, and it's pinned explicitly in every payment requirement (`extra.issuer`). A wallet should verify that address against Ripple's officially published RLUSD issuer for the network and warn hard on a mismatch, exactly as you would for a contract address on an EVM chain.",
          ),
          p(
            "The buyer tooling enforces this too: the RLUSD CLI's x402 command accepts `--require-issuer` so an agent only ever pays requirements naming the expected issuer, and the CLI swaps the official issuer addresses automatically when you switch networks.",
          ),
        ],
        keywords: ["issuer", "scam", "fake", "spoof", "verify", "allowlist", "phishing"],
      },
      {
        id: "sequence-concurrency",
        q: "A presigned blob consumes a sequence number. What about concurrent transactions?",
        a: [
          p(
            "The window is smaller than \"presigned\" suggests: the buyer client signs **at 402 time** and the facilitator submits immediately, so the blob is typically in flight for seconds, bounded by `LastLedgerSequence` (derived from `maxTimeoutSeconds`, assuming ~5s ledger closes). Still, XRPL sequence rules apply — if another transaction from the same account lands first, the blob dies cleanly at submission and the facilitator reports the failure; no funds move.",
          ),
          p(
            "For production agents the recommendation is a **dedicated payment account** (fund it from your treasury; XRPL accounts are cheap) so x402 traffic never interleaves with other activity. High-frequency payers should serialize payments per account. If your architecture needs true parallel presigning — e.g. Tickets — talk to us; the scheme is deliberately conservative here.",
          ),
        ],
        keywords: ["sequence", "concurrency", "tefpast_seq", "parallel", "tickets", "race"],
      },
      {
        id: "signing-infra",
        q: "Do RegularKey, SignerList multi-sig, or MPC/HSM setups work?",
        a: [
          p(
            "The scheme verifies a standard signed XRPL `Payment` blob and doesn't care how the signature was produced — a master key, a rotated `RegularKey`, or externalized signing behind an HSM/MPC boundary all yield the same wire format. XRPL's account model is a real asset here: `RegularKey` gives you key rotation without changing the account address, and a `SignerList` (up to 32 weighted signers with a quorum) encodes m-of-n control at the protocol level.",
          ),
          p(
            "One honest caveat: agent payment flows are latency-sensitive (the invoice expires in minutes), so interactive multi-sign ceremonies fit awkwardly into a 402 retry loop. Wallets with MPC or threshold signing should run their flow against the testnet facilitator end-to-end — and we're glad to validate the integration with you directly.",
          ),
        ],
        links: [{ label: "Ask engineering", href: "mailto:support@t54.ai" }],
        keywords: ["multisig", "regularkey", "signerlist", "mpc", "hsm", "threshold", "key management"],
      },
      {
        id: "tags-memos",
        q: "We already use Source/Destination tags and memos. Do they collide with x402?",
        a: [
          p(
            "Mostly no, with one rule. The **`SourceTag`** on an x402 payment identifies the settling facilitator (it's how the Index attributes volume), so buyer-side infrastructure shouldn't overwrite it — the tag is set from the payment requirement, not by wallet convention. The **`DestinationTag`** stays free for merchant-side routing: a requirement can carry one, and XRPL's sub-account pattern (one receiving address, many tags) works normally — one facilitator or merchant address can fan out to a whole fleet.",
          ),
          p(
            "`Memos[0]` and `InvoiceID` are reserved for the invoice binding. The invoice IDs the SDKs mint are random UUIDs — opaque by design. If you build your own server, keep it that way: never encode order details or anything personal into an invoiceId, because memos are public on-ledger forever.",
          ),
        ],
        keywords: ["sourcetag", "destinationtag", "memo", "collision", "routing", "pii", "privacy"],
      },
      {
        id: "spend-controls",
        q: "How do we cap what an agent is allowed to spend?",
        a: [
          p(
            "In layers, from cheapest to strongest. **Client-side**: `maxValue` on the buyer client refuses any requirement above the cap, and `confirmationMode` can force human sign-off before signing; the RLUSD CLI's x402 command makes its `--max-value` cap mandatory. **Account-side**: fund the agent's dedicated account with only its working budget — on XRPL the account balance is a hard ceiling nobody can talk the agent out of. **Policy-side**: a Verifiable Intent delegation (L2) binds owner-approved spend limits cryptographically, and the facilitator enforces them before settlement — limits the agent's own code can't remove.",
          ),
        ],
        links: [{ label: "Verifiable Intent, below", href: "/faq#what-is-x402-secure" }],
        keywords: ["spend limit", "cap", "budget", "maxvalue", "control", "guardrail"],
      },
    ],
  },
  {
    id: "security",
    title: "Security & Verifiable Intent",
    blurb: "The risk layer: proving an agent was authorized before money moves, and what happens when things go wrong.",
    items: [
      {
        id: "what-is-x402-secure",
        q: "What is x402 Secure / the Verifiable Intent chain?",
        a: [
          p(
            "An embedded risk-control layer that makes agent authority **provable before settlement** rather than asserted in a log afterwards. The payment carries a three-link credential chain: **L1** — a Know-Your-Agent credential issued by Trustline (t54's agent-native risk engine) attesting to the agent's identity; **L2** — a delegation signed by the owner, binding what this agent may spend and on what; **L3** — a per-payment signature by the agent over the concrete action. The chain rides in the x402 payload's `extensions.x402Secure` field as SD-JWT credentials.",
          ),
          p(
            "When the hosted facilitator sees the envelope, it calls x402 Secure before settling; Trustline verifies the chain and the applicable risk policy and returns allow/deny. Deny means the payment never reaches the ledger — and the gate **fails closed**: if the risk service is unreachable, the decision is deny, not \"proceed unchecked.\" Verifiable Intent is Mastercard's framework — introduced with Agent Pay for Machines — and t54 Labs is an official launch partner implementing it on XRPL.",
          ),
        ],
        links: [
          { label: "x402 Secure", href: "https://www.t54.ai/x402-secure" },
          { label: "Verifiable Intent spec", href: "https://verifiableintent.dev/" },
        ],
        keywords: ["verifiable intent", "x402 secure", "trustline", "kya", "l1", "l2", "l3", "mastercard", "risk"],
      },
      {
        id: "vi-required",
        q: "Is Verifiable Intent required to use x402 on XRPL?",
        a: [
          p(
            "No. A plain x402 payment carries no x402 Secure fields and settles normally — the layer is opt-in by design, so you can ship a paid endpoint in an afternoon and add the risk layer when autonomous spend gets serious. The SDK exposes it as a `verifiableIntentProvider` you attach to the buyer client; server-side, a policy ID on the middleware asks the facilitator for the requirements to advertise.",
          ),
          p(
            "Our honest recommendation: optional to start, the right default for production agents spending real budgets — it's the difference between \"the agent's code had a limit\" and \"the owner's signed limit was enforced by the settlement layer.\"",
          ),
        ],
        keywords: ["optional", "required", "opt-in", "adoption", "when"],
      },
      {
        id: "vi-enforcement",
        q: "What can an L2 delegation constrain, and where is it enforced?",
        a: [
          p(
            "The delegation is an owner-signed mandate over the agent's spending: its scope and limits are bound into the credential itself and checked against the concrete payment (the L3 action commits to a hash of the exact payment requirements, so the approved thing is what settles). Enforcement happens at the **facilitator, before submission** — not in the agent's process, which matters precisely because a compromised or misbehaving agent can't skip a check that lives on the other side of the trust boundary.",
          ),
          p(
            "Two implementation notes for integrators: the SDK refuses to let a provider overwrite facilitator-issued fields (requirement and decision tokens), and L1 issuance belongs in your trusted backend — Trustline API keys must never ship inside an agent or a payment payload.",
          ),
        ],
        keywords: ["delegation", "l2", "enforce", "limits", "mandate", "scope"],
      },
      {
        id: "compromise",
        q: "What happens if an agent key — or a whole agent — is compromised?",
        a: [
          p(
            "Defense in depth, honestly stated. **Blast radius**: a dedicated payment account caps losses at its balance; client-side `maxValue` and confirmation gates limit per-call damage. **Policy**: with Verifiable Intent active, payments outside the owner's delegated scope are denied at the facilitator regardless of what the compromised agent asks for, and Trustline's risk engine watches for exactly this class of anomaly. **On-ledger**: rotate a `RegularKey` immediately without changing the account address, or govern the account with a `SignerList` so no single key was ever sufficient.",
          ),
          p(
            "For settled funds the recourse asymmetry is deliberate: base-layer XRP payments are final, while regulated issued tokens like RLUSD carry issuer-level `Freeze` and `Clawback` — recourse for institutional money without a custodian in the flow. Report an incident to support@t54.ai and it reaches the engineering team directly — we'll work it with you.",
          ),
        ],
        keywords: ["compromise", "hack", "stolen", "incident", "freeze", "clawback", "rotation", "recovery"],
      },
      {
        id: "audit-openness",
        q: "Can we review the code? Audits, open source, verifying independently?",
        a: [
          p(
            "The SDKs are open source (MIT) on npm and PyPI with public repositories; the x402 Secure gateway — including its gating logic, policy merging, and OpenAPI protocol spec — is open source under Apache 2.0; and the Verifiable Intent credentials are standard SD-JWTs, inspectable with standard tooling (chain verification against risk policy runs in Trustline). The XRPL scheme itself is publicly specified, and everything that settles is inspectable on a public ledger — an unusual amount of this stack is auditable from outside.",
          ),
          p(
            "For security reviews, audit materials, or a walkthrough of the facilitator's internals under NDA, contact us directly — wallet-grade due diligence is a conversation we're set up for.",
          ),
        ],
        links: [
          { label: "x402-secure (Apache 2.0)", href: "https://github.com/t54-labs/x402-secure" },
          { label: "Ask engineering", href: "mailto:support@t54.ai" },
        ],
        keywords: ["audit", "open source", "license", "review", "due diligence", "verify", "nda"],
      },
      {
        id: "issuer-freeze",
        q: "What if the RLUSD issuer freezes a trust line mid-flow?",
        a: [
          p(
            "The payment simply fails to settle — a frozen trust line can't send, so the transaction returns a failure result at submission and the facilitator reports `success: false`; the merchant never sees a phantom payment and the resource isn't delivered. The payer's only cost is the network fee inside their signed transaction (capped by the facilitator's fee policy at 0.01 XRP, in practice ~10 drops — fractions of a cent).",
          ),
          p(
            "This is the flip side of using a regulated stablecoin: issuer controls exist, they're enforced by the ledger itself, and they're visible — a wallet can check freeze status on the trust line before signing, which is exactly the kind of preflight the tooling encourages.",
          ),
        ],
        keywords: ["freeze", "frozen", "issuer", "fail", "fee loss", "tec"],
      },
    ],
  },
  {
    id: "operations",
    title: "Facilitator & operations",
    blurb: "Endpoints, costs, limits, failure modes — what your SRE and payments teams will ask.",
    items: [
      {
        id: "endpoints",
        q: "What are the hosted facilitator endpoints and their contract?",
        a: [
          code(
            `Mainnet  https://xrpl-facilitator-mainnet.t54.ai     xrpl:0
Testnet  https://xrpl-facilitator-testnet.t54.ai     xrpl:1

POST /verify     validate a signed blob against requirements
POST /settle     submit to XRPL, wait for validation
GET  /supported  advertised schemes / networks / assets`,
          ),
          p(
            "`/verify` decodes the blob and checks every invariant statically — amount matches exactly, invoice binding present and correct, fee under the cap, right network and destination — without touching the ledger. `/settle` submits and, by default, blocks until the transaction is **validated** on-ledger (polling each second, 60s ceiling), then returns the transaction hash your server forwards in `PAYMENT-RESPONSE`. No API keys on any of them.",
          ),
        ],
        keywords: ["endpoints", "verify", "settle", "supported", "api", "hosted", "urls"],
      },
      {
        id: "fees",
        q: "What does it cost?",
        a: [
          p(
            "On-ledger: the XRPL network fee, paid by the buyer inside the signed transaction — typically ~10 drops, i.e. thousandths of a cent, burned rather than auctioned, so there's no gas market to reason about. The facilitator enforces a ceiling (rejecting any blob whose fee exceeds 0.01 XRP) and cannot inflate the fee, which is inside the signature.",
          ),
          p(
            "The hosted facilitator itself currently has no service fee and no API key. For wallet-scale or enterprise commitments — throughput guarantees, commercial terms, SLAs — talk to us rather than sizing your business on defaults.",
          ),
        ],
        links: [{ label: "Talk to t54", href: "mailto:support@t54.ai" }],
        keywords: ["fee", "cost", "pricing", "free", "drops", "gas", "commercial"],
      },
      {
        id: "latency",
        q: "How fast is settlement, really?",
        a: [
          p(
            "XRPL closes a ledger every ~4–5 seconds, and `/settle` waits for actual validation — so a paid request completes in one ledger close on the happy path: single-digit seconds from 402 to resource, with **finality**, not an optimistic acknowledgment. There's no mempool auction and no confirmation-count arithmetic; validated means done.",
          ),
          p(
            "For genuinely high-frequency flows (per-token or per-inference-call billing), per-request settlement is the wrong primitive — that's what XRPL Payment Channels are for: off-ledger signed claims at signature speed, settled once on-ledger. If you're designing that shape, we're happy to sketch it with you.",
          ),
        ],
        keywords: ["latency", "speed", "fast", "finality", "seconds", "settlement time", "payment channels"],
      },
      {
        id: "failure-modes",
        q: "What are the failure modes, and what does our server see?",
        a: [
          p(
            "Failures are typed and happen in the safe order — verification before submission. `/verify` rejects with a machine-readable reason (`amount_mismatch`, `invoice_binding_mismatch`, `fee_too_high`, unknown invoice…), and the middleware answers the client with a fresh 402 so a well-behaved agent can retry cleanly. An expired blob (`LastLedgerSequence` passed) can never validate — expiry is enforced by the ledger, not by a timer you have to trust.",
          ),
          p(
            "The ambiguous window — submitted but not yet observed as validated — is handled with a 60s validation wait plus **idempotent settles**: retrying the same settle returns the cached outcome instead of a double-submit, concurrent duplicates get a 409, and the transaction hash lets you reconcile against the ledger yourself as the final authority.",
          ),
        ],
        keywords: ["errors", "failure", "retry", "timeout", "idempotency", "reconcile", "409"],
      },
      {
        id: "rate-limits",
        q: "Are there rate limits or throughput ceilings?",
        a: [
          p(
            "Yes — sane defaults that protect the shared service: on the order of 20 verifies/sec and 5 settles/sec per IP (with higher global ceilings), answered with HTTP 429 and a `Retry-After` when exceeded, plus a cap on concurrently in-flight settles. Underneath, XRPL RPC calls get automatic retries with backoff and a circuit breaker across node providers.",
          ),
          p(
            "These are operational defaults, not product tiers. If your integration needs sustained throughput above them — a wallet fleet, a busy inference gateway — contact us and we'll provision for it.",
          ),
        ],
        keywords: ["rate limit", "throughput", "429", "scale", "capacity", "qps"],
      },
      {
        id: "self-host",
        q: "Can we run our own facilitator instead of using t54's?",
        a: [
          p(
            "At the protocol level, yes — and to be precise about what's what: **t54's facilitator is a hosted service, not an open-source component**. It settles with t54's registered `SourceTag` (804681468) by default. But the facilitator *role* is deliberately commoditized: the XRPL scheme is publicly specified, the contract is three JSON endpoints, and the SDKs accept any `facilitatorUrl` — so a team that wants sovereignty implements the spec, stamps its own `SourceTag`, and registers it on this hub to put its settled volume on the Index. The registry is self-serve and takes minutes.",
          ),
          p(
            "What the hosted service gives you is the operational layer — node redundancy, idempotency storage, rate limiting, the x402 Secure risk hookup — with zero infrastructure on your side. Most integrators start hosted; building your own facilitator is the fully-sovereign path, not a prerequisite.",
          ),
        ],
        links: [{ label: "Register a facilitator", href: "/join/facilitator" }],
        keywords: ["self-host", "own facilitator", "run", "deploy", "sourcetag", "lock-in"],
      },
      {
        id: "sla",
        q: "Uptime, SLAs, status page, incident contact?",
        a: [
          p(
            "The hosted facilitators run on redundant XRPL node providers with automatic failover, and the Index on this site doubles as a public liveness signal — settlements flowing through the mainnet facilitator are visible within seconds on the homepage. Formal SLAs, a status page subscription, and incident-channel arrangements are part of partner onboarding: tell us your requirements and we'll put terms on paper.",
          ),
          p(
            "Worth noting in your risk assessment: facilitator downtime blocks **new** settlements but can never touch funds — there's nothing in custody to be affected, and merchants can fail over to another facilitator (or their own) without changing anything on-chain.",
          ),
        ],
        links: [{ label: "Talk to t54", href: "mailto:support@t54.ai" }],
        keywords: ["sla", "uptime", "status", "incident", "availability", "support"],
      },
    ],
  },
  {
    id: "ecosystem",
    title: "The Index & ecosystem",
    blurb: "How the live numbers on this site are counted, how you get on them, and the rest of the t54 toolkit.",
    items: [
      {
        id: "how-index-counts",
        q: "How does the Index actually count transactions? Can we trust the numbers?",
        a: [
          p(
            "The hub runs its own independent indexer subscribed to XRPL: every validated `Payment` whose `SourceTag` matches a registered facilitator tag is recorded — amount taken from the ledger's authoritative `delivered_amount` (never the requested amount), split by asset (XRP and RLUSD are never blended into one number), with the buyer, merchant, facilitator, and invoice binding stored per transaction. Every figure on the site traces to on-ledger transactions you can open in an explorer.",
          ),
          p(
            "Because tags are public, the indexer is deliberately skeptical: dust payments below a minimum threshold are ignored so nobody can inflate the leaderboard with spam, and merchant identity is bound to the receiving address on first verification so a later 402 can't impersonate an existing merchant.",
          ),
        ],
        links: [
          { label: "Live Index", href: "/" },
          { label: "Detection spec", href: "https://xrpl-x402.t54.ai/docs/xrpl-scheme" },
        ],
        keywords: ["index", "count", "data", "methodology", "trust", "leaderboard", "delivered amount"],
      },
      {
        id: "register-facilitator",
        q: "We run a facilitator. How does our volume get on the Index?",
        a: [
          p(
            "Self-serve, no gatekeeping: submit a name and your `SourceTag` (plus optional site, networks, assets) at the registry, and the indexer starts recording every XRPL payment carrying that tag — your settled volume, transaction count, and active buyers appear on the facilitators leaderboard. No ownership proof is required, because a SourceTag isn't a claimable asset — it's the label you already stamp on your own settlements.",
          ),
        ],
        links: [
          { label: "Register your facilitator", href: "/join/facilitator" },
          { label: "Facilitator leaderboard", href: "/facilitators" },
        ],
        keywords: ["register", "facilitator", "sourcetag", "leaderboard", "index", "list"],
      },
      {
        id: "get-listed",
        q: "How does our AI service get listed in the Directory?",
        a: [
          p(
            "Register a live x402 endpoint and it's verified on the spot: the hub probes your URL (GET, then POST — matching how x402 endpoints actually answer), confirms it returns a 402 with a valid `PAYMENT-REQUIRED` naming an XRPL network and a `payTo`, and lists you immediately. Serve a `/.well-known/x402` catalog on your origin and every resource in it is discovered automatically — and re-crawled hourly, so your listing stays current without re-submitting.",
          ),
          p(
            "Give your resources names and descriptions in the catalog (they're ingested verbatim), and once payments flow, your settled activity shows up on the same Index — the listing and the numbers reinforce each other. No live endpoint yet? Email us and we'll list you after a quick review.",
          ),
        ],
        links: [
          { label: "Get listed", href: "/join/service" },
          { label: "Directory", href: "/directory" },
        ],
        keywords: ["directory", "listing", "well-known", "discovery", "merchant", "service"],
      },
      {
        id: "toolkit",
        q: "Beyond the SDK, what does the t54 toolkit include?",
        a: [
          p(
            "**RLUSD CLI** (`npm install -g @rlusd/cli`, command `rlusd`) — a multi-chain RLUSD command line: XRPL trust lines and payments, native DEX and AMM trading, Uniswap/Aave on Ethereum, Wormhole bridging to L2s, encrypted local wallets, and a buyer-side `rlusd x402 fetch` with a mandatory spend cap. Every write follows a prepare → review → execute plan flow with tamper-checked plan files, and everything speaks `--json` — built to be driven by agents, not just humans.",
          ),
          p(
            "**RLUSD Skills** — the same flows packaged as Claude Code agent skills (`/plugin marketplace add t54-labs/rlusd-skills`), so an agent gets guarded RLUSD workflows without bespoke integration. **ClawCredit** — agent-native credit underwritten by t54's risk engine. Alongside the official XRPL side: Ripple's agentic-transactions docs and skills, and the XRPL docs MCP server — all linked on the Resources page.",
          ),
        ],
        links: [
          { label: "All resources", href: "/resources" },
          { label: "rlusd-skills", href: "https://github.com/t54-labs/rlusd-skills" },
        ],
        keywords: ["cli", "rlusd", "skills", "clawcredit", "tools", "toolkit", "mcp"],
      },
      {
        id: "official-xrpl-resources",
        q: "What official XRPL resources exist for AI agent development?",
        a: [
          p(
            "Start with XRPL's official **agentic-transactions guide** and its AI starter kit: the **XRPL Agent Wallet Skill** and **XRPL Payments Skill**, installed into Claude Code (or any skills-compatible agent) via `npx skills`. They're built around a strict security model — human preview before every signature, scoped and time-limited auto-signing, external-signer support for KMS/HSM setups, and SourceTag/Memo attribution — which makes them a solid reference for how a production agent should treat XRPL keys even if you build your own stack.",
          ),
          p(
            "Alongside those: the **XRPL Docs MCP Server** gives agents grounded access to the XRPL documentation; **`xrpl-up`** is Ripple's CLI for local development — a local sandbox with pre-funded accounts, scripting, snapshots, and testnet/devnet access, with a Claude Code plugin; and **XRPL Commons maintains `xrpl-dev-skills`**, community agent skills for XRPL development. These compose cleanly with the t54 stack: the official skills handle wallets and payments, and `x402-xrpl` adds the paid-API handshake and facilitator settlement on top.",
          ),
        ],
        links: [
          { label: "Agentic transactions guide", href: "https://xrpl.org/docs/agents/getting-started-with-agentic-transactions" },
          { label: "XRPL AI tools (MCP)", href: "https://xrpl.org/resources/dev-tools/ai-tools" },
          { label: "xrpl-up", href: "https://github.com/ripple/xrpl-up" },
          { label: "xrpl-dev-skills", href: "https://github.com/XRPL-Commons/xrpl-dev-skills" },
        ],
        keywords: ["official", "ripple", "xrpl.org", "starter kit", "agent kit", "skills", "mcp", "xrpl-up", "commons"],
      },
      {
        id: "who-to-talk-to",
        q: "Who do we talk to for integration support or a technical deep-dive?",
        a: [
          p(
            "Write to **support@t54.ai** and it lands with the engineering team, not a ticket queue — integration questions, architecture reviews, wallet due-diligence sessions, and partner intros all start there. If you're evaluating on behalf of a partner or a portfolio of projects, we'll happily run a live technical Q&A; send your question list ahead and we'll come prepared.",
          ),
          p(
            "And a standing promise: real integration questions that aren't answered here get answered *and* added to this page — if you had to ask, the next team shouldn't have to.",
          ),
        ],
        links: [{ label: "support@t54.ai", href: "mailto:support@t54.ai" }],
        keywords: ["contact", "support", "help", "bd", "partner", "korea", "meeting"],
      },
    ],
  },
];

/** Plain-text answer for JSON-LD — strips inline markup, skips code blocks. */
export function faqPlainAnswer(item: FaqItem): string {
  return item.a
    .filter((b): b is Extract<FaqBlock, { kind: "p" }> => b.kind === "p")
    .map((b) => b.text.replace(/`([^`]+)`/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1"))
    .join(" ");
}
