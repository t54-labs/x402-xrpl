import type { MetadataRoute } from "next";

const BASE = "https://xrpl-ai.org";

type Entry = {
  path: string;
  priority: number;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
};

// Static, indexable routes. Dynamic detail pages (/tx/[hash], /address/[address])
// are intentionally excluded — they are unbounded and best discovered via links.
const ROUTES: Entry[] = [
  { path: "", priority: 1.0, changeFrequency: "hourly" },
  { path: "/directory", priority: 0.9, changeFrequency: "hourly" },
  { path: "/agora", priority: 0.8, changeFrequency: "daily" },
  { path: "/resources", priority: 0.8, changeFrequency: "weekly" },
  { path: "/build", priority: 0.7, changeFrequency: "weekly" },
  { path: "/why-xrpl", priority: 0.7, changeFrequency: "monthly" },
  { path: "/transactions", priority: 0.6, changeFrequency: "hourly" },
  { path: "/merchants", priority: 0.6, changeFrequency: "daily" },
  { path: "/facilitators", priority: 0.6, changeFrequency: "daily" },
  { path: "/merchant", priority: 0.5, changeFrequency: "monthly" },
  { path: "/events", priority: 0.5, changeFrequency: "weekly" },
  { path: "/join/service", priority: 0.6, changeFrequency: "monthly" },
  { path: "/join/facilitator", priority: 0.5, changeFrequency: "monthly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map((r) => ({
    url: `${BASE}${r.path}`,
    lastModified,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
