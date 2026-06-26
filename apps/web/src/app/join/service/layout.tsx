import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "List your service",
  description:
    "Register your x402 endpoint to get listed in the XRPL AI Hub directory — discoverable by AI agents paying in RLUSD and XRP on the XRP Ledger.",
  alternates: { canonical: "/join/service" },
};

export default function JoinServiceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
