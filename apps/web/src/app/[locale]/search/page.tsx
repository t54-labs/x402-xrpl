import type { Metadata } from "next";
import Link from "@/app/components/LocaleLink";
import { apiFetch } from "@/app/lib/api";
import { VerificationBadge } from "@/app/components/VerificationBadge";
import { formatCurrency } from "@/app/utils/currency";
import { isLocale } from "@/app/lib/i18n";
import { makeT } from "@/app/lib/i18n-t";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the XRPL AI Hub by XRPL address or transaction hash.",
  robots: { index: false, follow: true },
};

interface SearchParams {
  q?: string;
}

type SearchResult = {
  merchants: Array<{ address: string; name: string | null }>;
  transactions: Array<{
    hash: string; amount: string; asset: string; merchantAddr: string;
    verifiableIntent?: boolean; riskChecked?: boolean;
    merchant?: { address: string; name: string | null } | null;
  }>;
  resources: Array<{ id: string; merchantAddr: string; url: string; name: string | null; priceAmount: string; priceAsset: string }>;
};

export default async function SearchPage(props: { params: Promise<{ locale: string }>; searchParams: Promise<SearchParams> }) {
  const { locale } = await props.params;
  const t = makeT(isLocale(locale) ? locale : "en");
  const params = await props.searchParams;
  const query = params.q?.trim() || "";

  if (!query) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="text-3xl font-light text-white mb-4">{t("Search")}</h1>
        <p className="text-gray-500">{t("Enter an address or transaction hash in the search bar above.")}</p>
      </div>
    );
  }

  const { merchants, transactions, resources } = await apiFetch<SearchResult>(`/search?q=${encodeURIComponent(query)}`);

  const totalResults = merchants.length + transactions.length + resources.length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-light text-white">{t("Search Results")}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {(totalResults === 1 ? t("{n} result for") : t("{n} results for")).replace("{n}", String(totalResults))} &ldquo;<span className="text-gray-300">{query}</span>&rdquo;
        </p>
      </div>

      {totalResults === 0 && (
        <div className="ui-card bg-[#131518] rounded-xl border border-white/5 p-12 text-center">
          <p className="text-gray-500">{t("No results found. Try a different search term.")}</p>
        </div>
      )}

      {merchants.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">{t("Merchants / Addresses")}</h2>
          <div className="ui-card bg-[#131518] rounded-xl border border-white/5 divide-y divide-white/5">
            {merchants.map((m) => (
              <Link href={`/address/${m.address}`} key={m.address} className="flex items-center gap-4 px-4 sm:px-6 py-4 hover:bg-white/[0.02] transition-colors">
                <div className="ui-card w-10 h-10 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center shrink-0">
                  <span className="text-sm text-cyan-400 font-medium">{(m.name || "M").charAt(0)}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-gray-200 font-medium">{m.name || t("Unknown Merchant")}</p>
                  <p className="text-xs text-gray-500 font-mono truncate">{m.address}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {transactions.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">{t("Transactions")}</h2>
          <div className="ui-card bg-[#131518] rounded-xl border border-white/5 divide-y divide-white/5">
            {transactions.map((tx) => (
              <Link href={`/tx/${tx.hash}`} key={tx.hash} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 sm:px-6 py-4 hover:bg-white/[0.02] transition-colors">
                <div className="min-w-0">
                  <p className="text-sm text-cyan-400 font-mono truncate">{tx.hash}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {tx.merchant?.name || tx.merchantAddr.substring(0, 16) + "..."}
                  </p>
                  <VerificationBadge verifiableIntent={tx.verifiableIntent} riskChecked={tx.riskChecked} compact className="mt-2" />
                </div>
                <span className="text-sm text-white font-medium shrink-0 ml-4">
                  {tx.amount} <span className="text-xs text-gray-500">{formatCurrency(tx.asset)}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {resources.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">{t("Resources")}</h2>
          <div className="ui-card bg-[#131518] rounded-xl border border-white/5 divide-y divide-white/5">
            {resources.map((res) => (
              <Link href={`/address/${res.merchantAddr}`} key={res.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 sm:px-6 py-4 hover:bg-white/[0.02] transition-colors">
                <div className="min-w-0">
                  <p className="text-sm text-gray-200">{res.name || t("Unnamed Resource")}</p>
                  <p className="text-xs text-gray-500 font-mono truncate mt-1">{res.url}</p>
                </div>
                <span className="text-sm font-mono text-cyan-400 shrink-0 ml-4">
                  {res.priceAmount} {formatCurrency(res.priceAsset)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
