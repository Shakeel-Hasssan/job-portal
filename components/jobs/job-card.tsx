import Image from "next/image";
import Link from "next/link";

import { formatDate, isoDate, truncate } from "@/lib/utils/format";
import type { JobWithCategory } from "@/lib/types";

export function JobCard({ job }: { job: JobWithCategory }) {
  const summary = job.description ? truncate(job.description, 160) : null;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm transition hover:border-neutral-300 hover:shadow">
      {job.featured_image_url ? (
        <div className="relative aspect-[16/9] w-full bg-neutral-100">
          <Image
            src={job.featured_image_url}
            alt={job.featured_image_alt || job.title}
            fill
            sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 100vw"
            className="object-cover"
          />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col p-4">
        {job.category ? (
          <Link
            href={`/category/${job.category.slug}`}
            className="self-start rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700 hover:bg-neutral-200"
          >
            {job.category.name}
          </Link>
        ) : null}

        <h3 className="mt-2 text-base font-semibold text-neutral-900">
          <Link
            href={`/jobs/${job.slug}`}
            className="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500"
          >
            {job.title}
          </Link>
        </h3>

        {job.company_name ? (
          <p className="mt-1 text-sm text-neutral-700">{job.company_name}</p>
        ) : null}

        <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-600">
          {job.location ? (
            <div className="flex gap-1">
              <dt className="sr-only">Location</dt>
              <dd>{job.location}</dd>
            </div>
          ) : null}
          {job.employment_type ? (
            <div className="flex gap-1">
              <dt className="sr-only">Employment type</dt>
              <dd>{job.employment_type}</dd>
            </div>
          ) : null}
          {job.salary ? (
            <div className="flex gap-1">
              <dt className="sr-only">Salary</dt>
              <dd>{job.salary}</dd>
            </div>
          ) : null}
        </dl>

        {summary ? (
          <p className="mt-3 flex-1 text-sm text-neutral-600">{summary}</p>
        ) : (
          <div className="flex-1" />
        )}

        <p className="mt-4 text-xs text-neutral-500">
          Posted{" "}
          <time dateTime={isoDate(job.published_at)}>
            {formatDate(job.published_at)}
          </time>
        </p>
      </div>
    </article>
  );
}
