import { DashboardLive, type DashboardData, type DirectoryService } from "./components/DashboardLive";
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

// The first 20 Directory services for the home marquee: distinct providers
// first (so it isn't all one provider's many endpoints), then Heurist's.
async function getDirectoryServices(): Promise<DirectoryService[]> {
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
    return uniq.slice(0, 20);
  } catch {
    return [];
  }
}

export default async function Home() {
  const [dashboardData, services] = await Promise.all([
    apiFetch<DashboardData>("/dashboard").catch(() => EMPTY_DASHBOARD),
    getDirectoryServices(),
  ]);

  return <DashboardLive initialData={dashboardData} services={services} />;
}
