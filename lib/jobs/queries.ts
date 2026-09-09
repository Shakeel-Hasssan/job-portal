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

/**
 * PostgREST error for an offset past the end of the result set. It answers a
 * beyond-the-last-page request with 416 rather than an empty list.
 */
const RANGE_NOT_SATISFIABLE = "PGRST103";

/**
 * Applies the shared public filters to a jobs query.
 *
 * Extracted so the listing query and the fallback count query cannot drift
 * apart - if they did, an out-of-range page would report a total that does not
 * match the filters actually in force.
 */
function applyJobFilters<T>(
  query: T,
  filters: JobFilters,
): T {
  // The Supabase builder is chainable but its generics differ per call, so the
  // narrowing happens through this local alias rather than at every step.
  let q = query as unknown as ReturnType<
    ReturnType<Awaited<ReturnType<typeof createClient>>["from"]>["select"]
  >;

  const search = filters.search ? sanitizeSearchTerm(filters.search) : "";
  if (search) {
    q = q.or(
      `title.ilike.%${search}%,company_name.ilike.%${search}%,location.ilike.%${search}%`,
    );
  }

  const location = filters.location ? sanitizeSearchTerm(filters.location) : "";
  if (location) {
    q = q.ilike("location", `%${location}%`);
  }

  const employmentType = filters.employmentType?.trim();
  if (employmentType) {
    q = q.eq("employment_type", employmentType);
  }

  const categorySlug = filters.category?.trim();
  if (categorySlug) {
    q = q.eq("category.slug", categorySlug);
  }

  return q as unknown as T;
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

  const baseQuery = supabase
    .from("jobs")
    .select(selection, { count: "exact" })
    .eq("status", "published");

  const { data, error, count } = await applyJobFilters(baseQuery, filters)
    .order("published_at", { ascending: false })
    .range(from, to);

  if (error) {
    // A page number past the end is a normal request - a stale bookmark, a
    // crawler, or a hand-edited URL - not a failure. Report an empty page with
    // the true total so pagination can still link back to a valid page.
    if (error.code === RANGE_NOT_SATISFIABLE) {
      const total = await countPublishedJobs(filters);
      return {
        jobs: [],
        total,
        page,
        pageCount: Math.max(1, Math.ceil(total / JOBS_PER_PAGE)),
        error: null,
      };
    }

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

/** Counts matching published jobs without fetching any rows. */
async function countPublishedJobs(filters: JobFilters): Promise<number> {
  const supabase = await createClient();
  const categorySlug = filters.category?.trim();

  const selection = categorySlug
    ? "id, category:categories!inner(id)"
    : "id";

  const baseQuery = supabase
    .from("jobs")
    .select(selection, { count: "exact", head: true })
    .eq("status", "published");

  const { count } = await applyJobFilters(baseQuery, filters);
  return count ?? 0;
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
