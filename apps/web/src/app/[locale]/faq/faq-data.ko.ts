// Korean FAQ content — technical register for engineer readers (per KR-team feedback,
// question phrasing and terminology proofread by the KR team, 2026-07-31).
import type { FaqCategory } from "./faq-data";

export const FAQ_CATEGORIES_KO: FaqCategory[] = [
  {
    "id": "protocol",
    "title": "프로토콜 및 아키텍처",
    "blurb": "XRPL에서 x402가 실제로 어떻게 구현되는지, 그리고 에이전트 결제가 와이어와 렛저 상에서 각각 어떻게 보이는지 다룹니다.",
    "items": [
      {
        "id": "what-is-x402-xrpl",
        "q": "x402란 무엇이며, XRPL에선 어떻게 작동하나요?",
        "a": [
          {
            "kind": "p",
            "text": "x402는 HTTP 상태 코드 402를 실제 결제 핸드셰이크로 바꿉니다. 서버가 요청에 가격으로 응답하면 클라이언트가 결제하고, 재시도 시 요청이 성공합니다. EVM 체인에서는 이 흐름이 스마트 컨트랙트 위에서 동작하지만, XRPL에는 호출할 컨트랙트가 없습니다 — 결제가 네이티브 `Payment` 트랜잭션이기 때문에, XRPL 스킴은 대신 **사전 서명된 트랜잭션 블롭**을 사용합니다."
          },
          {
            "kind": "p",
            "text": "전체 흐름은 다음과 같습니다. (1) 에이전트가 여러분의 엔드포인트에 요청을 보냅니다. (2) 서버는 결제 요구 사항(스킴, 네트워크, 자산, 금액, `payTo`, 일회성 `invoiceId`)을 담은 `PAYMENT-REQUIRED` 헤더와 함께 `402`로 응답합니다. (3) 에이전트는 해당 인보이스를 바인딩한 XRPL `Payment`에 서명하고 `PAYMENT-SIGNATURE` 헤더를 붙여 재시도합니다. (4) 서버는 서명된 블롭을 facilitator에 전달하고, facilitator가 이를 검증한 뒤 XRPL에 제출합니다. (5) 렛저에서 검증이 완료되면 서버는 리소스와 함께, 정산된 트랜잭션 해시를 담은 `PAYMENT-RESPONSE` 헤더를 반환합니다."
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
        "q": "와이어로는 헤더, 페이로드, 버전 중에 정확히 무엇이 전송되나요?",
        "a": [
          {
            "kind": "p",
            "text": "메시지는 세 가지이며, 모두 base64로 인코딩된 정규화(canonical) JSON입니다. 402 응답 본문(`PAYMENT-REQUIRED` 헤더에도 동일하게 담김)은 x402 **v2** `PaymentRequired`입니다: `{ x402Version: 2, resource, accepts: [PaymentRequirements], extensions }`. 재시도 요청에는 `PAYMENT-SIGNATURE` = v2 `PaymentPayload`의 base64가 실립니다 — `{ x402Version: 2, accepted, payload: { signedTxBlob, invoiceId }, extensions }`. 성공 응답에는 `PAYMENT-RESPONSE` = `{ success, transaction, network, payer }`의 base64가 실립니다."
          },
          {
            "kind": "p",
            "text": "각 `PaymentRequirements` 항목은 `{ scheme: \"exact\", network: \"xrpl:0|1|2\", payTo, asset, amount, maxTimeoutSeconds, extra }` 형태이며, `extra`에는 `invoiceId`가, 발행 자산의 경우 `issuer`가 담깁니다. SDK가 모든 헤더에 대한 인코딩/디코딩 헬퍼를 제공하므로 JSON을 직접 조립할 필요가 없습니다."
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
        "q": "x402 결제는 온체인에서 어떻게 보이나요?",
        "a": [
          {
            "kind": "p",
            "text": "완전히 표준적인 XRPL `Payment`로 정산되며, 어떤 익스플로러에서도 조회할 수 있습니다:"
          },
          {
            "kind": "code",
            "body": "TransactionType  \"Payment\"\nAccount          buyer (the agent's address)\nDestination      payTo (the merchant's address)\nAmount           drops for XRP · { currency, issuer, value } for RLUSD/IOUs\nSourceTag        the facilitator's tag (t54 hosted: 804681468)\nInvoiceID        SHA-256 of the invoiceId          ┐ replay\nMemos[0]         hex-encoded invoiceId             ┘ protection\nLastLedgerSequence  bounds how long the blob stays valid"
          },
          {
            "kind": "p",
            "text": "`SourceTag`는 온체인 지문 역할을 하며, 이 허브의 인덱서를 포함해 누구든 해당 결제를 정산한 facilitator를 식별할 수 있게 합니다. 래핑 토큰도, 컨트랙트 이벤트도, 오프체인 정산 레이어도 없습니다."
          }
        ],
        "links": [
          {
            "label": "XRPL Payment 레퍼런스",
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
          "익스플로러"
        ]
      },
      {
        "id": "why-presigned",
        "q": "왜 사전 서명 트랜잭션을 쓰나요? facilitator는 왜 필요한 거예요?",
        "a": [
          {
            "kind": "p",
            "text": "사전 서명은 신뢰 모델을 최소한으로 유지합니다. 결제자는 완전한 형태의 `Payment`에 로컬에서 서명하고 **서명된 블롭**만 전달합니다. facilitator는 이를 제출하거나 버리는 것만 할 수 있으며, 서명을 깨뜨리지 않고서는 금액·목적지·수수료를 비롯해 그 무엇도 변경할 수 없습니다. 키는 서명자를 벗어나지 않으며, 어느 시점에도 누구도 자금을 커스터디하지 않습니다."
          },
          {
            "kind": "p",
            "text": "facilitator는 모든 리소스 서버가 XRPL 인프라를 직접 운영하지 않아도 되도록 존재합니다. 블롭을 디코딩하고, 스킴의 불변 조건(금액이 인보이스와 일치하는지, 인보이스 바인딩이 존재하는지, 수수료가 상한 이내인지, 올바른 네트워크인지)을 확인한 뒤 XRPL에 제출하고 검증을 기다립니다. 머천트는 렛저 노드와 재시도 로직을 직접 운영하는 대신 `/verify`와 `/settle` 두 개의 엔드포인트 계약만 다루면 됩니다."
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
          "키"
        ]
      },
      {
        "id": "networks-assets",
        "q": "어떤 네트워크와 자산이 지원되나요?",
        "a": [
          {
            "kind": "p",
            "text": "네트워크는 CAIP-2 식별자를 사용합니다: `xrpl:0`(메인넷), `xrpl:1`(테스트넷), `xrpl:2`(데브넷). t54는 메인넷(`xrpl-facilitator-mainnet.t54.ai`)과 테스트넷(`xrpl-facilitator-testnet.t54.ai`)용 호스티드 facilitator를 운영합니다. 테스트넷에는 공개 faucet이 있으므로 엔드투엔드 연동 테스트에는 비용이 전혀 들지 않습니다."
          },
          {
            "kind": "p",
            "text": "자산: **XRP**는 drops 단위로 가격을 지정하며(`\"1000000\"` = 1 XRP), RLUSD를 포함한 모든 **발행 토큰(IOU)**은 십진수 값 문자열과 발행자 주소로 가격을 지정합니다. 하나의 요구 사항은 하나의 자산을 고정하지만, 서버는 `accepts[]`에 여러 옵션(예: XRP와 RLUSD)을 제시해 결제자가 선택하게 할 수 있습니다."
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
        "q": "리플레이(replay)와 이중 지불은 어떻게 방지하나요?",
        "a": [
          {
            "kind": "p",
            "text": "서로 독립적인 세 개의 계층이 있습니다. **인보이스 바인딩**: 모든 결제는 일회성 `invoiceId`를 반드시 포함해야 합니다 — `Memos`에 hex로, `InvoiceID`에 SHA-256 해시로, 또는 둘 다(SDK 기본값은 둘 다) 넣습니다. facilitator는 바인딩이 결제 대상 인보이스와 일치하지 않는 블롭을 거부합니다. **일회용 인보이스**: 서버 미들웨어는 정산이 성공하면 해당 인보이스를 소진 처리하므로, 같은 서명 블롭으로 리소스를 두 번 구매할 수 없습니다. **렛저 수준**: XRPL 트랜잭션은 하나의 시퀀스 번호와 `LastLedgerSequence`를 가지므로, 한 번 검증(또는 만료)되면 다시는 실행될 수 없습니다."
          },
          {
            "kind": "p",
            "text": "여기에 더해 `/settle`은 멱등(idempotent)합니다. 동일한 정산 요청을 재시도하면 이중 제출 대신 캐시된 결과가 반환되고, 첫 번째 시도가 진행 중인 동안 동시에 들어온 중복 요청은 HTTP 409를 받습니다."
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
        "q": "더 넓은 x402 생태계와 호환되나요, 아니면 XRPL 전용 포크인가요?",
        "a": [
          {
            "kind": "p",
            "text": "XRPL 전용 스킴을 갖춘 x402 v2 프로토콜입니다. HTTP 핸드셰이크, 헤더 이름, `PaymentRequired` / `PaymentPayload` / `SettlementResponse` 구조, 그리고 facilitator의 `/verify` · `/settle` · `/supported` 계약은 x402 사양을 그대로 따릅니다. XRPL 고유의 부분은 `exact` 스킴의 페이로드로, EVM의 `transferWithAuthorization` 대신 사전 서명된 네이티브 `Payment` 블롭을 사용합니다. 이미 x402를 지원하는 클라이언트라면 새 프로토콜이 아니라 XRPL 스킴 모듈만 추가하면 됩니다."
          },
          {
            "kind": "p",
            "text": "이 스킴은 facilitator 문서 사이트에 공개적으로 문서화되고 버전 관리됩니다. 또한 허브는 라이브 XRPL 엔드포인트의 x402 형식 디스커버리 피드를 게시하므로, 멀티체인 x402 도구가 EVM 서비스와 나란히 이들을 나열할 수 있습니다."
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
    "blurb": "TypeScript 또는 Python으로 엔드포인트에 요금을 부과하고 에이전트로서 결제하는 방법, 그리고 그 외 스택에서의 대응 방법까지 다룹니다.",
    "items": [
      {
        "id": "sdks",
        "q": "어떤 SDK가 있고, 무엇을 제공하나요?",
        "a": [
          {
            "kind": "p",
            "text": "하나의 SDK를 두 언어로, 동일한 사용성으로 제공합니다. **TypeScript** — `npm i x402-xrpl` (Node 18+, MIT, ESM + CJS): Express `requirePayment` 미들웨어, `x402Fetch` 구매자 클라이언트, 통화 헬퍼, 헤더 코덱, Verifiable Intent 체인 빌더를 포함합니다. **Python** — `pip install x402-xrpl` (Python 3.11+, `x402_xrpl`로 import): FastAPI/Starlette `require_payment` 미들웨어, `requests` 세션 기반 구매자 클라이언트, 원샷 `x402_purchase` 헬퍼를 포함합니다."
          },
          {
            "kind": "p",
            "text": "프로토콜의 양쪽을 모두 지원합니다. 머천트로서 라우트에 결제를 요구하는 것도, 에이전트로서 402에 결제하는 것도 각각 몇 줄이면 됩니다."
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
        "q": "API 라우트에 어떻게 과금하나요?",
        "a": [
          {
            "kind": "p",
            "text": "라우트를 미들웨어로 감싸고, 가격과 수취 주소를 설정한 뒤 facilitator를 지정하면 됩니다. 미결제 요청에는 자동으로 402가 반환되고, 핸들러는 결제가 정산된 후에만 실행되며, 정산 상세 정보는 요청 컨텍스트에서 확인할 수 있습니다."
          },
          {
            "kind": "code",
            "lang": "ts",
            "body": "import { requirePayment } from \"x402-xrpl/express\";\n\napp.use(requirePayment({\n  path: \"/ai-news\",\n  price: \"1000\",                       // XRP drops; IOUs use a value string like \"1.25\"\n  payToAddress: \"rYourAddress...\",\n  network: \"xrpl:0\",\n  asset: \"XRP\",\n  facilitatorUrl: \"https://xrpl-facilitator-mainnet.t54.ai\",\n}));"
          },
          {
            "kind": "p",
            "text": "Python도 동일한 구조입니다. `require_payment(path=..., price=..., pay_to_address=..., facilitator_url=...)`를 FastAPI/Starlette HTTP 미들웨어로 등록합니다. 양쪽 모두에서 유용한 옵션으로 라우트당 복수 결제 옵션(예: XRP **및** RLUSD), 인보이스 TTL(기본 900초), 검증 전용 모드를 위한 `settle: false`, 교체 가능한 인보이스 스토어(프로덕션에서는 기본 인메모리 대신 Redis/DB 사용)를 지원합니다."
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
          "미들웨어",
          "과금",
          "판매"
        ]
      },
      {
        "id": "pay-as-agent",
        "q": "에이전트는 402에 어떻게 결제하나요?",
        "a": [
          {
            "kind": "p",
            "text": "구매자 클라이언트에 지갑을 넘기고 `fetch`처럼 URL을 호출하면 됩니다. 402를 받으면 `accepts[]`를 파싱하고, 설정한 필터를 통과하는 결제 요구사항을 선택한 뒤, `Payment`를 로컬에서 서명하고 한 번 재시도합니다 — 전체 교환이 await 한 번으로 끝납니다. 클라이언트는 facilitator와 통신하지 않으며, 계정 정보 조회를 위한 XRPL WebSocket 접근만 필요합니다."
          },
          {
            "kind": "code",
            "lang": "ts",
            "body": "import { x402Fetch } from \"x402-xrpl\";\nimport { Wallet } from \"xrpl\";\n\nconst fetchPaid = x402Fetch({\n  wallet: Wallet.fromSeed(process.env.XRPL_SEED!),\n  network: \"xrpl:0\",\n  maxValue: \"1000000\",   // refuse anything above 1 XRP\n});\nconst res = await fetchPaid(\"https://api.example.com/ai-news\");"
          },
          {
            "kind": "p",
            "text": "가드레일이 내장되어 있습니다. `maxValue`는 호출당 지출 상한을 정하고, `networkFilter`/`schemeFilter`는 수락 대상을 제한하며, `confirmationMode`로 서명 전에 사람의 확인을 요구할 수 있습니다. Python에서는 `x402_requests(wallet, ...)`가 동일하게 동작하는 드롭인 `requests` 세션을 반환합니다."
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
        "q": "라우트 가격을 RLUSD로 지정하려면 어떻게 하나요?",
        "a": [
          {
            "kind": "p",
            "text": "RLUSD는 발행형 토큰이므로 결제 요구사항에 세 가지가 필요합니다. **40자리 16진수 통화 코드**(`524C555344000000000000000000000000000000` — \"RLUSD\"는 5글자로, XRPL 일반 코드의 3글자 제한을 초과합니다), **발행자 주소**, 그리고 **십진수 값 문자열로 표기한 가격**(예: `\"1.25\"`)입니다. 표시용 심볼 변환은 SDK가 처리합니다:"
          },
          {
            "kind": "code",
            "lang": "ts",
            "body": "import { resolveCurrencyCode } from \"x402-xrpl\";\n\nconst asset = resolveCurrencyCode(\"RLUSD\", { allowUtf8Symbol: true });\n// → \"524C555344000000000000000000000000000000\"\n\napp.use(requirePayment({\n  path: \"/report\", price: \"1.25\", asset,\n  issuer: \"rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De\",   // RLUSD mainnet issuer\n  payToAddress: \"rYourAddress...\", network: \"xrpl:0\",\n  facilitatorUrl: \"https://xrpl-facilitator-mainnet.t54.ai\",\n}));"
          },
          {
            "kind": "p",
            "text": "금액은 검증 시점에 정확히 일치해야 합니다(IOU는 십진수 동등 비교, XRP는 정수 drops) — 반올림으로 어긋나는 일은 없습니다. 결제자가 RLUSD를 보유하거나 전송하려면 먼저 발행자에 대한 트러스트 라인이 필요하다는 점을 기억하세요(지갑 섹션 참조)."
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
        "q": "테스트넷과 로컬 개발 환경은 어떻게 지원되나요?",
        "a": [
          {
            "kind": "p",
            "text": "프로덕션과 완전히 동일합니다. 모든 설정을 `xrpl:1`과 호스팅 테스트넷 facilitator(`xrpl-facilitator-testnet.t54.ai`)로 지정하고, 공개 XRPL 테스트넷 포싯(faucet)에서 지갑에 자금을 받은 뒤, 메인넷에 배포할 코드와 동일한 코드를 실행하면 됩니다 — SDK의 기본 네트워크가 `xrpl:1`인 것도 개발 중 실수로 실제 자금이 지출되는 일을 막기 위해서입니다."
          },
          {
            "kind": "p",
            "text": "호스팅 테스트넷 facilitator가 곧 개발 환경입니다 — 설치하거나 운영할 것이 없으며, 전체 루프(402, 서명, `/verify`, `/settle`)를 로컬 머신에서 그대로 실행할 수 있습니다. 테스트넷에서 RLUSD와 유사한 플로우가 필요하면 일회용 발행자로 테스트 IOU를 직접 발행하면 됩니다 — 그 패턴은 facilitator 문서에 나와 있으며, QA가 트러스트 라인 엣지 케이스를 실제에 가깝게 검증하는 데도 유용합니다."
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
        "q": "저희는 Express나 FastAPI를 쓰지 않습니다 — Kotlin, Swift, Go, Rust, Java는 지원되나요?",
        "a": [
          {
            "kind": "p",
            "text": "이 프로토콜은 일반 HTTP에 문서화된 스킴을 더한 것이므로 저희 SDK가 필수는 아닙니다. 서버에서 할 일은 `PAYMENT-REQUIRED` 헤더와 함께 402를 반환한 뒤, 수신한 `PAYMENT-SIGNATURE` 페이로드를 facilitator의 `/verify` 및 `/settle` JSON 엔드포인트로 전달하는 것 — POST 호출 두 번입니다. 클라이언트에서 할 일은 `accepts[]`를 파싱하고, 인보이스 바인딩을 포함한 표준 XRPL `Payment`를 구성해 서명한 뒤(주요 언어마다 XRPL 라이브러리가 있습니다 — xrpl.js, xrpl-py, xrpl4j, 그리고 커뮤니티의 Swift/Go/Rust 클라이언트), 해당 헤더와 함께 재시도하는 것입니다."
          },
          {
            "kind": "p",
            "text": "XRPL Exact Scheme 스펙에 모든 필드와 불변 조건이 문서화되어 있으며, TypeScript/Python 소스가 동작을 대조할 수 있는 레퍼런스 구현입니다. 네이티브 모바일 지갑 연동을 구축하다 스펙에서 빠진 부분을 발견하면 알려주세요 — 저희는 그것을 스펙 버그로 취급합니다."
          }
        ],
        "links": [
          {
            "label": "XRPL 스킴 스펙",
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
    "title": "지갑, 키, 커스터디",
    "blurb": "지갑을 개발하는 팀이 가장 먼저 묻는 질문들: 누가 무엇을 보유하는지, 사용자에게 무엇이 보이는지, XRPL 고유의 작동 방식은 무엇인지.",
    "items": [
      {
        "id": "custody",
        "q": "플로우 진행 중 어느 단계에서든 키나 자금을 보유하는 주체는 누구인가요?",
        "a": [
          {
            "kind": "p",
            "text": "오직 지불인뿐입니다. 서명 키는 지갑 또는 에이전트 런타임에 머무릅니다 — SDK가 로컬에서 서명한 뒤 **서명된 블롭(signed blob)**을 전송하며, 이 블롭은 제출 아니면 폐기만 가능합니다: facilitator는 서명을 무효화하지 않고서는 목적지, 금액, 수수료를 물리적으로 변경할 수 없습니다. 자금은 구매자에서 머천트로 단일 원자적 렛저 트랜잭션으로 이동하며, 중간에 에스크로 계정도, 풀링된 잔액도, facilitator 지갑도 없고, 유출될 수 있는 API 키도 없습니다."
          },
          {
            "kind": "p",
            "text": "이 스택이 정책이 아니라 구조적으로 논커스터디인 이유가 여기에 있습니다: 어떤 단계에서도 t54 시스템이 스스로 사용자 자금을 이동시킬 능력을 갖지 않습니다."
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
          "서명"
        ]
      },
      {
        "id": "wallet-402-ux",
        "q": "저희가 지갑을 개발 중이라면, 402를 인터셉트(intercept) 했을 때 무엇을 렌더링해야 합니까?",
        "a": [
          {
            "kind": "p",
            "text": "`PAYMENT-REQUIRED` 헤더를 디코딩하면(base64 → JSON) 확인 화면에 필요한 모든 정보가 `accepts[]`의 옵션별로 들어 있습니다: `amount` + `asset`(IOU의 경우 `issuer` 포함), `payTo` 목적지, `network`, `maxTimeoutSeconds`, 그리고 리소스의 URL과 설명입니다. 여러 옵션이 제시된 경우(예: XRP와 RLUSD) 이는 사용자의 선택이거나 지갑 정책의 영역입니다 — 이 페이로드는 맹목적으로 서명되는 것이 아니라 화면에 렌더링되도록 명시적으로 설계되었습니다."
          },
          {
            "kind": "p",
            "text": "정산 후에는 `PAYMENT-RESPONSE`의 트랜잭션 해시를 표시하세요 — 어떤 XRPL 익스플로러로도 바로 연결되며, 대부분의 결제 레일이 제공할 수 있는 것보다 실질적으로 더 나은 영수증입니다. 표시용으로는 SDK가 `displayCurrencyCode` 등의 헬퍼를 제공하여 40자리 16진수 코드를 사람이 읽을 수 있는 심볼로 되돌립니다."
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
        "q": "RLUSD 지불자에게 트러스트 라인(trust line)과 리저브(reserve)는 어떻게 작동합니까?",
        "a": [
          {
            "kind": "p",
            "text": "계정이 RLUSD를 보유하거나 보내려면 먼저 RLUSD 발행자에 대한 **트러스트 라인**이 필요합니다 — 한 번만 실행하는 `TrustSet` 트랜잭션으로, 트러스트 라인이 존재하는 동안 소액의 소유자 준비금(현재 0.2 XRP)이 묶입니다. 지갑에 적합한 UX는 사전 점검입니다: 사용자가 RLUSD 결제 요구사항을 처음 만나는 시점에 트러스트 라인을 확인하고, 플로우 도중에 실패하게 두는 대신 결제 전에 원탭 설정을 제안하세요."
          },
          {
            "kind": "p",
            "text": "바로 이를 위한 도구가 이미 있습니다: RLUSD CLI는 `rlusd xrpl trustline setup / status / remove`와 에이전트용 prepare/execute 변형을 제공하며, 결제 사전 점검은 목적지가 RLUSD를 받을 수 없으면 타입이 지정된 `TRUSTLINE_MISSING` 오류로 실패합니다 — 지갑이 지불인에 대해 수행해야 하는 것과 동일한 검사입니다."
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
        "q": "가짜 RLUSD 발행자로부터 사용자를 어떻게 보호하나요?",
        "a": [
          {
            "kind": "p",
            "text": "XRPL에서 통화 코드는 단순한 라벨입니다 — 누구든 코드가 \"RLUSD\"로 디코딩되는 토큰을 발행할 수 있습니다 — 따라서 **발행자 주소가 곧 토큰의 정체성**이며, 모든 결제 요구사항에 명시적으로 고정되어 있습니다(`extra.issuer`). 지갑은 이 주소를 해당 네트워크에 대해 Ripple이 공식 게시한 RLUSD 발행자 주소와 대조해 검증하고, 불일치 시 강하게 경고해야 합니다 — EVM 체인에서 컨트랙트 주소를 검증하는 것과 정확히 같은 방식입니다."
          },
          {
            "kind": "p",
            "text": "구매자 도구도 이를 강제합니다: RLUSD CLI의 x402 명령은 `--require-issuer` 옵션을 받아 에이전트가 기대한 발행자를 명시한 요구사항에만 결제하도록 하며, 네트워크를 전환하면 CLI가 공식 발행자 주소를 자동으로 교체합니다."
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
        "q": "사전 서명된 블롭은 시퀀스 번호를 써버립니다. 그러면 동시 트랜잭션은 어떻게 처리하나요?",
        "a": [
          {
            "kind": "p",
            "text": "이 윈도우는 \"사전 서명\"이라는 표현이 시사하는 것보다 짧습니다: 구매자 클라이언트는 **402 수신 시점에** 서명하고 facilitator가 즉시 제출하므로, 블롭이 전송 중인 시간은 보통 수 초이며 `LastLedgerSequence`(렛저 마감을 약 5초로 가정하고 `maxTimeoutSeconds`에서 파생)로 상한이 정해집니다. 그래도 XRPL 시퀀스 규칙은 그대로 적용됩니다 — 같은 계정의 다른 트랜잭션이 먼저 반영되면 블롭은 제출 시점에 깔끔하게 실패하고 facilitator가 실패를 보고하며, 자금은 이동하지 않습니다."
          },
          {
            "kind": "p",
            "text": "프로덕션 에이전트에는 **전용 결제 계정**을 권장합니다(트레저리에서 자금을 공급하세요. XRPL 계정 생성 비용은 저렴합니다). 그러면 x402 트래픽이 다른 활동과 섞이지 않습니다. 결제 빈도가 높은 지불인은 계정별로 결제를 직렬화해야 합니다. 아키텍처상 진정한 병렬 사전 서명이 필요하다면 — 예: Tickets — 저희에게 문의하세요. 이 스킴은 이 부분에서 의도적으로 보수적입니다."
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
        "q": "RegularKey, SignerList 멀티시그, MPC/HSM 구성도 동작하나요?",
        "a": [
          {
            "kind": "p",
            "text": "이 스킴은 표준적으로 서명된 XRPL `Payment` 블롭을 검증할 뿐, 서명이 어떻게 만들어졌는지는 관여하지 않습니다 — 마스터 키, 교체된 `RegularKey`, HSM/MPC 경계 뒤로 외부화된 서명 모두 동일한 와이어 포맷을 만들어냅니다. 여기서 XRPL의 계정 모델은 실질적인 강점입니다: `RegularKey`는 계정 주소를 바꾸지 않고 키를 교체할 수 있게 하고, `SignerList`(쿼럼을 갖춘 최대 32개의 가중 서명자)는 m-of-n 제어를 프로토콜 수준에서 표현합니다."
          },
          {
            "kind": "p",
            "text": "솔직한 주의사항 하나: 에이전트 결제 플로우는 지연에 민감하므로(인보이스는 몇 분 안에 만료됩니다) 상호작용이 필요한 멀티사인 절차는 402 재시도 루프에 잘 맞지 않습니다. MPC나 임계값 서명을 사용하는 지갑은 테스트넷 facilitator를 상대로 전체 플로우를 엔드투엔드로 실행해 보시기 바랍니다 — 연동 검증은 저희가 직접 함께 진행해 드리겠습니다."
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
        "q": "이미 Source/Destination 태그와 메모를 사용하고 있습니다. 이 경우 x402랑 충돌하나요?",
        "a": [
          {
            "kind": "p",
            "text": "대체로 충돌하지 않으며, 지켜야 할 규칙이 하나 있습니다. x402 결제의 **`SourceTag`**는 정산을 수행하는 facilitator를 식별합니다(Index가 거래량을 귀속시킬 때 사용하는 값입니다). 따라서 구매자 측 인프라가 이를 덮어써서는 안 됩니다 — 이 태그는 지갑 관례가 아니라 결제 요구사항에서 설정됩니다. **`DestinationTag`**는 머천트 측 라우팅용으로 자유롭게 남아 있습니다: 요구사항이 태그를 포함할 수 있고, XRPL의 서브 계정 패턴(수신 주소 하나에 여러 태그)이 그대로 동작합니다 — facilitator 또는 머천트 주소 하나가 전체 플릿으로 분기할 수 있습니다."
          },
          {
            "kind": "p",
            "text": "`Memos[0]`과 `InvoiceID`는 인보이스 바인딩용으로 예약되어 있습니다. SDK가 발급하는 인보이스 ID는 무작위 UUID로, 의도적으로 불투명합니다. 서버를 직접 구축한다면 이 원칙을 유지하세요: 주문 상세나 개인 정보를 invoiceId에 절대 인코딩하지 마세요. 메모는 렛저에 영구히 공개되기 때문입니다."
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
        "q": "에이전트가 지출할 수 있는 금액을 어떻게 제한하나요?",
        "a": [
          {
            "kind": "p",
            "text": "여러 계층으로, 비용이 가장 낮은 것부터 가장 강력한 것 순으로 적용합니다. **클라이언트 측**: 구매자 클라이언트의 `maxValue`는 한도를 초과하는 모든 요구사항을 거부하고, `confirmationMode`는 서명 전에 사람의 승인을 강제할 수 있습니다. RLUSD CLI의 x402 명령은 `--max-value` 한도를 필수로 요구합니다. **계정 측**: 에이전트 전용 계정에 운영 예산만큼만 자금을 넣으세요 — XRPL에서 계정 잔액은 누구도 에이전트를 설득해 넘게 만들 수 없는 절대 상한입니다. **정책 측**: Verifiable Intent 위임(L2)은 소유자가 승인한 지출 한도를 암호학적으로 바인딩하고, facilitator가 정산 전에 이를 강제합니다 — 에이전트 자신의 코드로는 제거할 수 없는 한도입니다."
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
    "blurb": "리스크 레이어(Risk Layer): 자금이 이동하기 전에 에이전트가 승인되었음을 증명하는 방법과, 문제가 생겼을 때 생기는 일을 다룹니다.",
    "items": [
      {
        "id": "what-is-x402-secure",
        "q": "x402 Secure / Verifiable Intent 체인이란 무엇인가요?",
        "a": [
          {
            "kind": "p",
            "text": "에이전트의 권한을 사후에 로그로 주장하는 대신 **정산 전에 증명 가능**하게 만드는 내장형 리스크 제어 레이어입니다. 결제에는 세 단계로 연결된 크리덴셜 체인이 함께 실립니다. **L1** — Trustline(t54의 에이전트 네이티브 리스크 엔진)이 발급하여 에이전트의 신원을 증명하는 Know-Your-Agent 크리덴셜, **L2** — 이 에이전트가 무엇에 얼마를 지출할 수 있는지를 규정하는 소유자 서명 위임, **L3** — 구체적인 행위에 대해 에이전트가 결제 건마다 생성하는 서명. 이 체인은 x402 페이로드의 `extensions.x402Secure` 필드에 SD-JWT 크리덴셜 형태로 전달됩니다."
          },
          {
            "kind": "p",
            "text": "호스티드 facilitator는 이 봉투를 받으면 정산 전에 x402 Secure를 호출합니다. Trustline이 체인과 해당 리스크 정책을 검증하고 허용/거부를 반환합니다. 거부되면 결제는 렛저에 도달하지 않으며, 이 게이트는 **fail-closed**로 동작합니다. 즉, 리스크 서비스에 연결할 수 없으면 결정은 \"검사 없이 진행\"이 아니라 거부입니다. Verifiable Intent는 Mastercard가 Agent Pay for Machines와 함께 공개한 프레임워크이며, t54 Labs는 이를 XRPL에서 구현하는 공식 런칭 파트너입니다."
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
            "text": "아니요. 일반 x402 결제는 x402 Secure 필드 없이 정상적으로 정산됩니다. 이 레이어는 설계상 옵트인이므로, 오후 한나절에 유료 엔드포인트를 먼저 출시하고 자율 지출이 본격화될 때 리스크 레이어를 추가하면 됩니다. SDK에서는 구매자 클라이언트에 붙이는 `verifiableIntentProvider`로 제공되며, 서버 측에서는 미들웨어에 정책 ID를 지정하면 광고할 요구사항을 facilitator에 조회합니다."
          },
          {
            "kind": "p",
            "text": "솔직한 권장 사항은 이렇습니다. 시작 단계에서는 선택 사항이지만, 실제 예산을 지출하는 프로덕션 에이전트에게는 올바른 기본값입니다. \"에이전트 코드에 한도가 있었다\"와 \"소유자가 서명한 한도가 정산 레이어에서 강제되었다\"의 차이이기 때문입니다."
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
        "q": "L2 위임은 무엇을 제약할 수 있고, 어디에서 강제되나요?",
        "a": [
          {
            "kind": "p",
            "text": "위임은 에이전트의 지출에 대해 소유자가 서명한 명령서(mandate)입니다. 범위와 한도가 크리덴셜 자체에 바인딩되어 구체적인 결제 건과 대조 검증됩니다(L3 행위가 정확한 결제 요구사항의 해시에 커밋하므로, 승인된 바로 그 내용이 정산됩니다). 강제는 에이전트 프로세스가 아니라 **제출 전 facilitator에서** 이루어집니다. 이 점이 중요한 이유는, 침해되었거나 오동작하는 에이전트라도 신뢰 경계 반대편에 있는 검사를 건너뛸 수 없기 때문입니다."
          },
          {
            "kind": "p",
            "text": "연동 담당자를 위한 구현 노트 두 가지: SDK는 프로바이더가 facilitator가 발급한 필드(요구사항 토큰과 결정 토큰)를 덮어쓰는 것을 거부하며, L1 발급은 신뢰할 수 있는 백엔드에서 수행해야 합니다. Trustline API 키를 에이전트나 결제 페이로드 안에 담아 배포해서는 절대 안 됩니다."
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
        "q": "에이전트 키 또는 에이전트 전체가 침해당하면 어떻게 되나요?",
        "a": [
          {
            "kind": "p",
            "text": "있는 그대로 말하면, 다층 방어(defense in depth)입니다. **피해 반경**: 전용 결제 계정을 쓰면 손실이 그 계정 잔액으로 제한되고, 클라이언트 측 `maxValue`와 확인 게이트가 호출당 피해를 제한합니다. **정책**: Verifiable Intent가 활성화되어 있으면, 침해된 에이전트가 무엇을 요청하든 소유자가 위임한 범위를 벗어난 결제는 facilitator에서 거부되며, Trustline의 리스크 엔진이 바로 이런 유형의 이상 징후를 감시합니다. **온체인**: 계정 주소를 바꾸지 않고 `RegularKey`를 즉시 교체하거나, 애초에 단일 키만으로는 충분하지 않도록 `SignerList`로 계정을 관리할 수 있습니다."
          },
          {
            "kind": "p",
            "text": "이미 정산된 자금에 대한 구제 수단의 비대칭은 의도된 것입니다. 기본 레이어의 XRP 결제는 최종적이지만, RLUSD 같은 규제 대상 발행 토큰에는 발행자 수준의 `Freeze`와 `Clawback`이 있습니다. 흐름에 커스터디언을 두지 않고도 기관 자금에 구제 수단을 제공하는 방식입니다. 사고가 발생하면 support@t54.ai로 신고해 주세요 — 엔지니어링 팀에 바로 전달되며, 함께 대응합니다."
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
        "q": "코드를 검토할 수 있나요? 감사, 오픈소스, 독립적인 검증은요?",
        "a": [
          {
            "kind": "p",
            "text": "SDK는 npm과 PyPI에 공개 저장소와 함께 오픈소스(MIT)로 배포됩니다. x402 Secure 게이트웨이는 게이팅 로직, 정책 병합, OpenAPI 프로토콜 스펙을 포함해 Apache 2.0 오픈소스이며, Verifiable Intent 크리덴셜은 표준 SD-JWT라서 표준 도구로 검사할 수 있습니다(리스크 정책에 대한 체인 검증은 Trustline에서 실행됩니다). XRPL 스킴 자체도 공개 명세이고, 정산되는 모든 것은 공개 렛저에서 확인할 수 있습니다. 이 스택은 외부에서 감사할 수 있는 범위가 이례적으로 넓습니다."
          },
          {
            "kind": "p",
            "text": "보안 검토, 감사 자료, 또는 NDA 하에 facilitator 내부 구조를 살펴보는 워크스루가 필요하면 직접 연락해 주세요. 지갑 수준의 실사(due diligence)는 저희가 대응할 준비가 되어 있는 대화입니다."
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
        "q": "RLUSD 발행자가 결제 흐름 도중 트러스트 라인을 동결(Freeze)하면 어떻게 되나요?",
        "a": [
          {
            "kind": "p",
            "text": "결제가 정산되지 못하고 그대로 실패합니다. 동결된 트러스트 라인은 송금할 수 없으므로 제출 시점에 트랜잭션이 실패 결과를 반환하고 facilitator는 `success: false`를 보고합니다. 머천트에게 유령 결제가 보이는 일은 없고, 리소스도 전달되지 않습니다. 지불자가 부담하는 비용은 서명한 트랜잭션 안의 네트워크 수수료뿐입니다(facilitator의 수수료 정책상 0.01 XRP로 상한이 걸려 있고, 실제로는 약 10 drops — 1센트에도 한참 못 미치는 금액입니다)."
          },
          {
            "kind": "p",
            "text": "이는 규제 대상 스테이블코인을 쓰는 데 따르는 반대급부입니다. 발행자 통제 수단이 존재하고, 렛저 자체가 이를 강제하며, 외부에서 확인할 수 있습니다. 지갑은 서명 전에 트러스트 라인의 Freeze 상태를 확인할 수 있고, 이것이 바로 툴링이 권장하는 종류의 사전 점검(preflight)입니다."
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
    "blurb": "엔드포인트, 비용, 한도, 장애 유형 — SRE 팀과 결제 팀을 위해 준비했습니다.",
    "items": [
      {
        "id": "endpoints",
        "q": "호스팅 facilitator의 엔드포인트와 그 컨트랙트는 무엇인가요?",
        "a": [
          {
            "kind": "code",
            "body": "Mainnet  https://xrpl-facilitator-mainnet.t54.ai     xrpl:0\nTestnet  https://xrpl-facilitator-testnet.t54.ai     xrpl:1\n\nPOST /verify     validate a signed blob against requirements\nPOST /settle     submit to XRPL, wait for validation\nGET  /supported  advertised schemes / networks / assets"
          },
          {
            "kind": "p",
            "text": "`/verify`는 블롭을 디코딩하여 모든 불변 조건을 정적으로 검사합니다 — 금액의 정확한 일치, 인보이스 바인딩의 존재와 정확성, 상한 이하의 수수료, 올바른 네트워크와 목적지 — 이 과정에서 렛저에는 접근하지 않습니다. `/settle`은 트랜잭션을 제출하고 기본적으로 렛저에서 **검증(validated)**될 때까지 대기한 뒤(1초 간격 폴링, 최대 60초), 서버가 `PAYMENT-RESPONSE`로 전달할 트랜잭션 해시를 반환합니다. 어느 엔드포인트에도 API 키는 필요 없습니다."
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
            "text": "온체인 비용: XRPL 네트워크 수수료는 서명된 트랜잭션 안에 포함되어 구매자가 부담합니다 — 일반적으로 약 10 drops, 즉 1센트의 천분의 일 수준이며, 경매되는 것이 아니라 소각되므로 고려해야 할 가스 시장이 없습니다. facilitator는 상한을 강제하며(수수료가 0.01 XRP를 초과하는 블롭은 거부), 수수료는 서명 안에 들어 있으므로 facilitator가 부풀릴 수 없습니다."
          },
          {
            "kind": "p",
            "text": "호스팅 facilitator 자체는 현재 서비스 수수료가 없고 API 키도 없습니다. 지갑 규모 또는 엔터프라이즈 수준의 커밋먼트 — 처리량 보장, 상업 조건, SLA — 가 필요하다면 기본값을 기준으로 비즈니스 규모를 산정하기보다 저희에게 문의하세요."
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
            "text": "XRPL은 약 4–5초마다 렛저를 닫으며, `/settle`은 실제 검증이 완료될 때까지 대기합니다 — 따라서 정상 경로에서는 결제된 요청이 렛저 클로즈 한 번 안에 완료됩니다. 402부터 리소스 수신까지 한 자릿수 초 단위이며, 낙관적 승인이 아니라 **최종성(finality)**을 갖습니다. 멤풀 경매도, 컨펌 횟수 계산도 없습니다. 검증되었다면 완료된 것입니다."
          },
          {
            "kind": "p",
            "text": "진정한 고빈도 플로우(토큰 단위 또는 추론 호출 단위 과금)에는 요청별 정산이 적합한 프리미티브가 아닙니다 — 그런 경우를 위한 것이 XRPL Payment Channels입니다: 서명 속도로 만들어지는 오프레저 서명 클레임을 렛저에서 한 번에 정산합니다. 이런 형태를 설계 중이라면 기꺼이 함께 스케치해 드리겠습니다."
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
        "q": "장애 유형에는 어떤 것이 있고, 저희 서버에서는 어떤게 보이나요?",
        "a": [
          {
            "kind": "p",
            "text": "실패는 유형화되어 있으며 안전한 순서 — 제출 전 검증 — 로 발생합니다. `/verify`는 기계가 읽을 수 있는 사유(`amount_mismatch`, `invoice_binding_mismatch`, `fee_too_high`, 알 수 없는 인보이스 등)와 함께 거부하고, 미들웨어는 클라이언트에 새로운 402로 응답하므로 올바르게 동작하는 에이전트는 깔끔하게 재시도할 수 있습니다. 만료된 블롭(`LastLedgerSequence` 경과)은 절대 검증될 수 없습니다 — 만료는 신뢰해야 하는 타이머가 아니라 렛저가 강제합니다."
          },
          {
            "kind": "p",
            "text": "모호한 구간 — 제출은 되었지만 아직 검증이 관측되지 않은 상태 — 은 60초 검증 대기와 **멱등 정산(idempotent settle)**으로 처리됩니다. 동일한 정산을 재시도하면 이중 제출 대신 캐시된 결과가 반환되고, 동시 중복 요청은 409를 받으며, 트랜잭션 해시를 이용해 최종 권위인 렛저과 직접 대사할 수 있습니다."
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
        "q": "레이트 리밋(rate limit)이나 처리량 한도가 있나요?",
        "a": [
          {
            "kind": "p",
            "text": "있습니다 — 공유 서비스를 보호하기 위한 합리적인 기본값입니다. IP당 초당 약 20건의 verify와 초당 5건의 settle 수준이며(전역 상한은 더 높음), 초과 시 HTTP 429와 `Retry-After`로 응답하고, 동시에 진행 중인 settle 수에도 상한이 있습니다. 그 아래 계층에서 XRPL RPC 호출은 백오프를 적용한 자동 재시도와 노드 제공자 간 서킷 브레이커로 보호됩니다."
          },
          {
            "kind": "p",
            "text": "이는 운영상의 기본값이지 제품 등급이 아닙니다. 연동에 그 이상의 지속적인 처리량이 필요하다면 — 지갑 플릿, 트래픽이 많은 추론 게이트웨이 등 — 문의해 주시면 그에 맞게 프로비저닝해 드립니다."
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
            "text": "프로토콜 수준에서는 가능합니다 — 그리고 정확히 짚어두자면, **t54의 facilitator는 호스팅 서비스이지 오픈소스 컴포넌트가 아닙니다**. 기본적으로 t54가 등록한 `SourceTag`(804681468)로 정산합니다. 다만 facilitator라는 *역할* 자체는 의도적으로 범용화되어 있습니다. XRPL 스킴은 공개 명세로 정의되어 있고, 계약은 세 개의 JSON 엔드포인트이며, SDK는 어떤 `facilitatorUrl`이든 받아들입니다 — 따라서 주권을 원하는 팀은 명세를 구현하고, 자체 `SourceTag`를 찍고, 이 허브에 등록하여 자신의 정산 볼륨을 Index에 올릴 수 있습니다. 등록은 셀프서비스이며 몇 분이면 끝납니다."
          },
          {
            "kind": "p",
            "text": "호스팅 서비스가 제공하는 것은 운영 계층입니다 — 노드 이중화, 멱등성 저장소, 레이트 리밋, x402 Secure 리스크 연동 — 여러분 쪽에는 인프라가 전혀 필요 없습니다. 대부분의 연동 팀은 호스팅으로 시작합니다. 자체 facilitator 구축은 완전한 주권을 위한 경로이지 전제 조건이 아닙니다."
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
        "q": "가동률, SLA, 상태 페이지, 인시던트 연락처(incident contact)는요?",
        "a": [
          {
            "kind": "p",
            "text": "호스팅 facilitator는 자동 페일오버가 적용된 이중화 XRPL 노드 제공자 위에서 운영되며, 이 사이트의 Index는 공개 라이브니스 신호 역할도 합니다 — 메인넷 facilitator를 통해 흐르는 정산은 몇 초 안에 홈페이지에서 확인할 수 있습니다. 공식 SLA, 상태 페이지 구독, 인시던트 채널 구성은 파트너 온보딩의 일부입니다. 요구 사항을 알려주시면 조건을 문서로 정리해 드립니다."
          },
          {
            "kind": "p",
            "text": "리스크 평가 시 참고할 점: facilitator 다운타임은 **신규** 정산을 막을 뿐 자금에는 결코 영향을 줄 수 없습니다 — 커스터디에 보관된 것이 없으므로 영향을 받을 자금 자체가 없고, 머천트는 온체인에서 아무것도 바꾸지 않고 다른 facilitator(또는 자체 facilitator)로 페일오버할 수 있습니다."
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
    "blurb": "본 사이트에 실시간 수치가 집계되는 방식, 해당 인덱스에 오는 방법, 그리고 t54 툴킷(toolkit)의 나머지 구성 요소를 다룹니다.",
    "items": [
      {
        "id": "how-index-counts",
        "q": "인덱스는 실제로 트랜잭션을 어떻게 집계하나요? 수치를 신뢰할 수 있나요?",
        "a": [
          {
            "kind": "p",
            "text": "허브는 XRPL을 구독하는 자체 독립 인덱서를 운영합니다. `SourceTag`가 등록된 facilitator 태그와 일치하는 모든 검증된 `Payment`가 기록되며, 금액은 렛저의 권위 있는 `delivered_amount`에서 가져오고(요청 금액은 절대 사용하지 않음), 자산별로 분리 집계되며(XRP와 RLUSD는 결코 하나의 수치로 합산되지 않음), 트랜잭션마다 구매자, 머천트, facilitator, 인보이스 바인딩이 저장됩니다. 사이트의 모든 수치는 익스플로러에서 직접 열어볼 수 있는 렛저상의 트랜잭션으로 추적됩니다."
          },
          {
            "kind": "p",
            "text": "태그가 공개되어 있기 때문에 인덱서는 의도적으로 회의적으로 설계되어 있습니다. 최소 임계값 미만의 더스트 결제는 무시되므로 누구도 스팸으로 리더보드를 부풀릴 수 없고, 머천트 신원은 최초 검증 시 수신 주소에 바인딩되므로 이후의 402가 기존 머천트를 사칭할 수 없습니다."
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
        "q": "저희는 facilitator를 운영합니다. 저희 볼륨은 어떻게 인덱스에 반영되나요?",
        "a": [
          {
            "kind": "p",
            "text": "셀프서브 방식이며 별도의 심사는 없습니다. 레지스트리에 이름과 `SourceTag`(선택적으로 사이트, 네트워크, 자산 포함)를 제출하면 인덱서가 해당 태그가 붙은 모든 XRPL 결제를 기록하기 시작하고, 정산 볼륨, 트랜잭션 수, 활성 구매자 수가 facilitator 리더보드에 표시됩니다. 소유권 증명은 필요하지 않습니다. SourceTag는 소유권을 주장할 수 있는 자산이 아니라, 이미 여러분이 자체 정산에 찍고 있는 라벨이기 때문입니다."
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
        "q": "저희 AI 서비스를 어떻게 디렉터리에 등록할 수 있나요?",
        "a": [
          {
            "kind": "p",
            "text": "라이브 x402 엔드포인트를 등록하면 그 자리에서 바로 검증됩니다. 허브가 URL을 프로브하여(GET 후 POST — x402 엔드포인트가 실제로 응답하는 방식에 맞춰) XRPL 네트워크와 `payTo`를 명시한 유효한 `PAYMENT-REQUIRED`와 함께 402를 반환하는지 확인한 뒤 즉시 등재합니다. 오리진에 `/.well-known/x402` 카탈로그를 제공하면 그 안의 모든 리소스가 자동으로 발견되며, 매시간 다시 크롤링되므로 재제출 없이 등재 정보가 최신 상태로 유지됩니다."
          },
          {
            "kind": "p",
            "text": "카탈로그에서 리소스에 이름과 설명을 지정하세요(그대로 수집됩니다). 결제가 흐르기 시작하면 정산 활동이 동일한 인덱스에 표시되어 등재 정보와 수치가 서로를 뒷받침합니다. 아직 라이브 엔드포인트가 없다면 이메일을 보내 주세요. 간단한 검토 후 등재해 드립니다."
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
          "서비스"
        ]
      },
      {
        "id": "toolkit",
        "q": "SDK 외에 t54 툴킷(toolkit)에는 무엇이 포함되나요?",
        "a": [
          {
            "kind": "p",
            "text": "**RLUSD CLI**(`npm install -g @rlusd/cli`, 명령어 `rlusd`) — 멀티체인 RLUSD 커맨드라인입니다. XRPL 트러스트 라인과 결제, 네이티브 DEX·AMM 트레이딩, Ethereum의 Uniswap/Aave, L2로의 Wormhole 브리징, 암호화된 로컬 지갑, 그리고 지출 한도가 필수로 적용되는 구매자 측 `rlusd x402 fetch`를 제공합니다. 모든 쓰기 작업은 변조 검증되는 플랜 파일과 함께 준비 → 검토 → 실행 플랜 플로우를 따르며, 모든 기능이 `--json`을 지원합니다 — 사람만이 아니라 에이전트가 구동하도록 설계되었습니다."
          },
          {
            "kind": "p",
            "text": "**RLUSD Skills** — 동일한 플로우를 Claude Code 에이전트 스킬로 패키징한 것으로(`/plugin marketplace add t54-labs/rlusd-skills`), 에이전트가 별도의 맞춤 연동 없이 보호 장치가 적용된 RLUSD 워크플로우를 사용할 수 있습니다. **ClawCredit** — t54의 리스크 엔진이 인수 심사하는 에이전트 네이티브 크레딧입니다. 공식 XRPL 측 자료로는 Ripple의 에이전틱 트랜잭션 문서와 스킬, 그리고 XRPL 문서 MCP 서버가 있으며, 모두 리소스 페이지에 링크되어 있습니다."
          }
        ],
        "links": [
          {
            "label": "전체 리소스",
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
        "q": "AI 에이전트 개발을 위한 공식 XRPL 리소스에는 무엇이 있나요?",
        "a": [
          {
            "kind": "p",
            "text": "XRPL의 공식 **에이전틱 트랜잭션 가이드**와 AI 스타터 킷에서 시작하세요. **XRPL Agent Wallet Skill**과 **XRPL Payments Skill**은 `npx skills`를 통해 Claude Code(또는 스킬 호환 에이전트)에 설치됩니다. 이 스킬들은 엄격한 보안 모델을 중심으로 설계되어 있습니다 — 모든 서명 전 사람의 사전 확인, 범위와 시간이 제한된 자동 서명, KMS/HSM 구성을 위한 외부 서명자 지원, SourceTag/Memo 기반 출처 표시 — 따라서 자체 스택을 구축하는 경우에도 프로덕션 에이전트가 XRPL 키를 어떻게 다뤄야 하는지에 대한 확실한 참고 자료가 됩니다."
          },
          {
            "kind": "p",
            "text": "이와 함께 **XRPL Docs MCP Server**는 에이전트에게 XRPL 문서에 근거한 접근을 제공합니다. **`xrpl-up`**은 로컬 개발을 위한 Ripple의 CLI로, 사전 충전된 계정, 스크립팅, 스냅샷, 테스트넷/데브넷 접근을 갖춘 로컬 샌드박스이며 Claude Code 플러그인도 제공합니다. 그리고 **XRPL Commons가 `xrpl-dev-skills`를 유지 관리**하며, 이는 XRPL 개발을 위한 커뮤니티 에이전트 스킬입니다. 이들은 t54 스택과 깔끔하게 조합됩니다. 공식 스킬이 지갑과 결제를 담당하고, `x402-xrpl`이 그 위에 유료 API 핸드셰이크와 facilitator 정산을 더합니다."
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
        "q": "연동 지원이나 기술 딥다이브는 누구에게 문의하면 되나요?",
        "a": [
          {
            "kind": "p",
            "text": "**support@t54.ai**로 메일을 보내면 티켓 큐가 아니라 엔지니어링 팀에게 직접 전달됩니다 — 연동 질문, 아키텍처 리뷰, 지갑 실사 세션, 파트너 소개 모두 여기서 시작됩니다. 파트너나 프로젝트 포트폴리오를 대신해 평가 중이라면 라이브 기술 Q&A도 기꺼이 진행합니다. 질문 목록을 미리 보내 주시면 준비된 상태로 참석하겠습니다."
          },
          {
            "kind": "p",
            "text": "그리고 한 가지 변함없는 약속이 있습니다. 이 페이지에 답이 없는 실제 연동 질문에는 답변을 드리고 *동시에* 이 페이지에도 추가합니다 — 여러분이 질문해야 했다면, 다음 팀은 그럴 필요가 없어야 하기 때문입니다."
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
