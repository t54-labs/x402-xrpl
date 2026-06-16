import { DashboardLive, type DashboardData } from "./components/DashboardLive";
import { apiFetch } from "./lib/api";

export const dynamic = "force-dynamic";

export default async function Home() {
  const dashboardData = await apiFetch<DashboardData>("/dashboard");

  return <DashboardLive initialData={dashboardData} />;
}
