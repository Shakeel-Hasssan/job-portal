import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getPublishedJobBySlug } from "@/lib/jobs/queries";
import { buildJobPostingSchema, serializeJsonLd } from "@/lib/seo/job-posting";
import { buildJobMetadata } from "@/lib/seo/metadata";
import { parseApplicationSteps } from "@/lib/types";
import { formatDate, isoDate } from "@/lib/utils/format";
import { externalUrlHost, safeExternalUrl } from "@/lib/utils/url";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const job = await getPublishedJobBySlug(slug);

  // An unpublished or missing job must not leak a title into the head.
  if (!job) {
    return {
      title: "Job not found",
      robots: { index: false, follow: true },
    };
  }

  return buildJobMetadata(job);
}

/**
 * Renders multi-line plain text.
 *
 * Job content is stored as plain text and rendered as text - never with
 * dangerouslySetInnerHTML - so an administrator cannot inject markup or script
 * into a public page. Line breaks are preserved with CSS.
 */
function TextBlock({ value }: { value: string }) {
  return <p className="whitespace-pre-line text-neutral-700">{value}</p>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-neutral-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-neutral-900">{value}</dd>
    </div>
  );
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = await getPublishedJobBySlug(slug);

  if (!job) {
    notFound();
  }

  const steps = parseApplicationSteps(job.how_to_apply);
  // Only http(s) links ever become a clickable button.
  const applyUrl = safeExternalUrl(job.application_url);
  const applyHost = externalUrlHost(job.application_url);

  const jsonLd = buildJobPostingSchema(job);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      {/* Structured data is escaped before embedding - see serializeJsonLd. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />

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
          {job.category ? (
            <>
              <li aria-hidden="true">/</li>
              <li>
                <Link
                  href={`/category/${job.category.slug}`}
                  className="hover:underline"
                >
                  {job.category.name}
                </Link>
              </li>
            </>
          ) : null}
        </ol>
      </nav>

      <article className="mt-4 overflow-hidden rounded-lg border border-neutral-200 bg-white">
        {job.featured_image_url ? (
          <div className="relative aspect-[21/9] w-full bg-neutral-100">
            <Image
              src={job.featured_image_url}
              alt={job.featured_image_alt || job.title}
              fill
              priority
              sizes="(min-width: 896px) 56rem, 100vw"
              className="object-cover"
            />
          </div>
        ) : null}

        <div className="p-6">
          <header>
            {job.category ? (
              <Link
                href={`/category/${job.category.slug}`}
                className="inline-block rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-700 hover:bg-neutral-200"
              >
                {job.category.name}
              </Link>
            ) : null}

            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
              {job.title}
            </h1>

            {job.company_name ? (
              <p className="mt-1 text-lg text-neutral-700">{job.company_name}</p>
            ) : null}

            <p className="mt-2 text-sm text-neutral-500">
              Posted{" "}
              <time dateTime={isoDate(job.published_at)}>
                {formatDate(job.published_at)}
              </time>
            </p>
          </header>

          <dl className="mt-6 grid grid-cols-2 gap-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4 sm:grid-cols-4">
            {job.location ? <Detail label="Location" value={job.location} /> : null}
            {job.employment_type ? (
              <Detail label="Employment type" value={job.employment_type} />
            ) : null}
            {job.salary ? <Detail label="Salary" value={job.salary} /> : null}
            {job.category ? (
              <Detail label="Category" value={job.category.name} />
            ) : null}
          </dl>

          {applyUrl ? (
            <div className="mt-6">
              <a
                href={applyUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center gap-2 rounded-md bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2"
              >
                Apply now
                <span aria-hidden="true">↗</span>
              </a>
              {applyHost ? (
                <p className="mt-2 text-xs text-neutral-500">
                  Opens {applyHost} in a new tab. Applications are handled by the
                  employer, not by this site.
                </p>
              ) : null}
            </div>
          ) : (
            <p
              role="alert"
              className="mt-6 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900"
            >
              No valid application link is available for this listing.
            </p>
          )}

          {job.description ? (
            <section className="mt-8">
              <h2 className="text-lg font-semibold text-neutral-900">
                Job description
              </h2>
              <div className="mt-2">
                <TextBlock value={job.description} />
              </div>
            </section>
          ) : null}

          {job.responsibilities ? (
            <section className="mt-8">
              <h2 className="text-lg font-semibold text-neutral-900">
                Responsibilities
              </h2>
              <div className="mt-2">
                <TextBlock value={job.responsibilities} />
              </div>
            </section>
          ) : null}

          {job.requirements ? (
            <section className="mt-8">
              <h2 className="text-lg font-semibold text-neutral-900">Requirements</h2>
              <div className="mt-2">
                <TextBlock value={job.requirements} />
              </div>
            </section>
          ) : null}

          {steps.length > 0 ? (
            <section className="mt-8">
              <h2 className="text-lg font-semibold text-neutral-900">How to apply</h2>
              <ol className="mt-3 space-y-3">
                {steps.map((step) => (
                  <li
                    key={step.step}
                    className="flex gap-3 rounded-md border border-neutral-200 p-3"
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white"
                    >
                      {step.step}
                    </span>
                    <span>
                      <span className="font-medium text-neutral-900">
                        <span className="sr-only">Step {step.step}: </span>
                        {step.title}
                      </span>
                      {step.description ? (
                        <span className="mt-0.5 block text-sm text-neutral-700">
                          {step.description}
                        </span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          {applyUrl ? (
            <div className="mt-8 border-t border-neutral-200 pt-6">
              <a
                href={applyUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center gap-2 rounded-md bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2"
              >
                Apply now
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          ) : null}
        </div>
      </article>

      <p className="mt-6">
        <Link
          href="/jobs"
          className="text-sm text-neutral-700 underline underline-offset-2 hover:text-neutral-900"
        >
          ← Back to all jobs
        </Link>
      </p>
    </main>
  );
}
