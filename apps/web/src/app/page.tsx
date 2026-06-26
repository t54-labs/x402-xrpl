import { DashboardLive, type DashboardData, type DirectoryService } from "./components/DashboardLive";
import { SIGNALS } from "./lib/signals";
import { apiFetch } from "./lib/api";

export const dynamic = "force-dynamic";

const EMPTY_DASHBOARD: DashboardData = {
  totalTransactions: 0,
  totalMerchants: 0,
  totalResources: 0,
  totalVolumeXrp: 0,
  recentTransactions: [],
  recentResources: [],
  topMerchants: [],
  activeAgents: 0,
  facilitators: [],
};

// The home marquee shows the first 20 Directory services (distinct providers
// first, then Heurist's), but reports the FULL deduped total in its label —
// using the same dedup the /directory page uses so the counts match.
async function getDirectoryServices(): Promise<{ items: DirectoryService[]; total: number }> {
  try {
    const r = await apiFetch<{ items: DirectoryService[] }>("/resources?limit=100");
    const seen = new Set<string>();
    const uniq = (r.items ?? []).filter((s) => {
      const key = `${s.merchantAddr}|${(s.name ?? "").toLowerCase().trim()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    uniq.sort((a, b) => (/heurist/i.test(a.url) ? 1 : 0) - (/heurist/i.test(b.url) ? 1 : 0));
    return { items: uniq.slice(0, 20), total: uniq.length };
  } catch {
    return { items: [], total: 0 };
  }
}

export default async function Home() {
  const [dashboardData, directory] = await Promise.all([
    apiFetch<DashboardData>("/dashboard").catch(() => EMPTY_DASHBOARD),
    getDirectoryServices(),
  ]);

  const signals = [...SIGNALS].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));

  return <DashboardLive initialData={dashboardData} services={directory.items} servicesTotal={directory.total} signals={signals} />;
}
