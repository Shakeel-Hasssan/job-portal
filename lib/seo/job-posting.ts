import { absoluteUrl } from "@/lib/env";
import { SITE_NAME } from "@/lib/seo/config";
import type { JobWithCategory } from "@/lib/types";
import { jobDescription } from "@/lib/seo/metadata";

/**
 * Schema.org JobPosting structured data.
 *
 * Only properties that are genuinely known are emitted. A job with no company
 * name produces no hiringOrganization; a job with no location produces no
 * jobLocation. That means some listings will not qualify for Google's rich
 * results, which is the correct outcome - inventing an employer, a place or a
 * salary to satisfy a validator would publish false information.
 *
 * baseSalary is deliberately never emitted. The salary column is free text
 * ("Not specified", "PKR 200,000 - 300,000 per month", "Competitive"), and
 * guessing a currency and numeric range from it would be fabrication. Salary
 * is still shown to human readers on the page.
 */

/** Maps our employment type labels onto the schema.org enumeration. */
const EMPLOYMENT_TYPE_MAP: Record<string, string> = {
  "full-time": "FULL_TIME",
  "part-time": "PART_TIME",
  contract: "CONTRACTOR",
  temporary: "TEMPORARY",
  internship: "INTERN",
  volunteer: "VOLUNTEER",
};

function mapEmploymentType(value: string | null): string | undefined {
  if (!value) return undefined;
  // "Remote" is a work arrangement, not a schema employment type, so it is
  // intentionally absent from the map and simply omitted.
  return EMPLOYMENT_TYPE_MAP[value.trim().toLowerCase()];
}

export type JobPostingSchema = Record<string, unknown>;

export function buildJobPostingSchema(job: JobWithCategory): JobPostingSchema {
  const schema: JobPostingSchema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: jobDescription(job),
    url: absoluteUrl(`/jobs/${job.slug}`),
    identifier: {
      "@type": "PropertyValue",
      name: SITE_NAME,
      value: job.slug,
    },
    // Applications are completed on the employer's site, never here.
    directApply: false,
  };

  if (job.published_at) {
    schema.datePosted = job.published_at;
  }

  if (job.company_name) {
    schema.hiringOrganization = {
      "@type": "Organization",
      name: job.company_name,
    };
  }

  if (job.location) {
    schema.jobLocation = {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location,
      },
    };
  }

  const employmentType = mapEmploymentType(job.employment_type);
  if (employmentType) {
    schema.employmentType = employmentType;
  }

  if (job.category) {
    schema.occupationalCategory = job.category.name;
  }

  return schema;
}

/**
 * Serialises structured data for embedding in a <script> tag.
 *
 * Escapes the characters that could otherwise terminate the script element or
 * open an HTML comment, so text from the database cannot break out of the JSON
 * block and inject markup. U+2028 and U+2029 are also escaped: they are valid
 * inside JSON strings but are line terminators in JavaScript source, which
 * would otherwise produce a syntax error in the inlined script.
 */
const LINE_SEPARATOR = String.fromCharCode(0x2028);
const PARAGRAPH_SEPARATOR = String.fromCharCode(0x2029);

export function serializeJsonLd(schema: unknown): string {
  return JSON.stringify(schema)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .split(LINE_SEPARATOR)
    .join("\\u2028")
    .split(PARAGRAPH_SEPARATOR)
    .join("\\u2029");
}
