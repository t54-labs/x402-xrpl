import { DashboardLive, type DashboardData, type DirectoryService } from "./components/DashboardLive";
import { SIGNALS } from "./lib/signals";
import { apiFetch } from "./lib/api";

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

// The home marquee shows the first 20 Directory services — one entry per
// provider (grouped server-side by /services), most-active first.
async function getDirectoryServices(): Promise<{ items: DirectoryService[]; total: number }> {
  try {
    const r = await apiFetch<{ items: DirectoryService[] }>("/services", ssrOpts());
    const items = r.items ?? [];
    return { items: items.slice(0, 20), total: items.length };
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
