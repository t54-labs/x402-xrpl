"use client";

import Image from "next/image";
import { useState } from "react";
import { track } from "@/app/lib/analytics";
import { useT } from "@/app/components/useT";

type RegisteredMerchant = {
  address: string;
  name: string | null;
  logoUrl: string | null;
};

type RegisteredResource = {
  merchantAddr: string;
};

type VerifyResult = {
  success?: boolean;
  error?: string;
  registeredCount?: number;
  discoveryChecked?: boolean;
  discoveryFound?: number;
  failed?: Array<{ url: string; error: string }>;
  resources?: RegisteredResource[];
  merchants?: RegisteredMerchant[];
};

type LogoResult = {
  success?: boolean;
  error?: string;
};

const MAX_LOGO_BYTES = 256 * 1024;
const SUPPORTED_LOGO_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

const SUPPORT_EMAIL = "support@t54.ai";
const DIRECTORY_MAILTO =
  `mailto:${SUPPORT_EMAIL}` +
  `?subject=${encodeURIComponent("XRPL AI — Directory listing request")}` +
  `&body=${encodeURIComponent(
    [
      "Tell us about your service and we'll add it to the XRPL AI Directory after a quick review.",
      "",
      "Service name:",
      "Website:",
      "One-line tagline:",
      "Category (AI agent / data / inference / LLM gateway / dev tool / wallet / agentic commerce):",
      "Settlement asset (RLUSD / XRP / IOU):",
      "Short description:",
      "Contact name & email:",
    ].join("\n"),
  )}`;

export default function JoinServicePage() {
  const t = useT();
  const [url, setUrl] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifiedUrl, setVerifiedUrl] = useState("");
  const [selectedMerchant, setSelectedMerchant] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoResult, setLogoResult] = useState<LogoResult | null>(null);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [emailCopied, setEmailCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    track("endpoint_register_submit");
    setLoading(true);
    setResult(null);
    setLogoFile(null);
    setLogoPreview("");
    setLogoResult(null);

    try {
      const submittedUrl = url;
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: submittedUrl, name: displayName.trim() || undefined }),
      });

      const data = (await res.json()) as VerifyResult;
      setResult(data);
      if (res.ok && data.success) {
        track("endpoint_register_success", { count: data.registeredCount ?? 0 });
        const merchants = getRegisteredMerchants(data);
        setVerifiedUrl(submittedUrl);
        setSelectedMerchant(merchants[0]?.address || "");
        setUrl("");
      } else {
        track("endpoint_register_error", { error: data.error ?? String(res.status) });
        setVerifiedUrl("");
        setSelectedMerchant("");
      }
    } catch {
      setResult({ error: t("Network error occurred.") });
      setVerifiedUrl("");
      setSelectedMerchant("");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setLogoResult(null);
    setLogoFile(null);
    setLogoPreview("");

    if (!file) return;
    if (!SUPPORTED_LOGO_TYPES.has(file.type)) {
      setLogoResult({ error: t("Use a PNG, JPG, WebP, or GIF logo.") });
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setLogoResult({ error: t("Logo must be under 256KB.") });
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = async () => {
    if (!logoFile || !logoPreview || !verifiedUrl || !selectedMerchant) return;
    setLogoUploading(true);
    setLogoResult(null);

    try {
      const res = await fetch("/api/merchant-logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: verifiedUrl,
          merchantAddress: selectedMerchant,
          logoDataUrl: logoPreview,
        }),
      });
      const data = (await res.json()) as LogoResult & { merchant?: RegisteredMerchant };
      if (!res.ok || !data.success || !data.merchant) {
        setLogoResult({ error: data.error || t("Logo upload failed.") });
        return;
      }

      setResult((prev) => {
        if (!prev) return prev;
        const merchants = getRegisteredMerchants(prev);
        const nextMerchants = merchants.map((merchant) =>
          merchant.address === data.merchant?.address ? data.merchant : merchant,
        );
        return { ...prev, merchants: nextMerchants };
      });
      setLogoFile(null);
      setLogoResult({ success: true });
    } catch {
      setLogoResult({ error: t("Network error occurred.") });
    } finally {
      setLogoUploading(false);
    }
  };

  const registeredMerchants = result?.success ? getRegisteredMerchants(result) : [];
  const selectedMerchantDetails = registeredMerchants.find((merchant) => merchant.address === selectedMerchant);

  const input =
    "ui-control w-full bg-[rgba(255,255,255,0.03)] text-[var(--text-primary)] px-4 py-3 border border-[var(--border)] rounded-lg focus:border-[var(--brand-blue)] focus:outline-none transition-colors text-sm placeholder:text-[var(--text-muted)]";
  const label = "block text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-2";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

      <header className="mb-10 animate-fade-up">
        <span className="text-[10px] font-plek uppercase tracking-[0.28em] text-[var(--paper-mute)]">{t("Get listed")}</span>
        <h1 className="mt-5 text-4xl sm:text-5xl font-medium tracking-[-0.03em] leading-[1.02] text-[var(--paper)]">
          {t("Put your service")}<br />{t("on the rail")}
        </h1>
        <p className="text-[15px] text-[var(--text-secondary)] mt-5 max-w-lg leading-relaxed">
          {t("Register a live x402 endpoint and it appears on the Index automatically — we verify your HTTP 402 and XRPL config on the spot. No endpoint yet? Email us for a manual Directory listing.")}
        </p>
      </header>

      {/* Core path — verify & register a live x402 endpoint */}
      <section className="dashboard-panel bg-[var(--bg-surface)] border border-[var(--border)] p-6 sm:p-8 animate-fade-up" style={{ animationDelay: "80ms" }}>
        <div className="flex items-center gap-2.5 mb-1.5">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">{t("Register an x402 endpoint")}</h2>
          <span className="!rounded-md px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold bg-[rgba(0,140,255,0.08)] text-[var(--brand-blue)] border border-[rgba(0,140,255,0.15)]">
            {t("auto-verified")}
          </span>
        </div>
        <p className="text-[13px] text-[var(--text-muted)] mb-5 max-w-lg leading-relaxed">
          {t("We check your HTTP 402 configuration and XRPL requirements instantly, then publish you to the Agora and the Index.")}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="svc-endpoint-url" className={label}>{t("Origin or API endpoint URL")}</label>
            <input
              id="svc-endpoint-url"
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.yourdomain.com"
              className={`${input} font-mono`}
            />
          </div>
          <div>
            <label htmlFor="svc-display-name" className={label}>
              {t("Display name")} <span className="font-normal normal-case tracking-normal text-[var(--text-muted)]">{t("(optional)")}</span>
            </label>
            <input
              id="svc-display-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t("e.g. ClawBank")}
              maxLength={80}
              className={input}
            />
            <p className="mt-1.5 text-[11px] text-[var(--text-muted)]">
              {t("Your merchant name on the Index. Skip it if your")} <code className="text-[var(--text-secondary)]">.well-known/x402</code> {t("already sets a top-level")} <code className="text-[var(--text-secondary)]">name</code>.
            </p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="ui-control w-full bg-[var(--brand-blue)] text-white font-medium py-3 px-4 rounded-lg transition-all disabled:opacity-50"
          >
            {loading ? t("Verifying endpoint…") : t("Verify & register")}
          </button>
        </form>

        {result && (
          <div className="mt-6 space-y-3">
            {result.success ? (
              <div className="p-4 rounded-lg text-sm border bg-[var(--success)]/10 border-[var(--success)]/20 text-[var(--success)]">
                <p className="font-medium">
                  {(result.registeredCount !== 1
                    ? t("Successfully registered {n} resources on the XRPL x402 network!")
                    : t("Successfully registered {n} resource on the XRPL x402 network!")
                  ).replace("{n}", String(result.registeredCount ?? 0))}
                </p>
                {result.discoveryChecked && (
                  <p className="text-xs mt-1 opacity-80">
                    {(result.discoveryFound !== 1
                      ? t("Auto-discovery found {n} endpoints via .well-known/x402.")
                      : t("Auto-discovery found {n} endpoint via .well-known/x402.")
                    ).replace("{n}", String(result.discoveryFound ?? 0))}
                  </p>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-lg text-sm border bg-red-500/10 border-red-500/20 text-red-400">
                {result.error || t("Failed to register resource.")}
              </div>
            )}

            {result.failed && result.failed.length > 0 && (
              <div className="p-4 rounded-lg text-sm border border-amber-500/20 bg-amber-500/5 text-amber-400">
                <p className="font-medium text-xs uppercase tracking-wider mb-2">{t("Failed endpoints")}</p>
                {result.failed.map((f, i) => (
                  <div key={i} className="text-xs mt-1">
                    <span className="font-mono text-amber-300">{f.url}</span>
                    <span className="text-amber-500/80 ml-2">&mdash; {f.error}</span>
                  </div>
                ))}
              </div>
            )}

            {registeredMerchants.length > 0 && verifiedUrl && (
              <div className="p-4 sm:p-5 rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,0.03)] text-sm">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">{t("Merchant logo")}</p>
                    <p className="text-[var(--text-secondary)] mt-1">{t("Upload a small logo for the verified XRPL merchant address.")}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-12 h-12 !rounded-md border border-[var(--border)] bg-[rgba(255,255,255,0.04)] overflow-hidden flex items-center justify-center">
                      {logoPreview || selectedMerchantDetails?.logoUrl ? (
                        <Image
                          src={logoPreview || selectedMerchantDetails?.logoUrl || ""}
                          alt=""
                          width={48}
                          height={48}
                          unoptimized
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-[var(--text-muted)]">{t("Logo")}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="svc-verified-address" className={label}>{t("Verified address")}</label>
                    <select
                      id="svc-verified-address"
                      value={selectedMerchant}
                      onChange={(e) => setSelectedMerchant(e.target.value)}
                      className={`${input} font-mono`}
                    >
                      {registeredMerchants.map((merchant) => (
                        <option key={merchant.address} value={merchant.address}>
                          {merchant.name ? `${merchant.name} — ${merchant.address}` : merchant.address}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="svc-logo-file" className={label}>{t("Logo file")}</label>
                    <input
                      id="svc-logo-file"
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={handleLogoFileChange}
                      className="ui-control w-full bg-[rgba(255,255,255,0.03)] text-[var(--text-secondary)] px-4 py-3 border border-[var(--border)] rounded-lg file:mr-4 file:border-0 file:bg-[var(--brand-blue)] file:text-white file:rounded-md file:px-3 file:py-1.5 file:text-xs file:font-medium"
                    />
                    <p className="text-[11px] text-[var(--text-muted)] mt-2">{t("PNG, JPG, WebP, or GIF. Max 256KB.")}</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogoUpload}
                    disabled={!logoFile || logoUploading || !selectedMerchant}
                    className="ui-control w-full bg-[var(--brand-blue)] text-white font-medium py-3 px-4 rounded-lg transition-all disabled:opacity-50"
                  >
                    {logoUploading ? t("Uploading logo…") : t("Upload logo")}
                  </button>

                  {logoResult?.success && (
                    <div className="p-3 rounded-lg text-sm border bg-[var(--success)]/10 border-[var(--success)]/20 text-[var(--success)]">
                      {t("Logo uploaded successfully.")}
                    </div>
                  )}
                  {logoResult?.error && (
                    <div className="p-3 rounded-lg text-sm border bg-red-500/10 border-red-500/20 text-red-400">{logoResult.error}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <p className="mt-6 text-[11px] text-[var(--text-muted)] leading-relaxed">
          {t("Submit an origin URL to auto-discover")} <code className="text-[var(--text-secondary)]">/.well-known/x402</code>{t(", or a direct endpoint URL. Every registered endpoint must return")}{" "}
          <code className="text-[var(--text-secondary)]">HTTP 402</code> {t("with a valid")} <code className="text-[var(--text-secondary)]">PAYMENT-REQUIRED</code> {t("header containing")}{" "}
          <code className="text-[var(--text-secondary)]">{`{"network":"xrpl"}`}</code>.
        </p>
        <p className="mt-2 text-[11px] text-[var(--text-muted)] leading-relaxed">
          {t("Tip: give every resource a")} <code className="text-[var(--text-secondary)]">name</code> {t("and")} <code className="text-[var(--text-secondary)]">description</code> {t("in your")} <code className="text-[var(--text-secondary)]">.well-known/x402</code> {t("(and a top-level")} <code className="text-[var(--text-secondary)]">name</code> {t("for your service) — we ingest them, so your listing reads properly instead of “Registered Resource”. Re-submit anytime to refresh; endpoints that leave your catalog are retired automatically.")}
        </p>
      </section>

      {/* Secondary path — manual Directory listing by email */}
      <section className="mt-4 dashboard-panel bg-[var(--bg-surface)] border border-[var(--border)] p-6 sm:p-8 animate-fade-up" style={{ animationDelay: "140ms" }}>
        <h2 className="text-base font-semibold text-[var(--text-primary)]">{t("No live endpoint yet?")}</h2>
        <p className="text-[13px] text-[var(--text-secondary)] mt-1.5 max-w-lg leading-relaxed">
          {t("If you don’t have an x402 endpoint live yet — or you just want a manual listing in the Directory — email us the details and we’ll add you after a quick review.")}
        </p>
        <div className="mt-5 flex items-center gap-3 flex-wrap">
          <a
            href={DIRECTORY_MAILTO}
            onClick={() => {
              track("directory_email_click");
              try {
                void navigator.clipboard?.writeText(SUPPORT_EMAIL);
              } catch {}
              setEmailCopied(true);
              window.setTimeout(() => setEmailCopied(false), 2400);
            }}
            className="ui-control inline-flex items-center gap-2 px-4 py-2 bg-[rgba(255,255,255,0.04)] border border-[var(--border)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
            {t("Email {email}").replace("{email}", SUPPORT_EMAIL)}
          </a>
          <span className={`text-[12px] transition-colors ${emailCopied ? "text-[var(--success)]" : "text-[var(--text-muted)]"}`}>
            {emailCopied ? t("Address copied — paste it into your mail app.") : t("No mail app? Clicking copies the address.")}
          </span>
        </div>
      </section>
    </div>
  );
}

function getRegisteredMerchants(result: VerifyResult) {
  if (result.merchants && result.merchants.length > 0) return result.merchants;

  const seen = new Set<string>();
  return (result.resources || []).flatMap((resource) => {
    if (!resource.merchantAddr || seen.has(resource.merchantAddr)) return [];
    seen.add(resource.merchantAddr);
    return [{ address: resource.merchantAddr, name: null, logoUrl: null }];
  });
}
