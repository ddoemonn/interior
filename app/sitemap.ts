import type { MetadataRoute } from "next";
import { readyEntries } from "@/lib/registry";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/docs`, changeFrequency: "weekly", priority: 0.8 },
    ...readyEntries.map((entry) => ({
      url: `${SITE}/docs/${entry.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
