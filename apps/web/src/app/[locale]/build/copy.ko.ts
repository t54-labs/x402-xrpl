// Korean copy for the Build page — proofread by the KR team, 2026-07-31.
export const BUILD_KO = {
  "why": [
    {
      "spec": "Native DEX · auto-bridging",
      "title": "어떤 자산이든 1번의 결제로",
      "body": "AI 에이전트는 XRP로 결제하고, 머천트(merchant)는 RLUSD를 받습니다. 이 모든 교환은 XRPL 프로토콜 내장 DEX를 거쳐 전부 성공하거나 전부 취소되는 방식으로 처리됩니다. 별도의 스왑 절차도, 중간 라우터나 브릿지도, 중간에 멈춘 어중간한 상태도 존재하지 않습니다. 범용 체인에서는 승인 → 스왑 → 지불 단계를 각각 따로 수행해야 하며, 각 단계에서 개별적으로 실패를 할 수도 있습니다."
    },
    {
      "spec": "XLS-70 / XLS-80",
      "title": "Know-Your-Agent, 프로토콜 단에서",
      "body": "렛저의 Credentials와 Permissioned Domains를 활용하여, 상대 노드는 발행 기관이 서명한 어테스테이션(Attestation - KYC 완료, 제재 대상 아님)을 렛저 위에서 직접 검증할 수 있습니다. KYA(Know-Your-Agent)는 미들웨어를 거치지 않고 정산 시점에 프로토콜 레벨에서 강제되며, 어테스테이션(Attestation) 뒤에 숨겨진 개인정보는 전혀 노출되지 않습니다."
    },
    {
      "spec": "DepositAuth · Freeze / Clawback",
      "title": "허용 목록과 발행자 구제 수단",
      "body": "수신자는 크레덴셜을 보유한 송신자의 자산만 받도록 제한할 수 있습니다. 규제 대상 토큰의 발행자는 분쟁이 발생하거나 탈취된 잔액을 Freeze로 동결하거나 Clawback으로 회수할 수 있습니다(XLS-39). 커스터디 없이도 확실한 구제 수단을 확보할 수 있으며, 동시에 기본 레이어의 XRP 결제는 최종성(*한 번 확정되면 되돌릴 수 없음)을 그대로 유지합니다."
    },
    {
      "spec": "Escrow · Payment Channels",
      "title": "프로그래머블 정산",
      "body": "Escrow에 대금을 잠가 두고, 증명이 제출되거나 기한이 되면 지급되게 할 수 있습니다. 또는 호출 한 건 단위의 소액 결제를 Payment Channel로 이어 보낸 뒤, 렛저 위에서 한 번에 정산할 수 있습니다. 조건이 붙거나 아주 잦은 머신 간 결제를, 직접 만들고 일일이 점검해야 하는 별도의 스마트 컨트랙트 없이 구현합니다."
    },
    {
      "spec": "Mastercard Verifiable Intent",
      "title": "자금이 움직이기 전에, 권한이 증명됩니다",
      "body": "x402 Secure는 Verifiable Intent 체인을 구현합니다. 이 체인은 Know-Your-Agent Credential, 지출 한도가 포함된 소유자 서명 위임, 그리고 결제 건별 에이전트 서명으로 구성되며, 정산 전에 사용자의 리스크 정책과 대조해 검증됩니다. Verifiable Intent는 Mastercard의 프레임워크(Agent Pay for Machines)이며, 리플과 t54 랩스가 공식 파트너로 참여하고 있습니다."
    }
  ],
  "flow": [
    {
      "n": "01",
      "title": "AI 에이전트가 유료 서비스를 요청합니다",
      "body": "결제가 붙어 있지 않은, 엔드포인트로 보내는 일반적인 HTTP 요청입니다. 주고받는 내용에 아직 특별한 것은 없습니다 — 일반 GET 요청일 뿐입니다."
    },
    {
      "n": "02",
      "title": "서버가 402로 응답합니다",
      "body": "x402는 HTTP 402를 실제 결제 절차로 만듭니다. PAYMENT-REQUIRED 헤더(응답에 함께 실려 오는 안내 정보)에는 결제 방식(exact), 네트워크(xrpl:0), 자산(RLUSD 또는 XRP), 금액, 받는 주소(payTo), 그리고 한 번만 쓰는 청구서 번호(invoiceId)가 담깁니다."
    },
    {
      "n": "03",
      "title": "AI 에이전트가 XRPL Payment에 서명합니다",
      "body": "AI 에이전트는 해당 invoiceId를 (Memos와 InvoiceID 필드에) 묶어 넣은 Payment를 만들고 서명합니다. 그런 다음 PAYMENT-SIGNATURE 헤더를 붙여 요청을 다시 보냅니다. AI 에이전트의 서명 키는 에이전트 밖으로 절대 나가지 않습니다."
    },
    {
      "n": "04",
      "title": "facilitator가 검증하고 정산합니다",
      "body": "t54가 서명된 거래를 검증합니다 — Verifiable Intent 체인과 리스크 정책이 있으면 함께 검사합니다. 그다음 XRPL에 제출합니다. 약 4초 뒤 서버는 요청한 자료와 함께 정상 응답(200)을 반환하고, PAYMENT-RESPONSE 헤더에는 정산된 거래의 고유 번호(해시)가 담깁니다."
    }
  ],
  "steps": [
    {
      "n": "1",
      "title": "SDK 설치",
      "body": "개발용 도구 모음(SDK)은 패키지 하나면 됩니다. TypeScript 또는 Python을 선택하세요. 서버 미들웨어, 구매자 클라이언트, Verifiable Intent 헬퍼가 함께 제공됩니다.",
      "code": "npm i x402-xrpl  ·  pip install x402-xrpl"
    },
    {
      "n": "2",
      "title": "서버 라우트에 결제 게이트 적용",
      "body": "어떤 라우트든 requirePayment로 감싸면 됩니다. 가격, 자산(RLUSD는 발행자 지정이 필요하고, XRP는 drops 단위로 가격을 지정), 지급받을 주소, facilitator URL을 설정하세요. 이제 결제되지 않은 요청에는 자동으로 402가 반환됩니다. 핸들러는 결제가 정산된 뒤에만 실행됩니다."
    },
    {
      "n": "3",
      "title": "AI 에이전트로 결제하기",
      "body": "구매자 클라이언트에 지갑과 네트워크를 지정하고, fetch를 쓰듯 URL을 호출하세요. 402 응답을 받으면 클라이언트가 결제 요건을 고르고, Payment에 서명한 뒤 다시 요청해 응답을 돌려줍니다. 이 전체 과정이 await 한 번에 끝납니다."
    },
    {
      "n": "4",
      "title": "Verifiable Intent 추가(권장)",
      "body": "AI 에이전트가 스스로 지출하게 하려면 Verifiable Intent 제공자를 연결하세요. 신원 증명(L1) → 소유자 위임(L2) → 결제 건별 서명(L3)으로 이어지는 3단계 체인을 발급하고, 지출 한도를 함께 묶습니다. facilitator는 정산 전에 이 체인과 리스크 정책을 검사합니다. 처음에는 선택 사항이지만, 실서비스 에이전트에는 기본값으로 두는 것이 맞습니다."
    }
  ],
  "refs": [
    {
      "label": "x402-xrpl SDK",
      "href": "https://www.npmjs.com/package/x402-xrpl",
      "note": "npm · PyPI · TypeScript + Python"
    },
    {
      "label": "x402 Facilitator",
      "href": "https://xrpl-x402.t54.ai",
      "note": "호스팅 verify + settle · 자산 보관 없음"
    },
    {
      "label": "x402 Secure — Verifiable Intent",
      "href": "https://www.t54.ai/x402-secure",
      "note": "KYA + 위임 + 정산 전 리스크 검사"
    },
    {
      "label": "XRPL AI 에이전트 문서",
      "href": "https://xrpl.org/docs/agents/getting-started-with-agentic-transactions",
      "note": "공식 지갑 + 결제 스킬"
    }
  ],
  "strings": {
    "kicker": "Build · x402 on XRPL",
    "h1": "AI 에이전트 경제를\nXRPL 위에 구축하세요",
    "intro": "x402는 HTTP 402 규격을 실제로 구현합니다. 서버가 요청에 대해 가격으로 응답하면, AI 에이전트가 XRPL Payment에 서명합니다. 이어 t54 Facilitator가 이를 검증하여 몇 초 만에 온체인 정산을 완료합니다. 자산 수탁도, API 키도 필요 없습니다. XRPL이 머신 결제의 핵심 인프라인 이유, 그리고 첫 유료 엔드포인트(endpoint)를 출시하는 방법을 지금 확인해 보세요.",
    "part01": "왜 XRPL인가",
    "part02": "작동 방식",
    "part03": "구축하기",
    "part04": "레퍼런스",
    "why_h2": "범용 체인이 AI 에이전트에게 주지 못하는 것 — XRPL 프로토콜에는 내장되어 있습니다",
    "why_p": "“빠르고 저렴하다”는 기본 전제일 뿐입니다. AI 에이전트 상거래에서 XRPL의 강점은 기관 친화적이고 결제에 특화되어 있다는 점입니다. 신원 확인, 구제 수단, 조건부 정산이 별도로 신뢰해야 하는 컨트랙트가 아니라 렛저 자체에 들어 있습니다.",
    "how_h2": "요청 하나, 서명된 Payment 하나, 정산 하나",
    "how_p": "x402는 HTTP 위에서 그대로 동작하는 결제 핸드셰이크(정해진 순서로 요청과 응답을 주고받는 절차)입니다. 네 단계로 이루어지며, 모든 단계를 주고받는 내용과 렛저에서 직접 확인할 수 있습니다.",
    "build_h2": "처음부터 유료 엔드포인트까지 — 호출하는 쪽과 받는 쪽 모두",
    "ref_h2": "엔드포인트, 자산, 그리고 더 깊이 볼 자료",
    "console_caption": "서버는 라우트를 게이팅(gating)하고 · AI 에이전트는 402를 결제하며 · Verifiable Intent는 누가 얼마까지 쓸 수 있는지 바인딩(binding)합니다. TS / PY로 전환할 수 있습니다.",
    "panel_facilitator_title": "호스팅 facilitator",
    "panel_assets_title": "자산 및 금액",
    "cta_list": "엔드포인트 등록하기",
    "link_faq": "엔지니어링 FAQ →",
    "link_resources": "모든 자료 보기 →",
    "link_why": "XRPL을 선택해야 하는 모든 이유 →",
    "mainnet_label": "메인넷 · xrpl:0",
    "testnet_label": "테스트넷 · xrpl:1",
    "endpoints_label": "엔드포인트",
    "xrp_label": "XRP",
    "xrp_value": "drops 단위로 가격 지정 (1,000,000 drops = 1 XRP)",
    "iou_label": "RLUSD / 발행 토큰(IOU)",
    "iou_value": "십진수 금액 + 발행자 주소(issuer)",
    "networks_label": "네트워크"
  }
} as const;
