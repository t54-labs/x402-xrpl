import type { Metadata } from "next";
import { Poppins, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Script from "next/script";
import { Suspense } from "react";
import { SearchBar } from "./components/SearchBar";
import { MobileNav } from "./components/MobileNav";
import { NavLinks } from "./components/NavLinks";
import { GoogleAnalyticsPageView } from "./components/GoogleAnalyticsPageView";
import { CookieConsent } from "./components/CookieConsent";
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

export const metadata: Metadata = {
  title: "t54 — The XRPL AI Index",
  description: "The live ledger of the XRPL agentic economy. Institution-grade rails for agentic commerce on the XRP Ledger.",
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
              <Link href="/" className="flex items-center shrink-0 group" aria-label="t54">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/t54-logo.svg" alt="t54" className="h-7 w-auto shrink-0 transition-transform duration-200 group-hover:scale-105" />
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

        <main className="flex-1">
          {children}
        </main>
        
        <footer className="border-t border-[rgba(255,255,255,0.06)] py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-[var(--text-muted)]">&copy; 2026 t54 labs. All rights reserved.</p>
            <div className="flex items-center gap-4 text-[11px] text-[var(--text-muted)]">
              <Link href="/terms" className="hover:text-[var(--text-secondary)] transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-[var(--text-secondary)] transition-colors">Privacy</Link>
              <a href="https://x402.org" target="_blank" rel="noreferrer" className="hover:text-[var(--text-secondary)] transition-colors">x402 Protocol</a>
              <a href="https://xrpl.org" target="_blank" rel="noreferrer" className="hover:text-[var(--text-secondary)] transition-colors">XRPL</a>
              <a href="https://x.com/t54ai" target="_blank" rel="noreferrer" aria-label="t54 on X" className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
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
