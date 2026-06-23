import type { Metadata } from "next";
import { Poppins, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Script from "next/script";
import { Suspense } from "react";
import { SearchBar } from "./components/SearchBar";
import { MobileNav } from "./components/MobileNav";
import { NavLinks } from "./components/NavLinks";
import { GoogleAnalyticsPageView } from "./components/GoogleAnalyticsPageView";
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
              <a href="https://github.com/coinbase/x402" target="_blank" rel="noreferrer" className="hover:text-[var(--text-secondary)] transition-colors">x402 Protocol</a>
              <a href="https://xrpl.org" target="_blank" rel="noreferrer" className="hover:text-[var(--text-secondary)] transition-colors">XRPL</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
