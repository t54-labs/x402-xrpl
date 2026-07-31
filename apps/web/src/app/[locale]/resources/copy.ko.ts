// Korean copy for the Resources page — proofread by the KR team, 2026-07-31.
export const RESOURCES_KO = {
  "groups": [
    {
      "title": "개발자 툴 & SDK",
      "blurb": "XRPL에서 AI 에이전트로부터 결제를 받는 데 필요한 모든 툴을 제공합니다. t54의 자체 개발 툴과 공식 XRPL 툴킷(toolkit)을 함께 확인할 수 있습니다.",
      "items": [
        {
          "name": "x402-xrpl — TypeScript SDK",
          "description": "Express 미들웨어인 requirePayment + x402Fetch 구매자 클라이언트 + 통화 단위 헬퍼 + Verifiable Intent."
        },
        {
          "name": "x402-xrpl — Python SDK",
          "description": "FastAPI/Starlette 헬퍼 + 사전 서명 결제 클라이언트로, TS SDK와 동일한 사용성을 제공합니다."
        },
        {
          "name": "t54 x402 Facilitator",
          "description": "미리 서명된 XRPL 결제를 검증(verify)하고 정산(settle)해 주는 호스팅 서비스입니다. 자산을 직접 보관하지 않고, API 키도 필요 없습니다. 메인넷과 테스트넷을 지원합니다."
        },
        {
          "name": "x402 Secure — Verifiable Intent",
          "description": "Know-Your-Agent 자격 증명, 소유자→AI 에이전트 위임, 결제 건별 리스크 검사를 정산 전에 강제합니다(L1–L3)."
        },
        {
          "name": "Verifiable Intent",
          "description": "상거래에서 AI 에이전트에게 권한을 주는 방법을 정한 공개 규격입니다. 위조 여부를 확인할 수 있는 위임 체인으로, AI 에이전트의 행동을 사람이 승인한 범위 안에 묶습니다."
        },
        {
          "name": "Virtuals — Agent Commerce Protocol (ACP)",
          "description": "AI 에이전트끼리 서로를 찾고, 계약하고, 정산하는 방식을 정한 Virtuals의 표준입니다. 지금은 Base 체인에서 운영 중이며, XRPL 지원이 곧 추가됩니다."
        },
        {
          "name": "RLUSD CLI",
          "description": "XRP Ledger와 Ethereum(+ L2)을 지원하는, RLUSD(미국 달러에 1:1로 연동된 디지털 화폐)용 멀티체인 명령줄 도구입니다. 트러스트 라인(해당 토큰을 받을 수 있게 하는 계정 설정)과 결제, XRPL 기본 거래소(DEX) & 자동 환전 풀(AMM) 거래, EVM에서의 Uniswap·Aave, Wormhole 브리징, 암호화 지갑, x402 유료 요청, JSON 출력을 제공합니다."
        },
        {
          "name": "XRPL CLI — xrpl-up",
          "description": "XRPL 로컬 개발과 스크립트 작업을 위한 Ripple의 명령줄 도구입니다. 자금이 미리 들어 있는 계정으로 내 컴퓨터에 연습용 환경을 띄우고, 스크립트를 실행하고, 스냅샷을 관리하고, 테스트넷/데브넷에 접속할 수 있습니다. Claude Code 플러그인도 제공합니다."
        },
        {
          "name": "RLUSD Skills",
          "description": "RLUSD CLI를 감싼 Claude / MCP 에이전트 스킬입니다. 거래 한 건마다 지출 한도를 적용합니다."
        },
        {
          "name": "ClawCredit",
          "description": "AI 에이전트를 위한 신용 서비스입니다. t54의 리스크 엔진이 심사합니다."
        },
        {
          "name": "XRPL agentic-transactions docs",
          "description": "AI 에이전트 구축을 위한 공식 XRPL 가이드입니다. Agent Wallet Skill, Payments Skill, 보안 모델을 다룹니다."
        },
        {
          "name": "XRPL Docs MCP Server",
          "description": "AI 에이전트가 XRPL 공식 문서를 정확한 근거로 삼아 찾아볼 수 있게 해 주는 공식 MCP 서버입니다."
        },
        {
          "name": "XRPL Commons — xrpl-dev-skills",
          "description": "커뮤니티가 관리하는 XRPL 개발용 AI 에이전트 스킬입니다."
        }
      ]
    },
    {
      "title": "더 빠른 출시",
      "blurb": "XRPL-AI 프로젝트의 시작과 성장을 지원하는 프로그램 및 액셀러레이터를 만나보세요.",
      "items": [
        {
          "name": "XRPL Commons — Aquarium & HAKS",
          "description": "AI & 블록체인 트랙을 포함하는 레지던시(Residency) 프로그램과 해커톤입니다."
        },
        {
          "name": "Tenity — XRPL Accelerator",
          "description": "XRPL 개발팀을 기수 단위로 모아 키우는 성장 지원 프로그램입니다."
        },
        {
          "name": "Brinc — XRPL Hong Kong Accelerator",
          "description": "XRPL 스타트업을 위한 홍콩의 성장 지원 프로그램입니다."
        },
        {
          "name": "XRPL Grants",
          "description": "XRP Ledger 위에서 개발하는 오픈소스 프로젝트에 자금을 지원합니다."
        },
        {
          "name": "Ripple Swell (formerly Apex)",
          "description": "Ripple의 대표 행사입니다. 기존에 Apex라는 이름으로 열리던 XRPL 개발자 프로그램이 이 행사로 통합되었습니다."
        }
      ]
    }
  ],
  "strings": {
    "kicker": "자료",
    "h1": "XRPL 위에서 개발하기 위한\n툴킷(Toolkit)",
    "intro": "개발에 필요한 도구 및 출시를 위한 프로그램까지 준비했습니다. AI 에이전트가 바로 호출해 쓸 수 있는 실서비스를 찾고 계신가요? 디렉터리를 확인하세요. 자산 보관, 지갑, 운영 같은 개발 및 기술 관련 질문은 엔지니어링 FAQ에서 다룹니다.",
    "cta_title": "서비스를 등록하고 싶으신가요?",
    "cta_sub": "x402 엔드포인트를 XRPL AI 생태계에 추가하세요.",
    "cta_button": "등록하기"
  }
} as const;
