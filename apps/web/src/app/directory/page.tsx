import type { Metadata } from "next";
import Link from "next/link";
import { apiFetch } from "../lib/api";
import { ParticleField } from "../components/ParticleField";
import { DirectoryView, type Service, type Merchant } from "./DirectoryView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Directory",
  description:
    "Browse live x402-enabled services and the merchants settling on the XRP Ledger — indexed from XRPL mainnet in RLUSD and XRP.",
  alternates: { canonical: "/directory" },
};

async function getServices(): Promise<Service[]> {
  // One card per provider (merchant) — a representative endpoint + total count —
  // so a many-endpoint gateway doesn't flood the list or crowd others out.
  try {
    const r = await apiFetch<{ items: Service[] }>("/services");
    return r.items ?? [];
  } catch {
    return [];
  }
}

async function getMerchants(): Promise<Merchant[]> {
  // The /merchants endpoint caps at 100/page and sorts by createdAt; pull the
  // first couple of pages so we have the full set to sort by activity client-side.
  try {
    const [p1, p2] = await Promise.all([
      apiFetch<{ items: Merchant[] }>("/merchants?limit=100&page=1"),
      apiFetch<{ items: Merchant[] }>("/merchants?limit=100&page=2"),
    ]);
    return [...(p1.items ?? []), ...(p2.items ?? [])];
  } catch {
    return [];
  }
}

export default async function DirectoryPage() {
  const [services, merchants] = await Promise.all([getServices(), getMerchants()]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <header className="relative animate-fade-up">
        <div aria-hidden className="pointer-events-none absolute inset-y-0 z-0 overflow-hidden" style={{ left: "calc(50% - 50vw)", width: "100vw" }}>
          <ParticleField className="absolute inset-0 h-full w-full opacity-70" />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 py-6">
          <div className="max-w-2xl">
            <span className="text-[10px] font-plek uppercase tracking-[0.28em] text-[var(--paper-mute)]">Directory</span>
            <h1 className="mt-5 text-4xl sm:text-5xl font-medium tracking-[-0.03em] leading-[1.02] text-[var(--paper)]">
              Who&rsquo;s building<br />on the rail
            </h1>
            <p className="mt-5 text-[15px] text-[var(--text-secondary)] leading-relaxed max-w-xl">
              Live x402 services and the merchants settling on XRPL — indexed from mainnet, in RLUSD and XRP.
            </p>
          </div>
          <Link href="/join/service" className="ui-control px-4 py-2 bg-[var(--brand-blue)] text-white font-medium text-sm shrink-0">
            Get listed
          </Link>
        </div>
      </header>

      <DirectoryView services={services} merchants={merchants} />
    </div>
  );
}
