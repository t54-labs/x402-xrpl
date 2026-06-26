import type { Metadata } from "next";
import { Poppins, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Script from "next/script";
import { Suspense } from "react";
import { SearchBar } from "./components/SearchBar";
import { MobileNav } from "./components/MobileNav";
import { NavLinks } from "./components/NavLinks";
import { GoogleAnalyticsPageView } from "./components/GoogleAnalyticsPageView";
import { CookieConsent, CookieSettingsLink } from "./components/CookieConsent";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-1D7VRX7WY2";

// t54 brand typeface — Poppins for all sans-serif text (headings + body).
const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

// Monospace stays Geist Mono — tabular figures for instrument numbers,
// amounts, timestamps, and code blocks where column alignment matters.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://xrpl-ai.org";
const SITE_NAME = "XRPL AI Hub";
const SITE_DESCRIPTION =
  "An open community of builders, agents and services growing on the XRP Ledger — where agents transact in XRP and RLUSD.";
const SOCIAL_TITLE = "Build the agent economy on XRP Ledger together";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "XRPL AI Hub — the live index of agentic payments on the XRP Ledger",
    template: "%s — XRPL AI Hub",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "XRPL",
    "XRP Ledger",
    "RLUSD",
    "x402",
    "AI agents",
    "agentic payments",
    "agentic commerce",
    "machine economy",
    "stablecoin payments",
    "agent trust layer",
    "verifiable intent",
    "t54",
    "Ripple",
  ],
  authors: [{ name: "t54 Labs", url: "https://t54.ai" }],
  creator: "t54 Labs",
  publisher: "t54 Labs",
  category: "technology",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: SOCIAL_TITLE,
    description: SITE_DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@t54ai",
    creator: "@t54ai",
    title: SOCIAL_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  icons: { icon: "/icon.png", shortcut: "/favicon.ico", apple: "/icon.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${poppins.variable} ${geistMono.variable} antialiased bg-[var(--bg-base)] text-[var(--text-primary)] min-h-screen flex flex-col`}
      >
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' });
            try { if (window.localStorage && localStorage.getItem('cookie-consent') === 'granted') { gtag('consent', 'update', { analytics_storage: 'granted' }); } } catch (e) {}
            gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
          `}
        </Script>
        <Suspense fallback={null}>
          <GoogleAnalyticsPageView measurementId={GA_MEASUREMENT_ID} />
        </Suspense>
        <nav className="sticky top-0 z-50 w-full bg-[rgba(0,0,0,0.6)] backdrop-blur-[20px] backdrop-saturate-150 border-b border-[rgba(255,255,255,0.06)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[80px] flex items-center justify-between gap-4">
            <div className="h-full flex items-center gap-5 min-w-0">
              <Link href="/" className="flex items-center gap-2 shrink-0 group" aria-label="XRPL AI">
                <svg viewBox="0 0 51 51" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className="w-8 h-8 shrink-0 transition-transform duration-200 group-hover:scale-110">
                  <path d="M25.1882 50.3765C39.0993 50.3765 50.3765 39.0993 50.3765 25.1882C50.3765 11.2772 39.0993 0 25.1882 0C11.2772 0 0 11.2772 0 25.1882C0 39.0993 11.2772 50.3765 25.1882 50.3765Z" fill="#FFFFFF" />
                  <path d="M25.1882 24.8505C26.3053 24.8505 27.3826 24.4355 28.2124 23.6855L32.8325 19.3553H30.6169L27.0953 22.6269C26.5713 23.1057 25.8878 23.3716 25.1802 23.3716C24.4727 23.3716 23.7865 23.1057 23.2652 22.6269L19.7649 19.3553H17.5493L22.1694 23.6855C22.9992 24.4355 24.0764 24.8505 25.1935 24.8505H25.1882ZM14.7805 13.7033C14.2113 13.9373 13.6953 14.2831 13.2617 14.7167C12.8282 15.1502 12.4824 15.6689 12.2483 16.2354C12.0143 16.8046 11.8919 17.4137 11.8919 18.0281V21.4247C11.8919 22.1428 11.618 22.837 11.1259 23.361C10.6338 23.885 9.95826 24.1988 9.24011 24.2414L9.28267 24.9861L9.24011 25.7309C9.95826 25.7734 10.6338 26.0873 11.1259 26.6113C11.618 27.1352 11.8919 27.8268 11.8919 28.5476V32.4628C11.8919 33.7608 12.4026 35.0082 13.3202 35.9285C14.2379 36.8488 15.4826 37.3675 16.7806 37.3701V35.878C15.879 35.878 15.0172 35.5189 14.3788 34.8832C13.7431 34.2475 13.3841 33.3831 13.3841 32.4814V28.5449C13.3841 27.8427 13.2138 27.1512 12.884 26.5288C12.5542 25.9091 12.0808 25.3771 11.4983 24.9808C12.0781 24.5845 12.5516 24.0525 12.8814 23.4328C13.2085 22.8131 13.3814 22.1215 13.3841 21.4193V18.0228C13.3867 17.177 13.7245 16.3684 14.323 15.7726C14.9214 15.1741 15.73 14.839 16.5732 14.8337H17.153V13.3416H16.5732C15.9587 13.3416 15.3497 13.4612 14.7805 13.698V13.7033ZM25.1882 25.8373C24.0685 25.8373 22.9886 26.2575 22.164 27.0182L17.5254 31.367H19.741L23.2838 28.0529C23.8078 27.5741 24.4914 27.3081 25.1989 27.3081C25.9064 27.3081 26.5926 27.5741 27.1139 28.0529L30.6355 31.367H32.8511L28.2124 27.0182C27.3879 26.2602 26.308 25.8373 25.1882 25.8373ZM41.1177 24.2414C40.3996 24.1988 39.724 23.885 39.2319 23.361C38.7399 22.837 38.4659 22.1455 38.4659 21.4247V18.0281C38.4659 16.7886 37.9792 15.5997 37.1041 14.722C36.229 13.8443 35.0428 13.3495 33.806 13.3469H33.2261V14.839H33.806C34.2235 14.839 34.6385 14.9215 35.0241 15.0837C35.4098 15.2433 35.7609 15.48 36.0535 15.7753C36.3487 16.0705 36.5801 16.4243 36.7397 16.8099C36.8966 17.1956 36.9791 17.6105 36.9764 18.0281V21.4247C36.9764 22.1268 37.152 22.8184 37.4791 23.4381C37.8063 24.0579 38.2824 24.5898 38.8622 24.9861C38.2797 25.3798 37.8063 25.9117 37.4765 26.5341C37.1467 27.1539 36.9764 27.8481 36.9764 28.5502V32.4867C36.9764 33.3884 36.6174 34.2502 35.9817 34.8885C35.346 35.5242 34.4815 35.8833 33.5799 35.8833V37.3754C34.8779 37.3728 36.1226 36.8541 37.0403 35.9338C37.9579 35.0135 38.4712 33.7661 38.4686 32.4681V28.5529C38.4686 27.8348 38.7425 27.1406 39.2346 26.6166C39.7267 26.0926 40.4022 25.7787 41.1204 25.7362L41.0778 24.9914L41.1204 24.2467L41.1177 24.2414Z" fill="#0A0A0A" />
                </svg>
                <span className="font-plek text-xl leading-none tracking-tight text-[var(--text-primary)]">AI HUB</span>
              </Link>
              <div className="hidden xl:block">
                <SearchBar />
              </div>
            </div>

            <div className="h-full flex items-center gap-2.5 ml-auto">
              <NavLinks />
              <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.16)] rounded-full text-[11px] text-[var(--text-muted)] shrink-0">
                <span className="w-1.5 h-1.5 !rounded-full bg-[#10B981] animate-[pulse_2s_infinite]" />
                XRPL Mainnet
              </div>
              <MobileNav />
            </div>
          </div>
        </nav>

        <main className="flex-1 overflow-x-clip">
          {children}
        </main>
        
        <footer className="border-t border-[rgba(255,255,255,0.06)] py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-[var(--text-muted)]">&copy; 2026 t54 labs. All rights reserved.</p>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-[var(--text-muted)]">
              <Link href="/terms" className="inline-flex items-center min-h-[40px] hover:text-[var(--text-secondary)] transition-colors">Terms</Link>
              <Link href="/privacy" className="inline-flex items-center min-h-[40px] hover:text-[var(--text-secondary)] transition-colors">Privacy</Link>
              <CookieSettingsLink className="inline-flex items-center min-h-[40px] hover:text-[var(--text-secondary)] transition-colors" />
              <a href="https://t54.ai" target="_blank" rel="noreferrer" className="inline-flex items-center min-h-[40px] hover:text-[var(--text-secondary)] transition-colors">t54.ai</a>
              <a href="https://x402.org" target="_blank" rel="noreferrer" className="inline-flex items-center min-h-[40px] hover:text-[var(--text-secondary)] transition-colors">x402 Protocol</a>
              <a href="https://xrpl.org" target="_blank" rel="noreferrer" className="inline-flex items-center min-h-[40px] hover:text-[var(--text-secondary)] transition-colors">XRPL</a>
              <a href="https://x.com/t54ai" target="_blank" rel="noreferrer" aria-label="t54 on X" className="inline-flex items-center justify-center min-h-[40px] min-w-[40px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-5">
            <p className="text-[10px] text-[var(--text-muted)] leading-relaxed max-w-3xl">
              T54 Labs Inc. is an official launch partner of Mastercard&rsquo;s Agent Pay for Machines. Mastercard, Mastercard Agent Pay, Agent Pay for Machines and Verifiable Intent are trademarks of Mastercard International Incorporated.
            </p>
          </div>
        </footer>
        <CookieConsent />
      </body>
    </html>
  );
}
