import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { SearchBar } from "./components/SearchBar";
import { MobileNav } from "./components/MobileNav";
import { AutoRefresh } from "./components/AutoRefresh";
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
  icons: { icon: "/favicon.ico" },
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
              <Link href="/" className="flex items-center gap-2.5 shrink-0">
                <div className="w-9 h-9 rounded-full bg-[#4b9cf5] flex items-center justify-center shrink-0 shadow-lg shadow-[#4b9cf5]/25">
                  <svg width="22" height="22" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.5 10C13 10 11.5 10.5 11.5 12.5V15C11.5 16 11 17 9.5 18C11 19 11.5 20 11.5 21V23.5C11.5 25.5 13 26 14.5 26" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    <path d="M21.5 10C23 10 24.5 10.5 24.5 12.5V15C24.5 16 25 17 26.5 18C25 19 24.5 20 24.5 21V23.5C24.5 25.5 23 26 21.5 26" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    <line x1="15" y1="13" x2="21" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="21" y1="13" x2="15" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="text-xl font-semibold tracking-tight text-white">
                  x402<span className="text-[#4b9cf5] font-light">scan</span>
                </span>
              </Link>
              
              <div className="hidden md:flex items-center gap-5 text-sm font-medium">
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link>
                <Link href="/transactions" className="text-gray-400 hover:text-white transition-colors">Transactions</Link>
                <Link href="/bazaar" className="text-gray-400 hover:text-white transition-colors">Bazaar</Link>
                <Link href="/resources/register" className="text-gray-400 hover:text-white transition-colors">Register</Link>
              </div>
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
