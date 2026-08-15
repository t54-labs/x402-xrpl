import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/app/components/LocaleLink";
import { DotField } from "@/app/components/BrandDots";
import { MerchantTxChart } from "@/app/components/MerchantTxChart";
import { OfferedApisList } from "@/app/components/OfferedApisList";
import { CopyButton } from "@/app/components/CopyButton";
import { RelativeTime } from "@/app/components/RelativeTime";
import { getExplorerUrl } from "@/app/utils/explorer";
import { formatCurrency } from "@/app/utils/currency";
import { apiFetch } from "@/app/lib/api";
import { isLocale } from "@/app/lib/i18n";
import { makeT } from "@/app/lib/i18n-t";

type T = ReturnType<typeof makeT>;

interface PageProps {
  params: Promise<{ address: string; locale: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { address } = await params;
  const short = address.length > 16 ? `${address.slice(0, 8)}…${address.slice(-6)}` : address;
  return {
    title: `${short} · Address`,
    description: `x402 activity for XRPL address ${address} — settlements, offered services and merchant profile.`,
    alternates: { canonical: `/address/${address}` },
  };
}

type TxRow = {
  hash: string; timestamp: string; buyerAddress: string; merchantAddr: string;
  amount: string; asset: string;
  merchant?: { address: string; name: string | null } | null;
  resource?: { url: string; name: string | null } | null;
};

type AssetVolume = { asset: string; total: number };

type AddressResponse = {
  type: "merchant" | "buyer";
  merchant?: {
    address: string; name: string | null; description: string | null;
    website: string | null; logoUrl: string | null; createdAt: string;
    resources: Array<{
      id: string; url: string; name: string | null; priceAmount: string;
      priceAsset: string; isActive: boolean;
    }>;
  };
  address?: string;
  totalTxCount?: number;
  txCount?: number;
  totalVolume?: number;
  volumeByAsset?: AssetVolume[];
  txSeries?: Array<{ t: string; count: number }>;
  totalSpent?: number;
  spentByAsset?: AssetVolume[];
  uniqueMerchants?: number;
  transactions: TxRow[];
  pagination: { page: number; pageSize: number; totalPages: number };
};

export default async function AddressPage({ params, searchParams }: PageProps) {
  const { address, locale } = await params;
  const t = makeT(isLocale(locale) ? locale : "en");
  const { page: pageStr } = await searchParams;
  const page = parseInt(pageStr || "1", 10);

  let data: AddressResponse;
  try {
    data = await apiFetch<AddressResponse>(`/address/${address}?page=${page}`);
  } catch {
    notFound();
  }

  if (data.type === "merchant" && data.merchant) {
    return <MerchantView address={address} data={data} t={t} />;
  }
  return <BuyerView address={address} data={data} t={t} />;
}


function VolumeDisplay({ volumes, fallback }: { volumes?: AssetVolume[]; fallback?: number }) {
  const items = volumes && volumes.length > 0 ? volumes : [{ asset: "XRP", total: fallback ?? 0 }];
  return (
    <div className="flex flex-col gap-0.5">
      {items.map((v) => (
        <p key={v.asset} className="text-2xl font-mono tabular-nums leading-none text-[var(--paper)]">
          {v.total.toFixed(v.total > 0 && v.total < 1 ? 4 : 2)}
          <span className="ml-1.5 text-[11px] font-plek uppercase tracking-[0.16em] text-[var(--paper-mute)]">{formatCurrency(v.asset)}</span>
        </p>
      ))}
    </div>
  );
}

function StatCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-plek uppercase tracking-[0.2em] text-[var(--paper-mute)]">{label}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Avatar({ logoUrl, name, accent }: { logoUrl?: string | null; name?: string | null; accent: "blue" | "coral" }) {
  if (logoUrl) {
    return (
      <span className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[var(--border)] bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl} alt={name || ""} className="h-full w-full object-cover" />
      </span>
    );
  }
  const tint =
    accent === "coral"
      ? "border-[rgba(201,70,46,0.25)] bg-[rgba(201,70,46,0.08)] text-[var(--t54-coral)]"
      : "border-[rgba(0,140,255,0.2)] bg-[rgba(0,140,255,0.08)] text-[var(--brand-blue)]";
  return (
    <span className={`flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl border text-3xl font-medium ${tint}`}>
      {(name?.[0] || (accent === "coral" ? "B" : "M")).toUpperCase()}
    </span>
  );
}

function hostOf(u: string) {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u;
  }
}

function MerchantView({ address, data, t }: { address: string; data: AddressResponse; t: T }) {
  const merchant = data.merchant!;
  // Fall back to the endpoint's domain (like the directory card does) so a merchant
  // whose name was never captured reads as its host instead of "Unknown merchant".
  // Prefer `website`, but indexer-born rows have none — derive from a resource URL then.
  const displayName = merchant.name?.trim() || hostOf(merchant.website || merchant.resources[0]?.url || "") || null;
  const totalTxCount = data.totalTxCount ?? 0;
  const series = data.txSeries ?? [];
  const hasChart = series.length >= 2;
  // Short, dense spans label the ends with the time too (like an intraday tape).
  const spanMs = hasChart ? new Date(series[series.length - 1].t).getTime() - new Date(series[0].t).getTime() : 0;
  const withTime = spanMs <= 3 * 86_400_000;
  const fmtTick = (iso: string) =>
    new Date(iso).toLocaleString("en-US", withTime ? { timeZone: "UTC", month: "short", day: "numeric", hour: "numeric" } : { timeZone: "UTC", month: "short", day: "numeric" });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="dashboard-panel relative overflow-hidden bg-[var(--bg-surface)] border border-[var(--border)] p-6 sm:p-8">
        {hasChart ? null : (
          <DotField className="pointer-events-none absolute top-5 right-6 z-0 hidden sm:block text-[var(--paper-faint)] opacity-[0.1]" cols={10} rows={4} />
        )}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-5 sm:gap-6">
          <Avatar logoUrl={merchant.logoUrl} name={displayName} accent="blue" />
          <div className="min-w-0">
            <span className="text-[10px] font-plek uppercase tracking-[0.28em] text-[var(--paper-mute)]">{t("Merchant")}</span>
            <h1 className="mt-1.5 text-3xl sm:text-4xl font-medium tracking-tight text-[var(--paper)]">{displayName || t("Unknown merchant")}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-[12px] text-[var(--brand-blue)] bg-[rgba(0,140,255,0.06)] px-3 py-1 rounded-md border border-[rgba(0,140,255,0.12)] break-all">{address}</span>
              <CopyButton text={address} />
              {merchant.website ? (
                <a href={merchant.website} target="_blank" rel="noreferrer" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">{t("Website")} &#8599;</a>
              ) : null}
              <a href={`${getExplorerUrl()}/accounts/${address}`} target="_blank" rel="noreferrer" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">XRPL Explorer &#8599;</a>
            </div>
          </div>
          {hasChart ? (
            <div className="ml-auto hidden w-[300px] shrink-0 lg:block">
              <span className="mb-1.5 block font-plek text-[9px] uppercase tracking-[0.2em] text-[var(--paper-mute)]">{t("Transactions over time")}</span>
              <div className="h-[60px]">
                <MerchantTxChart series={series} />
              </div>
              <div className="mt-1 flex items-center justify-between font-mono text-[9px] text-[var(--paper-faint)] tabular-nums">
                <span>{fmtTick(series[0].t)}</span>
                <span>{fmtTick(series[series.length - 1].t)}</span>
              </div>
            </div>
          ) : null}
        </div>
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-7 border-t border-[var(--rule)]">
          <StatCell label={t("Total volume")}><VolumeDisplay volumes={data.volumeByAsset} fallback={data.totalVolume} /></StatCell>
          <StatCell label={t("Payments received")}><p className="text-2xl font-mono tabular-nums text-[var(--paper)]">{totalTxCount.toLocaleString()}</p></StatCell>
          <StatCell label={t("Active APIs")}><p className="text-2xl font-mono tabular-nums text-[var(--paper)]">{merchant.resources.length}</p></StatCell>
          <StatCell label={t("Joined")}><p className="mt-1 text-sm text-[var(--text-secondary)]">{new Date(merchant.createdAt).toLocaleDateString("en-US", { timeZone: "UTC", year: "numeric", month: "short", day: "numeric" })}</p></StatCell>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-medium tracking-tight text-[var(--paper)]">{t("Offered APIs")}</h2>
          <OfferedApisList resources={merchant.resources} />
        </div>
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-medium tracking-tight text-[var(--paper)]">{t("Recent payments")}</h2>
          <TxTable transactions={data.transactions} perspective="merchant" page={data.pagination.page} totalPages={data.pagination.totalPages} basePath={`/address/${address}`} t={t} />
        </div>
      </div>
    </div>
  );
}

function BuyerView({ address, data, t }: { address: string; data: AddressResponse; t: T }) {
  const totalSpent = data.totalSpent ?? 0;
  const txCount = data.txCount ?? 0;
  const uniqueMerchants = data.uniqueMerchants ?? 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="dashboard-panel relative overflow-hidden bg-[var(--bg-surface)] border border-[var(--border)] p-6 sm:p-8">
        <DotField className="pointer-events-none absolute top-5 right-6 z-0 hidden sm:block text-[var(--paper-faint)] opacity-[0.1]" cols={10} rows={4} />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-5 sm:gap-6">
          <Avatar accent="coral" name={null} />
          <div className="min-w-0">
            <span className="text-[10px] font-plek uppercase tracking-[0.28em] text-[var(--paper-mute)]">{t("Buyer")}</span>
            <h1 className="mt-1.5 text-3xl sm:text-4xl font-medium tracking-tight text-[var(--paper)]">{t("Buyer address")}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-[12px] text-[var(--t54-coral)] bg-[rgba(201,70,46,0.07)] px-3 py-1 rounded-md border border-[rgba(201,70,46,0.16)] break-all">{address}</span>
              <CopyButton text={address} />
              <a href={`${getExplorerUrl()}/accounts/${address}`} target="_blank" rel="noreferrer" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">XRPL Explorer &#8599;</a>
            </div>
          </div>
        </div>
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 gap-6 mt-8 pt-7 border-t border-[var(--rule)]">
          <StatCell label={t("Total spent")}><VolumeDisplay volumes={data.spentByAsset} fallback={totalSpent} /></StatCell>
          <StatCell label={t("Payments made")}><p className="text-2xl font-mono tabular-nums text-[var(--paper)]">{txCount.toLocaleString()}</p></StatCell>
          <StatCell label={t("Merchants used")}><p className="text-2xl font-mono tabular-nums text-[var(--paper)]">{uniqueMerchants}</p></StatCell>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-medium tracking-tight text-[var(--paper)]">{t("Payment history")}</h2>
        <TxTable transactions={data.transactions} perspective="buyer" page={data.pagination.page} totalPages={data.pagination.totalPages} basePath={`/address/${address}`} t={t} />
      </div>
    </div>
  );
}

function TxTable({ transactions, perspective, page, totalPages, basePath, t }: {
  transactions: TxRow[]; perspective: "merchant" | "buyer"; page: number; totalPages: number; basePath: string; t: T;
}) {
  const counterLabel = perspective === "merchant" ? "Buyer" : "Merchant";
  return (
    <div className="dashboard-panel bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="border-b border-[var(--border)]">
            <tr>
              <th className="px-5 py-3 text-[10px] font-plek uppercase tracking-[0.18em] text-[var(--paper-mute)]">{t("Hash")}</th>
              <th className="px-5 py-3 text-[10px] font-plek uppercase tracking-[0.18em] text-[var(--paper-mute)]">{t(counterLabel)}</th>
              <th className="px-5 py-3 text-[10px] font-plek uppercase tracking-[0.18em] text-[var(--paper-mute)]">{t("Resource")}</th>
              <th className="px-5 py-3 text-[10px] font-plek uppercase tracking-[0.18em] text-[var(--paper-mute)] text-right">{t("Value")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {transactions.map((tx) => {
              const counterAddr = perspective === "merchant" ? tx.buyerAddress : tx.merchantAddr;
              const counterName = perspective === "buyer" ? tx.merchant?.name : null;
              return (
                <tr key={tx.hash} className="transition-colors hover:bg-[rgba(255,255,255,0.02)]">
                  <td className="px-5 py-3.5">
                    <Link href={`/tx/${tx.hash}`} className="font-mono text-[13px] text-[var(--brand-blue)] hover:underline">{tx.hash.substring(0, 10)}&#8230;</Link>
                    <div className="mt-0.5 text-[10px] text-[var(--text-muted)]"><RelativeTime date={tx.timestamp} /></div>
                  </td>
                  <td className="px-5 py-3.5">
                    <Link href={`/address/${counterAddr}`} className="font-mono text-[13px] text-[var(--text-secondary)] transition-colors hover:text-[var(--brand-blue)]">{counterName || `${counterAddr.substring(0, 12)}…`}</Link>
                  </td>
                  <td className="px-5 py-3.5 max-w-[220px]">
                    {tx.resource ? (
                      <span className="block text-[12px] font-mono text-[var(--text-secondary)] truncate" title={tx.resource.url}>{hostOf(tx.resource.url)}</span>
                    ) : (
                      <span className="text-[12px] italic text-[var(--text-muted)]">{t("Unknown")}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="font-mono tabular-nums text-[13px] text-[var(--paper)]">{tx.amount}</span>
                    <span className="ml-1 text-[11px] text-[var(--paper-mute)]">{formatCurrency(tx.asset)}</span>
                  </td>
                </tr>
              );
            })}
            {transactions.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-12 text-center text-sm text-[var(--text-muted)]">{t("No transactions recorded yet.")}</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 p-4 border-t border-[var(--border)]">
          {page > 1 && <Link href={`${basePath}?page=${page - 1}`} className="ui-control px-3.5 py-1.5 text-[12px] font-medium border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.04)] transition-colors">&larr; {t("Prev")}</Link>}
          <span className="text-[12px] text-[var(--text-muted)]">{t("Page {page} of {total}").replace("{page}", String(page)).replace("{total}", String(totalPages))}</span>
          {page < totalPages && <Link href={`${basePath}?page=${page + 1}`} className="ui-control px-3.5 py-1.5 text-[12px] font-medium border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.04)] transition-colors">{t("Next")} &rarr;</Link>}
        </div>
      )}
    </div>
  );
}
