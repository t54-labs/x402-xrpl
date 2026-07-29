import { DashboardLive, type DashboardData, type DirectoryService } from "@/app/components/DashboardLive";
import { SIGNALS } from "@/app/lib/signals";
import { apiFetch } from "@/app/lib/api";

// ISR: serve a shared, periodically-revalidated snapshot instead of rendering
// (and hitting the backend) once per visitor. The client live-polls every 8s,
// so a first paint that is up to ~10s stale is invisible. Under a launch spike
// this collapses thousands of SSR renders/min into ~one every 10s.
export const revalidate = 10;
const SSR_CACHE = { next: { revalidate: 10 } } as const;
// Fresh timeout per call — AbortSignal.timeout must not be shared (it fires once).
const ssrOpts = () => ({ ...SSR_CACHE, signal: AbortSignal.timeout(12000) });

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

// The home marquee is a lively per-endpoint strip (shows the API name of each
// live x402 endpoint). Render a good spread, and label it with the FULL live
// endpoint count (pagination.total), not the fetch cap. (The /directory page
// groups these by provider; the marquee intentionally stays per-endpoint.)
async function getDirectoryServices(): Promise<{ items: DirectoryService[]; total: number }> {
  try {
    const r = await apiFetch<{ items: DirectoryService[]; pagination?: { total?: number } }>("/resources?limit=100", ssrOpts());
    const items = r.items ?? [];
    return { items: items.slice(0, 40), total: r.pagination?.total ?? items.length };
  } catch {
    return { items: [], total: 0 };
  }
}

export default async function Home() {
  const [dashboardData, directory] = await Promise.all([
    apiFetch<DashboardData>("/dashboard", ssrOpts()).catch(() => EMPTY_DASHBOARD),
    getDirectoryServices(),
  ]);

  const signals = [...SIGNALS].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));

  return <DashboardLive initialData={dashboardData} services={directory.items} servicesTotal={directory.total} signals={signals} />;
}
