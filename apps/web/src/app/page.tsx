import { DashboardLive, type DashboardData } from "./components/DashboardLive";
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
};

export default async function Home() {
  let dashboardData: DashboardData;
  try {
    dashboardData = await apiFetch<DashboardData>("/dashboard");
  } catch {
    // API unreachable/slow — render the shell; the client polls and recovers.
    dashboardData = EMPTY_DASHBOARD;
  }

  return <DashboardLive initialData={dashboardData} />;
}
