import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register a facilitator",
  description:
    "Register an x402 facilitator settling agent payments on the XRP Ledger so your volume is indexed and surfaced on the XRPL AI Hub.",
  alternates: { canonical: "/join/facilitator" },
};

export default function JoinFacilitatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
