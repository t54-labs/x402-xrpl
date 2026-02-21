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
                  <svg width="20" height="20" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 7C11.5 7 10.5 8 10.5 9.5V14C10.5 15 9.5 16 8 17L7.5 17.5C7.3 17.7 7.3 18.3 7.5 18.5L8 19C9.5 20 10.5 21 10.5 22V26.5C10.5 28 11.5 29 13 29" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
                    <path d="M23 7C24.5 7 25.5 8 25.5 9.5V14C25.5 15 26.5 16 28 17L28.5 17.5C28.7 17.7 28.7 18.3 28.5 18.5L28 19C26.5 20 25.5 21 25.5 22V26.5C25.5 28 24.5 29 23 29" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
                    <path d="M13.5 12L18 18L22.5 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M13.5 24L18 18L22.5 24" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
