import { LegalDoc } from "../components/LegalDoc";

export const metadata = {
  title: "Terms & Conditions — t54 XRPL AI",
  description: "Terms & Conditions for XRPL AI, the t54 Labs ecosystem hub indexing x402 agentic-payment services on the XRP Ledger.",
};

const SECTIONS = [
  {
    heading: "Acceptance of these terms",
    paragraphs: [
      "These Terms form a binding agreement between you and t54 Labs. You accept them by visiting xrpl-ai.org, searching the directory or on-chain data, following a link to a third-party service, or otherwise using any feature of the hub.",
      "The hub does not currently offer user accounts or logins, and it does not collect payment credentials. Your use is governed by these Terms as published from time to time, together with any policies we reference within them, including our Privacy Policy.",
    ],
  },
  {
    heading: "What the hub is",
    paragraphs: [
      "XRPL AI is an informational index and directory. It lists x402-enabled, agent-payable services, APIs and tools that operate on the XRP Ledger, surfaces live public settlement data read from XRPL mainnet, and lets you search by wallet address or transaction hash. It also links out to t54 Labs' hosted x402 facilitator, software development kits (SDKs) and documentation.",
      "The hub is a directory and reference layer only. It does not custody, hold or transmit funds; it does not execute trades, payments or transfers; and it does not move money on your behalf. Any value transfer that occurs does so directly on the XRP Ledger between the relevant parties and their wallets, outside the hub.",
      "Where we link to the t54 Labs x402 facilitator, that facilitator verifies and settles x402 payments by submitting signed transactions to XRPL on a non-custodial basis — it does not take custody of your keys or funds. The facilitator, SDKs and documentation are governed by their own terms and notices, which apply in addition to these Terms when you use them.",
    ],
    bullets: [
      "The hub displays information about services it does not operate or control.",
      "The on-chain data shown is read from public ledger sources and surfaced for reference.",
      "Settlement, payments and key custody happen on XRPL and in the relevant tools, not on the hub.",
    ],
  },
  {
    heading: "Eligibility",
    paragraphs: [
      "You may use the hub only if you can form a legally binding agreement with us and your use is permitted under the laws that apply to you. By using the hub you represent that you meet these requirements and that you are not located in, ordinarily resident in, or accessing the hub on behalf of a person or entity in a jurisdiction or on a list subject to comprehensive sanctions or trade restrictions administered by any relevant authority.",
      "You also represent that you are not a person with whom we are prohibited from dealing under applicable sanctions, export-control or anti-money-laundering laws. We may restrict, suspend or block access where we reasonably suspect unlawful activity, fraud, sanctions exposure, or a breach of these Terms.",
    ],
  },
  {
    heading: "No financial, investment, legal or tax advice",
    paragraphs: [
      "All content on the hub is provided for general informational purposes only. Nothing on the hub is, or should be relied upon as, financial, investment, trading, legal, accounting, tax or other professional advice, nor is it a recommendation, solicitation or offer to buy, sell or hold any digital asset, token or service, including XRP or RLUSD.",
      "Listings, metrics, descriptions and on-chain figures may be incomplete, delayed, inaccurate or out of date, and digital assets such as XRP and RLUSD can be volatile and may lose value. You are solely responsible for your own decisions. Do your own research, and seek independent advice from a qualified professional before transacting or relying on any information surfaced through the hub.",
    ],
  },
  {
    heading: "Assumption of risk for crypto and agentic payments",
    paragraphs: [
      "You understand and accept the risks inherent in blockchain networks, digital assets and autonomous agent payments, and you use the XRP Ledger and any linked tools at your own risk. We do not control the XRP Ledger, its validators, network conditions, or the issuers of any asset.",
      "On-chain transactions are generally irreversible and final once settled. Errors in addresses, amounts, signatures, agent configurations or spend limits can result in permanent and total loss of funds, and we cannot reverse, cancel or recover such transactions.",
      "Agent-payable and x402 flows may authorize software agents to initiate payments on your behalf within parameters you configure, such as Verifiable Intent delegations and spending limits. You are responsible for configuring, supervising and bearing the consequences of any agent you operate or authorize, including all amounts it spends.",
      "Digital assets, stablecoins and AI-driven payment systems are subject to evolving and uncertain regulation, smart-contract and protocol risk, third-party infrastructure failures, and the risk that a stablecoin may lose its peg or value. You accept these risks in full.",
    ],
  },
  {
    heading: "Third-party services and listings",
    paragraphs: [
      "The services, APIs and tools listed in the directory are operated by independent third parties. We do not own, control, operate, vet, audit or guarantee them, and a listing does not constitute an endorsement, certification, recommendation or warranty of any provider, its security, its performance or its compliance.",
      "We make no guarantee that any listed service is available, accurate, secure, lawful or fit for any purpose. Your dealings with any third-party provider — including any payment, agreement or dispute — are solely between you and that provider, and are governed by that provider's own terms and policies. We are not a party to those dealings and are not responsible for them.",
      "The hub may also rely on third-party data sources and infrastructure to read and display on-chain information. We are not responsible for the accuracy, completeness or availability of third-party data, services or infrastructure.",
    ],
  },
  {
    heading: "Directory listing requests",
    paragraphs: [
      "Service operators may request to be listed in the directory, currently by emailing support@t54.ai with the relevant details. Submitting a request does not guarantee a listing.",
      "We may accept, decline, edit, reorder, suspend or remove any listing at our discretion and at any time, with or without notice, including where information appears inaccurate, unlawful, unsafe, misleading or in breach of these Terms.",
      "If you submit a service for listing, you represent and warrant that the information you provide is accurate and not misleading; that you have the authority and all rights necessary to submit it and to operate the service described; that the service and your operation of it comply with all applicable laws; and that the listing does not infringe any third party's rights. You grant us a non-exclusive, worldwide, royalty-free license to use, reproduce and display the submitted information for the purpose of operating and promoting the directory, and you agree to keep it current and to notify us of material changes.",
    ],
  },
  {
    heading: "Acceptable use",
    paragraphs: [
      "You agree to use the hub lawfully and only for its intended informational purposes. When using the hub you must not engage in the prohibited conduct below.",
      "We may monitor use of the hub, and may investigate and take action — including removing content, restricting access, or reporting to authorities — where we reasonably believe these Terms have been breached. We are under no obligation to pre-screen content or listings.",
    ],
    bullets: [
      "Use the hub for any unlawful, fraudulent, deceptive or harmful purpose, or in breach of sanctions, export-control or anti-money-laundering laws.",
      "Submit false, misleading, infringing or unauthorized listing information, or impersonate any person or entity.",
      "Interfere with, disrupt, overload or attempt to gain unauthorized access to the hub, its systems, or any connected network or ledger.",
      "Scrape, harvest, data-mine or systematically extract content or data from the hub except as expressly permitted, or use automated means in a way that burdens our infrastructure.",
      "Introduce malware or other harmful code, or attempt to probe, breach or circumvent the hub's security or access controls.",
      "Use the hub to facilitate transactions in, or links to, illegal, unsafe or rights-infringing services or content.",
    ],
  },
  {
    heading: "Intellectual property and trademarks",
    paragraphs: [
      "The hub and its content — including text, design, layout, graphics, the coral-dot brand motif, logos and software — are owned by or licensed to t54 Labs and are protected by intellectual property laws. We grant you a limited, personal, non-exclusive, non-transferable and revocable license to access and use the hub for its intended informational purposes. You may not copy, modify, distribute, sell, publicly display, create derivative works from, or commercially exploit any part of the hub without our prior written consent, except as expressly permitted by these Terms or applicable law.",
      "\"XRP\" and \"XRPL\" and related marks, and the names, logos and marks of listed third-party services, are the property of their respective owners and are referenced for identification and informational purposes only. Their use on the hub does not imply any affiliation with or endorsement by those owners beyond any relationship actually disclosed.",
      "Mastercard, Mastercard Agent Pay, Agent Pay for Machines and Verifiable Intent are trademarks of Mastercard International Incorporated. References to them reflect publicly announced partner relationships and do not imply endorsement or a formal or exclusive partnership beyond the named-partner role in Agent Pay for Machines.",
      "If you send us feedback, suggestions or ideas about the hub, you grant us a perpetual, irrevocable, worldwide, royalty-free license to use them for any purpose without restriction or compensation.",
      "If you believe that a listing or any content on the hub infringes your intellectual property or other rights, contact us at support@t54.ai with enough detail to identify the material and your claim, and we will review it and, where appropriate, remove or disable access to it.",
    ],
  },
  {
    heading: "On-chain data is public and permanent",
    paragraphs: [
      "The settlement and transaction data displayed by the hub is read from the public XRP Ledger. Information recorded on a public blockchain — including wallet addresses, transaction hashes, amounts and timestamps — is inherently public, transparent and, by the nature of the ledger, permanent and not within our control to alter or erase.",
      "When you search or browse this data, you are viewing information already published on-chain. We do not create, own or control that on-chain record, and we cannot modify, delete or anonymize entries on the underlying ledger.",
    ],
  },
  {
    heading: "Disclaimer of warranties",
    paragraphs: [
      "The hub and all content, listings, data and links are provided \"as is\" and \"as available,\" with all faults and without warranties of any kind, whether express, implied or statutory. To the fullest extent permitted by law, we disclaim all implied warranties, including merchantability, fitness for a particular purpose, title, non-infringement, accuracy, and any warranty arising from course of dealing or usage.",
      "We do not warrant that the hub will be uninterrupted, timely, secure, error-free or free of harmful components, or that any information, listing or on-chain figure is accurate, complete or current. Some jurisdictions do not allow the exclusion of certain warranties, so some of these exclusions may not apply to you.",
    ],
  },
  {
    heading: "Limitation of liability",
    paragraphs: [
      "To the fullest extent permitted by law, t54 Labs and its affiliates, officers, employees, contractors and agents will not be liable for any indirect, incidental, special, consequential, exemplary or punitive damages, or for any loss of profits, revenue, data, goodwill, digital assets or business, arising out of or relating to your use of (or inability to use) the hub, any listed third-party service, or any on-chain transaction, whether based in contract, tort or any other theory, even if advised of the possibility of such damages.",
      "Because the hub is provided to you free of charge and we do not custody funds or process payments, our total aggregate liability to you for all claims relating to the hub will not exceed one hundred United States dollars (USD $100). Nothing in these Terms excludes or limits liability that cannot lawfully be excluded or limited, such as liability for fraud or for death or personal injury caused by our negligence. Some jurisdictions do not allow certain limitations, so parts of this section may not apply to you.",
    ],
  },
  {
    heading: "Indemnification",
    paragraphs: [
      "You agree to defend, indemnify and hold harmless t54 Labs and its affiliates, officers, employees, contractors and agents from and against any claims, liabilities, damages, losses and expenses, including reasonable legal fees, arising out of or related to your use of the hub, any listing or content you submit, your dealings with any third-party service, your on-chain transactions or agent activity, or your breach of these Terms or of any applicable law or third-party right.",
      "Where applicable law limits a consumer's obligation to indemnify, this section applies only to the extent permitted by that law.",
    ],
  },
  {
    heading: "Changes to the hub and to these terms",
    paragraphs: [
      "We may add, change, suspend or discontinue any part of the hub — including directory listings, data displays and linked resources — at any time and without notice or liability.",
      "We may also update these Terms from time to time. When we do, we will revise the \"Last updated\" date above and post the current version on the hub. Changes take effect when posted, and your continued use of the hub after they take effect constitutes acceptance of the revised Terms.",
    ],
  },
  {
    heading: "Governing law and dispute resolution",
    paragraphs: [
      "These Terms, and any dispute arising out of or relating to them or to your use of the hub, are governed by the laws of the State of Delaware, United States, without regard to its conflict-of-laws rules.",
      "Before bringing any formal proceeding, you agree to first contact us at support@t54.ai and attempt in good faith to resolve the dispute informally. If it cannot be resolved within a reasonable period, the dispute will be subject to the exclusive jurisdiction of the courts of the State of Delaware, United States, except where applicable mandatory law gives you the right to bring proceedings elsewhere.",
    ],
  },
  {
    heading: "General",
    paragraphs: [
      "If any provision of these Terms is found unenforceable, the remaining provisions will stay in full effect. Our failure to enforce any provision is not a waiver of it. You may not assign or transfer your rights or obligations under these Terms without our consent; we may assign ours to an affiliate or successor without notice or your consent.",
      "These Terms, together with our Privacy Policy and any notices applicable to the linked facilitator, SDKs and documentation, constitute the entire agreement between you and us regarding the hub and supersede any prior understandings. We are not liable for any failure or delay in performance caused by events beyond our reasonable control.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalDoc
      eyebrow="Legal"
      title="Terms & Conditions"
      lastUpdated="June 24, 2026"
      intro={"XRPL AI is an ecosystem hub at xrpl-ai.org that catalogs x402-enabled, agent-payable services on the XRP Ledger and displays public, on-chain settlement data from XRPL mainnet. The hub is built and operated by T54 Labs Inc. (\"t54 Labs,\" \"we,\" \"us,\" or \"our\"). These Terms & Conditions (\"Terms\") govern your access to and use of the website and the informational features it provides. By accessing or using the hub, you agree to be bound by these Terms; if you do not agree, do not use the hub."}
      sections={SECTIONS}
      contact={"Questions about these Terms can be sent to support@t54.ai; for privacy or data requests, contact privacy@t54.ai."}
    />
  );
}
