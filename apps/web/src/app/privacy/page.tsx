import { LegalDoc } from "../components/LegalDoc";

export const metadata = {
  title: "Privacy Policy — t54 XRPL AI",
  description: "Privacy Policy for XRPL AI — what limited data the t54 Labs hub collects, how it is used, and your choices and rights.",
};

const SECTIONS = [
  {
    heading: "Scope of this policy",
    paragraphs: [
      "This policy applies to the XRPL AI hub at xrpl-ai.org and to the limited interactions it supports: browsing the directory, viewing dashboards, searching by XRPL address or transaction hash, and emailing us to request a listing or to contact support.",
      "It does not apply to any third-party service, API, tool, wallet, or facilitator that we link to or list. Listed services are operated by independent providers; their data practices are governed by their own privacy policies, which we do not control. A listing in the directory is an index entry, not an endorsement.",
      "It also does not change the nature of public blockchain data. Information recorded on the XRP Ledger is created and maintained by the ledger and its participants, not by us, and is governed by the realities of a public, permanent ledger rather than by this policy.",
    ],
  },
  {
    heading: "Information we collect",
    paragraphs: [
      "We keep data collection to a minimum. The information involved falls into the following categories.",
    ],
    bullets: [
      "Usage and analytics data collected automatically when you visit the hub, such as pages and dashboards viewed, the referring page, the time and date of your visit, and general interaction patterns.",
      "Device and connection data, such as your IP address, browser type and version, operating system, and language settings, which are typical of any website request.",
      "Approximate location inferred from your IP address (for example, country or region), used only to understand traffic at an aggregate level — we do not determine your precise location.",
      "Search queries you enter on the hub, such as an XRPL address or transaction hash, which are used to return the corresponding public on-chain information.",
      "Information you choose to submit to us, for example when you email support@t54.ai to request that a service be listed in the directory or to ask a support question. This typically includes your email address, your name or company, and whatever details you include about the service or your request.",
    ],
  },
  {
    heading: "What we do not collect",
    paragraphs: [
      "The hub has no user accounts and no login, so we do not collect usernames, passwords, or account profiles.",
      "We do not custody funds, execute trades, or move money, and the hub does not ask for or collect payment credentials — no card numbers, private keys, seed phrases, or wallet secrets. You should never send us a private key or seed phrase, and we will never ask for one.",
      "We do not provide investment, financial, legal, or tax advice, and we do not collect information for the purpose of giving it.",
    ],
  },
  {
    heading: "Cookies and analytics",
    paragraphs: [
      "We use Google Analytics, a measurement service provided by Google, to understand how the hub is used so we can improve it. Google Analytics is loaded with a measurement ID embedded in the site and may set cookies or use similar technologies in your browser to measure page views and aggregate usage.",
      "The analytics we review are aggregated and oriented toward traffic and performance rather than identifying individuals. We do not use this data to build advertising profiles of you.",
      "You can limit or block this collection in several ways: adjust your browser settings to refuse or delete cookies, use the Google Analytics Opt-out Browser Add-on, or rely on browser features and extensions that block analytics scripts. Blocking analytics does not affect your ability to use the informational features of the hub.",
      "Some browsers and extensions send “Do Not Track” (DNT) or Global Privacy Control (GPC) signals. Because there is no common industry standard for DNT, we do not currently respond to DNT signals; where applicable law requires it, we treat a recognized GPC signal as a request to opt out of any “sale” or “sharing” of personal information — noting that, as described below, we do not sell or share personal data.",
    ],
  },
  {
    heading: "How we use information",
    paragraphs: [
      "We use the limited information described above for the following purposes.",
    ],
    bullets: [
      "To operate, maintain, and secure the hub, including diagnosing technical problems and protecting against abuse, scraping, and fraudulent or malicious activity.",
      "To understand and improve how the hub is used, through aggregate analytics about pages, dashboards, and search features.",
      "To return public on-chain results that correspond to the address or transaction hash you search for.",
      "To respond to you when you email us to request a directory listing or to contact support, and to evaluate and process listing requests.",
      "To comply with applicable law and to respond to valid legal requests where required.",
    ],
  },
  {
    heading: "Legal bases for processing",
    paragraphs: [
      "Where data protection laws such as the EU or UK GDPR apply to you, we rely on the following legal bases.",
      "Our legitimate interests support running and securing the hub, understanding aggregate usage, and improving the service, in each case balanced against your interests and rights. When you email us, we process the information you provide in order to take steps at your request and to respond to you. Where the law requires it, we rely on your consent for non-essential analytics cookies, which you can withdraw at any time through the controls described above. We also process information where necessary to comply with a legal obligation.",
    ],
  },
  {
    heading: "Third-party processors and linked services",
    paragraphs: [
      "We rely on a small number of service providers that process data on our behalf so that the hub can function. These are limited to what the service needs to operate.",
    ],
    bullets: [
      "Vercel, which hosts and serves the website and processes standard request and server data, including IP addresses, as part of delivering the site.",
      "Google Analytics, which processes usage, device, and approximate-location data to provide aggregate measurement, as described in the cookies and analytics section.",
      "t54's hosted x402 facilitator, SDKs, and documentation, which the hub links out to. The facilitator's verify and settle endpoints are non-custodial — they do not take custody of your funds. Any data you submit directly to the facilitator, SDKs, or docs is handled under their own terms and notices.",
    ],
  },
  {
    heading: "Third-party listed services",
    paragraphs: [
      "The directory indexes and links to services, APIs, and tools operated by independent third parties. When you follow a link and interact with one of those services, you are dealing directly with that provider, not with us.",
      "Those providers decide for themselves what data they collect and how they use it, under their own privacy policies. We do not control, and are not responsible for, the data practices, content, or availability of any third-party service we list or link to. We encourage you to review the privacy policy of any service before you use it.",
    ],
  },
  {
    heading: "On-chain and blockchain data",
    paragraphs: [
      "The hub displays live settlement and transaction data from XRPL mainnet. This data is inherently public: anyone can read the XRP Ledger, and addresses, transaction hashes, amounts, and timestamps are visible to all participants by design.",
      "On-chain data is also permanent. Once a transaction is recorded on the XRP Ledger, it cannot be altered, reversed, or deleted by us or by anyone, and it remains publicly accessible indefinitely. We do not author this data; we read and display what the public ledger already contains.",
      "Because of this, requests to delete or correct on-chain information are outside our control, and any deletion right you exercise with us applies to the limited data we hold about you (such as analytics records or an email you sent us), not to the immutable contents of the ledger. You should treat anything you commit to a public blockchain as permanent and public, and assume the associated risks of doing so.",
    ],
  },
  {
    heading: "How we share information",
    paragraphs: [
      "We do not sell your personal data, and we do not share it for cross-context behavioral advertising.",
      "We share the limited data we handle only in these circumstances: with the processors described above, who act on our instructions to run the hub; where required to comply with applicable law, regulation, legal process, or an enforceable governmental request; to protect the rights, safety, and security of the hub, our users, or the public, including to address fraud or abuse; and in connection with a merger, acquisition, financing, or other corporate transaction, in which case we will continue to protect the information consistent with this policy.",
    ],
  },
  {
    heading: "International data transfers",
    paragraphs: [
      "The hub is operated by t54 Labs and served through providers, including Vercel and Google, that may process data on servers located in countries other than your own. As a result, your information may be transferred to and processed in jurisdictions whose data protection laws differ from those where you live.",
      "Where such transfers are subject to data protection laws like the GDPR, we rely on appropriate safeguards for international transfers, such as the European Commission's Standard Contractual Clauses or another lawful transfer mechanism, where applicable.",
    ],
  },
  {
    heading: "Data retention",
    paragraphs: [
      "We keep information only for as long as it is needed for the purposes described in this policy, after which we delete or anonymize it.",
      "Aggregate analytics data is retained according to our analytics configuration and Google's retention controls, which are oriented toward trend analysis rather than long-term storage of individual records. Emails and listing requests you send us are kept for as long as needed to handle your request and maintain the directory, and for a reasonable period afterward for recordkeeping, support continuity, and legal compliance. Public on-chain data is not retained by us in the conventional sense — it lives permanently on the XRP Ledger and we simply read it.",
    ],
  },
  {
    heading: "Your rights and choices",
    paragraphs: [
      "Depending on where you live, you may have rights over the personal data we hold about you. These can include the right to access the data we hold, to request correction of inaccurate data, to request deletion, to object to or restrict certain processing, to withdraw consent where we rely on it, and to request portability of data you have provided.",
      "To exercise any of these rights, email us at support@t54.ai or privacy@t54.ai and describe your request. We may need to verify your identity or ask for additional detail before acting, particularly to make sure we are responding to the right person. We will respond within the timeframe required by applicable law.",
      "These rights apply to the limited data we control, such as analytics records and correspondence you send us. They cannot be applied to data on the public XRP Ledger, which we do not control and cannot alter or remove. If you are in the EU, UK, or another region with a data protection authority, you also have the right to lodge a complaint with your local supervisory authority.",
    ],
  },
  {
    heading: "Children's privacy",
    paragraphs: [
      "The hub is not directed to children, and we do not knowingly collect personal data from anyone under the age of 16 (or under 18 where that is the applicable age of majority in your jurisdiction).",
      "If you believe a child has provided us with personal data, please contact us and we will take reasonable steps to delete it.",
    ],
  },
  {
    heading: "Security",
    paragraphs: [
      "We take reasonable technical and organizational measures to protect the limited information we handle, including serving the hub over encrypted connections and limiting internal access to data on a need-to-know basis. Because the hub holds no accounts and no payment credentials, the sensitive data exposed through it is minimal by design.",
      "No method of transmission over the internet or of electronic storage is completely secure, so while we work to protect your information we cannot guarantee absolute security. You can help protect yourself by being cautious about what you include in emails to us and by never sharing private keys or seed phrases with anyone, including us.",
    ],
  },
  {
    heading: "Changes to this policy",
    paragraphs: [
      "We may update this Privacy Policy from time to time to reflect changes in the hub, our practices, or the law. When we do, we will revise the date shown on this page, and for material changes we will take reasonable steps to make the update more visible.",
      "Your continued use of the hub after an update takes effect means you accept the revised policy.",
    ],
  },
  {
    heading: "Governing law",
    paragraphs: [
      "This Privacy Policy and any matter relating to it are governed by the laws of the State of Delaware, United States, without regard to its conflict-of-laws rules, except where mandatory local data protection laws grant you rights that cannot be overridden.",
      "The data controller responsible for the limited personal data described in this policy is T54 Labs Inc..",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalDoc
      eyebrow="Legal"
      title="Privacy Policy"
      lastUpdated="June 24, 2026"
      intro={"XRPL AI is an ecosystem hub at xrpl-ai.org, built and operated by t54 Labs. It is an informational index of x402-enabled, agent-payable services, APIs and tools on the XRP Ledger (XRPL), and it displays live, public on-chain settlement data from XRPL mainnet. This Privacy Policy explains what limited information we collect when you visit the hub, how we use it, who we share it with, and the choices and rights you have. Because the hub is informational and does not custody funds, move money, or hold accounts, the personal data we handle is deliberately minimal."}
      sections={SECTIONS}
      contact={"For privacy questions or to exercise your data rights, contact t54 Labs at support@t54.ai or privacy@t54.ai."}
    />
  );
}
