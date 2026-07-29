// Korean FAQ content — generated from the translation pass, hand-editable.
// Structure mirrors FAQ_CATEGORIES in ./faq-data (ids and hrefs must match).
import type { FaqCategory } from "./faq-data";

export const FAQ_CATEGORIES_KO: FaqCategory[] = [
  {
    "id": "protocol",
    "title": "프로토콜과 시스템 구조",
    "blurb": "XRPL 위의 x402가 실제로 무엇인지 다룹니다. 또한 AI 에이전트(사람 대신 자동으로 일하는 인공지능 프로그램)의 결제가 통신 과정과 원장(모든 거래가 기록되는 장부)에 어떤 모습으로 남는지 살펴봅니다.",
    "items": [
      {
        "id": "what-is-x402-xrpl",
        "q": "x402란 무엇이며, XRPL에서는 어떻게 동작합니까?",
        "a": [
          {
            "kind": "p",
            "text": "x402는 HTTP 상태 코드 402를 실제 결제 절차(핸드셰이크)로 바꿉니다. 서버가 요청에 가격을 알려 주면 클라이언트가 결제하고, 다시 요청하면 성공합니다. 다른 블록체인(이더리움 계열, 이른바 EVM 체인)에서는 이 흐름이 스마트 컨트랙트(블록체인 위에서 자동으로 실행되는 프로그램) 위에서 동작합니다. 하지만 XRPL에는 호출할 그런 프로그램이 없습니다. 결제 자체가 XRPL 고유의 `Payment` 거래이기 때문입니다. 그래서 XRPL 결제 방식(스킴)은 대신 **미리 서명해 둔 거래 데이터(블롭)**를 사용합니다."
          },
          {
            "kind": "p",
            "text": "전체 흐름은 다음과 같습니다. (1) AI 에이전트가 여러분의 엔드포인트(접속 주소)에 요청을 보냅니다. (2) 서버는 결제 요구사항(스킴, 네트워크, 자산, 금액, `payTo`, 한 번만 쓰는 `invoiceId`)을 담은 `PAYMENT-REQUIRED` 헤더와 함께 `402`로 응답합니다. (3) AI 에이전트는 해당 인보이스(청구서) 정보를 안에 담은 XRPL `Payment` 거래에 서명하고, `PAYMENT-SIGNATURE` 헤더를 붙여 다시 요청합니다. (4) 서버는 서명된 거래 데이터를 facilitator(결제 중개 서비스)에 전달합니다. facilitator는 내용을 검증한 뒤 XRPL에 제출합니다. (5) 원장에서 검증이 끝나면, 서버는 요청받은 자료와 함께 정산된 거래 해시(거래마다 부여되는 고유 확인 번호)를 담은 `PAYMENT-RESPONSE` 헤더를 돌려줍니다."
          }
        ],
        "links": [
          {
            "label": "단계별 동작 방식",
            "href": "/build"
          },
          {
            "label": "XRPL 스킴 사양",
            "href": "https://xrpl-x402.t54.ai/docs/xrpl-scheme"
          },
          {
            "label": "x402 프로토콜",
            "href": "https://github.com/coinbase/x402"
          }
        ],
        "keywords": [
          "402",
          "http",
          "handshake",
          "payment required",
          "overview",
          "basics",
          "핸드셰이크",
          "결제 요구",
          "개요",
          "기초"
        ]
      },
      {
        "id": "wire-format",
        "q": "실제 통신으로는 정확히 무엇이 오갑니까 — 헤더, 페이로드, 버전?",
        "a": [
          {
            "kind": "p",
            "text": "오가는 메시지는 세 가지입니다. 모두 base64로 인코딩한 정규화(canonical) JSON입니다. 402 응답의 본문은 x402 **v2** `PaymentRequired`이며, 같은 내용이 `PAYMENT-REQUIRED` 헤더에도 담깁니다: `{ x402Version: 2, resource, accepts: [PaymentRequirements], extensions }`. 다시 보내는 요청에는 `PAYMENT-SIGNATURE` 헤더에 v2 `PaymentPayload`를 base64로 담아 보냅니다 — `{ x402Version: 2, accepted, payload: { signedTxBlob, invoiceId }, extensions }`. 성공 응답에는 `PAYMENT-RESPONSE` 헤더에 `{ success, transaction, network, payer }`를 base64로 담아 돌려줍니다."
          },
          {
            "kind": "p",
            "text": "각 `PaymentRequirements` 항목의 형태는 `{ scheme: \"exact\", network: \"xrpl:0|1|2\", payTo, asset, amount, maxTimeoutSeconds, extra }`입니다. `extra`에는 `invoiceId`가 들어가고, 발행 자산이라면 `issuer`도 들어갑니다. SDK가 모든 헤더의 인코딩/디코딩 도구를 제공하므로, JSON을 직접 조립할 필요는 없습니다."
          }
        ],
        "keywords": [
          "headers",
          "payment-required",
          "payment-signature",
          "payment-response",
          "schema",
          "v2",
          "wire",
          "헤더",
          "페이로드",
          "스키마",
          "와이어 포맷"
        ]
      },
      {
        "id": "onchain-footprint",
        "q": "x402 결제는 원장에 어떤 모습으로 기록됩니까?",
        "a": [
          {
            "kind": "p",
            "text": "완전히 표준적인 XRPL `Payment` 거래로 정산됩니다. 어떤 익스플로러(거래 조회 사이트)에서도 확인할 수 있습니다:"
          },
          {
            "kind": "code",
            "body": "TransactionType  \"Payment\"\nAccount          buyer (the agent's address)\nDestination      payTo (the merchant's address)\nAmount           drops for XRP · { currency, issuer, value } for RLUSD/IOUs\nSourceTag        the facilitator's tag (t54 hosted: 804681468)\nInvoiceID        SHA-256 of the invoiceId          ┐ replay\nMemos[0]         hex-encoded invoiceId             ┘ protection\nLastLedgerSequence  bounds how long the blob stays valid"
          },
          {
            "kind": "p",
            "text": "`SourceTag`(거래에 찍히는 식별 번호)는 원장에 남는 지문 역할을 합니다. 이 허브의 집계 시스템을 포함해 누구든, 그 결제를 어느 facilitator가 정산했는지 확인할 수 있습니다. 감싸서 만든 별도 토큰도, 컨트랙트 이벤트도, 원장 밖의 정산 계층도 없습니다."
          }
        ],
        "links": [
          {
            "label": "XRPL Payment 공식 문서",
            "href": "https://xrpl.org/docs/references/protocol/transactions/types/payment"
          }
        ],
        "keywords": [
          "sourcetag",
          "invoiceid",
          "memos",
          "transaction",
          "explorer",
          "on-chain",
          "온체인",
          "트랜잭션",
          "익스플로러",
          "거래"
        ]
      },
      {
        "id": "why-presigned",
        "q": "왜 미리 서명한 거래를 사용합니까? facilitator는 왜 필요합니까?",
        "a": [
          {
            "kind": "p",
            "text": "미리 서명하는 방식은 믿고 맡겨야 하는 범위를 최소한으로 줄입니다. 결제하는 쪽은 완성된 형태의 `Payment` 거래에 자기 기기에서 서명하고, **서명이 끝난 거래 데이터**만 전달합니다. facilitator가 할 수 있는 일은 이를 제출하거나 버리는 것뿐입니다. 서명을 깨뜨리지 않고서는 금액도, 목적지도, 수수료도 바꿀 수 없습니다. 키는 서명한 쪽을 벗어나지 않고, 어느 시점에도 누구도 자금을 대신 보관하지 않습니다."
          },
          {
            "kind": "p",
            "text": "facilitator가 존재하는 이유는, 서비스를 제공하는 서버마다 XRPL 인프라를 직접 운영하지 않아도 되게 하기 위해서입니다. facilitator는 거래 데이터를 해석하고, 스킴이 반드시 지키도록 정한 규칙을 확인합니다 — 금액이 인보이스와 일치하는지, 인보이스 연결 정보가 들어 있는지, 수수료가 상한 이내인지, 올바른 네트워크인지. 그다음 XRPL에 제출하고 검증을 기다립니다. 가맹점은 원장 노드와 재시도 로직을 직접 운영할 필요 없이, `/verify`와 `/settle` 두 개의 엔드포인트 규격만 다루면 됩니다."
          }
        ],
        "keywords": [
          "presigned",
          "custody",
          "trust model",
          "facilitator",
          "architecture",
          "keys",
          "사전 서명",
          "커스터디",
          "수탁",
          "신뢰 모델",
          "아키텍처",
          "키",
          "자산 보관"
        ]
      },
      {
        "id": "networks-assets",
        "q": "어떤 네트워크와 자산이 지원됩니까?",
        "a": [
          {
            "kind": "p",
            "text": "네트워크는 CAIP-2 식별자를 사용합니다: `xrpl:0`(메인넷), `xrpl:1`(테스트넷), `xrpl:2`(데브넷). t54는 메인넷용(`xrpl-facilitator-mainnet.t54.ai`)과 테스트넷용(`xrpl-facilitator-testnet.t54.ai`) facilitator를 직접 운영합니다. 테스트넷에는 테스트용 XRP를 무료로 받을 수 있는 공개 faucet이 있어서, 처음부터 끝까지 연동을 테스트해도 비용이 전혀 들지 않습니다."
          },
          {
            "kind": "p",
            "text": "자산: **XRP**는 drops 단위로 가격을 정합니다(`\"1000000\"` = 1 XRP). RLUSD(미국 달러에 1:1로 연동된 디지털 화폐)를 포함한 모든 **발행 토큰(IOU)**은 소수점 값 문자열과 발행자 주소로 가격을 정합니다. 결제 요구사항 하나는 자산 하나만 고정하지만, 서버는 `accepts[]`에 여러 선택지(예: XRP와 RLUSD)를 함께 제시해 결제하는 쪽이 고르게 할 수 있습니다."
          }
        ],
        "keywords": [
          "mainnet",
          "testnet",
          "devnet",
          "caip-2",
          "xrp",
          "rlusd",
          "iou",
          "assets",
          "networks",
          "메인넷",
          "테스트넷",
          "데브넷",
          "자산",
          "네트워크"
        ]
      },
      {
        "id": "replay-protection",
        "q": "같은 결제를 다시 쓰는 공격(리플레이)과 이중 지불은 어떻게 막습니까?",
        "a": [
          {
            "kind": "p",
            "text": "서로 독립적인 세 겹의 방어가 있습니다. **인보이스 바인딩(연결)**: 모든 결제에는 한 번만 쓰는 `invoiceId`가 반드시 들어가야 합니다. `Memos`에 hex로 넣거나, `InvoiceID`에 SHA-256 해시로 넣거나, 둘 다 넣습니다(SDK 기본값은 둘 다). facilitator는 이 연결 정보가 결제 대상 인보이스와 일치하지 않는 거래 데이터를 거부합니다. **일회용 인보이스**: 정산이 성공하면 서버 미들웨어(서버에 끼워 넣는 중간 처리 프로그램)가 그 인보이스를 사용 완료로 처리합니다. 그래서 같은 서명 데이터로 같은 자료를 두 번 살 수 없습니다. **원장 수준**: XRPL 거래는 시퀀스 번호 하나와 `LastLedgerSequence`를 갖습니다. 한 번 검증되거나 만료된 거래는 다시는 실행될 수 없습니다."
          },
          {
            "kind": "p",
            "text": "여기에 더해 `/settle`은 같은 요청을 여러 번 보내도 결과가 한 번 보낸 것과 같도록(멱등, idempotent) 만들어져 있습니다. 같은 정산 요청을 다시 보내면 두 번 제출되는 대신 저장해 둔 결과를 돌려받습니다. 첫 시도가 진행되는 동안 같은 요청이 동시에 들어오면 '이미 처리 중'이라는 오류 응답(HTTP 409)을 받습니다. 돈이 두 번 나가지는 않습니다."
          }
        ],
        "keywords": [
          "replay",
          "double spend",
          "idempotent",
          "invoice",
          "security",
          "리플레이",
          "이중 지불",
          "멱등성",
          "인보이스",
          "보안"
        ]
      },
      {
        "id": "is-it-standard",
        "q": "더 넓은 x402 생태계와 호환됩니까, 아니면 XRPL 전용으로 갈라져 나온 버전(포크)입니까?",
        "a": [
          {
            "kind": "p",
            "text": "XRPL 전용 스킴을 얹은 x402 v2 프로토콜입니다. HTTP 핸드셰이크, 헤더 이름, `PaymentRequired` / `PaymentPayload` / `SettlementResponse` 구조, 그리고 facilitator의 `/verify` · `/settle` · `/supported` 계약은 모두 x402 사양을 그대로 따릅니다. XRPL 고유의 부분은 `exact` 스킴의 페이로드뿐입니다. EVM의 `transferWithAuthorization` 대신, 미리 서명한 XRPL 고유의 `Payment` 거래 데이터를 사용합니다. 이미 x402를 지원하는 클라이언트라면 새 프로토콜을 익힐 필요 없이 XRPL 스킴 모듈만 추가하면 됩니다."
          },
          {
            "kind": "p",
            "text": "이 스킴은 facilitator 문서 사이트에 공개되어 있고, 버전도 관리됩니다. 또한 이 허브는 실제 운영 중인 XRPL 엔드포인트 목록을 x402 형식의 디스커버리 피드(서비스 목록 피드)로 게시합니다. 그래서 여러 체인을 지원하는 x402 도구가 EVM 서비스와 나란히 XRPL 서비스도 보여줄 수 있습니다."
          }
        ],
        "links": [
          {
            "label": "XRPL 스킴 사양",
            "href": "https://xrpl-x402.t54.ai/docs/xrpl-scheme"
          },
          {
            "label": "x402 사양 (Coinbase)",
            "href": "https://github.com/coinbase/x402"
          }
        ],
        "keywords": [
          "standard",
          "compatible",
          "coinbase",
          "spec",
          "interop",
          "fork",
          "표준",
          "호환성",
          "상호운용성",
          "포크",
          "사양"
        ]
      }
    ]
  },
  {
    "id": "integration",
    "title": "연동: SDK와 코드",
    "blurb": "TypeScript 또는 Python으로 엔드포인트(접속 주소)에 요금을 매기는 방법과, AI 에이전트(사람 대신 자동으로 일하는 인공지능 프로그램)로서 결제하는 방법을 다룹니다. Express나 FastAPI가 아닌 다른 개발 환경에서 대응하는 방법도 함께 다룹니다.",
    "items": [
      {
        "id": "sdks",
        "q": "어떤 SDK가 있고, 무엇을 제공합니까?",
        "a": [
          {
            "kind": "p",
            "text": "하나의 SDK(개발에 필요한 도구 모음)를 두 언어로, 같은 사용감으로 제공합니다. **TypeScript** — `npm i x402-xrpl` (Node 18+, MIT, ESM + CJS). Express용 `requirePayment` 미들웨어, 구매자용 `x402Fetch` 클라이언트, 통화(화폐) 단위 헬퍼, 헤더 인코딩/디코딩 도구, Verifiable Intent 체인 빌더가 들어 있습니다. **Python** — `pip install x402-xrpl` (Python 3.11+, `x402_xrpl`로 import). FastAPI/Starlette용 `require_payment` 미들웨어, `requests` 세션 기반 구매자 클라이언트, 호출 한 번으로 끝내는 `x402_purchase` 헬퍼가 들어 있습니다."
          },
          {
            "kind": "p",
            "text": "프로토콜의 양쪽을 모두 지원합니다. 가맹점으로서 라우트(경로)에 결제를 요구하는 것도, AI 에이전트로서 402에 결제하는 것도 각각 몇 줄이면 됩니다."
          }
        ],
        "links": [
          {
            "label": "npm: x402-xrpl",
            "href": "https://www.npmjs.com/package/x402-xrpl"
          },
          {
            "label": "PyPI: x402-xrpl",
            "href": "https://pypi.org/project/x402-xrpl/"
          }
        ],
        "keywords": [
          "sdk",
          "typescript",
          "python",
          "npm",
          "pypi",
          "install",
          "packages",
          "설치",
          "패키지",
          "타입스크립트",
          "파이썬"
        ]
      },
      {
        "id": "charge-for-api",
        "q": "API 라우트(경로)에 어떻게 요금을 매깁니까?",
        "a": [
          {
            "kind": "p",
            "text": "라우트를 미들웨어로 감싸고, 가격과 받을 주소를 설정한 뒤 facilitator(결제 중개 서비스)를 지정하면 됩니다. 결제하지 않은 요청에는 자동으로 402가 돌아갑니다. 핸들러는 결제가 정산된 뒤에만 실행되고, 정산 상세 내용은 요청 컨텍스트에서 확인할 수 있습니다."
          },
          {
            "kind": "code",
            "lang": "ts",
            "body": "import { requirePayment } from \"x402-xrpl/express\";\n\napp.use(requirePayment({\n  path: \"/ai-news\",\n  price: \"1000\",                       // XRP drops; IOUs use a value string like \"1.25\"\n  payToAddress: \"rYourAddress...\",\n  network: \"xrpl:0\",\n  asset: \"XRP\",\n  facilitatorUrl: \"https://xrpl-facilitator-mainnet.t54.ai\",\n}));"
          },
          {
            "kind": "p",
            "text": "Python도 구조가 같습니다. `require_payment(path=..., price=..., pay_to_address=..., facilitator_url=...)`를 FastAPI/Starlette HTTP 미들웨어로 등록합니다. 두 언어 모두 유용한 옵션을 지원합니다. 라우트 하나에 여러 결제 옵션을 둘 수 있습니다 — 예: XRP **및** RLUSD(미국 달러에 1:1로 연동된 디지털 화폐). 인보이스 유효 시간(TTL)은 기본 900초입니다. 검증만 하고 정산하지 않는 모드를 위한 `settle: false`도 있습니다. 인보이스 저장소는 교체할 수 있습니다(프로덕션에서는 기본 인메모리 대신 Redis/DB를 사용하세요)."
          }
        ],
        "keywords": [
          "server",
          "merchant",
          "middleware",
          "express",
          "fastapi",
          "requirepayment",
          "charge",
          "sell",
          "서버",
          "머천트",
          "가맹점",
          "미들웨어",
          "과금",
          "판매"
        ]
      },
      {
        "id": "pay-as-agent",
        "q": "AI 에이전트는 402에 어떻게 결제합니까?",
        "a": [
          {
            "kind": "p",
            "text": "구매자 클라이언트에 지갑을 넘기고 `fetch`처럼 URL을 호출하면 됩니다. 클라이언트는 402를 받으면 `accepts[]`를 읽고, 설정된 필터를 통과하는 결제 요구사항을 고릅니다. 그다음 `Payment` 거래에 기기 안에서 서명하고 한 번 다시 요청합니다. 이 전체 과정이 await 한 번으로 끝납니다. 클라이언트는 facilitator와 직접 통신하지 않습니다. 계정 정보를 조회할 XRPL WebSocket 접속만 있으면 됩니다."
          },
          {
            "kind": "code",
            "lang": "ts",
            "body": "import { x402Fetch } from \"x402-xrpl\";\nimport { Wallet } from \"xrpl\";\n\nconst fetchPaid = x402Fetch({\n  wallet: Wallet.fromSeed(process.env.XRPL_SEED!),\n  network: \"xrpl:0\",\n  maxValue: \"1000000\",   // refuse anything above 1 XRP\n});\nconst res = await fetchPaid(\"https://api.example.com/ai-news\");"
          },
          {
            "kind": "p",
            "text": "안전장치가 내장되어 있습니다. `maxValue`는 호출 한 번에 쓸 수 있는 금액의 상한을 정합니다. `networkFilter`/`schemeFilter`는 수락할 대상을 제한합니다. `confirmationMode`를 켜면 서명 전에 사람의 확인을 요구할 수 있습니다. Python에서는 `x402_requests(wallet, ...)`가 같은 방식으로 동작하는 `requests` 세션을 돌려주므로, 기존 코드를 바꾸지 않고 그대로 끼워 넣을 수 있습니다."
          }
        ],
        "keywords": [
          "client",
          "buyer",
          "agent",
          "x402fetch",
          "pay",
          "fetch",
          "wallet",
          "클라이언트",
          "구매자",
          "에이전트",
          "결제",
          "지갑"
        ]
      },
      {
        "id": "rlusd-charge",
        "q": "라우트 가격을 RLUSD로 지정하려면 어떻게 합니까?",
        "a": [
          {
            "kind": "p",
            "text": "RLUSD는 발행형 토큰이므로 결제 요구사항에 세 가지가 필요합니다. 첫째, **40자리 16진수 통화 코드**(`524C555344000000000000000000000000000000`)입니다. \"RLUSD\"는 다섯 글자라서, 세 글자까지만 허용되는 XRPL 일반 코드로는 담을 수 없기 때문입니다. 둘째, **발행자 주소**입니다. 셋째, **소수점 값 문자열로 적은 가격**(예: `\"1.25\"`)입니다. 화면 표시용 심볼 변환은 SDK가 처리합니다:"
          },
          {
            "kind": "code",
            "lang": "ts",
            "body": "import { resolveCurrencyCode } from \"x402-xrpl\";\n\nconst asset = resolveCurrencyCode(\"RLUSD\", { allowUtf8Symbol: true });\n// → \"524C555344000000000000000000000000000000\"\n\napp.use(requirePayment({\n  path: \"/report\", price: \"1.25\", asset,\n  issuer: \"rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De\",   // RLUSD mainnet issuer\n  payToAddress: \"rYourAddress...\", network: \"xrpl:0\",\n  facilitatorUrl: \"https://xrpl-facilitator-mainnet.t54.ai\",\n}));"
          },
          {
            "kind": "p",
            "text": "금액은 검증 시점에 정확히 일치해야 합니다. IOU는 소수 값이 같은지, XRP는 정수 drops가 같은지를 비교하므로 반올림 때문에 어긋나는 일은 없습니다. 그리고 결제하는 쪽이 RLUSD를 보유하거나 보내려면, 먼저 발행자에 대한 트러스트 라인(해당 토큰을 받을 수 있게 하는 계정 설정)이 필요하다는 점을 기억하세요(지갑 섹션 참조)."
          }
        ],
        "keywords": [
          "rlusd",
          "iou",
          "issuer",
          "currency code",
          "40-hex",
          "stablecoin",
          "price",
          "발행자",
          "통화 코드",
          "스테이블코인",
          "가격"
        ]
      },
      {
        "id": "testnet-story",
        "q": "테스트넷과 로컬 개발 환경은 어떻게 지원됩니까?",
        "a": [
          {
            "kind": "p",
            "text": "프로덕션과 완전히 같습니다. 모든 설정을 `xrpl:1`과 t54가 운영하는 테스트넷 facilitator(`xrpl-facilitator-testnet.t54.ai`)로 지정합니다. 공개 XRPL 테스트넷 faucet(테스트용 XRP를 무료로 받는 곳)에서 지갑에 자금을 받습니다. 그다음 메인넷에 올릴 코드와 똑같은 코드를 실행하면 됩니다. SDK의 기본 네트워크가 `xrpl:1`인 것도, 개발 중에 실수로 실제 돈이 나가는 일을 막기 위해서입니다."
          },
          {
            "kind": "p",
            "text": "이 테스트넷 facilitator가 곧 개발 환경입니다. 따로 설치하거나 운영할 것이 없고, 전체 흐름(402, 서명, `/verify`, `/settle`)을 내 컴퓨터에서 그대로 실행할 수 있습니다. 테스트넷에서 RLUSD와 비슷한 흐름이 필요하면, 일회용 발행자로 테스트용 IOU를 직접 발행하면 됩니다. 그 방법은 facilitator 문서에 나와 있습니다. QA 팀이 트러스트 라인 관련 예외 상황을 실제에 가깝게 검증할 때도 유용합니다."
          }
        ],
        "links": [
          {
            "label": "Facilitator 문서",
            "href": "https://xrpl-x402.t54.ai/docs/overview"
          }
        ],
        "keywords": [
          "testnet",
          "faucet",
          "local",
          "development",
          "sandbox",
          "qa",
          "devnet",
          "테스트넷",
          "데브넷",
          "개발",
          "로컬",
          "포싯"
        ]
      },
      {
        "id": "other-stacks",
        "q": "Express나 FastAPI를 쓰지 않습니다 — Kotlin, Swift, Go, Rust, Java는요?",
        "a": [
          {
            "kind": "p",
            "text": "이 프로토콜은 일반 HTTP에, 문서로 공개된 스킴을 더한 것입니다. 그래서 저희 SDK가 필수는 아닙니다. 서버에서 할 일은 이렇습니다. `PAYMENT-REQUIRED` 헤더와 함께 402를 반환하고, 받은 `PAYMENT-SIGNATURE` 페이로드를 facilitator(결제 중개 서비스)의 `/verify`와 `/settle` JSON 엔드포인트로 전달합니다 — POST 호출 두 번이면 됩니다. 클라이언트에서 할 일은 이렇습니다. `accepts[]`를 읽고, 인보이스 연결 정보를 포함한 표준 XRPL `Payment` 거래를 만들어 서명한 뒤, 해당 헤더와 함께 다시 요청합니다. 서명에 쓸 XRPL 라이브러리는 주요 언어마다 있습니다 — xrpl.js, xrpl-py, xrpl4j, 그리고 커뮤니티가 만든 Swift/Go/Rust 클라이언트."
          },
          {
            "kind": "p",
            "text": "XRPL Exact Scheme 사양에 모든 필드와 반드시 지켜야 하는 규칙이 문서화되어 있습니다. TypeScript/Python 소스 코드는 동작을 맞춰 볼 수 있는 참조 구현입니다. 네이티브 모바일 지갑 연동을 만들다 사양에서 빠진 부분을 발견하면 알려주세요. 저희는 그것을 사양의 버그로 취급합니다."
          }
        ],
        "links": [
          {
            "label": "XRPL 스킴 사양",
            "href": "https://xrpl-x402.t54.ai/docs/xrpl-scheme"
          },
          {
            "label": "엔지니어링 팀에 문의",
            "href": "mailto:support@t54.ai"
          }
        ],
        "keywords": [
          "kotlin",
          "swift",
          "go",
          "rust",
          "java",
          "mobile",
          "native",
          "framework",
          "other languages",
          "모바일",
          "네이티브",
          "프레임워크",
          "다른 언어"
        ]
      }
    ]
  },
  {
    "id": "wallets",
    "title": "지갑, 키, 자산 보관",
    "blurb": "지갑을 만드는 팀이 가장 먼저 묻는 질문들입니다. 누가 무엇을 보관하는지, 사용자에게 무엇이 보이는지, 그리고 XRPL만의 동작 방식을 다룹니다.",
    "items": [
      {
        "id": "custody",
        "q": "결제 과정 어느 시점에서든, 키나 자금을 쥐고 있는 쪽은 누구입니까?",
        "a": [
          {
            "kind": "p",
            "text": "오직 결제하는 본인뿐입니다. 서명 키는 지갑 또는 AI 에이전트(사람 대신 자동으로 일하는 인공지능 프로그램)의 실행 환경에 머무릅니다. SDK는 기기 안에서 서명을 마친 뒤 **서명이 끝난 거래 데이터(signed blob)**만 내보냅니다. 이 데이터로 할 수 있는 일은 제출 아니면 폐기뿐입니다. facilitator(결제 중개 서비스)는 서명을 깨뜨리지 않고서는 목적지도, 금액도, 수수료도 바꿀 수 없습니다. 자금은 구매자에게서 가맹점으로, 원장(모든 거래가 기록되는 장부)에 남는 단 한 건의 거래로 한 번에(원자적으로) 이동합니다. 중간에 에스크로 계정도, 한데 모아 두는 잔액도, facilitator의 지갑도 없고, 유출될 수 있는 API 키도 없습니다."
          },
          {
            "kind": "p",
            "text": "이 시스템이 자산을 직접 보관하지 않는 방식(논커스터디)인 것은 회사 방침이어서가 아니라, 구조 자체가 그렇게 만들어져 있기 때문입니다. 어떤 단계에서도 t54 시스템에는 사용자 자금을 스스로 옮길 능력이 없습니다."
          }
        ],
        "keywords": [
          "custody",
          "keys",
          "non-custodial",
          "funds",
          "trust",
          "signing",
          "커스터디",
          "수탁",
          "키",
          "논커스터디",
          "자금",
          "서명",
          "자산 보관"
        ]
      },
      {
        "id": "wallet-402-ux",
        "q": "지갑을 개발하고 있습니다. 402를 가로챘을 때 화면에 무엇을 보여줘야 합니까?",
        "a": [
          {
            "kind": "p",
            "text": "`PAYMENT-REQUIRED` 헤더를 디코딩하면(base64 → JSON), 확인 화면에 필요한 모든 정보가 `accepts[]`의 선택지별로 들어 있습니다. `amount`와 `asset`(IOU라면 `issuer` 포함), 받는 주소 `payTo`, `network`, `maxTimeoutSeconds`, 그리고 결제 대상 서비스의 URL과 설명입니다. 선택지가 여러 개라면 — 예: XRP와 RLUSD(미국 달러에 1:1로 연동된 디지털 화폐) — 무엇을 고를지는 사용자의 선택이거나 지갑 정책의 영역입니다. 이 페이로드는 무턱대고 서명하라고 만든 것이 아니라, 화면에 보여 주도록 처음부터 설계되었습니다."
          },
          {
            "kind": "p",
            "text": "정산이 끝나면 `PAYMENT-RESPONSE`에 담긴 거래 해시를 보여 주세요. 어떤 XRPL 익스플로러(거래 조회 사이트)로도 바로 연결되며, 웬만한 결제망이 주는 것보다 실질적으로 더 나은 영수증입니다. 화면 표시용으로는 SDK의 `displayCurrencyCode` 같은 헬퍼가 40자리 16진수 코드를 사람이 읽을 수 있는 심볼로 되돌려 줍니다."
          }
        ],
        "keywords": [
          "wallet",
          "ux",
          "confirmation",
          "screen",
          "render",
          "display",
          "receipt",
          "지갑",
          "확인 화면",
          "렌더링",
          "표시",
          "영수증"
        ]
      },
      {
        "id": "trust-lines",
        "q": "RLUSD로 결제하는 사용자에게 트러스트 라인과 준비금(리저브)은 어떻게 동작합니까?",
        "a": [
          {
            "kind": "p",
            "text": "계정이 RLUSD를 보유하거나 보내려면, 먼저 RLUSD 발행자에 대한 **트러스트 라인**(해당 토큰을 받을 수 있게 하는 계정 설정)이 필요합니다. 한 번만 실행하는 `TrustSet` 거래로 만들며, 트러스트 라인이 있는 동안에는 소액의 소유자 준비금(현재 0.2 XRP)이 묶입니다. 지갑에 알맞은 사용자 경험은 미리 확인하는 것입니다. 사용자가 RLUSD 결제 요구사항을 처음 만나는 순간 트러스트 라인이 있는지 확인하세요. 결제 도중에 실패하게 두지 말고, 결제 전에 한 번의 탭으로 설정할 수 있게 제안하세요."
          },
          {
            "kind": "p",
            "text": "바로 이를 위한 도구가 이미 있습니다. RLUSD CLI는 `rlusd xrpl trustline setup / status / remove` 명령과, AI 에이전트용 prepare/execute 변형을 제공합니다. 결제 전 사전 점검은 받는 쪽이 RLUSD를 받을 수 없는 상태면 타입이 지정된 `TRUSTLINE_MISSING` 오류로 실패합니다. 지갑이 결제하는 사용자 쪽에 대해 해야 하는 검사와 같은 것입니다."
          }
        ],
        "links": [
          {
            "label": "RLUSD CLI",
            "href": "https://github.com/t54-labs/rlusd-cli"
          }
        ],
        "keywords": [
          "trust line",
          "trustset",
          "reserve",
          "rlusd",
          "onboarding",
          "preflight",
          "트러스트 라인",
          "준비금",
          "리저브",
          "온보딩",
          "사전 점검"
        ]
      },
      {
        "id": "issuer-safety",
        "q": "가짜 RLUSD 발행자로부터 사용자를 어떻게 보호합니까?",
        "a": [
          {
            "kind": "p",
            "text": "XRPL에서 통화 코드는 그저 이름표입니다. 누구든 코드가 \"RLUSD\"로 읽히는 토큰을 발행할 수 있습니다. 그래서 **발행자 주소가 곧 그 토큰의 신원**이며, 모든 결제 요구사항에 명시적으로 고정되어 있습니다(`extra.issuer`). 지갑은 이 주소를, 해당 네트워크용으로 Ripple이 공식 게시한 RLUSD 발행자 주소와 대조해 확인해야 합니다. 다르면 강하게 경고해야 합니다. EVM 체인에서 컨트랙트 주소를 확인하는 것과 똑같은 방식입니다."
          },
          {
            "kind": "p",
            "text": "구매자 쪽 도구도 이를 강제합니다. RLUSD CLI의 x402 명령은 `--require-issuer` 옵션을 받습니다. 이 옵션을 쓰면 AI 에이전트는 기대한 발행자가 명시된 요구사항에만 결제합니다. 네트워크를 전환하면 CLI가 공식 발행자 주소를 자동으로 바꿔 줍니다."
          }
        ],
        "keywords": [
          "issuer",
          "scam",
          "fake",
          "spoof",
          "verify",
          "allowlist",
          "phishing",
          "발행자",
          "사기",
          "가짜",
          "위조",
          "검증",
          "피싱"
        ]
      },
      {
        "id": "sequence-concurrency",
        "q": "미리 서명한 거래 데이터는 시퀀스 번호를 사용합니다. 동시에 일어나는 거래는 어떻게 처리합니까?",
        "a": [
          {
            "kind": "p",
            "text": "이 시간 창은 \"사전 서명\"이라는 말이 주는 느낌보다 짧습니다. 구매자 클라이언트는 **402를 받는 시점에** 서명하고, facilitator가 곧바로 제출합니다. 그래서 거래 데이터가 오가는 시간은 보통 몇 초이고, 상한은 `LastLedgerSequence`가 정합니다(원장 마감을 약 5초로 보고 `maxTimeoutSeconds`에서 계산합니다). 그래도 XRPL의 시퀀스 규칙은 그대로 적용됩니다. 같은 계정의 다른 거래가 먼저 반영되면, 이 거래 데이터는 제출 시점에 깔끔하게 실패합니다. facilitator가 실패를 알려 주고, 자금은 움직이지 않습니다."
          },
          {
            "kind": "p",
            "text": "실서비스용 AI 에이전트에는 **전용 결제 계정**을 권장합니다. 운영 자금 계정에서 필요한 만큼 넣어 주면 되고, XRPL 계정을 만드는 비용은 저렴합니다. 이렇게 하면 x402 결제가 다른 활동과 섞이지 않습니다. 결제가 잦다면 계정별로 결제를 한 줄로 세워 순서대로 처리해야 합니다. 아키텍처상 진짜 병렬 사전 서명이 필요하다면 — 예: Tickets — 저희에게 문의하세요. 이 스킴은 이 부분에서 일부러 보수적으로 설계되어 있습니다."
          }
        ],
        "keywords": [
          "sequence",
          "concurrency",
          "tefpast_seq",
          "parallel",
          "tickets",
          "race",
          "시퀀스 번호",
          "동시성",
          "병렬",
          "경쟁 조건"
        ]
      },
      {
        "id": "signing-infra",
        "q": "RegularKey, SignerList 멀티시그, MPC/HSM 구성도 동작합니까?",
        "a": [
          {
            "kind": "p",
            "text": "이 스킴은 표준 방식으로 서명된 XRPL `Payment` 거래 데이터를 검증할 뿐, 그 서명이 어떻게 만들어졌는지는 따지지 않습니다. 마스터 키로 서명하든, 교체해 둔 `RegularKey`로 서명하든, HSM/MPC 장비 안에서 서명하든 셋 모두 같은 와이어 포맷(전송되는 데이터 형식)을 만들어 냅니다. 여기서 XRPL의 계정 모델은 실질적인 강점입니다. `RegularKey`를 쓰면 계정 주소를 바꾸지 않고 키를 교체할 수 있습니다. `SignerList`(정족수를 정해 두는, 가중치 있는 서명자 최대 32명)는 m-of-n 제어(전체 n명 중 m명이 서명해야 승인되는 방식)를 프로토콜 수준에서 표현합니다."
          },
          {
            "kind": "p",
            "text": "솔직한 주의사항이 하나 있습니다. AI 에이전트의 결제 흐름은 지연에 민감합니다(인보이스는 몇 분 안에 만료됩니다). 그래서 사람이 개입해야 진행되는 멀티시그 절차는 402 재시도 루프에 잘 맞지 않습니다. MPC나 임계값 서명을 쓰는 지갑이라면, 테스트넷 facilitator를 상대로 전체 흐름을 처음부터 끝까지 실행해 보시기 바랍니다. 연동 검증은 저희가 직접 함께 진행해 드리겠습니다."
          }
        ],
        "links": [
          {
            "label": "엔지니어링 팀에 문의",
            "href": "mailto:support@t54.ai"
          }
        ],
        "keywords": [
          "multisig",
          "regularkey",
          "signerlist",
          "mpc",
          "hsm",
          "threshold",
          "key management",
          "멀티시그",
          "임계값 서명",
          "키 관리"
        ]
      },
      {
        "id": "tags-memos",
        "q": "이미 Source/Destination 태그와 메모를 사용하고 있습니다. x402와 충돌합니까?",
        "a": [
          {
            "kind": "p",
            "text": "대체로 충돌하지 않습니다. 지켜야 할 규칙은 하나입니다. x402 결제의 **`SourceTag`**(거래에 찍히는 식별 번호)는 정산을 수행한 facilitator를 식별합니다. 이 허브의 집계 시스템(Index)이 거래량을 어느 facilitator의 것으로 집계할지 정할 때 쓰는 값이기도 합니다. 따라서 구매자 쪽 인프라가 이 값을 덮어쓰면 안 됩니다. 이 태그는 지갑의 관례가 아니라 결제 요구사항에서 정해집니다. **`DestinationTag`**는 가맹점 쪽 라우팅용으로 자유롭게 남아 있습니다. 요구사항에 태그를 넣을 수 있고, 받는 주소 하나에 여러 태그를 두는 XRPL의 서브 계정 패턴도 그대로 동작합니다. facilitator든 가맹점이든 주소 하나로 여러 서비스의 결제를 나눠 받을 수 있습니다."
          },
          {
            "kind": "p",
            "text": "`Memos[0]`과 `InvoiceID`는 인보이스 연결용으로 예약되어 있습니다. SDK가 발급하는 인보이스 ID는 무작위 UUID로, 일부러 아무 정보도 담지 않습니다. 서버를 직접 만든다면 이 원칙을 지키세요. 주문 내용이나 개인 정보를 invoiceId에 절대 넣지 마세요. 메모는 원장에 영구히, 누구나 볼 수 있게 남기 때문입니다."
          }
        ],
        "keywords": [
          "sourcetag",
          "destinationtag",
          "memo",
          "collision",
          "routing",
          "pii",
          "privacy",
          "태그",
          "메모",
          "충돌",
          "라우팅",
          "개인정보"
        ]
      },
      {
        "id": "spend-controls",
        "q": "AI 에이전트가 쓸 수 있는 금액을 어떻게 제한합니까?",
        "a": [
          {
            "kind": "p",
            "text": "여러 겹으로 제한합니다. 손이 덜 가는 것부터 가장 강력한 것 순서입니다. **클라이언트 쪽**: 구매자 클라이언트의 `maxValue`는 한도를 넘는 모든 요구사항을 거부합니다. `confirmationMode`는 서명 전에 사람의 승인을 강제할 수 있습니다. RLUSD CLI의 x402 명령은 `--max-value` 한도를 반드시 지정하게 합니다. **계정 쪽**: AI 에이전트 전용 계정에 운영 예산만큼만 자금을 넣으세요. XRPL에서 계정 잔액은 절대 상한입니다. 누가 AI 에이전트를 어떻게 설득해도 잔액을 넘겨 쓸 수는 없습니다. **정책 쪽**: '검증 가능한 지시서(Verifiable Intent)' 위임은 소유자가 승인한 지출 한도를 암호학적으로 묶어 두고, facilitator가 정산 전에 이를 강제합니다. AI 에이전트 자신의 코드로는 없앨 수 없는 한도입니다."
          }
        ],
        "links": [
          {
            "label": "아래의 Verifiable Intent 항목",
            "href": "/faq#what-is-x402-secure"
          }
        ],
        "keywords": [
          "spend limit",
          "cap",
          "budget",
          "maxvalue",
          "control",
          "guardrail",
          "지출 한도",
          "상한",
          "예산",
          "가드레일"
        ]
      }
    ]
  },
  {
    "id": "security",
    "title": "보안과 Verifiable Intent",
    "blurb": "위험 관리 계층을 다룹니다. 돈이 움직이기 전에 AI 에이전트(사람 대신 자동으로 일하는 인공지능 프로그램)가 승인받았음을 증명하는 방법과, 문제가 생겼을 때 벌어지는 일을 설명합니다.",
    "items": [
      {
        "id": "what-is-x402-secure",
        "q": "x402 Secure / Verifiable Intent 체인이란 무엇인가요?",
        "a": [
          {
            "kind": "p",
            "text": "AI 에이전트의 결제 권한을, 일이 끝난 뒤 기록으로 주장하는 대신 **정산 전에 미리 증명**할 수 있게 만드는 내장형 위험 관리 계층입니다. 결제에는 세 단계로 이어지는 자격 증명(크리덴셜) 체인이 함께 실립니다. **L1** — Trustline(t54의 AI 에이전트 전용 리스크 엔진)이 발급하는 Know-Your-Agent 자격 증명으로, AI 에이전트가 누구인지 증명합니다. **L2** — 소유자가 서명한 위임장으로, 이 AI 에이전트가 무엇에 얼마까지 쓸 수 있는지 정합니다. **L3** — 구체적인 행위에 대해 AI 에이전트가 결제 건마다 만드는 서명입니다. 이 체인은 x402 페이로드(결제 요청에 실려 가는 데이터)의 `extensions.x402Secure` 필드에 SD-JWT(국제 표준으로 정해진 전자 자격 증명 형식) 형태로 전달됩니다."
          },
          {
            "kind": "p",
            "text": "t54가 호스팅하는 facilitator(결제 중개 서비스)는 이 결제 요청(자격 증명이 함께 실린 페이로드)을 받으면 정산 전에 x402 Secure를 호출합니다. Trustline이 자격 증명 체인과 해당 리스크 정책을 검증하고, 허용 또는 거부를 돌려줍니다. 거부되면 결제는 원장(모든 거래가 기록되는 장부)에 도달하지 않습니다. 이 관문은 **fail-closed**(문제가 있으면 닫히는 방식)로 동작합니다. 즉, 리스크 서비스에 연결할 수 없으면 \"검사 없이 진행\"이 아니라 거부로 처리합니다. Verifiable Intent는 Mastercard가 Agent Pay for Machines와 함께 공개한 프레임워크이며, t54 Labs는 이를 XRPL에서 구현하는 공식 런칭 파트너입니다."
          }
        ],
        "links": [
          {
            "label": "x402 Secure",
            "href": "https://www.t54.ai/x402-secure"
          },
          {
            "label": "Verifiable Intent 스펙",
            "href": "https://verifiableintent.dev/"
          }
        ],
        "keywords": [
          "verifiable intent",
          "x402 secure",
          "trustline",
          "kya",
          "l1",
          "l2",
          "l3",
          "mastercard",
          "risk",
          "리스크",
          "크리덴셜 체인",
          "마스터카드",
          "위임"
        ]
      },
      {
        "id": "vi-required",
        "q": "XRPL에서 x402를 사용하려면 Verifiable Intent가 필수인가요?",
        "a": [
          {
            "kind": "p",
            "text": "아니요. 일반 x402 결제는 x402 Secure 필드 없이도 정상적으로 정산됩니다. 이 계층은 처음부터 원할 때 선택해서 켜는 방식으로 설계되었습니다. 한나절이면 유료 엔드포인트(접속 주소)를 먼저 열 수 있고, AI 에이전트의 자율 지출이 본격화될 때 위험 관리 계층을 추가하면 됩니다. SDK(개발자가 가져다 쓰도록 만들어 둔 소프트웨어 부품 모음)에서는 구매자 클라이언트에 붙이는 `verifiableIntentProvider`로 제공됩니다. 서버 쪽에서는 미들웨어(서버에 끼워 넣는 중간 처리 프로그램)에 정책 ID를 지정해 두면, 미들웨어가 손님에게 내걸 결제 요구사항을 facilitator에 알아서 조회합니다."
          },
          {
            "kind": "p",
            "text": "솔직한 권장 사항은 이렇습니다. 시작 단계에서는 켜지 않아도 됩니다. 하지만 실제 예산을 쓰는 운영 단계의 AI 에이전트라면 켜 두는 것이 올바른 기본값입니다. \"AI 에이전트 코드 안에 한도가 있었다\"와 \"소유자가 서명한 한도를 정산 단계에서 강제했다\"는 전혀 다른 이야기이기 때문입니다."
          }
        ],
        "keywords": [
          "optional",
          "required",
          "opt-in",
          "adoption",
          "when",
          "선택 사항",
          "필수",
          "옵트인",
          "도입 시점"
        ]
      },
      {
        "id": "vi-enforcement",
        "q": "L2 위임으로 무엇을 제한할 수 있고, 그 제한은 어디에서 강제되나요?",
        "a": [
          {
            "kind": "p",
            "text": "위임은 AI 에이전트의 지출에 대해 소유자가 서명해 주는 명령서(mandate)입니다. 사용 범위와 한도가 자격 증명 자체에 묶여 있고, 구체적인 결제 건과 대조해 검증됩니다. L3 서명이 결제 요구사항의 해시(내용이 조금만 달라져도 값이 바뀌는 전자 지문)에 고정되므로, 소유자가 승인한 바로 그 내용만 정산됩니다. 이 검사는 AI 에이전트 프로그램 안이 아니라 **제출 전 facilitator에서** 이루어집니다. 그래서 해킹당했거나 오동작하는 AI 에이전트라도 검사를 건너뛸 수 없습니다. 검사가 에이전트의 손이 닿지 않는 신뢰 경계 반대편에 있기 때문입니다."
          },
          {
            "kind": "p",
            "text": "연동 담당자를 위한 구현 노트 두 가지입니다. 첫째, SDK는 프로바이더가 facilitator 발급 필드(요구사항 토큰과 결정 토큰)를 덮어쓰는 것을 거부합니다. 둘째, L1 발급은 신뢰할 수 있는 백엔드 서버에서 수행해야 합니다. Trustline API 키를 AI 에이전트나 결제 페이로드 안에 담아 배포해서는 절대 안 됩니다."
          }
        ],
        "keywords": [
          "delegation",
          "l2",
          "enforce",
          "limits",
          "mandate",
          "scope",
          "위임",
          "한도",
          "강제",
          "범위"
        ]
      },
      {
        "id": "compromise",
        "q": "AI 에이전트의 키를 도둑맞거나 에이전트 전체가 해킹당하면 어떻게 되나요?",
        "a": [
          {
            "kind": "p",
            "text": "있는 그대로 말하면, 방어막을 여러 겹으로 쌓는 방식(defense in depth)입니다. **피해 범위**: 결제 전용 계정을 쓰면 손실이 그 계정의 잔액을 넘지 못합니다. 클라이언트 쪽 `maxValue` 상한과 결제 전 확인 절차가 호출 한 번당 피해도 제한합니다. **정책**: Verifiable Intent가 켜져 있으면, 해킹당한 AI 에이전트가 무엇을 요청하든 소유자가 위임한 범위를 벗어난 결제는 facilitator에서 거부됩니다. Trustline의 리스크 엔진이 바로 이런 유형의 이상 징후를 감시합니다. **원장 차원**: 계정 주소를 바꾸지 않고 `RegularKey`(계정에 등록해 두는 교체용 서명 키)를 즉시 바꿀 수 있습니다. 아예 `SignerList`(여러 서명자가 함께 승인해야 하는 설정)로 계정을 관리해, 처음부터 키 하나만으로는 돈이 나가지 않게 할 수도 있습니다."
          },
          {
            "kind": "p",
            "text": "이미 정산된 돈을 되찾는 수단이 자산마다 다른 것은 의도된 설계입니다. 기본 계층인 XRP 결제는 한번 확정되면 되돌릴 수 없습니다. 반면 RLUSD(미국 달러에 1:1로 연동된 디지털 화폐) 같은 규제 대상 발행 토큰에는 발행자 차원의 `Freeze`(동결)와 `Clawback`(회수) 수단이 있습니다. 중간에 자산을 맡아 보관하는 기관을 두지 않고도 기관 자금에 구제 수단을 제공하는 방식입니다. 사고가 발생하면 신고해 주세요. 함께 대응하겠습니다. 보안 사고 문의도 support@t54.ai 한 곳으로 보내 주시면 됩니다."
          }
        ],
        "keywords": [
          "compromise",
          "hack",
          "stolen",
          "incident",
          "freeze",
          "clawback",
          "rotation",
          "recovery",
          "침해",
          "해킹",
          "키 교체",
          "복구",
          "동결"
        ]
      },
      {
        "id": "audit-openness",
        "q": "코드를 검토할 수 있나요? 감사, 오픈소스, 독립적인 검증은 어떻게 되나요?",
        "a": [
          {
            "kind": "p",
            "text": "SDK는 npm과 PyPI에 공개 저장소와 함께 오픈소스(MIT 라이선스)로 배포됩니다. x402 Secure 게이트웨이도 오픈소스(Apache 2.0)입니다. 여기에는 관문 판정 로직, 정책 병합, OpenAPI 프로토콜 명세까지 포함됩니다. Verifiable Intent 자격 증명은 표준 SD-JWT 형식이라 표준 도구로 열어 검사할 수 있습니다(리스크 정책에 대한 체인 검증은 Trustline에서 실행됩니다). XRPL 스킴(XRPL에서 결제가 오가는 방식을 정한 규격) 자체도 공개 명세입니다. 그리고 정산되는 모든 거래는 누구나 볼 수 있는 공개 원장에서 확인할 수 있습니다. 이 스택은 외부에서 감사할 수 있는 범위가 이례적으로 넓습니다."
          },
          {
            "kind": "p",
            "text": "보안 검토, 감사 자료, 또는 비밀유지계약(NDA) 아래에서 facilitator 내부 구조를 함께 살펴보는 자리가 필요하면 직접 연락해 주세요. 지갑 사업자 수준의 실사(due diligence)에도 대응할 준비가 되어 있습니다."
          }
        ],
        "links": [
          {
            "label": "x402-secure (Apache 2.0)",
            "href": "https://github.com/t54-labs/x402-secure"
          },
          {
            "label": "엔지니어링에 문의하기",
            "href": "mailto:support@t54.ai"
          }
        ],
        "keywords": [
          "audit",
          "open source",
          "license",
          "review",
          "due diligence",
          "verify",
          "nda",
          "감사",
          "오픈소스",
          "라이선스",
          "실사",
          "검증"
        ]
      },
      {
        "id": "issuer-freeze",
        "q": "RLUSD 발행자가 결제 도중 트러스트 라인(해당 토큰을 받을 수 있게 하는 계정 설정)을 동결(Freeze)하면 어떻게 되나요?",
        "a": [
          {
            "kind": "p",
            "text": "결제가 정산되지 못하고 그대로 실패합니다. 동결된 트러스트 라인으로는 송금할 수 없습니다. 그래서 제출 시점에 거래가 실패 결과를 반환하고, facilitator는 `success: false`를 보고합니다. 가맹점에 유령 결제가 잡히는 일은 없고, 구매하려던 서비스도 전달되지 않습니다. 지불자가 부담하는 비용은 서명한 거래 안에 든 네트워크 수수료뿐입니다. 이 수수료는 facilitator 정책상 0.01 XRP가 상한이고, 실제로는 약 10 drops — 1센트에도 한참 못 미치는 금액입니다."
          },
          {
            "kind": "p",
            "text": "이는 규제를 받는 스테이블코인(달러 등 법정 화폐에 가치가 고정된 디지털 화폐)을 쓸 때 함께 따라오는 조건입니다. 발행자에게 통제 수단이 있고, 원장 자체가 그 통제를 강제하며, 그 사실을 외부에서 확인할 수 있습니다. 지갑은 서명 전에 트러스트 라인의 동결 여부를 미리 확인할 수 있습니다. 저희 도구가 권장하는 사전 점검(preflight)이 바로 이런 확인입니다."
          }
        ],
        "keywords": [
          "freeze",
          "frozen",
          "issuer",
          "fail",
          "fee loss",
          "tec",
          "동결",
          "발행자",
          "실패",
          "수수료 손실"
        ]
      }
    ]
  },
  {
    "id": "operations",
    "title": "Facilitator와 운영",
    "blurb": "엔드포인트(접속 주소), 비용, 한도, 그리고 실패가 일어나는 방식 — 서비스 운영 팀과 결제 팀이 묻게 될 내용입니다.",
    "items": [
      {
        "id": "endpoints",
        "q": "호스팅 facilitator(결제 중개 서비스)의 엔드포인트와 그 동작 규칙은 무엇인가요?",
        "a": [
          {
            "kind": "code",
            "body": "Mainnet  https://xrpl-facilitator-mainnet.t54.ai     xrpl:0\nTestnet  https://xrpl-facilitator-testnet.t54.ai     xrpl:1\n\nPOST /verify     validate a signed blob against requirements\nPOST /settle     submit to XRPL, wait for validation\nGET  /supported  advertised schemes / networks / assets"
          },
          {
            "kind": "p",
            "text": "`/verify`는 서명된 블롭(서명이 끝난 거래 데이터 묶음)을 해독해 지켜야 할 규칙을 모두 미리 검사합니다. 금액이 정확히 일치하는지, 인보이스(청구서) 연결 정보가 있고 정확한지, 수수료가 상한 이하인지, 네트워크와 목적지가 올바른지 확인합니다. 이 과정에서 원장(모든 거래가 기록되는 장부)에는 접근하지 않습니다. `/settle`은 거래를 제출하고, 기본적으로 원장에서 **검증(validated)**될 때까지 기다립니다(1초 간격으로 확인, 최대 60초). 그런 다음 서버가 `PAYMENT-RESPONSE`로 전달할 거래 해시(거래 고유 번호)를 반환합니다. 어느 엔드포인트에도 API 키는 필요 없습니다."
          }
        ],
        "keywords": [
          "endpoints",
          "verify",
          "settle",
          "supported",
          "api",
          "hosted",
          "urls",
          "엔드포인트",
          "호스팅"
        ]
      },
      {
        "id": "fees",
        "q": "비용은 얼마인가요?",
        "a": [
          {
            "kind": "p",
            "text": "원장에서 드는 비용: XRPL 네트워크 수수료는 서명된 거래 안에 포함되어 구매자가 부담합니다. 보통 약 10 drops, 즉 1센트의 천분의 일 수준입니다. 이 수수료는 경매로 정해지는 것이 아니라 소각(영구 폐기)되므로, 수수료를 두고 경쟁하는 가스 시장을 신경 쓸 필요가 없습니다. facilitator는 상한을 강제해, 수수료가 0.01 XRP를 넘는 블롭은 거부합니다. 수수료 액수는 서명 안에 들어 있으므로 facilitator가 부풀릴 수도 없습니다."
          },
          {
            "kind": "p",
            "text": "호스팅 facilitator 자체는 현재 서비스 수수료가 없고 API 키도 필요 없습니다. 지갑 사업 규모나 기업 수준의 약정 — 처리량 보장, 상업 조건, SLA(서비스 수준 협약) — 이 필요하다면, 기본 제공 조건에 사업 규모를 맞추지 말고 저희에게 먼저 문의하세요."
          }
        ],
        "links": [
          {
            "label": "t54에 문의하기",
            "href": "mailto:support@t54.ai"
          }
        ],
        "keywords": [
          "fee",
          "cost",
          "pricing",
          "free",
          "drops",
          "gas",
          "commercial",
          "수수료",
          "비용",
          "가격",
          "무료"
        ]
      },
      {
        "id": "latency",
        "q": "정산은 실제로 얼마나 빠른가요?",
        "a": [
          {
            "kind": "p",
            "text": "XRPL은 약 4–5초마다 원장을 한 번씩 마감하며, `/settle`은 실제 검증이 끝날 때까지 기다립니다. 따라서 정상적인 경우, 결제된 요청은 원장 마감 한 번 안에 완료됩니다. 402 응답(먼저 결제해 달라는 서버의 회신, 이 프로토콜 이름 x402의 유래입니다)부터 결과물을 받기까지 몇 초면 됩니다. 이는 \"아마 성공할 것\"이라는 낙관적 승인이 아니라 **최종 확정(finality)**입니다. 거래 대기열(멤풀)에서 벌어지는 수수료 경매도 없고, 확인(컨펌) 횟수를 세며 기다릴 일도 없습니다. 검증되었다면 끝난 것입니다."
          },
          {
            "kind": "p",
            "text": "매우 잦은 결제(토큰 단위 과금이나 AI 추론 호출 단위 과금)에는 요청마다 정산하는 방식이 맞지 않습니다. 그런 경우를 위한 것이 XRPL Payment Channels입니다. 원장 밖에서 서명 속도로 결제 확인서(서명 클레임)를 쌓아 두었다가, 원장에서 한 번에 정산하는 방식입니다. 이런 구조를 설계 중이라면 기꺼이 함께 그려 드리겠습니다."
          }
        ],
        "keywords": [
          "latency",
          "speed",
          "fast",
          "finality",
          "seconds",
          "settlement time",
          "payment channels",
          "지연 시간",
          "속도",
          "최종성",
          "정산 시간"
        ]
      },
      {
        "id": "failure-modes",
        "q": "결제는 어떤 식으로 실패하고, 우리 서버에서는 무엇을 보게 되나요?",
        "a": [
          {
            "kind": "p",
            "text": "실패는 종류별로 정리되어 있고, 안전한 순서로 일어납니다. 즉, 원장에 제출하기 전에 먼저 검증합니다. `/verify`는 기계가 읽을 수 있는 사유 코드(`amount_mismatch`, `invoice_binding_mismatch`, `fee_too_high`, 알 수 없는 인보이스 등)와 함께 거부합니다. 그러면 미들웨어가 클라이언트에 새로운 402로 응답하므로, 올바르게 만들어진 AI 에이전트(사람 대신 자동으로 일하는 인공지능 프로그램)는 깔끔하게 다시 시도할 수 있습니다. 만료된 블롭(`LastLedgerSequence`가 지난 것)은 절대 검증될 수 없습니다. 만료를 강제하는 것은 믿고 지켜봐야 하는 타이머가 아니라 원장 자체입니다."
          },
          {
            "kind": "p",
            "text": "모호한 구간도 있습니다. 제출은 되었지만 검증 결과가 아직 확인되지 않은 상태입니다. 이 구간은 60초의 검증 대기와, **같은 정산 요청을 여러 번 보내도 한 번만 처리되는 구조(idempotent settle)**로 처리합니다. 동일한 정산을 다시 요청하면 이중 제출 대신 저장해 둔 결과가 반환됩니다. 동시에 들어온 중복 요청은 HTTP 409 응답을 받습니다. 그리고 거래 해시를 이용해, 최종 기준인 원장과 직접 대조해 확인할 수 있습니다."
          }
        ],
        "keywords": [
          "errors",
          "failure",
          "retry",
          "timeout",
          "idempotency",
          "reconcile",
          "409",
          "오류",
          "실패",
          "재시도",
          "타임아웃",
          "멱등성",
          "대사"
        ]
      },
      {
        "id": "rate-limits",
        "q": "요청 횟수 제한(레이트 리밋)이나 처리량 상한이 있나요?",
        "a": [
          {
            "kind": "p",
            "text": "있습니다. 함께 쓰는 서비스를 보호하기 위한 합리적인 기본값입니다. IP당 verify는 초당 약 20건, settle은 초당 5건 수준입니다(서비스 전체의 상한은 더 높습니다). 초과하면 HTTP 429와 `Retry-After` 헤더로 응답하며, 동시에 진행 중인 settle 건수에도 상한이 있습니다. 그 아래 계층에서 XRPL 노드(원장에 접속해 주는 서버)에 보내는 요청은 간격을 늘려 가며 자동으로 재시도하고(백오프), 노드 제공자에 문제가 생기면 다른 제공자로 전환하는 차단 장치(서킷 브레이커)로 보호됩니다."
          },
          {
            "kind": "p",
            "text": "이는 운영상의 기본값일 뿐, 서비스 등급의 한계가 아닙니다. 그 이상의 처리량이 꾸준히 필요하다면 — 대규모 지갑 서비스, 트래픽이 많은 AI 추론 게이트웨이 등 — 문의해 주세요. 그에 맞게 용량을 준비해 드립니다."
          }
        ],
        "keywords": [
          "rate limit",
          "throughput",
          "429",
          "scale",
          "capacity",
          "qps",
          "레이트 리밋",
          "처리량",
          "용량",
          "제한"
        ]
      },
      {
        "id": "self-host",
        "q": "t54의 facilitator 대신 자체 facilitator를 운영할 수 있나요?",
        "a": [
          {
            "kind": "p",
            "text": "프로토콜 차원에서는 가능합니다. 먼저 정확히 짚어 두자면, **t54의 facilitator는 호스팅 서비스이지 오픈소스 부품이 아닙니다**. 기본적으로 t54가 등록한 `SourceTag`(거래에 찍히는 식별 번호, 값은 804681468)로 정산합니다. 다만 facilitator라는 *역할* 자체는 누구나 맡을 수 있도록 설계되어 있습니다. XRPL 스킴은 공개 명세로 정의되어 있고, 약속된 규칙은 JSON 엔드포인트 세 개가 전부이며, SDK는 어떤 `facilitatorUrl`이든 받아들입니다. 따라서 독립 운영을 원하는 팀은 명세를 구현하고, 자체 `SourceTag`를 찍고, 이 허브에 등록해 자신의 정산 규모를 Index에 올릴 수 있습니다. 등록은 직접 신청 방식이며 몇 분이면 끝납니다."
          },
          {
            "kind": "p",
            "text": "호스팅 서비스가 제공하는 것은 운영 계층입니다. 노드 이중화, 중복 정산을 막는 저장소, 요청 횟수 제한, x402 Secure 위험 관리 연동이 포함되며, 여러분 쪽에는 별도 인프라가 전혀 필요 없습니다. 대부분의 연동 팀은 호스팅으로 시작합니다. 자체 facilitator 구축은 완전한 독립 운영으로 가는 길이지, 시작하기 위한 전제 조건이 아닙니다."
          }
        ],
        "links": [
          {
            "label": "Facilitator 등록하기",
            "href": "/join/facilitator"
          }
        ],
        "keywords": [
          "self-host",
          "own facilitator",
          "run",
          "deploy",
          "sourcetag",
          "lock-in",
          "자체 호스팅",
          "셀프 호스팅",
          "직접 운영",
          "락인"
        ]
      },
      {
        "id": "sla",
        "q": "가동률, SLA, 상태 페이지, 장애 연락처는 어떻게 되나요?",
        "a": [
          {
            "kind": "p",
            "text": "호스팅 facilitator는 이중화된 XRPL 노드 제공자 위에서 운영되며, 문제가 생기면 자동으로 예비 노드로 전환됩니다(페일오버). 이 사이트의 Index는 서비스가 살아 있다는 공개 신호 역할도 합니다. 메인넷(실제 돈이 오가는 운영망) facilitator를 거친 정산은 몇 초 안에 홈페이지에서 확인할 수 있습니다. 공식 SLA(서비스 수준 협약), 상태 페이지 구독, 장애 알림 채널 구성은 파트너 온보딩 과정에 포함됩니다. 요구 사항을 알려주시면 조건을 문서로 정리해 드립니다."
          },
          {
            "kind": "p",
            "text": "위험을 평가할 때 참고할 점이 있습니다. facilitator가 멈추면 **새로운** 정산만 막힐 뿐, 자금에는 결코 영향을 주지 못합니다. 저희가 맡아 보관하는 자산이 없으므로, 영향을 받을 자금 자체가 없기 때문입니다. 가맹점은 원장에서 아무것도 바꾸지 않고 다른 facilitator(또는 자체 facilitator)로 갈아탈 수 있습니다."
          }
        ],
        "links": [
          {
            "label": "t54에 문의하기",
            "href": "mailto:support@t54.ai"
          }
        ],
        "keywords": [
          "sla",
          "uptime",
          "status",
          "incident",
          "availability",
          "support",
          "가동률",
          "상태 페이지",
          "인시던트",
          "가용성",
          "지원"
        ]
      }
    ]
  },
  {
    "id": "ecosystem",
    "title": "인덱스와 생태계",
    "blurb": "이 사이트의 실시간 수치가 집계되는 방식, 이곳에 이름을 올리는 방법, 그리고 t54 도구 모음의 나머지 구성 요소를 다룹니다.",
    "items": [
      {
        "id": "how-index-counts",
        "q": "인덱스는 실제로 거래를 어떻게 집계하나요? 수치를 신뢰할 수 있나요?",
        "a": [
          {
            "kind": "p",
            "text": "허브는 XRPL을 실시간으로 지켜보는 자체 집계 시스템(인덱서)을 운영합니다. `SourceTag`(거래에 찍히는 식별 번호)가 등록된 facilitator(결제 중개 서비스)의 태그와 일치하는, 검증된 `Payment` 거래가 모두 기록됩니다. 금액은 원장(모든 거래가 기록되는 장부)에 확정된 `delivered_amount`(실제 전달된 금액)에서 가져오며, 요청 금액은 절대 사용하지 않습니다. 자산별로 나누어 집계하므로, XRP와 RLUSD(미국 달러에 1:1로 연동된 디지털 화폐)가 하나의 수치로 합산되는 일은 없습니다. 거래마다 구매자, 가맹점, facilitator, 인보이스 연결 정보가 저장됩니다. 사이트의 모든 수치는 익스플로러(거래 조회 사이트)에서 직접 열어볼 수 있는 원장 위의 거래로 추적됩니다."
          },
          {
            "kind": "p",
            "text": "태그는 누구나 쓸 수 있는 공개 값이기 때문에, 집계 시스템은 일부러 의심 많게 설계되어 있습니다. 최소 기준에 못 미치는 먼지 수준의 소액 결제는 무시하므로, 아무도 스팸으로 리더보드(순위표)를 부풀릴 수 없습니다. 가맹점의 신원은 처음 검증될 때 수신 주소에 묶이므로, 나중에 들어온 402가 기존 가맹점을 사칭할 수도 없습니다."
          }
        ],
        "links": [
          {
            "label": "실시간 인덱스",
            "href": "/"
          },
          {
            "label": "탐지 사양",
            "href": "https://xrpl-x402.t54.ai/docs/xrpl-scheme"
          }
        ],
        "keywords": [
          "index",
          "count",
          "data",
          "methodology",
          "trust",
          "leaderboard",
          "delivered amount",
          "인덱스",
          "집계",
          "데이터",
          "방법론",
          "신뢰",
          "리더보드"
        ]
      },
      {
        "id": "register-facilitator",
        "q": "저희는 facilitator를 운영합니다. 저희 거래 규모는 어떻게 인덱스에 반영되나요?",
        "a": [
          {
            "kind": "p",
            "text": "직접 신청하는 방식이며 별도의 심사는 없습니다. 등록부에 이름과 `SourceTag`를 제출하면 됩니다(원하면 사이트, 네트워크, 자산도 함께 적을 수 있습니다). 그러면 집계 시스템이 해당 태그가 붙은 모든 XRPL 결제를 기록하기 시작합니다. 정산 규모, 총 거래 수, 활성 구매자 수가 facilitator 리더보드(순위표)에 표시됩니다. 소유권 증명은 필요하지 않습니다. SourceTag는 소유권을 주장할 수 있는 자산이 아니라, 이미 여러분이 자기 정산에 찍고 있는 표시이기 때문입니다."
          }
        ],
        "links": [
          {
            "label": "facilitator 등록하기",
            "href": "/join/facilitator"
          },
          {
            "label": "facilitator 리더보드",
            "href": "/facilitators"
          }
        ],
        "keywords": [
          "register",
          "facilitator",
          "sourcetag",
          "leaderboard",
          "index",
          "list",
          "등록",
          "등재",
          "리더보드",
          "인덱스"
        ]
      },
      {
        "id": "get-listed",
        "q": "저희 AI 서비스는 어떻게 디렉터리에 등재되나요?",
        "a": [
          {
            "kind": "p",
            "text": "운영 중인 x402 엔드포인트(접속 주소)를 등록하면 그 자리에서 바로 검증됩니다. 허브가 해당 URL에 확인 요청을 보내(GET 다음 POST — 실제 x402 엔드포인트가 응답하는 방식에 맞춘 순서입니다), XRPL 네트워크와 `payTo`를 명시한 유효한 `PAYMENT-REQUIRED`와 함께 402를 반환하는지 확인한 뒤 즉시 등재합니다. 사이트 오리진(도메인의 기본 주소)에 `/.well-known/x402` 카탈로그를 올려 두면 그 안의 모든 서비스가 자동으로 발견됩니다. 매시간 다시 확인하므로, 다시 제출하지 않아도 등재 정보가 최신 상태로 유지됩니다."
          },
          {
            "kind": "p",
            "text": "카탈로그에는 각 서비스의 이름과 설명을 적어 두세요(적힌 그대로 수집됩니다). 결제가 흐르기 시작하면 정산 활동이 같은 인덱스에 표시되어, 등재 정보와 수치가 서로를 뒷받침합니다. 아직 운영 중인 엔드포인트가 없다면 이메일을 보내 주세요. 간단히 검토한 뒤 등재해 드립니다."
          }
        ],
        "links": [
          {
            "label": "등재 신청",
            "href": "/join/service"
          },
          {
            "label": "디렉터리",
            "href": "/directory"
          }
        ],
        "keywords": [
          "directory",
          "listing",
          "well-known",
          "discovery",
          "merchant",
          "service",
          "디렉터리",
          "등재",
          "디스커버리",
          "머천트",
          "가맹점",
          "서비스"
        ]
      },
      {
        "id": "toolkit",
        "q": "SDK 외에 t54 도구 모음(툴킷)에는 무엇이 포함되나요?",
        "a": [
          {
            "kind": "p",
            "text": "**RLUSD CLI**(`npm install -g @rlusd/cli`, 명령어 `rlusd`) — 여러 체인에서 쓸 수 있는 RLUSD 명령줄 도구입니다. XRPL의 트러스트 라인(해당 토큰을 받을 수 있게 하는 계정 설정)과 결제, XRPL에 내장된 거래소 기능(DEX·AMM)을 통한 거래, Ethereum의 Uniswap/Aave, 이더리움 보조망(레이어2 — 앞서 나온 L1·L2 자격 증명 단계와는 무관한 용어입니다)으로의 Wormhole 브리징(체인 간 자산 이동), 암호화된 로컬 지갑, 그리고 지출 한도를 반드시 정해야 쓸 수 있는 구매자용 `rlusd x402 fetch`를 제공합니다. 무언가를 변경하는 모든 작업은 준비 → 검토 → 실행의 플랜 절차를 따르고, 플랜 파일은 위·변조 여부가 검증됩니다. 모든 기능이 `--json` 출력을 지원합니다. 사람만이 아니라 AI 에이전트(사람 대신 자동으로 일하는 인공지능 프로그램)가 구동하도록 설계되었기 때문입니다."
          },
          {
            "kind": "p",
            "text": "**RLUSD Skills** — 같은 작업 흐름을 Claude Code용 에이전트 스킬로 묶은 것입니다(`/plugin marketplace add t54-labs/rlusd-skills`). AI 에이전트가 별도의 맞춤 개발 없이, 보호 장치가 적용된 RLUSD 작업 흐름을 바로 쓸 수 있습니다. **ClawCredit** — t54의 리스크 엔진이 신용 심사를 담당하는, AI 에이전트 전용 신용(크레딧) 서비스입니다. 공식 XRPL 자료로는 Ripple의 에이전틱 트랜잭션 문서와 스킬, 그리고 XRPL 문서 MCP 서버가 있으며, 모두 자료 페이지에 링크되어 있습니다."
          }
        ],
        "links": [
          {
            "label": "전체 자료",
            "href": "/resources"
          },
          {
            "label": "rlusd-skills",
            "href": "https://github.com/t54-labs/rlusd-skills"
          }
        ],
        "keywords": [
          "cli",
          "rlusd",
          "skills",
          "clawcredit",
          "tools",
          "toolkit",
          "mcp",
          "툴킷",
          "도구",
          "스킬"
        ]
      },
      {
        "id": "official-xrpl-resources",
        "q": "AI 에이전트 개발을 위한 공식 XRPL 자료에는 무엇이 있나요?",
        "a": [
          {
            "kind": "p",
            "text": "XRPL의 공식 **에이전틱 트랜잭션 가이드**와 AI 스타터 킷에서 시작하세요. **XRPL Agent Wallet Skill**과 **XRPL Payments Skill**은 `npx skills` 명령으로 Claude Code(또는 스킬을 지원하는 다른 AI 에이전트)에 설치합니다. 이 스킬들은 엄격한 보안 모델을 중심으로 설계되어 있습니다. 모든 서명 전에 사람이 먼저 확인합니다. 자동 서명은 범위와 시간이 제한됩니다. KMS/HSM(서명 열쇠를 금고처럼 따로 보관해 주는 장비나 서비스) 구성을 위한 외부 서명자를 지원합니다. SourceTag와 Memo로 거래의 출처를 표시합니다. 따라서 자체 시스템을 만드는 경우에도, 운영 환경의 AI 에이전트가 XRPL 키를 어떻게 다뤄야 하는지 보여 주는 확실한 참고 자료가 됩니다."
          },
          {
            "kind": "p",
            "text": "이와 함께 **XRPL Docs MCP Server**는 AI 에이전트가 XRPL 공식 문서에 근거해 일하도록 돕습니다. **`xrpl-up`**은 로컬 개발용 Ripple CLI입니다. 미리 충전된 계정, 스크립트 실행, 스냅샷, 테스트넷/데브넷(연습용 망) 접속을 갖춘 내 컴퓨터 안의 연습 환경(샌드박스)이며, Claude Code 플러그인도 제공합니다. 그리고 **XRPL Commons가 `xrpl-dev-skills`를 유지 관리**합니다. XRPL 개발을 위한 커뮤니티 에이전트 스킬 모음입니다. 이들은 t54 스택과 깔끔하게 맞물립니다. 공식 스킬이 지갑과 결제를 담당하고, `x402-xrpl`이 그 위에 유료 API 핸드셰이크(결제 요청과 응답 절차)와 facilitator 정산을 더합니다."
          }
        ],
        "links": [
          {
            "label": "에이전틱 트랜잭션 가이드",
            "href": "https://xrpl.org/docs/agents/getting-started-with-agentic-transactions"
          },
          {
            "label": "XRPL AI 도구 (MCP)",
            "href": "https://xrpl.org/resources/dev-tools/ai-tools"
          },
          {
            "label": "xrpl-up",
            "href": "https://github.com/ripple/xrpl-up"
          },
          {
            "label": "xrpl-dev-skills",
            "href": "https://github.com/XRPL-Commons/xrpl-dev-skills"
          }
        ],
        "keywords": [
          "official",
          "ripple",
          "xrpl.org",
          "starter kit",
          "agent kit",
          "skills",
          "mcp",
          "xrpl-up",
          "commons",
          "공식",
          "스타터 킷",
          "에이전트 킷",
          "스킬"
        ]
      },
      {
        "id": "who-to-talk-to",
        "q": "연동 지원이나 심층 기술 논의는 누구에게 문의하면 되나요?",
        "a": [
          {
            "kind": "p",
            "text": "**support@t54.ai**로 메일을 보내면 자동 접수 대기열이 아니라 엔지니어링 팀에게 직접 전달됩니다. 연동 질문, 설계 검토, 지갑 실사 미팅, 파트너 소개 모두 여기서 시작됩니다. 파트너사나 여러 프로젝트를 대신해 평가 중이라면 실시간 기술 질의응답도 기꺼이 진행합니다. 질문 목록을 미리 보내 주시면 준비된 상태로 참석하겠습니다."
          },
          {
            "kind": "p",
            "text": "그리고 한 가지 변함없는 약속이 있습니다. 이 페이지에 답이 없는 실제 연동 질문을 받으면, 답변을 드리는 *동시에* 이 페이지에도 그 내용을 추가합니다. 여러분이 물어봐야 했던 것이라면, 다음 팀은 물어볼 필요가 없어야 하기 때문입니다."
          }
        ],
        "links": [
          {
            "label": "support@t54.ai",
            "href": "mailto:support@t54.ai"
          }
        ],
        "keywords": [
          "contact",
          "support",
          "help",
          "bd",
          "partner",
          "korea",
          "meeting",
          "문의",
          "지원",
          "연락처",
          "파트너",
          "한국",
          "미팅"
        ]
      }
    ]
  }
];
