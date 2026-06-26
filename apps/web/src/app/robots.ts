import type { MetadataRoute } from "next";

const BASE = "https://xrpl-ai.org";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Utility / non-content routes that shouldn't be indexed.
      disallow: ["/admin", "/admin/login", "/search", "/api/"],
    },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
