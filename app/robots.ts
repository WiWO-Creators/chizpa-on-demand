import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/ops", "/api/"] },
    sitemap: "https://chizpa.com/sitemap.xml",
  };
}
