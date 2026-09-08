import Link from "next/link";

import { JobCard } from "@/components/jobs/job-card";
import { listCategories, listPublishedJobs } from "@/lib/jobs/queries";

export const revalidate = 60;

export default async function HomePage() {
  const [{ jobs, total }, categories] = await Promise.all([
    listPublishedJobs({ page: 1 }),
    listCategories(),
  ]);

  const latest = jobs.slice(0, 6);

  return (
    <main>
      {/* Hero */}
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            Find your next job
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-neutral-600">
            Browse current openings with clear instructions on how to apply. Every
            application is made directly on the employer&apos;s own website.
          </p>

          <form
            action="/jobs"
            role="search"
            className="mx-auto mt-6 flex max-w-xl flex-col gap-2 sm:flex-row"
          >
            <label htmlFor="home-search" className="sr-only">
              Search jobs by title, company or location
            </label>
            <input
              id="home-search"
              name="search"
              type="search"
              placeholder="Job title, company or location"
              className="flex-1 rounded-md border border-neutral-300 px-4 py-2.5 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
            />
            <button
              type="submit"
              className="rounded-md bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2"
            >
              Search jobs
            </button>
          </form>

          {total > 0 ? (
            <p className="mt-3 text-sm text-neutral-500">
              {total} {total === 1 ? "job" : "jobs"} currently listed
            </p>
          ) : null}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* Categories */}
        {categories.length > 0 ? (
          <section aria-labelledby="categories-heading">
            <h2
              id="categories-heading"
              className="text-xl font-semibold text-neutral-900"
            >
              Browse by category
            </h2>
            <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/category/${category.slug}`}
                    className="block h-full rounded-lg border border-neutral-200 bg-white p-4 transition hover:border-neutral-300 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500"
                  >
                    <span className="font-medium text-neutral-900">
                      {category.name}
                    </span>
                    {category.description ? (
                      <span className="mt-1 block text-sm text-neutral-600">
                        {category.description}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* Latest jobs */}
        <section aria-labelledby="latest-heading" className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="latest-heading" className="text-xl font-semibold text-neutral-900">
              Latest jobs
            </h2>
            <Link
              href="/jobs"
              className="text-sm text-neutral-700 underline underline-offset-2 hover:text-neutral-900"
            >
              View all jobs
            </Link>
          </div>

          {latest.length > 0 ? (
            <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {latest.map((job) => (
                <li key={job.id}>
                  <JobCard job={job} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-lg border border-dashed border-neutral-300 bg-white px-4 py-12 text-center text-neutral-600">
              No jobs have been published yet. Please check back soon.
            </p>
          )}
        </section>

        {/* Call to action */}
        <section className="mt-14 rounded-lg border border-neutral-200 bg-white p-8 text-center">
          <h2 className="text-lg font-semibold text-neutral-900">
            Looking for something specific?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-neutral-600">
            Filter by location, category and employment type to narrow the list
            down to the roles that fit you.
          </p>
          <Link
            href="/jobs"
            className="mt-4 inline-block rounded-md bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2"
          >
            Browse all jobs
          </Link>
        </section>
      </div>
    </main>
  );
}
