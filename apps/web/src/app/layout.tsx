import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { SearchBar } from "./components/SearchBar";
import { MobileNav } from "./components/MobileNav";
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
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2 shrink-0">
                <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-bold text-black shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                  X
                </div>
                <span className="text-xl font-semibold tracking-tight text-white">
                  x402<span className="text-cyan-400 font-light">scan</span>
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
                <span className="w-2 h-2 rounded-full bg-cyan-400 mr-2 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse"></span>
                XRPL Testnet
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
