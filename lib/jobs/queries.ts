import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { JobWithCategory } from "@/lib/types";

/**
 * Public job queries.
 *
 * Everything here runs on the server and is paginated at the database level -
 * the browser never receives more than one page of jobs. Row Level Security
 * additionally guarantees that only published jobs are ever returned to an
 * anonymous visitor, so the status filter below is defence in depth rather
 * than the only safeguard.
 */

export const JOBS_PER_PAGE = 12;

export type JobFilters = {
  search?: string;
  location?: string;
  category?: string;
  employmentType?: string;
  page?: number;
};

export type JobListResult = {
  jobs: JobWithCategory[];
  total: number;
  page: number;
  pageCount: number;
  error: string | null;
};

/**
 * Makes a user-supplied term safe to embed in a PostgREST filter.
 *
 * PostgREST parses commas and parentheses as filter syntax, and % / _ are LIKE
 * wildcards, so a raw term could change the shape of the query or match
 * everything. Values are never concatenated into SQL - Supabase parameterises
 * them - but the filter grammar itself still has to be respected.
 */
export function sanitizeSearchTerm(raw: string): string {
  return raw
    .replace(/[%_\\,()"*:]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
}

/** Coerces a query-string page value into a valid 1-based page number. */
export function parsePage(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "1", 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  // Guards against someone requesting page 10^9 and forcing a huge offset.
  return Math.min(parsed, 10_000);
}

export async function listPublishedJobs(
  filters: JobFilters = {},
): Promise<JobListResult> {
  const supabase = await createClient();

  const page = filters.page ?? 1;
  const from = (page - 1) * JOBS_PER_PAGE;
  const to = from + JOBS_PER_PAGE - 1;

  const categorySlug = filters.category?.trim();

  // An inner join is only correct when filtering by category; otherwise jobs
  // with no category would disappear from the list.
  const selection = categorySlug
    ? "*, category:categories!inner(id, name, slug)"
    : "*, category:categories(id, name, slug)";

  let query = supabase
    .from("jobs")
    .select(selection, { count: "exact" })
    .eq("status", "published");

  const search = filters.search ? sanitizeSearchTerm(filters.search) : "";
  if (search) {
    query = query.or(
      `title.ilike.%${search}%,company_name.ilike.%${search}%,location.ilike.%${search}%`,
    );
  }

  const location = filters.location ? sanitizeSearchTerm(filters.location) : "";
  if (location) {
    query = query.ilike("location", `%${location}%`);
  }

  const employmentType = filters.employmentType?.trim();
  if (employmentType) {
    query = query.eq("employment_type", employmentType);
  }

  if (categorySlug) {
    query = query.eq("category.slug", categorySlug);
  }

  const { data, error, count } = await query
    .order("published_at", { ascending: false })
    .range(from, to);

  if (error) {
    return { jobs: [], total: 0, page, pageCount: 0, error: error.message };
  }

  const total = count ?? 0;

  return {
    jobs: (data ?? []) as unknown as JobWithCategory[],
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / JOBS_PER_PAGE)),
    error: null,
  };
}

/** A single published job by slug, or null when it does not exist. */
export async function getPublishedJobBySlug(
  slug: string,
): Promise<JobWithCategory | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("jobs")
    .select("*, category:categories(id, name, slug)")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  return (data as unknown as JobWithCategory | null) ?? null;
}

/** Slugs of every published job, for the sitemap. */
export async function listPublishedJobSlugs(): Promise<
  { slug: string; updated_at: string }[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("jobs")
    .select("slug, updated_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  return data ?? [];
}

export async function listCategories() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name, slug, description")
    .order("name");
  return data ?? [];
}

export async function getCategoryBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name, slug, description")
    .eq("slug", slug)
    .maybeSingle();
  return data;
}

/**
 * Distinct locations and employment types across published jobs, used to
 * populate the filter dropdowns.
 */
export async function getFilterOptions(): Promise<{
  locations: string[];
  employmentTypes: string[];
}> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("jobs")
    .select("location, employment_type")
    .eq("status", "published")
    .limit(1000);

  const locations = new Set<string>();
  const employmentTypes = new Set<string>();

  for (const row of data ?? []) {
    if (row.location) locations.add(row.location);
    if (row.employment_type) employmentTypes.add(row.employment_type);
  }

  return {
    locations: [...locations].sort(),
    employmentTypes: [...employmentTypes].sort(),
  };
}
