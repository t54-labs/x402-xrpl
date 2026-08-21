import type { Metadata } from "next";
import { isLocale } from "@/app/lib/i18n";
import { AgentLeagueDemo } from "@/app/components/AgentLeagueDemo";

export const metadata: Metadata = {
  title: "XRPL Agent League",
  description:
    "Build your standing through facilitator-verified agentic activity on the XRP Ledger.",
  alternates: { canonical: "/agent-league" },
};

export default async function AgentLeaguePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <AgentLeagueDemo locale={isLocale(locale) ? locale : "en"} />;
}
