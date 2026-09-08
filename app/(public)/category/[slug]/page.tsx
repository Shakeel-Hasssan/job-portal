import Link from "next/link";
import { notFound } from "next/navigation";

import { JobCard } from "@/components/jobs/job-card";
import { JobFilters } from "@/components/jobs/job-filters";
import { Pagination } from "@/components/jobs/pagination";
import {
  getCategoryBySlug,
  getFilterOptions,
  listCategories,
  listPublishedJobs,
  parsePage,
} from "@/lib/jobs/queries";

export const revalidate = 60;

type SearchParams = {
  search?: string;
  location?: string;
  employmentType?: string;
  page?: string;
};

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const page = parsePage(query.page);

  const category = await getCategoryBySlug(slug);
  if (!category) {
    notFound();
  }

  const [result, categories, options] = await Promise.all([
    listPublishedJobs({
      category: slug,
      search: query.search,
      location: query.location,
      employmentType: query.employmentType,
      page,
    }),
    listCategories(),
    getFilterOptions(),
  ]);

  const { jobs, total, pageCount, error } = result;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <nav aria-label="Breadcrumb" className="text-sm text-neutral-600">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/" className="hover:underline">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/jobs" className="hover:underline">
              Jobs
            </Link>
          </li>
        </ol>
      </nav>

      <h1 className="mt-3 text-2xl font-semibold text-neutral-900">
        {category.name} jobs
      </h1>
      {category.description ? (
        <p className="mt-1 max-w-2xl text-neutral-600">{category.description}</p>
      ) : null}
      <p className="mt-1 text-sm text-neutral-600">
        {total} {total === 1 ? "job" : "jobs"} in this category
      </p>

      <div className="mt-6">
        <JobFilters
          action={`/category/${category.slug}`}
          values={{
            search: query.search,
            location: query.location,
            employmentType: query.employmentType,
          }}
          locations={options.locations}
          employmentTypes={options.employmentTypes}
          categories={categories}
          hideCategory
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
            basePath={`/category/${category.slug}`}
            params={{
              search: query.search,
              location: query.location,
              employmentType: query.employmentType,
            }}
          />
        </>
      ) : !error ? (
        <div className="mt-6 rounded-lg border border-dashed border-neutral-300 bg-white px-4 py-14 text-center">
          <p className="font-medium text-neutral-900">No jobs found.</p>
          <p className="mt-1 text-sm text-neutral-600">
            There are no published jobs in this category yet.
          </p>
          <Link
            href="/jobs"
            className="mt-3 inline-block text-sm underline underline-offset-2 hover:text-neutral-900"
          >
            Browse all jobs
          </Link>
        </div>
      ) : null}
    </main>
  );
}
