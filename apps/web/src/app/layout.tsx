import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { SearchBar } from "./components/SearchBar";
import { MobileNav } from "./components/MobileNav";
import { AutoRefresh } from "./components/AutoRefresh";
import { NavLinks } from "./components/NavLinks";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "x402scan | XRPL x402 Explorer",
  description: "The machine-native payment block explorer and bazaar for the XRP Ledger.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0b0d10] text-gray-300 min-h-screen flex flex-col`}
      >
        <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0b0d10]/80 backdrop-blur-md">
          <AutoRefresh />
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2 shrink-0">
                <svg
                  width="42"
                  height="42"
                  viewBox="0 0 128 128"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-label="x402 logo"
                  className="shrink-0"
                >
                  <rect width="128" height="128" fill="#020848" />
                  <circle cx="64" cy="64" r="49" fill="#2AAEFF" />
                  <g stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M50 43C45 43 42 46 42 50V58C42 61 40 64 35 66C40 68 42 71 42 74V82C42 86 45 89 50 89" />
                    <path d="M78 43C83 43 86 46 86 50V58C86 61 88 64 93 66C88 68 86 71 86 74V82C86 86 83 89 78 89" />
                    <path d="M56 53L72 77" />
                    <path d="M72 53L56 77" />
                  </g>
                </svg>
                <span className="text-xl font-semibold tracking-tight text-white">
                  AI
                </span>
              </Link>
              
              <NavLinks />
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block">
                <SearchBar />
              </div>
              <div className="hidden lg:flex items-center px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400 shrink-0">
                <span className={`w-2 h-2 rounded-full mr-2 animate-pulse ${
                  process.env.NEXT_PUBLIC_XRPL_NETWORK === "mainnet" 
                    ? "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]" 
                    : "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                }`}></span>
                {process.env.NEXT_PUBLIC_XRPL_NETWORK === "mainnet" ? "XRPL Mainnet" : "XRPL Testnet"}
              </div>
              <MobileNav />
            </div>
          </div>
        </nav>

        <main className="flex-1">
          {children}
        </main>
        
        <footer className="border-t border-white/5 bg-[#0b0d10] py-8">
          <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-600">&copy; {new Date().getFullYear()} x402scan | XRPL Explorer</p>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <a href="https://github.com/coinbase/x402" target="_blank" rel="noreferrer" className="hover:text-gray-400 transition-colors">x402 Protocol</a>
              <a href="https://xrpl.org" target="_blank" rel="noreferrer" className="hover:text-gray-400 transition-colors">XRPL</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
