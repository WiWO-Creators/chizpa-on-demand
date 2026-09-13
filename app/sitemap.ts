import type { MetadataRoute } from "next";
import { chispireads } from "./data/chispireads";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://chizpa.com";
  return [
    { url: base, lastModified: new Date("2026-08-16"), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/chispireads`, lastModified: new Date("2026-08-16"), changeFrequency: "weekly", priority: .8 },
    ...chispireads.map((article) => ({ url: `${base}/chispireads/${article.slug}`, lastModified: new Date(article.updatedAt), changeFrequency: "monthly" as const, priority: .7 })),
  ];
}
