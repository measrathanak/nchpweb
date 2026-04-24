import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  for (const locale of locales) {
    entries.push(
      {
        url: absoluteUrl(`/${locale}`),
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.9,
      },
      {
        url: absoluteUrl(`/${locale}/articles`),
        lastModified: now,
        changeFrequency: "hourly",
        priority: 0.8,
      }
    );
  }

  return entries;
}
