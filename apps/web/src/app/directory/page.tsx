import Link from "next/link";
import { apiFetch } from "../lib/api";
import { DirectoryGrid, type Listing } from "./DirectoryGrid";

export const dynamic = "force-dynamic";

async function getDirectory(): Promise<Listing[]> {
  try {
    return await apiFetch<Listing[]>("/directory");
  } catch {
    return [];
  }
}

export default async function DirectoryPage() {
  const listings = await getDirectory();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <header className="animate-fade-up flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">Directory</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1 max-w-2xl">
            AI services, agents, and tools building on XRPL — available on XRPL rails via x402 and RLUSD.
          </p>
        </div>
        <Link href="/join/service" className="ui-control px-4 py-2 bg-[var(--brand-blue)] text-white font-medium text-sm shrink-0">
          Get listed
        </Link>
      </header>

      {listings.length === 0 ? (
        <div className="dashboard-panel bg-[var(--bg-surface)] border border-[var(--border)] p-10 text-center text-sm text-[var(--text-muted)]">
          No listings yet. <Link href="/join/service" className="text-[var(--brand-blue)]">Be the first &rarr;</Link>
        </div>
      ) : (
        <DirectoryGrid listings={listings} />
      )}
    </div>
  );
}
