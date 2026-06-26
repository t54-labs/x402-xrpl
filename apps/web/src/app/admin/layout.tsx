import type { Metadata } from "next";

// Admin is an internal tool — keep it (and /admin/login) out of search indexes.
export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
