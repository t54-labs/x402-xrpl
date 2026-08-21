"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/app/lib/i18n";
import Link from "@/app/components/LocaleLink";
import { BrandDots } from "@/app/components/BrandDots";
import {
  BENEFIT_THRESHOLDS,
  PROVIDER_SCORES,
  SEASON_SCORE_MAX,
  USER_SCORES,
  calculateSeasonScore,
} from "@/app/lib/agent-league-model";

type Division = "user" | "provider";
type View = "overview" | "standings" | "benefits" | "history";
type WalletName = "Tidal" | "Xaman" | "Girin";
type LeaderRow = [name: string, score: number, activity: string, breadth: string];

type Copy = {
  preview: string;
  demoData: string;
  season: string;
  hero: string;
  subhero: string;
  verifiedOnly: string;
  connect: string;
  connected: string;
  changeWallet: string;
  shadow: string;
  days: string;
  maxScore: string;
  remains: string;
  user: string;
  provider: string;
  overview: string;
  standings: string;
  benefits: string;
  history: string;
  seasonScore: string;
  rank: string;
  finalPoints: string;
  pendingPoints: string;
  nextBenefit: string;
  scoreMakeup: string;
  scoreIntroUser: string;
  scoreIntroProvider: string;
  verifiedActivity: string;
  consistency: string;
  diversity: string;
  verifiedUsage: string;
  reach: string;
  retention: string;
  nextMove: string;
  nextMoveUser: string;
  nextMoveProvider: string;
  recent: string;
  allActivity: string;
  userStandings: string;
  providerStandings: string;
  score: string;
  address: string;
  activity: string;
  breadth: string;
  status: string;
  you: string;
  verified: string;
  pending: string;
  excluded: string;
  viewTx: string;
  benefitProgress: string;
  nextLevel: string;
  pointsAway: string;
  activeBenefit: string;
  benefitsTitle: string;
  benefitsBody: string;
  unlocked: string;
  locked: string;
  userTiers: Array<[string, string]>;
  providerTiers: Array<[string, string]>;
  providerDirectory: string;
  providerDirectorySub: string;
  explore: string;
  foundingHistory: string;
  historyTitle: string;
  historyBody: string;
  historyCount: string;
  historyBadge: string;
  historyRule: string;
  proofTitle: string;
  proofBody: string;
  detected: string;
  ticket: string;
  settled: string;
  attested: string;
  walletTitle: string;
  walletBody: string;
  cancel: string;
};

const COPY: Record<Locale, Copy> = {
  en: {
    preview: "STAGING PREVIEW",
    demoData: "Illustrative shadow data",
    season: "SEASON 0 · OPEN BETA",
    hero: "Put your agent to work.",
    subhero:
      "Build your standing through real services, real settlements, and facilitator-verified agentic activity on XRPL.",
    verifiedOnly: "Only t54 Facilitator-verified X402 settlements count.",
    connect: "Connect wallet",
    connected: "Connected",
    changeWallet: "Change wallet",
    shadow: "SHADOW SEASON",
    days: "21 DAYS",
    maxScore: "MAX SCORE",
    remains: "12D 08H REMAINING",
    user: "User division",
    provider: "Provider division",
    overview: "Overview",
    standings: "Standings",
    benefits: "Benefits",
    history: "History",
    seasonScore: "Season score",
    rank: "Current rank",
    finalPoints: "Final points",
    pendingPoints: "Pending points",
    nextBenefit: "Next benefit",
    scoreMakeup: "How your score is built",
    scoreIntroUser: "A 100,000-point score that values real usage over raw transaction spam.",
    scoreIntroProvider: "Reach and repeat usage matter more than a single wallet sending high volume.",
    verifiedActivity: "Verified activity",
    consistency: "Consistency",
    diversity: "Diversity",
    verifiedUsage: "Verified usage",
    reach: "Unique reach",
    retention: "Retention",
    nextMove: "Best next move",
    nextMoveUser: "Use one new verified service on two different days to improve both diversity and consistency.",
    nextMoveProvider: "Bring back three verified payers on a second active day to improve retention.",
    recent: "Recent agentic activity",
    allActivity: "View activity rules",
    userStandings: "User standings",
    providerStandings: "Provider standings",
    score: "Score",
    address: "Address",
    activity: "Activity",
    breadth: "Breadth",
    status: "Status",
    you: "YOU",
    verified: "VERIFIED",
    pending: "PENDING",
    excluded: "EXCLUDED",
    viewTx: "Transaction",
    benefitProgress: "Benefit progress",
    nextLevel: "Agent Operator",
    pointsAway: "6,580 points away",
    activeBenefit: "Verified profile · Season badge · Early access",
    benefitsTitle: "Benefits that grow with verified activity",
    benefitsBody: "Each season publishes its benefit pool and thresholds before scoring begins. Points are not a promise of tokens or financial return.",
    unlocked: "UNLOCKED",
    locked: "LOCKED",
    userTiers: [
      ["Verified Participant", "Profile seal, Season badge, and activity history"],
      ["Active Agent", "Early product access and private feature previews"],
      ["Agent Operator", "Non-transferable X402 service credits"],
      ["League Leader", "Season recognition and product council access"],
    ],
    providerTiers: [
      ["Listed Provider", "Claimed profile and X402 directory listing"],
      ["Verified Provider", "Usage analytics and integration office hours"],
      ["Growth Provider", "Technical review and ecosystem campaign eligibility"],
      ["League Leader", "Featured placement and grant-readiness support"],
    ],
    providerDirectory: "Services your agent can use",
    providerDirectorySub: "Every listed service supports agent-payable X402 flows on XRPL.",
    explore: "Explore directory",
    foundingHistory: "FOUNDING ACTIVITY",
    historyTitle: "The first 2.2M+ transactions still matter.",
    historyBody:
      "Legacy activity is preserved in a separate history index. It can unlock founding recognition, but it never becomes verified Season score without settlement evidence.",
    historyCount: "2,222,950 observed historical transactions",
    historyBadge: "Founding Participant eligible",
    historyRule: "History is recognition, not retroactive token entitlement.",
    proofTitle: "One score. A complete evidence trail.",
    proofBody:
      "SourceTag discovers a candidate. A signed ticket binds the intent. XRPL finality proves settlement. The t54 attestation makes the activity reward-grade.",
    detected: "Detected",
    ticket: "Ticket bound",
    settled: "XRPL settled",
    attested: "t54 attested",
    walletTitle: "Choose a wallet",
    walletBody: "This preview simulates address ownership. No signature or transaction will be requested.",
    cancel: "Cancel",
  },
  ko: {
    preview: "스테이징 미리보기",
    demoData: "예시 쉐도우 데이터",
    season: "시즌 0 · 오픈 베타",
    hero: "에이전트가 일하게 하세요.",
    subhero: "XRPL에서 실제 서비스와 결제, Facilitator가 검증한 에이전트 활동으로 순위를 높이세요.",
    verifiedOnly: "t54 Facilitator가 검증한 X402 결제만 반영됩니다.",
    connect: "지갑 연결",
    connected: "연결됨",
    changeWallet: "지갑 변경",
    shadow: "쉐도우 시즌",
    days: "21일",
    maxScore: "최대 점수",
    remains: "12일 08시간 남음",
    user: "유저 디비전",
    provider: "프로바이더 디비전",
    overview: "개요",
    standings: "순위",
    benefits: "혜택",
    history: "기록",
    seasonScore: "시즌 점수",
    rank: "현재 순위",
    finalPoints: "확정 점수",
    pendingPoints: "검증 중 점수",
    nextBenefit: "다음 혜택",
    scoreMakeup: "점수 구성",
    scoreIntroUser: "단순 트랜잭션 스팸보다 실제 사용을 평가하는 100,000점 스코어입니다.",
    scoreIntroProvider: "하나의 지갑이 보낸 큰 금액보다 다양한 유저와 반복 사용을 평가합니다.",
    verifiedActivity: "검증된 활동",
    consistency: "지속성",
    diversity: "다양성",
    verifiedUsage: "검증된 사용",
    reach: "고유 유저",
    retention: "재사용",
    nextMove: "추천 다음 활동",
    nextMoveUser: "새로운 검증 서비스를 서로 다른 날에 사용해 다양성과 지속성을 높이세요.",
    nextMoveProvider: "3명의 검증 유저가 다른 날에 다시 사용하게 해 재사용 점수를 높이세요.",
    recent: "최근 에이전트 활동",
    allActivity: "활동 규칙 보기",
    userStandings: "유저 순위",
    providerStandings: "프로바이더 순위",
    score: "점수",
    address: "주소",
    activity: "활동",
    breadth: "확장성",
    status: "상태",
    you: "나",
    verified: "검증 완료",
    pending: "검증 중",
    excluded: "제외",
    viewTx: "트랜잭션",
    benefitProgress: "혜택 진행도",
    nextLevel: "에이전트 오퍼레이터",
    pointsAway: "6,580점 남음",
    activeBenefit: "검증 프로필 · 시즌 배지 · 얼리 액세스",
    benefitsTitle: "검증된 활동과 함께 성장하는 혜택",
    benefitsBody: "각 시즌은 시작 전에 혜택 풀과 기준을 공개합니다. 점수는 토큰이나 금융 수익을 약속하지 않습니다.",
    unlocked: "활성화",
    locked: "잠김",
    userTiers: [
      ["검증 참여자", "프로필 인증, 시즌 배지, 활동 기록"],
      ["활성 에이전트", "제품 얼리 액세스와 비공개 기능 미리보기"],
      ["에이전트 오퍼레이터", "양도할 수 없는 X402 서비스 크레딧"],
      ["리그 리더", "시즌 인정과 제품 커운슬 참여"],
    ],
    providerTiers: [
      ["등록 프로바이더", "소유권이 확인된 프로필과 X402 디렉터리 등록"],
      ["검증 프로바이더", "사용 분석과 인테그레이션 오피스 아워"],
      ["성장 프로바이더", "기술 리뷰와 생태계 캠페인 후보 자격"],
      ["리그 리더", "추천 노출과 그랜트 준비 지원"],
    ],
    providerDirectory: "에이전트가 사용할 수 있는 서비스",
    providerDirectorySub: "모든 등록 서비스는 XRPL의 에이전트 결제형 X402 흐름을 지원합니다.",
    explore: "디렉터리 보기",
    foundingHistory: "파운딩 활동",
    historyTitle: "초기 220만+ 트랜잭션도 기록됩니다.",
    historyBody: "기존 활동은 별도 기록 인덱스에 보존됩니다. 파운딩 인정을 활성화할 수 있지만, 결제 증거 없이 검증된 시즌 점수로 변하지 않습니다.",
    historyCount: "2,222,950건의 관찰된 기존 트랜잭션",
    historyBadge: "Founding Participant 자격 대상",
    historyRule: "기존 기록은 인정을 위한 것이며, 소급하여 토큰 권리를 주지 않습니다.",
    proofTitle: "하나의 점수, 완전한 증거 경로.",
    proofBody: "SourceTag는 후보 거래를 찾습니다. 서명된 Ticket은 의도를 묶고, XRPL finality는 결제를 증명하며, t54 attestation이 보상 대상 활동을 확정합니다.",
    detected: "탐지",
    ticket: "Ticket 연결",
    settled: "XRPL 결제",
    attested: "t54 증명",
    walletTitle: "지갑 선택",
    walletBody: "이 미리보기는 주소 소유권을 시뮬레이션합니다. 서명이나 트랜잭션을 요청하지 않습니다.",
    cancel: "취소",
  },
};

const USER_LEADERS: LeaderRow[] = [
  ["rL7K...4QpX", 91420, "128 tx", "9 providers"],
  ["rH3m...7NvA", 88760, "116 tx", "8 providers"],
  ["rP9c...2LmR", 82440, "94 tx", "8 providers"],
  ["rB2x...8WsT", 79610, "87 tx", "7 providers"],
  ["rJ8q...T54A", 68420, "61 tx", "6 providers"],
];

const PROVIDER_LEADERS: LeaderRow[] = [
  ["Heurist", 94780, "412 payers", "62% repeat"],
  ["AskSurf", 90230, "356 payers", "58% repeat"],
  ["Lucy", 86190, "298 payers", "54% repeat"],
  ["NOFA", 79240, "244 payers", "51% repeat"],
  ["T54 Compute", 76500, "218 payers", "49% repeat"],
];

const ACTIVITIES = [
  { service: "Heurist Inference", asset: "0.42 RLUSD", time: "3m", status: "verified" as const, hash: "BDB575E8...D6673B" },
  { service: "AskSurf Search", asset: "0.08 XRP", time: "18m", status: "pending" as const, hash: "7A4F20C9...B18E04" },
  { service: "Lucy Research", asset: "1.20 RLUSD", time: "2h", status: "verified" as const, hash: "F182D93A...849C12" },
  { service: "Unknown endpoint", asset: "0.001 XRP", time: "6h", status: "excluded" as const, hash: "113AD02C...D320A9" },
];

const SERVICES = [
  { name: "Heurist", type: "Inference", price: "from 0.12 RLUSD", tx: "18.4K verified uses", mark: "H" },
  { name: "AskSurf", type: "Search", price: "from 0.04 XRP", tx: "12.8K verified uses", mark: "A" },
  { name: "Lucy", type: "Research", price: "from 0.80 RLUSD", tx: "9.7K verified uses", mark: "L" },
];

function formatScore(value: number) {
  return value.toLocaleString("en-US");
}

function statusTone(status: "verified" | "pending" | "excluded") {
  if (status === "verified") return "border-[rgba(0,140,255,0.34)] bg-[var(--blue-08)] text-[var(--brand-blue)]";
  if (status === "pending") return "border-[rgba(224,148,27,0.35)] bg-[rgba(224,148,27,0.08)] text-[var(--amber)]";
  return "border-[rgba(214,68,46,0.35)] bg-[rgba(214,68,46,0.08)] text-[var(--red)]";
}

export function AgentLeagueDemo({ locale }: { locale: Locale }) {
  const c = COPY[locale];
  const [division, setDivision] = useState<Division>("user");
  const [view, setView] = useState<View>("overview");
  const [wallet, setWallet] = useState<WalletName | null>("Tidal");
  const [walletModal, setWalletModal] = useState(false);

  const isUser = division === "user";
  const scores = isUser ? USER_SCORES : PROVIDER_SCORES;
  const seasonScore = useMemo(() => calculateSeasonScore(scores), [scores]);
  const leaders = isUser ? USER_LEADERS : PROVIDER_LEADERS;

  return (
    <div className="min-h-screen bg-[var(--ink-base)]">
      <section className="relative overflow-hidden border-b border-[var(--rule)]">
        <div className="absolute inset-0 spine-grid opacity-40" aria-hidden />
        <div className="absolute left-[62%] top-0 h-full w-px bg-gradient-to-b from-transparent via-[var(--brand-blue)] to-transparent opacity-55 spine-line" aria-hidden />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--coral-28)] bg-[var(--coral-08)] px-3 py-1.5 font-plek text-[10px] uppercase tracking-[0.2em] text-[var(--t54-coral)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--t54-coral)]" />
              {c.preview}
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--paper-mute)]">{c.demoData}</span>
          </div>

          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-end">
            <div className="max-w-3xl animate-fade-up">
              <div className="flex items-center gap-3">
                <BrandDots count={5} />
                <p className="font-plek text-[11px] uppercase tracking-[0.24em] text-[var(--paper-mute)]">{c.season}</p>
              </div>
              <h1 className="mt-7 max-w-3xl text-[clamp(3.25rem,7vw,7.5rem)] font-light leading-[0.88] tracking-[-0.045em] text-[var(--paper)]">
                {c.hero}
              </h1>
              <p className="mt-7 max-w-2xl text-base sm:text-lg leading-relaxed text-[var(--text-secondary)]">{c.subhero}</p>
              <div className="mt-7 flex flex-col sm:flex-row sm:items-center gap-4">
                <button
                  type="button"
                  onClick={() => setWalletModal(true)}
                  className="ui-control inline-flex min-h-12 items-center justify-center gap-2 bg-[var(--paper)] px-5 text-sm font-medium text-[var(--ink-base)] hover:bg-white"
                >
                  {wallet ? c.changeWallet : c.connect}
                  <span aria-hidden>&rarr;</span>
                </button>
                <span className="flex items-center gap-2 text-xs text-[var(--paper-mute)]">
                  <span className="h-2 w-2 rounded-full bg-[var(--brand-blue)]" />
                  {c.verifiedOnly}
                </span>
              </div>
            </div>

            <div className="animate-fade-up lg:pl-8" style={{ animationDelay: "100ms" }}>
              <div className="border-y border-[var(--rule)] py-6">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="font-plek text-[10px] uppercase tracking-[0.24em] text-[var(--paper-mute)]">{c.maxScore}</p>
                    <p className="mt-3 font-mono text-[clamp(3.4rem,6vw,6.6rem)] leading-none tracking-[-0.055em] tabular-nums text-[var(--paper)]">{formatScore(SEASON_SCORE_MAX)}</p>
                  </div>
                  <span className="mb-2 font-plek text-[10px] uppercase tracking-[0.18em] text-[var(--brand-blue)]">{c.shadow}</span>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-px bg-[var(--rule)] border border-[var(--rule)]">
                  <div className="bg-[var(--ink-base)] p-4">
                    <p className="font-plek text-[9px] uppercase tracking-[0.2em] text-[var(--paper-faint)]">Duration</p>
                    <p className="mt-2 font-mono text-lg text-[var(--paper)]">{c.days}</p>
                  </div>
                  <div className="bg-[var(--ink-base)] p-4">
                    <p className="font-plek text-[9px] uppercase tracking-[0.2em] text-[var(--paper-faint)]">Clock</p>
                    <p className="mt-2 font-mono text-sm sm:text-base text-[var(--brand-blue)]">{c.remains}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--rule)] bg-[var(--ink-surface)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="inline-flex w-full sm:w-auto rounded-[var(--radius-control)] border border-[var(--rule)] bg-[var(--ink-base)] p-1">
            {(["user", "provider"] as Division[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setDivision(item)}
                className={`flex-1 sm:flex-none rounded-lg px-4 py-2 text-xs font-medium transition-colors ${division === item ? "bg-[var(--paper)] text-[var(--ink-base)]" : "text-[var(--paper-mute)] hover:text-[var(--paper)]"}`}
              >
                {item === "user" ? c.user : c.provider}
              </button>
            ))}
          </div>
          <div className="hide-scrollbar flex items-center gap-1 overflow-x-auto">
            {(["overview", "standings", "benefits", "history"] as View[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setView(item)}
                className={`shrink-0 px-3 py-2 font-plek text-[10px] uppercase tracking-[0.18em] transition-colors ${view === item ? "text-[var(--brand-blue)]" : "text-[var(--paper-mute)] hover:text-[var(--paper)]"}`}
              >
                {c[item]}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setWalletModal(true)}
            className="flex min-h-10 items-center justify-between gap-3 rounded-[var(--radius-control)] border border-[var(--rule)] bg-[var(--ink-base)] px-3 text-left"
          >
            <span className="h-2 w-2 rounded-full bg-[var(--success)]" />
            <span className="min-w-0">
              <span className="block font-plek text-[8px] uppercase tracking-[0.18em] text-[var(--paper-faint)]">{wallet ? `${wallet} · ${c.connected}` : c.connect}</span>
              <span className="block max-w-[170px] truncate font-mono text-[11px] text-[var(--paper)]">{wallet ? "rJ8qk5pV...T54A" : "—"}</span>
            </span>
            <span className="text-[var(--paper-faint)]" aria-hidden>&#8964;</span>
          </button>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-9 sm:py-12 space-y-12">
        {(view === "overview" || view === "standings") && (
          <>
            <section className="grid grid-cols-2 xl:grid-cols-5 border border-[var(--rule)] rounded-[var(--radius-shell)] overflow-hidden bg-[var(--rule)] gap-px animate-fade-up">
              <Metric label={c.seasonScore} value={formatScore(seasonScore)} accent />
              <Metric label={c.rank} value={isUser ? "#38" : "#12"} />
              <Metric label={c.finalPoints} value={formatScore(seasonScore - (isUser ? 2840 : 3180))} />
              <Metric label={c.pendingPoints} value={`+${formatScore(isUser ? 2840 : 3180)}`} pending />
              <Metric label={c.nextBenefit} value={isUser ? "75,000" : "80,000"} wide />
            </section>

            {view === "overview" && (
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
                <section className="dashboard-panel border border-[var(--rule)] p-5 sm:p-7 animate-fade-up" style={{ animationDelay: "60ms" }}>
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                    <div>
                      <p className="font-plek text-[10px] uppercase tracking-[0.22em] text-[var(--brand-blue)]">01 · SCORE</p>
                      <h2 className="mt-2 text-2xl font-medium text-[var(--paper)]">{c.scoreMakeup}</h2>
                    </div>
                    <p className="max-w-md text-xs leading-relaxed text-[var(--paper-mute)]">{isUser ? c.scoreIntroUser : c.scoreIntroProvider}</p>
                  </div>
                  <div className="mt-7 space-y-5">
                    {scores.map((item) => (
                      <ScoreBar key={item.key} label={c[item.key]} value={item.value} max={item.max} tone={item.tone} />
                    ))}
                  </div>
                </section>

                <aside className="dashboard-panel border border-[var(--rule)] p-5 sm:p-7 animate-fade-up" style={{ animationDelay: "120ms" }}>
                  <p className="font-plek text-[10px] uppercase tracking-[0.22em] text-[var(--t54-coral)]">{c.nextMove}</p>
                  <p className="mt-4 text-xl leading-snug text-[var(--paper)]">{isUser ? c.nextMoveUser : c.nextMoveProvider}</p>
                  <div className="mt-8 border-t border-[var(--rule)] pt-5">
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="text-[var(--paper-mute)]">{c.benefitProgress}</span>
                      <span className="font-mono text-[var(--brand-blue)]">{formatScore(seasonScore)} / {isUser ? "75,000" : "80,000"}</span>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--rule)]">
                      <div className="h-full rounded-full bg-[var(--brand-blue)]" style={{ width: `${Math.min(100, (seasonScore / (isUser ? 75000 : 80000)) * 100)}%` }} />
                    </div>
                    <div className="mt-5 flex items-end justify-between gap-3">
                      <div>
                        <p className="font-plek text-[9px] uppercase tracking-[0.18em] text-[var(--paper-faint)]">{c.nextLevel}</p>
                        <p className="mt-1 text-xs text-[var(--paper-mute)]">{c.activeBenefit}</p>
                      </div>
                      <span className="shrink-0 font-mono text-[10px] text-[var(--paper-mute)]">{c.pointsAway}</span>
                    </div>
                  </div>
                </aside>
              </div>
            )}

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
              <div className="table-shell border border-[var(--rule)] overflow-hidden animate-fade-up">
                <div className="flex items-center justify-between gap-3 border-b border-[var(--rule)] px-5 py-4">
                  <div>
                    <p className="font-plek text-[10px] uppercase tracking-[0.2em] text-[var(--brand-blue)]">02 · LIVE</p>
                    <h2 className="mt-1 text-lg font-medium text-[var(--paper)]">{c.recent}</h2>
                  </div>
                  <button type="button" className="text-[11px] text-[var(--paper-mute)] hover:text-[var(--paper)]">{c.allActivity} &rarr;</button>
                </div>
                <div className="divide-y divide-[var(--rule)]">
                  {ACTIVITIES.map((item) => (
                    <div key={item.hash} className="grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,1.35fr)_auto_auto] items-center gap-3 px-5 py-4 hover:bg-[var(--blue-08)] transition-colors">
                      <div className="min-w-0">
                        <p className="truncate text-sm text-[var(--paper)]">{item.service}</p>
                        <p className="mt-1 truncate font-mono text-[10px] text-[var(--paper-faint)]">{item.hash} · {item.time}</p>
                      </div>
                      <span className="hidden sm:block font-mono text-xs tabular-nums text-[var(--paper-mute)]">{item.asset}</span>
                      <span className={`rounded-full border px-2.5 py-1 font-plek text-[8px] uppercase tracking-[0.18em] ${statusTone(item.status)}`}>{c[item.status]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Standings c={c} isUser={isUser} leaders={leaders} />
            </section>
          </>
        )}

        {(view === "overview" || view === "benefits") && (
          <>
          {view === "benefits" && (
            <section className="animate-fade-up">
              <div className="grid gap-5 lg:grid-cols-[minmax(280px,0.62fr)_minmax(0,1.38fr)] lg:items-end">
                <div>
                  <p className="font-plek text-[10px] uppercase tracking-[0.22em] text-[var(--t54-coral)]">BENEFIT LADDER</p>
                  <h2 className="mt-3 text-3xl font-light leading-tight text-[var(--paper)]">{c.benefitsTitle}</h2>
                  <p className="mt-4 text-sm leading-relaxed text-[var(--paper-mute)]">{c.benefitsBody}</p>
                </div>
                <div className="grid gap-px border border-[var(--rule)] bg-[var(--rule)] sm:grid-cols-2">
                  {(isUser ? c.userTiers : c.providerTiers).map(([name, description], index) => {
                    const threshold = BENEFIT_THRESHOLDS[index];
                    const unlocked = seasonScore >= threshold;
                    return (
                      <div key={name} className={`bg-[var(--ink-surface)] p-5 ${unlocked ? "" : "opacity-55"}`}>
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-mono text-xs text-[var(--brand-blue)]">{formatScore(threshold)}</span>
                          <span className={`font-plek text-[8px] uppercase tracking-[0.18em] ${unlocked ? "text-[var(--success)]" : "text-[var(--paper-faint)]"}`}>{unlocked ? c.unlocked : c.locked}</span>
                        </div>
                        <h3 className="mt-4 text-lg text-[var(--paper)]">{name}</h3>
                        <p className="mt-2 text-xs leading-relaxed text-[var(--paper-mute)]">{description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}
          <section className="animate-fade-up">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <p className="font-plek text-[10px] uppercase tracking-[0.22em] text-[var(--brand-blue)]">03 · DISCOVER</p>
                <h2 className="mt-2 text-2xl font-medium text-[var(--paper)]">{c.providerDirectory}</h2>
                <p className="mt-2 text-sm text-[var(--paper-mute)]">{c.providerDirectorySub}</p>
              </div>
              <Link href="/directory" className="ui-control inline-flex min-h-10 items-center justify-center rounded-[var(--radius-control)] border border-[var(--rule)] px-4 text-xs text-[var(--paper-mute)] hover:text-[var(--paper)]">{c.explore} &rarr;</Link>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {SERVICES.map((service) => (
                <Link key={service.name} href="/directory" className="ui-card group border border-[var(--rule)] p-5 hover:bg-[var(--blue-08)]">
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-control)] border border-[var(--blue-28)] bg-[var(--blue-08)] font-plek text-sm text-[var(--brand-blue)]">{service.mark}</span>
                    <span className="font-plek text-[8px] uppercase tracking-[0.18em] text-[var(--paper-faint)]">T54 VERIFIED</span>
                  </div>
                  <h3 className="mt-5 text-xl text-[var(--paper)]">{service.name}</h3>
                  <p className="mt-1 text-xs text-[var(--paper-mute)]">{service.type}</p>
                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--rule)] pt-4 font-mono text-[10px]">
                    <span className="text-[var(--paper-mute)]">{service.price}</span>
                    <span className="text-[var(--brand-blue)]">{service.tx}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
          </>
        )}

        {(view === "overview" || view === "history") && (
          <section className="relative overflow-hidden rounded-[var(--radius-shell)] border border-[var(--rule)] bg-[var(--ink-surface)] p-6 sm:p-9 animate-fade-up">
            <div className="absolute right-[-60px] top-[-90px] h-72 w-72 rounded-full border border-[var(--coral-28)] opacity-40" aria-hidden />
            <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.65fr)] lg:items-end">
              <div>
                <p className="font-plek text-[10px] uppercase tracking-[0.22em] text-[var(--t54-coral)]">{c.foundingHistory}</p>
                <h2 className="mt-4 max-w-2xl text-3xl sm:text-4xl font-light leading-tight text-[var(--paper)]">{c.historyTitle}</h2>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--paper-mute)]">{c.historyBody}</p>
              </div>
              <div className="space-y-3 border-l border-[var(--rule)] pl-5">
                <p className="font-mono text-sm text-[var(--paper)]">{c.historyCount}</p>
                <p className="font-plek text-[10px] uppercase tracking-[0.16em] text-[var(--t54-coral)]">{c.historyBadge}</p>
                <p className="text-[11px] leading-relaxed text-[var(--paper-faint)]">{c.historyRule}</p>
              </div>
            </div>
          </section>
        )}

        <section className="border-y border-[var(--rule)] py-10 sm:py-14 animate-fade-up">
          <div className="grid gap-9 lg:grid-cols-[minmax(280px,0.7fr)_minmax(0,1.3fr)] lg:items-center">
            <div>
              <p className="font-plek text-[10px] uppercase tracking-[0.22em] text-[var(--brand-blue)]">VERIFICATION SPINE</p>
              <h2 className="mt-3 text-3xl font-light leading-tight text-[var(--paper)]">{c.proofTitle}</h2>
              <p className="mt-4 text-sm leading-relaxed text-[var(--paper-mute)]">{c.proofBody}</p>
            </div>
            <div className="grid grid-cols-2 gap-px bg-[var(--rule)] border border-[var(--rule)] sm:grid-cols-4">
              {[c.detected, c.ticket, c.settled, c.attested].map((label, index) => (
                <div key={label} className="relative bg-[var(--ink-base)] p-5">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full border font-mono text-[10px] ${index === 3 ? "border-[var(--brand-blue)] bg-[var(--brand-blue)] text-[var(--ink-base)]" : "border-[var(--blue-28)] text-[var(--brand-blue)]"}`}>{String(index + 1).padStart(2, "0")}</span>
                  <p className="mt-4 font-plek text-[9px] uppercase tracking-[0.16em] text-[var(--paper-mute)]">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {walletModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="wallet-dialog-title">
          <div className="w-full max-w-md rounded-[var(--radius-shell)] border border-[var(--rule)] bg-[var(--ink-surface)] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-plek text-[9px] uppercase tracking-[0.2em] text-[var(--brand-blue)]">ADDRESS OWNERSHIP</p>
                <h2 id="wallet-dialog-title" className="mt-2 text-2xl text-[var(--paper)]">{c.walletTitle}</h2>
              </div>
              <button type="button" onClick={() => setWalletModal(false)} className="p-2 text-[var(--paper-mute)] hover:text-[var(--paper)]" aria-label={c.cancel}>&times;</button>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-[var(--paper-mute)]">{c.walletBody}</p>
            <div className="mt-6 space-y-2">
              {(["Tidal", "Xaman", "Girin"] as WalletName[]).map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => { setWallet(name); setWalletModal(false); }}
                  className="ui-control flex w-full items-center justify-between rounded-[var(--radius-control)] border border-[var(--rule)] bg-[var(--ink-base)] px-4 py-3 text-sm text-[var(--paper)] hover:border-[var(--border-hover)] hover:bg-[var(--blue-08)]"
                >
                  <span>{name} Wallet</span>
                  <span className="font-mono text-[10px] text-[var(--paper-faint)]">{wallet === name ? c.connected : "CONNECT"}</span>
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setWalletModal(false)} className="mt-5 w-full py-2 text-xs text-[var(--paper-mute)] hover:text-[var(--paper)]">{c.cancel}</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, accent = false, pending = false, wide = false }: { label: string; value: string; accent?: boolean; pending?: boolean; wide?: boolean }) {
  return (
    <div className={`bg-[var(--ink-surface)] p-4 sm:p-5 ${wide ? "col-span-2 xl:col-span-1" : ""}`}>
      <p className="font-plek text-[9px] uppercase tracking-[0.18em] text-[var(--paper-faint)]">{label}</p>
      <p className={`mt-2 font-mono text-xl sm:text-2xl tabular-nums ${accent ? "text-[var(--brand-blue)]" : pending ? "text-[var(--amber)]" : "text-[var(--paper)]"}`}>{value}</p>
    </div>
  );
}

function ScoreBar({ label, value, max, tone }: { label: string; value: number; max: number; tone: string }) {
  const color = tone === "blue" ? "bg-[var(--brand-blue)]" : tone === "coral" ? "bg-[var(--t54-coral)]" : "bg-[var(--paper-mute)]";
  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm text-[var(--paper)]">{label}</p>
          <p className="mt-1 font-mono text-[10px] text-[var(--paper-faint)]">MAX {formatScore(max)}</p>
        </div>
        <p className="font-mono text-sm tabular-nums text-[var(--paper)]">{formatScore(value)}</p>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--rule)]">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </div>
  );
}

function Standings({ c, isUser, leaders }: { c: Copy; isUser: boolean; leaders: LeaderRow[] }) {
  return (
    <div className="table-shell border border-[var(--rule)] overflow-hidden animate-fade-up" style={{ animationDelay: "80ms" }}>
      <div className="border-b border-[var(--rule)] px-5 py-4">
        <p className="font-plek text-[10px] uppercase tracking-[0.2em] text-[var(--t54-coral)]">03 · RANK</p>
        <h2 className="mt-1 text-lg font-medium text-[var(--paper)]">{isUser ? c.userStandings : c.providerStandings}</h2>
      </div>
      <div className="divide-y divide-[var(--rule)]">
        {leaders.map((row, index) => {
          const self = index === 4;
          return (
            <div key={row[0]} className={`grid grid-cols-[30px_minmax(0,1fr)_auto] items-center gap-3 px-5 py-3 ${self ? "bg-[var(--blue-08)]" : ""}`}>
              <span className="font-mono text-[10px] text-[var(--paper-faint)]">{self && isUser ? "38" : String(index + 1).padStart(2, "0")}</span>
              <div className="min-w-0">
                <p className="truncate text-xs text-[var(--paper)]">{row[0]} {self ? <span className="ml-1 font-plek text-[8px] text-[var(--brand-blue)]">{c.you}</span> : null}</p>
                <p className="mt-1 truncate font-mono text-[9px] text-[var(--paper-faint)]">{row[2]} · {row[3]}</p>
              </div>
              <span className="font-mono text-xs tabular-nums text-[var(--brand-blue)]">{formatScore(row[1])}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
