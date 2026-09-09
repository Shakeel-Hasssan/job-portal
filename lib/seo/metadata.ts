import type { Metadata } from "next";

import { absoluteUrl } from "@/lib/env";
import { SITE_DESCRIPTION, SITE_LOCALE, SITE_NAME } from "@/lib/seo/config";
import type { JobWithCategory } from "@/lib/types";
import { truncate } from "@/lib/utils/format";

/**
 * Metadata builders.
 *
 * Titles and descriptions prefer the administrator's SEO fields and fall back
 * to the job's own content. Nothing is invented or padded with keywords - a
 * missing value is simply omitted, and a job with no description gets a plain
 * factual sentence rather than filler.
 */

/** Description for a job, preferring the SEO field, then the job description. */
export function jobDescription(job: JobWithCategory): string {
  if (job.seo_description) return job.seo_description;
  if (job.description) return truncate(job.description, 155);

  // No description available: state only what is actually known.
  const parts = [job.title];
  if (job.company_name) parts.push(`at ${job.company_name}`);
  if (job.location) parts.push(`in ${job.location}`);
  return `${parts.join(" ")}. See how to apply.`;
}

/** Title for a job, preferring the SEO field. */
export function jobTitle(job: JobWithCategory): string {
  if (job.seo_title) return job.seo_title;
  return job.company_name ? `${job.title} at ${job.company_name}` : job.title;
}

export function buildJobMetadata(job: JobWithCategory): Metadata {
  const title = jobTitle(job);
  const description = jobDescription(job);
  const url = absoluteUrl(`/jobs/${job.slug}`);

  // Only advertise an image when the job actually has one.
  const images = job.featured_image_url
    ? [
        {
          url: job.featured_image_url,
          alt: job.featured_image_alt || job.title,
        },
      ]
    : undefined;

  return {
    title,
    description,
    keywords: job.seo_keywords ? splitKeywords(job.seo_keywords) : undefined,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      title,
      description,
      url,
      images,
      publishedTime: job.published_at ?? undefined,
      modifiedTime: job.updated_at,
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title,
      description,
      images: images?.map((image) => image.url),
    },
  };
}

/** Splits a comma-separated keyword field, dropping blanks. */
export function splitKeywords(value: string): string[] {
  return value
    .split(",")
    .map((keyword) => keyword.trim())
    .filter((keyword) => keyword.length > 0)
    .slice(0, 15);
}

export function buildListingMetadata({
  title,
  description,
  path,
  noindex = false,
}: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
}): Metadata {
  const url = absoluteUrl(path);

  return {
    title,
    description,
    alternates: { canonical: url },
    // Filtered and deep-paginated result pages are crawlable but not indexed,
    // so near-duplicate permutations do not compete with the canonical list.
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      title,
      description,
      url,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export { SITE_DESCRIPTION, SITE_NAME };
