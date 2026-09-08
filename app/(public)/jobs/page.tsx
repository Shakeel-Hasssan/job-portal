import type { Metadata } from "next";

import { JobCard } from "@/components/jobs/job-card";
import { JobFilters } from "@/components/jobs/job-filters";
import { Pagination } from "@/components/jobs/pagination";
import {
  getFilterOptions,
  listCategories,
  listPublishedJobs,
  parsePage,
} from "@/lib/jobs/queries";

export const metadata: Metadata = {
  title: "Browse jobs",
  description:
    "Search and filter current job openings by keyword, location, category and employment type.",
};

export const revalidate = 60;

type SearchParams = {
  search?: string;
  location?: string;
  category?: string;
  employmentType?: string;
  page?: string;
};

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = parsePage(params.page);

  const [result, categories, options] = await Promise.all([
    listPublishedJobs({
      search: params.search,
      location: params.location,
      category: params.category,
      employmentType: params.employmentType,
      page,
    }),
    listCategories(),
    getFilterOptions(),
  ]);

  const { jobs, total, pageCount, error } = result;
  const hasFilters = Boolean(
    params.search || params.location || params.category || params.employmentType,
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-neutral-900">Browse jobs</h1>
      <p className="mt-1 text-sm text-neutral-600">
        {total} {total === 1 ? "job" : "jobs"}
        {hasFilters ? " matching your filters" : " currently listed"}
      </p>

      <div className="mt-6">
        <JobFilters
          values={{
            search: params.search,
            location: params.location,
            employmentType: params.employmentType,
            category: params.category,
          }}
          locations={options.locations}
          employmentTypes={options.employmentTypes}
          categories={categories}
        />
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          Unable to load jobs right now. Please try again shortly.
        </p>
      ) : null}

      {jobs.length > 0 ? (
        <>
          <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <li key={job.id}>
                <JobCard job={job} />
              </li>
            ))}
          </ul>

          <Pagination
            page={page}
            pageCount={pageCount}
            basePath="/jobs"
            params={{
              search: params.search,
              location: params.location,
              category: params.category,
              employmentType: params.employmentType,
            }}
          />
        </>
      ) : !error ? (
        <div className="mt-6 rounded-lg border border-dashed border-neutral-300 bg-white px-4 py-14 text-center">
          <p className="font-medium text-neutral-900">No jobs found.</p>
          <p className="mt-1 text-sm text-neutral-600">
            {hasFilters
              ? "Try removing a filter or searching for a different term."
              : "No jobs have been published yet. Please check back soon."}
          </p>
        </div>
      ) : null}
    </main>
  );
}
