"use client";

import { useMemo, useState } from "react";
import Link from "@/app/components/LocaleLink";
import { BrandDots } from "@/app/components/BrandDots";
import type { Locale } from "@/app/lib/i18n";
import {
  BENEFIT_THRESHOLDS,
  PROVIDER_SCORES,
  SEASON_SCORE_MAX,
  USER_SCORES,
  calculateSeasonScore,
  type ScoreItem,
} from "@/app/lib/agent-league-model";

type Division = "user" | "provider";
type View = "overview" | "standings" | "benefits" | "history";
type WalletName = "Tidal" | "Xaman" | "Girin";
type LeaderRow = [name: string, score: number, activity: string, breadth: string];

type Copy = {
  season: string; openBeta: string; hero: string; verifiedActivityOnly: string;
  connect: string; connected: string; changeWallet: string; duration: string; remaining: string;
  user: string; provider: string; overview: string; standings: string; benefits: string; history: string;
  yourRank: string; score: string; userStanding: string; providerStanding: string; top100: string;
  activity: string; breadth: string; you: string; scoreBreakdown: string;
  verifiedActivity: string; consistency: string; diversity: string; verifiedUsage: string; reach: string; retention: string;
  recentActivity: string; verified: string; pending: string; excluded: string;
  services: string; explore: string; benefitTitle: string; unlocked: string; locked: string;
  userTiers: Array<[string, string]>; providerTiers: Array<[string, string]>;
  historicalActivity: string; historicalTransactions: string; yourHistoricalTx: string; foundingStatus: string; firstSeen: string;
  walletTitle: string; cancel: string;
};

const COPY: Record<Locale, Copy> = {
  en: {
    season: "SEASON 0", openBeta: "OPEN BETA", hero: "Put your agent to work.", verifiedActivityOnly: "Verified X402 activity",
    connect: "Connect wallet", connected: "Connected", changeWallet: "Change wallet", duration: "21 DAY SEASON", remaining: "12D 08H LEFT",
    user: "User", provider: "Provider", overview: "Overview", standings: "Standings", benefits: "Benefits", history: "History",
    yourRank: "Your rank", score: "Score", userStanding: "User standings", providerStanding: "Provider standings", top100: "TOP 100",
    activity: "Activity", breadth: "Breadth", you: "YOU", scoreBreakdown: "Score breakdown",
    verifiedActivity: "Verified activity", consistency: "Consistency", diversity: "Diversity", verifiedUsage: "Verified usage", reach: "Unique reach", retention: "Retention",
    recentActivity: "Recent activity", verified: "VERIFIED", pending: "PENDING", excluded: "EXCLUDED",
    services: "Explore services", explore: "View directory", benefitTitle: "Your benefits", unlocked: "UNLOCKED", locked: "LOCKED",
    userTiers: [
      ["Verified Participant", "Profile seal and Season badge"],
      ["Active Agent", "Early product access"],
      ["Agent Operator", "X402 service credits"],
      ["League Leader", "Season recognition and product council"],
    ],
    providerTiers: [
      ["Listed Provider", "Claimed profile and directory listing"],
      ["Verified Provider", "Analytics and integration office hours"],
      ["Growth Provider", "Technical review and campaign eligibility"],
      ["League Leader", "Featured placement and grant support"],
    ],
    historicalActivity: "Agentic history", historicalTransactions: "Historical transactions", yourHistoricalTx: "Your transactions", foundingStatus: "Founding status", firstSeen: "First seen",
    walletTitle: "Choose a wallet", cancel: "Cancel",
  },
  ko: {
    season: "시즌 0", openBeta: "오픈 베타", hero: "에이전트가 일하게 하세요.", verifiedActivityOnly: "검증된 X402 활동",
    connect: "지갑 연결", connected: "연결됨", changeWallet: "지갑 변경", duration: "21일 시즌", remaining: "12일 08시간 남음",
    user: "유저", provider: "프로바이더", overview: "개요", standings: "순위", benefits: "혜택", history: "기록",
    yourRank: "나의 순위", score: "점수", userStanding: "유저 순위", providerStanding: "프로바이더 순위", top100: "상위 100",
    activity: "활동", breadth: "확장성", you: "나", scoreBreakdown: "점수 구성",
    verifiedActivity: "검증된 활동", consistency: "지속성", diversity: "다양성", verifiedUsage: "검증된 사용", reach: "고유 유저", retention: "재사용",
    recentActivity: "최근 활동", verified: "검증 완료", pending: "검증 중", excluded: "제외",
    services: "서비스 탐색", explore: "디렉터리 보기", benefitTitle: "나의 혜택", unlocked: "활성화", locked: "잠김",
    userTiers: [
      ["검증 참여자", "프로필 인증과 시즌 배지"],
      ["활성 에이전트", "제품 얼리 액세스"],
      ["에이전트 오퍼레이터", "X402 서비스 크레딧"],
      ["리그 리더", "시즌 인정과 제품 커운슬"],
    ],
    providerTiers: [
      ["등록 프로바이더", "프로필과 디렉터리 등록"],
      ["검증 프로바이더", "분석과 인테그레이션 오피스 아워"],
      ["성장 프로바이더", "기술 리뷰와 캠페인 자격"],
      ["리그 리더", "추천 노출과 그랜트 지원"],
    ],
    historicalActivity: "에이전트 기록", historicalTransactions: "기존 트랜잭션", yourHistoricalTx: "나의 트랜잭션", foundingStatus: "파운딩 상태", firstSeen: "첫 활동",
    walletTitle: "지갑 선택", cancel: "취소",
  },
};

const USER_LEADERS: LeaderRow[] = [
  ["rL7K...4QpX", 91_420, "128 tx", "9 providers"], ["rH3m...7NvA", 88_760, "116 tx", "8 providers"],
  ["rP9c...2LmR", 82_440, "94 tx", "8 providers"], ["rB2x...8WsT", 79_610, "87 tx", "7 providers"],
  ["rJ8q...T54A", 68_420, "61 tx", "6 providers"],
];

const PROVIDER_LEADERS: LeaderRow[] = [
  ["Heurist", 94_780, "412 payers", "62% repeat"], ["AskSurf", 90_230, "356 payers", "58% repeat"],
  ["Lucy", 86_190, "298 payers", "54% repeat"], ["NOFA", 79_240, "244 payers", "51% repeat"],
  ["T54 Compute", 76_500, "218 payers", "49% repeat"],
];

const ACTIVITIES = [
  { service: "Heurist Inference", asset: "0.42 RLUSD", time: "3m", status: "verified" as const, hash: "BDB575E8...D6673B" },
  { service: "AskSurf Search", asset: "0.08 XRP", time: "18m", status: "pending" as const, hash: "7A4F20C9...B18E04" },
  { service: "Lucy Research", asset: "1.20 RLUSD", time: "2h", status: "verified" as const, hash: "F182D93A...849C12" },
  { service: "Unknown endpoint", asset: "0.001 XRP", time: "6h", status: "excluded" as const, hash: "113AD02C...D320A9" },
];

const SERVICES = [
  { name: "Heurist", type: "Inference", price: "0.12 RLUSD", activity: "18.4K uses", mark: "H" },
  { name: "AskSurf", type: "Search", price: "0.04 XRP", activity: "12.8K uses", mark: "A" },
  { name: "Lucy", type: "Research", price: "0.80 RLUSD", activity: "9.7K uses", mark: "L" },
];

function formatScore(value: number) { return value.toLocaleString("en-US"); }
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
  const rank = isUser ? 38 : 12;
  const percentile = isUser ? "TOP 3%" : "TOP 1%";

  return (
    <div className="min-h-screen bg-[var(--ink-base)]">
      <section className="relative overflow-hidden border-b border-[var(--rule)]">
        <div className="absolute inset-0 spine-grid opacity-35" aria-hidden />
        <div className="absolute left-[62%] top-0 h-full w-px bg-gradient-to-b from-transparent via-[var(--brand-blue)] to-transparent opacity-55 spine-line" aria-hidden />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-end">
            <div className="max-w-3xl animate-fade-up">
              <div className="flex items-center gap-3"><BrandDots count={5} /><p className="font-plek text-[11px] uppercase tracking-[0.24em] text-[var(--paper-mute)]">{c.season} · {c.openBeta}</p></div>
              <h1 className="mt-7 max-w-3xl text-[clamp(3.25rem,7vw,7.5rem)] font-light leading-[0.88] tracking-[-0.045em] text-[var(--paper)]">{c.hero}</h1>
              <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
                <button type="button" onClick={() => setWalletModal(true)} className="ui-control inline-flex min-h-12 items-center justify-center gap-2 bg-[var(--paper)] px-5 text-sm font-medium text-[var(--ink-base)] hover:bg-white">{wallet ? c.changeWallet : c.connect} <span aria-hidden>&rarr;</span></button>
                <span className="flex items-center gap-2 font-plek text-[10px] uppercase tracking-[0.16em] text-[var(--paper-mute)]"><span className="h-2 w-2 rounded-full bg-[var(--brand-blue)]" /> {c.verifiedActivityOnly}</span>
              </div>
            </div>
            <div className="animate-fade-up lg:pl-8" style={{ animationDelay: "90ms" }}>
              <div className="border-y border-[var(--rule)] py-6">
                <div className="flex items-end justify-between gap-4"><div><p className="font-plek text-[10px] uppercase tracking-[0.22em] text-[var(--paper-mute)]">{c.yourRank}</p><p className="mt-2 font-mono text-[clamp(4.8rem,9vw,9rem)] leading-[0.82] tracking-[-0.07em] text-[var(--paper)]">#{rank}</p></div><span className="mb-1 font-plek text-[10px] uppercase tracking-[0.18em] text-[var(--brand-blue)]">{percentile}</span></div>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--rule)] pt-4 font-mono text-[11px]"><span className="text-[var(--paper)]">{formatScore(seasonScore)} / {formatScore(SEASON_SCORE_MAX)}</span><span className="text-[var(--paper-mute)]">{c.duration} · {c.remaining}</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--rule)] bg-[var(--ink-surface)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="inline-flex w-full sm:w-auto rounded-[var(--radius-control)] border border-[var(--rule)] bg-[var(--ink-base)] p-1">
            {(["user", "provider"] as Division[]).map((item) => <button key={item} type="button" onClick={() => setDivision(item)} className={`flex-1 sm:flex-none rounded-lg px-5 py-2 text-xs font-medium transition-colors ${division === item ? "bg-[var(--paper)] text-[var(--ink-base)]" : "text-[var(--paper-mute)] hover:text-[var(--paper)]"}`}>{item === "user" ? c.user : c.provider}</button>)}
          </div>
          <div className="hide-scrollbar flex items-center gap-1 overflow-x-auto">
            {(["overview", "standings", "benefits", "history"] as View[]).map((item) => <button key={item} type="button" onClick={() => setView(item)} className={`shrink-0 px-3 py-2 font-plek text-[10px] uppercase tracking-[0.18em] transition-colors ${view === item ? "text-[var(--brand-blue)]" : "text-[var(--paper-mute)] hover:text-[var(--paper)]"}`}>{c[item]}</button>)}
          </div>
          <button type="button" onClick={() => setWalletModal(true)} className="flex min-h-10 items-center justify-between gap-3 rounded-[var(--radius-control)] border border-[var(--rule)] bg-[var(--ink-base)] px-3 text-left">
            <span className="h-2 w-2 rounded-full bg-[var(--success)]" /><span className="min-w-0"><span className="block font-plek text-[8px] uppercase tracking-[0.18em] text-[var(--paper-faint)]">{wallet ? `${wallet} · ${c.connected}` : c.connect}</span><span className="block max-w-[170px] truncate font-mono text-[11px] text-[var(--paper)]">{wallet ? "rJ8qk5pV...T54A" : "—"}</span></span><span className="text-[var(--paper-faint)]" aria-hidden>&#8964;</span>
          </button>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-9 sm:py-12 space-y-10">
        {view === "overview" && <><div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.55fr)]"><Standings c={c} isUser={isUser} leaders={leaders} rank={rank} /><ScoreBreakdown c={c} scores={scores} /></div><ActivityPanel c={c} />{isUser ? <ServicesPanel c={c} /> : null}</>}
        {view === "standings" && <Standings c={c} isUser={isUser} leaders={leaders} rank={rank} />}
        {view === "benefits" && <BenefitsPanel c={c} isUser={isUser} seasonScore={seasonScore} />}
        {view === "history" && <HistoryPanel c={c} />}
      </div>

      {walletModal && <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="wallet-dialog-title"><div className="w-full max-w-md rounded-[var(--radius-shell)] border border-[var(--rule)] bg-[var(--ink-surface)] p-6"><div className="flex items-start justify-between gap-4"><h2 id="wallet-dialog-title" className="text-2xl text-[var(--paper)]">{c.walletTitle}</h2><button type="button" onClick={() => setWalletModal(false)} className="p-2 text-[var(--paper-mute)] hover:text-[var(--paper)]" aria-label={c.cancel}>&times;</button></div><div className="mt-6 space-y-2">{(["Tidal", "Xaman", "Girin"] as WalletName[]).map((name) => <button key={name} type="button" onClick={() => { setWallet(name); setWalletModal(false); }} className="ui-control flex w-full items-center justify-between rounded-[var(--radius-control)] border border-[var(--rule)] bg-[var(--ink-base)] px-4 py-3 text-sm text-[var(--paper)] hover:border-[var(--border-hover)] hover:bg-[var(--blue-08)]"><span>{name} Wallet</span><span className="font-mono text-[10px] text-[var(--paper-faint)]">{wallet === name ? c.connected.toUpperCase() : "CONNECT"}</span></button>)}</div></div></div>}
    </div>
  );
}

function Standings({ c, isUser, leaders, rank }: { c: Copy; isUser: boolean; leaders: LeaderRow[]; rank: number }) {
  const top = leaders.slice(0, 4); const self = leaders[4];
  return <section className="table-shell border border-[var(--rule)] overflow-hidden animate-fade-up">
    <div className="flex items-end justify-between gap-4 border-b border-[var(--rule)] px-5 py-5 sm:px-7"><h2 className="text-3xl sm:text-4xl font-light text-[var(--paper)]">{isUser ? c.userStanding : c.providerStanding}</h2><span className="font-plek text-[9px] uppercase tracking-[0.18em] text-[var(--brand-blue)]">{c.top100}</span></div>
    <div className="hidden sm:grid grid-cols-[50px_minmax(0,1fr)_120px_120px_130px] gap-3 border-b border-[var(--rule)] px-7 py-3 font-plek text-[8px] uppercase tracking-[0.18em] text-[var(--paper-faint)]"><span>#</span><span>{isUser ? c.user : c.provider}</span><span>{c.activity}</span><span>{c.breadth}</span><span className="text-right">{c.score}</span></div>
    <div className="divide-y divide-[var(--rule)]">{top.map((row, index) => <div key={row[0]} className={`grid grid-cols-[38px_minmax(0,1fr)_auto] sm:grid-cols-[50px_minmax(0,1fr)_120px_120px_130px] items-center gap-3 px-5 py-4 sm:px-7 ${index < 3 ? "bg-[rgba(255,255,255,0.015)]" : ""}`}><span className={`font-mono text-sm ${index < 3 ? "text-[var(--paper)]" : "text-[var(--paper-faint)]"}`}>{String(index + 1).padStart(2, "0")}</span><span className="truncate text-sm text-[var(--paper)]">{row[0]}</span><span className="hidden sm:block font-mono text-[11px] text-[var(--paper-mute)]">{row[2]}</span><span className="hidden sm:block font-mono text-[11px] text-[var(--paper-mute)]">{row[3]}</span><span className={`text-right font-mono tabular-nums text-[var(--brand-blue)] ${index < 3 ? "text-lg" : "text-sm"}`}>{formatScore(row[1])}</span></div>)}
      <div className="px-7 py-2 font-mono text-center text-[10px] tracking-[0.3em] text-[var(--paper-faint)]">···</div>
      <div className="grid grid-cols-[38px_minmax(0,1fr)_auto] sm:grid-cols-[50px_minmax(0,1fr)_120px_120px_130px] items-center gap-3 border-l-2 border-[var(--brand-blue)] bg-[var(--blue-08)] px-5 py-4 sm:px-7"><span className="font-mono text-sm text-[var(--brand-blue)]">{rank}</span><span className="truncate text-sm text-[var(--paper)]">{self[0]} <span className="ml-2 font-plek text-[8px] uppercase tracking-[0.16em] text-[var(--brand-blue)]">{c.you}</span></span><span className="hidden sm:block font-mono text-[11px] text-[var(--paper-mute)]">{self[2]}</span><span className="hidden sm:block font-mono text-[11px] text-[var(--paper-mute)]">{self[3]}</span><span className="text-right font-mono text-lg tabular-nums text-[var(--brand-blue)]">{formatScore(self[1])}</span></div>
    </div>
  </section>;
}

function ScoreBreakdown({ c, scores }: { c: Copy; scores: ScoreItem[] }) {
  return <section className="dashboard-panel border border-[var(--rule)] p-5 sm:p-7 animate-fade-up" style={{ animationDelay: "60ms" }}><h2 className="text-xl text-[var(--paper)]">{c.scoreBreakdown}</h2><div className="mt-7 space-y-6">{scores.map((item) => <ScoreBar key={item.key} label={c[item.key]} item={item} />)}</div></section>;
}

function ScoreBar({ label, item }: { label: string; item: ScoreItem }) {
  const color = item.tone === "blue" ? "bg-[var(--brand-blue)]" : item.tone === "coral" ? "bg-[var(--t54-coral)]" : "bg-[var(--paper-mute)]";
  return <div><div className="flex items-end justify-between gap-3"><p className="text-sm text-[var(--paper)]">{label}</p><p className="font-mono text-sm tabular-nums text-[var(--paper)]">{formatScore(item.value)} <span className="text-[var(--paper-faint)]">/ {formatScore(item.max)}</span></p></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--rule)]"><div className={`h-full rounded-full ${color}`} style={{ width: `${(item.value / item.max) * 100}%` }} /></div></div>;
}

function ActivityPanel({ c }: { c: Copy }) {
  return <section className="table-shell border border-[var(--rule)] overflow-hidden animate-fade-up"><div className="border-b border-[var(--rule)] px-5 py-4 sm:px-7"><h2 className="text-xl text-[var(--paper)]">{c.recentActivity}</h2></div><div className="divide-y divide-[var(--rule)]">{ACTIVITIES.map((item) => <div key={item.hash} className="grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,1fr)_140px_120px] items-center gap-3 px-5 py-4 sm:px-7 hover:bg-[var(--blue-08)] transition-colors"><div className="min-w-0"><p className="truncate text-sm text-[var(--paper)]">{item.service}</p><p className="mt-1 truncate font-mono text-[10px] text-[var(--paper-faint)]">{item.hash} · {item.time}</p></div><span className="hidden sm:block font-mono text-xs tabular-nums text-[var(--paper-mute)]">{item.asset}</span><span className={`justify-self-end rounded-full border px-2.5 py-1 font-plek text-[8px] uppercase tracking-[0.18em] ${statusTone(item.status)}`}>{c[item.status]}</span></div>)}</div></section>;
}

function ServicesPanel({ c }: { c: Copy }) {
  return <section className="animate-fade-up"><div className="flex items-end justify-between gap-3"><h2 className="text-2xl text-[var(--paper)]">{c.services}</h2><Link href="/directory" className="text-xs text-[var(--paper-mute)] hover:text-[var(--paper)]">{c.explore} &rarr;</Link></div><div className="mt-5 grid gap-4 md:grid-cols-3">{SERVICES.map((service) => <Link key={service.name} href="/directory" className="ui-card group border border-[var(--rule)] p-5 hover:bg-[var(--blue-08)]"><div className="flex items-start justify-between gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-control)] border border-[var(--blue-28)] bg-[var(--blue-08)] font-plek text-sm text-[var(--brand-blue)]">{service.mark}</span><span className="font-mono text-[10px] text-[var(--paper-faint)]">{service.activity}</span></div><h3 className="mt-5 text-xl text-[var(--paper)]">{service.name}</h3><p className="mt-1 text-xs text-[var(--paper-mute)]">{service.type}</p><p className="mt-5 border-t border-[var(--rule)] pt-4 font-mono text-[10px] text-[var(--brand-blue)]">{service.price}</p></Link>)}</div></section>;
}

function BenefitsPanel({ c, isUser, seasonScore }: { c: Copy; isUser: boolean; seasonScore: number }) {
  return <section className="animate-fade-up"><h2 className="text-3xl sm:text-4xl font-light text-[var(--paper)]">{c.benefitTitle}</h2><div className="mt-6 grid gap-px border border-[var(--rule)] bg-[var(--rule)] sm:grid-cols-2">{(isUser ? c.userTiers : c.providerTiers).map(([name, description], index) => { const threshold = BENEFIT_THRESHOLDS[index]; const unlocked = seasonScore >= threshold; return <div key={name} className={`bg-[var(--ink-surface)] p-6 ${unlocked ? "" : "opacity-50"}`}><div className="flex items-center justify-between gap-3"><span className="font-mono text-sm text-[var(--brand-blue)]">{formatScore(threshold)}</span><span className={`font-plek text-[8px] uppercase tracking-[0.18em] ${unlocked ? "text-[var(--success)]" : "text-[var(--paper-faint)]"}`}>{unlocked ? c.unlocked : c.locked}</span></div><h3 className="mt-5 text-xl text-[var(--paper)]">{name}</h3><p className="mt-2 text-sm text-[var(--paper-mute)]">{description}</p></div>; })}</div></section>;
}

function HistoryPanel({ c }: { c: Copy }) {
  const metrics = [[c.historicalTransactions, "2,222,950"], [c.yourHistoricalTx, "61"], [c.foundingStatus, "FOUNDING PARTICIPANT"], [c.firstSeen, "FEB 07, 2026"]];
  return <section className="animate-fade-up"><h2 className="text-3xl sm:text-4xl font-light text-[var(--paper)]">{c.historicalActivity}</h2><div className="mt-6 grid grid-cols-1 gap-px border border-[var(--rule)] bg-[var(--rule)] sm:grid-cols-2 lg:grid-cols-4">{metrics.map(([label, value]) => <div key={label} className="bg-[var(--ink-surface)] p-6"><p className="font-plek text-[9px] uppercase tracking-[0.18em] text-[var(--paper-faint)]">{label}</p><p className="mt-4 font-mono text-xl tabular-nums text-[var(--paper)]">{value}</p></div>)}</div></section>;
}
