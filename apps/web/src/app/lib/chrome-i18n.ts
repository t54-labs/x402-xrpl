// Shared chrome (nav / footer / FAQ shell) strings per locale.
// Plain data module — importable from server and client components alike.
import type { Locale } from "./i18n";

export type ChromeStrings = {
  nav: { index: string; build: string; resources: string; faq: string; directory: string; why: string; transactions: string; merchants: string; agora: string };
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
  nav: { index: "Index", build: "Build", resources: "Resources", faq: "FAQ", directory: "Directory", why: "Why XRPL", transactions: "Transactions", merchants: "Merchants", agora: "Agora" },
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
    "build": "개발 시작",
    "resources": "자료",
    "faq": "FAQ",
    "directory": "생태계 목록",
    "why": "왜 XRPL인가",
    "transactions": "거래 내역",
    "merchants": "가맹점",
    "agora": "아고라"
  },
  "badgeMainnet": "XRPL 메인넷(실제 운영망)",
  "footer": {
    "terms": "이용약관",
    "privacy": "개인정보 처리방침"
  },
  "faq": {
    "kicker": "엔지니어링 FAQ",
    "questionsLabel": "질문",
    "h1": "개발팀이 꼭 물어볼\n질문에 대한 답",
    "intro": "XRPL에서 x402 AI 에이전트(사람 대신 자동으로 일하는 인공지능 프로그램) 결제가 어떻게 동작하는지, 연동 검토에 실제로 필요한 깊이로 설명합니다. 프로토콜(통신 규칙)과 실제 주고받는 데이터 형식, SDK(개발에 바로 쓰는 도구 모음), 지갑 동작 원리, 자산 보관 방식, Verifiable Intent(결제 지시가 본인 뜻이 맞는지 확인하는 장치), 그리고 운영까지 다룹니다. 모든 답변에는 바로 공유할 수 있는 고유 링크가 있습니다. 질문 위에 마우스를 올려 링크를 복사하면, 필요한 답변 하나만 팀에 정확히 전달할 수 있습니다. 이런 개발이 처음이라면 {buildGuide}부터 보시고, 어려운 질문이 생기면 이 페이지로 돌아오세요.",
    "buildGuide": "개발 시작 가이드",
    "sections": "목차",
    "filterPlaceholder": "질문 검색 — “수수료”, “지갑”, “자산 보관” 같은 말로 찾아보세요",
    "filterAria": "질문 검색",
    "noMatch": "일치하는 질문이 없습니다",
    "noMatchSub": "{email}로 직접 문의해 주세요. 실제 연동에서 나온 질문은 답변과 함께 이 페이지에 다시 추가됩니다.",
    "ask": "엔지니어링 팀에 문의",
    "copied": "복사 완료",
    "link": "링크",
    "copyAria": "이 질문의 링크 복사",
    "metaTitle": "엔지니어링 FAQ",
    "metaDesc": "XRPL에서 x402 AI 에이전트 결제를 연동하는 팀을 위한 기술 답변 — 프로토콜, SDK(개발에 바로 쓰는 도구 모음), 지갑, 자산 보관, Verifiable Intent(결제 지시가 본인 뜻이 맞는지 확인하는 장치), facilitator(결제 중개 서비스) 운영, 그리고 거래 기록을 모아 보여 주는 인덱스까지."
  }
};

export const CHROME: Record<Locale, ChromeStrings> = { en, ko };
