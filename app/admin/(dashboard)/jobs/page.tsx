import type { Metadata } from "next";
import Link from "next/link";

import { JobRowActions } from "@/components/admin/job-row-actions";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Jobs",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const supabase = await createClient();

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("id, title, slug, company_name, status, published_at, created_at, category:categories(name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-neutral-900">Jobs</h1>
        <Link
          href="/admin/jobs/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2"
        >
          Add job
        </Link>
      </div>

      {params.deleted ? (
        <p
          role="status"
          className="mt-4 rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-800"
        >
          Job deleted.
        </p>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          Unable to load jobs: {error.message}
        </p>
      ) : null}

      {jobs && jobs.length > 0 ? (
        <div className="mt-6 overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-600">
              <tr>
                <th scope="col" className="px-4 py-2 font-medium">Title</th>
                <th scope="col" className="px-4 py-2 font-medium">Company</th>
                <th scope="col" className="px-4 py-2 font-medium">Category</th>
                <th scope="col" className="px-4 py-2 font-medium">Status</th>
                <th scope="col" className="px-4 py-2 font-medium">Published</th>
                <th scope="col" className="px-4 py-2 font-medium">Created</th>
                <th scope="col" className="px-4 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-2 font-medium text-neutral-900">{job.title}</td>
                  <td className="px-4 py-2 text-neutral-700">{job.company_name ?? "—"}</td>
                  <td className="px-4 py-2 text-neutral-700">
                    {job.category?.name ?? "—"}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        job.status === "published"
                          ? "bg-green-100 text-green-800"
                          : "bg-neutral-200 text-neutral-700"
                      }`}
                    >
                      {job.status === "published" ? "●" : "○"} {job.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-neutral-600">
                    {formatDate(job.published_at)}
                  </td>
                  <td className="px-4 py-2 text-neutral-600">
                    {formatDate(job.created_at)}
                  </td>
                  <td className="px-4 py-2">
                    <JobRowActions
                      id={job.id}
                      slug={job.slug}
                      status={job.status}
                      title={job.title}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : !error ? (
        <p className="mt-6 rounded-lg border border-dashed border-neutral-300 bg-white px-4 py-10 text-center text-sm text-neutral-600">
          No jobs yet.{" "}
          <Link
            href="/admin/jobs/new"
            className="underline underline-offset-2 hover:text-neutral-900"
          >
            Add your first job
          </Link>
          .
        </p>
      ) : null}
    </div>
  );
}
