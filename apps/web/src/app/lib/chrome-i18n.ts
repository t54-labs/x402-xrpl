// Shared chrome (nav / footer / FAQ shell) strings per locale.
// Plain data module — importable from server and client components alike.
import type { Locale } from "./i18n";

export type ChromeStrings = {
  nav: { index: string; agentLeague: string; build: string; resources: string; faq: string; directory: string; why: string; transactions: string; merchants: string; agora: string };
  badgeMainnet: string;
  footer: { terms: string; privacy: string };
  faq: {
    kicker: string;
    questionsLabel: string;
    h1: string; // two lines separated by \n
    intro: string; // contains {buildGuide}
    buildGuide: string;
    sections: string;
    filterPlaceholder: string;
    filterAria: string;
    noMatch: string;
    noMatchSub: string; // contains {email}
    ask: string;
    copied: string;
    link: string;
    copyAria: string;
    metaTitle: string;
    metaDesc: string;
  };
};

const en: ChromeStrings = {
  nav: { index: "Index", agentLeague: "Agent League", build: "Build", resources: "Resources", faq: "FAQ", directory: "Directory", why: "Why XRPL", transactions: "Transactions", merchants: "Merchants", agora: "Agora" },
  badgeMainnet: "XRPL Mainnet",
  footer: { terms: "Terms", privacy: "Privacy" },
  faq: {
    kicker: "Engineering FAQ",
    questionsLabel: "questions",
    h1: "The answers your\nengineers will ask for",
    intro:
      "How x402 agent payments work on XRPL, in the detail an integration review actually needs — protocol and wire format, SDKs, wallet mechanics, custody, Verifiable Intent, and operations. Every answer is deep-linkable: hover a question and copy its link to share one answer with your team. New to the stack? Start with the {buildGuide}, then come back here for the hard questions.",
    buildGuide: "Build guide",
    sections: "Sections",
    filterPlaceholder: "Filter questions — try “trust line”, “custody”, “fees”…",
    filterAria: "Filter questions",
    noMatch: "No questions match",
    noMatchSub: "Ask us directly at {email} — we fold real integration questions back into this page.",
    ask: "Ask engineering",
    copied: "Copied",
    link: "Link",
    copyAria: "Copy link to this question",
    metaTitle: "Engineering FAQ",
    metaDesc:
      "Technical answers for teams integrating x402 agent payments on XRPL — protocol, SDKs, wallets, custody, Verifiable Intent, facilitator operations, and the Index.",
  },
};

const ko: ChromeStrings = {
  "nav": {
    "index": "거래 인덱스",
    "agentLeague": "에이전트 리그",
    "build": "개발 시작",
    "resources": "자료",
    "faq": "FAQ",
    "directory": "디렉터리",
    "why": "왜 XRPL인가",
    "transactions": "트랜잭션",
    "merchants": "머천트",
    "agora": "아고라"
  },
  "badgeMainnet": "XRPL 메인넷",
  "footer": {
    "terms": "이용약관",
    "privacy": "개인정보 처리방침"
  },
  "faq": {
    "kicker": "엔지니어링 FAQ",
    "questionsLabel": "질문",
    "h1": "개발자들이 궁금해 할만한 사항",
    "intro": "XRPL에서 x402 에이전트 결제가 어떻게 작동하는지, 프로토콜과 와이어 포맷, SDK, 지갑 동작 원리, 커스터디, Verifiable Intent, 그리고 운영까지 포함해 인터그레이션(integration) 검토에 실제로 필요한 정도로 자세히 다룹니다. 모든 답변은 딥링크가 가능합니다. 질문 위에 마우스를 올려 링크를 복사하면 특정 답변만 팀에 전달할 수 있습니다. 이 스택이 처음이라면 {buildGuide}부터 시작하시고, 질문이 생기면 해당 페이지로 돌아오시면 됩니다.",
    "buildGuide": "빌드 가이드",
    "sections": "섹션",
    "filterPlaceholder": "질문 필터링 — “트러스트 라인”, “커스터디”, “수수료” 등으로 검색해 보세요",
    "filterAria": "질문 필터링",
    "noMatch": "일치하는 질문이 없습니다",
    "noMatchSub": "{email}로 직접 문의해 주세요 — 실제 연동 질문은 답변과 함께 이 페이지에 다시 반영됩니다.",
    "ask": "엔지니어링 팀에 문의",
    "copied": "복사됨",
    "link": "링크",
    "copyAria": "이 질문의 링크 복사",
    "metaTitle": "엔지니어링 FAQ",
    "metaDesc": "XRPL에서 x402 에이전트 결제를 연동하는 팀을 위한 기술 답변 — 프로토콜, SDK, 지갑, 커스터디, Verifiable Intent, facilitator 운영, 그리고 인덱스까지."
  }
};

export const CHROME: Record<Locale, ChromeStrings> = { en, ko };
