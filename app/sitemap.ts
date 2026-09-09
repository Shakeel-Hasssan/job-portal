import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/env";
import { listCategories, listPublishedJobSlugs } from "@/lib/jobs/queries";

/**
 * Dynamic sitemap.
 *
 * Lists public content only. Admin pages, the login and password-reset flows,
 * the auth callback and every draft job are excluded - draft jobs cannot appear
 * here even by mistake, because the query filters on status and Row Level
 * Security would withhold them from an anonymous request regardless.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [jobs, categories] = await Promise.all([
    listPublishedJobSlugs(),
    listCategories(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/jobs"), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/about"), changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/contact"), changeFrequency: "yearly", priority: 0.3 },
    {
      url: absoluteUrl("/privacy-policy"),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    { url: absoluteUrl("/terms"), changeFrequency: "yearly", priority: 0.2 },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: absoluteUrl(`/category/${category.slug}`),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const jobPages: MetadataRoute.Sitemap = jobs.map((job) => ({
    url: absoluteUrl(`/jobs/${job.slug}`),
    lastModified: new Date(job.updated_at),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...categoryPages, ...jobPages];
}
