// Korean copy for the Why XRPL page — proofread by the KR team, 2026-07-31.
export const WHY_XRPL_KO = {
  "groups": [
    {
      "n": "01",
      "label": "여러 자산을 한 번에 정산",
      "items": [
        {
          "spec": "Native DEX · auto-bridging",
          "title": "한 번의 결제로 어떤 자산이든",
          "why": "AI 에이전트는 XRP로 결제하고, 머천트는 RLUSD를 받습니다. 모든 과정이 하나의 트랜잭션으로 완료됩니다. 별도의 스왑도, 라우터도, 브리지도 필요 없으며, 중간에 일부만 처리된 상태도 남지 않습니다.",
          "body": "XRPL의 네이티브 Payment는 SendMax로 AI 에이전트가 지불할 최대 금액을 제한하면서, 머천트가 받을 금액은 보장합니다. 경로 탐색과 XRP 자동 브리징은 XRPL 프로토콜에 내장된 오더북(2012년부터 운영)을 통해 처리되며, 모든 과정이 한 번에 완료되거나 아예 실행되지 않습니다. 반면 범용 체인은 승인(approve), 스왑(swap), 결제(pay)를 각각 별도의 단계로 이어 붙이기 때문에, 각 단계가 개별적으로 실패할 수 있습니다."
        },
        {
          "spec": "XLS-30 · AMM",
          "title": "최적의 가격, 거래 경로는 자동 선택",
          "why": "모든 AI 에이전트 결제는 한 번의 호출 안에서 유동성 풀과 오더북을 함께 탐색해 가장 유리한 경로로 자동 처리됩니다. 에이전트가 직접 거래 경로를 선택할 필요가 없습니다.",
          "body": "XLS-30은 AMM을 렛저에 기본 내장된 객체로 구현합니다. AMM은 오더북과 통합되어 하나의 Payment가 유동성 풀, 오더북, 또는 둘 모두를 활용해 최적의 가격을 찾습니다. 반면 다른 체인에서는 AMM이 별도로 배포된 스마트 컨트랙트이기 때문에, 에이전트가 직접 연동하고 라우팅도 직접 구현해야 합니다."
        }
      ]
    },
    {
      "n": "02",
      "label": "신원 확인과 권한 관리, 기본 내장",
      "items": [
        {
          "spec": "XLS-70 · XLS-80",
          "title": "Know-Your-Agent, 렛저의 기본 기능",
          "why": "거래 상대방은 발급 기관이 서명한 증명을 렛저에서 바로 검증할 수 있으며, 그 과정에서 개인정보를 확인할 필요는 없습니다.",
          "body": "렛저의 Credentials를 활용하면, 신뢰받는 발급 기관은 AI 에이전트 계정이 KYC를 완료했거나 제재 대상이 아님을 해당 XRPL 주소에 연결해 증명할 수 있습니다. Permissioned Domains는 {issuer, credential} 쌍을 재사용 가능한 허용 목록으로 구성합니다. 규정 준수는 애플리케이션 로직에 숨겨지는 대신, 체인 위에서 선언적으로 표현됩니다."
        },
        {
          "spec": "DepositAuth · DepositPreauth",
          "title": "검증된 상대만 허용",
          "why": "받는 AI 에이전트는 발급 기관이 서명한 필요한 Credentials를 가진 송신자의 입금만 허용하고, 나머지는 모두 거부할 수 있습니다.",
          "body": "DepositAuth는 요청하지 않은 입금을 기본적으로 차단합니다. DepositPreauth는 특정 계정 또는 Credential 세트를 만족하는 모든 계정을 허용 목록에 추가합니다. 거래 상대를 하나씩 등록할 필요 없이 필요한 Credential 유형만 한 번 허용하면 되며, 이 규칙은 Payment 경로 자체에서 강제됩니다."
        }
      ]
    },
    {
      "n": "03",
      "label": "통제와 구제 수단",
      "items": [
        {
          "spec": "XLS-39 · Freeze / Clawback",
          "title": "수탁기관 없이도 가능한 분쟁 구제",
          "why": "AI 에이전트 계정이 해킹되거나 제재 대상이 되거나 분쟁이 발생하면, 토큰 발행자는 렛저에서 자금을 동결하거나 회수할 수 있습니다.",
          "body": "기본 XRP Payment는 한 번 확정되면 되돌릴 수 없습니다. 반면 규제를 받는 발행 토큰에는 발행자 수준에서 의도적으로 되돌릴 수 있는 기능이 포함되어 있습니다. Freeze는 잔액을 동결하고, Clawback은 이미 유통된 토큰을 회수합니다. 이러한 비대칭성이 기관 자금을 위한 현실적인 분쟁 처리 방식이며, '무조건 차지백이 없다'는 식의 일괄적인 주장과는 다릅니다."
        },
        {
          "spec": "SignerListSet · multi-sig",
          "title": "서명은 AI 에이전트가, 통제는 소유자가",
          "why": "AI 에이전트는 서명 키를 갖지만 혼자서는 자금을 이동할 수 없습니다. 소유자 또는 정책 서비스가 정족수를 충족하도록 함께 서명해야 합니다.",
          "body": "SignerList는 최대 32명의 서명자와 각 서명자의 가중치, 그리고 정족수(quorum)를 설정할 수 있습니다. 이를 통해 사람이 개입하는 승인, 여러 명 중 일정 수 이상의 서명이 필요한(m-of-n) 자금 관리, 그리고 계정 주소를 바꾸지 않는 키 교체를 구현할 수 있습니다. 소유자는 언제든 우선권을 행사할 수 있으며, AI 에이전트의 키 하나가 유출되더라도 시스템 전체가 무너지지는 않습니다."
        }
      ]
    },
    {
      "n": "04",
      "label": "조건을 걸 수 있는 정산",
      "items": [
        {
          "spec": "Payment Channels",
          "title": "호출 단위 결제, 서명만큼 빠르게",
          "why": "호출마다 렛저 트랜잭션을 발생시키지 않고도, 머신 간 요청 단위의 사용량 기반 과금을 구현할 수 있습니다.",
          "body": "소유자는 API 또는 AI 에이전트 제공자와 결제 채널을 하나 열어 둡니다. 이후 각 추론 호출이나 데이터 조각은 오프렛저에서 서명한 claim으로 결제하며, 가장 최신의 누적 claim만 렛저에서 정산됩니다. 또한 settle-delay가 제공자에게 claim을 제출할 수 있는 기간을 보장합니다. 1센트 미만의 고빈도 머신 간 결제를 위한 기본 구성 요소입니다."
        },
        {
          "spec": "Escrow · Token Escrow",
          "title": "증명 가능한 조건부 지급",
          "why": "AI 에이전트는 대금을 먼저 잠가 두고, 암호학적 증명이 제출되거나 기한이 도래했을 때만 지급되도록 합니다.",
          "body": "Escrow는 PREIMAGE-SHA-256 조건이 충족되거나 지정된 기간이 지나면 지급되며, 자동 환불 절차가 있어 자금이 영구적으로 묶이는 일이 없습니다. Token Escrow는 이를 RLUSD와 같은 트러스트 라인(해당 토큰을 받을 수 있게 하는 계정 설정) 기반 토큰까지 확장합니다. 별도의 escrow 스마트 컨트랙트를 작성하거나 감사할 필요 없이, 머신 간 신뢰 없는(trustless) 정산을 구현할 수 있습니다."
        }
      ]
    }
  ],
  "strings": {
    "meta_title": "왜 XRPL인가",
    "meta_description": "XRPL을 AI 에이전트 상거래의 결제 기반으로 만드는 기관급 정산·규정 준수 체계 — 신원 확인, 구제 수단, 조건부 정산이 프로토콜에 기본으로 내장되어 있습니다.",
    "kicker": "왜 XRPL인가",
    "h1": "결제를 위해 만들어진 레일",
    "h1_accent": "결제",
    "intro": "“빠르고 즉시 확정된다”는 것은 이제 기본 조건입니다. 모든 레이어 1이 그렇게 주장합니다. XRPL의 강점은 범용 체인에는 없는 기능이 프로토콜 자체에 내장되어 있다는 점입니다. 14년간 운영된 하나의 렛저 위에 기관 수준의 정산 및 규정 준수 체계를 갖추고 있으며, 신원 확인, 구제 수단, 조건부 결제가 모두 체인에 기본 내장되어 있습니다. AI 에이전트가 신뢰해야 하고 사용자가 직접 감사해야 하는 스마트 컨트랙트에 덧붙인 기능이 아닙니다.",
    "section_05_h2": "Verifiable Intent",
    "mastercard_logo_alt": "Mastercard",
    "mastercard_panel_label": "Mastercard · Agent Pay for Machines",
    "vi_h3": "자금이 이동하기 전에 권한이 증명됩니다.",
    "vi_p1": "Verifiable Intent는 자격 증명과 사용자 동의를 기반으로 하는 AI 에이전트 결제를 위한 마스터카드의 프레임워크입니다. Agent Pay for Machines(2026년 6월)와 함께 발표되었으며, 구글의 Agent Payments Protocol(AP2)과 함께 작동하도록 구글과 공동 개발되었고, 표준화를 위해 FIDO Alliance에 제출되었습니다.",
    "vi_p2": "t54의 x402 Secure는 이 Verifiable Intent 체인을 XRPL 위에 구현합니다. 이 체인은 Know-Your-Agent 자격 증명(L1), 지출 한도가 포함된 소유자 서명 위임(L2), 결제 건별 AI 에이전트 서명(L3)으로 구성됩니다. facilitator는 결제가 확정되기 전에 이 체인을 설정된 리스크 정책에 따라 검증합니다. 권한은 사후에 로그로 주장되는 것이 아니라, Payment 경로에서 미리 증명됩니다.",
    "closing_h2": "차별점은 코인이 아니라 기술 스택입니다.",
    "closing_p": "AI 에이전트가 규칙이 실제로 적용되는 환경에서 거래하는 데 필요한 모든 것이 프로토콜에 내장되어 있습니다. 신원 확인, 허용 목록, 발행자의 구제 수단, 조건부 정산, 여러 자산 결제는 물론, destination tag를 활용해 하나의 facilitator 주소로 들어오는 결제를 여러 AI 에이전트별로 구분해 처리하는 native sub-account routing과, gas war이나 MEV를 고려할 필요가 없는 소각 기반의 비경매 수수료 모델까지 제공합니다. RLUSD와 XRP는 이 위에서 정산되며, t54 facilitator는 자산을 보관하지 않습니다.",
    "cta_build": "개발 시작하기",
    "cta_toolkit": "툴킷 살펴보기",
    "footnote_mastercard": "Mastercard, Mastercard Agent Pay, Agent Pay for Machines 및 Verifiable Intent는 Mastercard International Incorporated의 상표입니다. 본 언급은 공개적으로 발표된 파트너 관계를 반영한 것이며, Agent Pay for Machines에서의 명명된 파트너(named-partner) 역할을 넘어서는 보증이나 공식적 또는 배타적 파트너십을 시사하지 않습니다."
  }
} as const;
