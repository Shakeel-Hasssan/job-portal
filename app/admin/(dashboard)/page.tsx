import type { Metadata } from "next";
import Link from "next/link";

import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href?: string;
}) {
  const content = (
    <>
      <dt className="text-sm text-neutral-600">{label}</dt>
      <dd className="mt-1 text-3xl font-semibold text-neutral-900">{value}</dd>
    </>
  );

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      {href ? (
        <Link
          href={href}
          className="block rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500"
        >
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function AdminDashboardPage() {
  await requireAdmin();
  const supabase = await createClient();

  // head:true fetches only the count, never the rows.
  const [totalJobs, publishedJobs, draftJobs, totalCategories, recent] =
    await Promise.all([
      supabase.from("jobs").select("*", { count: "exact", head: true }),
      supabase
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .eq("status", "published"),
      supabase
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .eq("status", "draft"),
      supabase.from("categories").select("*", { count: "exact", head: true }),
      supabase
        .from("jobs")
        .select("id, title, status, created_at, published_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const loadError =
    totalJobs.error ?? publishedJobs.error ?? draftJobs.error ?? recent.error;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-neutral-900">Dashboard</h1>
        <Link
          href="/admin/jobs/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2"
        >
          Add job
        </Link>
      </div>

      {loadError ? (
        <p
          role="alert"
          className="mt-6 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          Could not load dashboard data: {loadError.message}
        </p>
      ) : null}

      <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total jobs" value={totalJobs.count ?? 0} href="/admin/jobs" />
        <StatCard label="Published" value={publishedJobs.count ?? 0} />
        <StatCard label="Drafts" value={draftJobs.count ?? 0} />
        <StatCard
          label="Categories"
          value={totalCategories.count ?? 0}
          href="/admin/categories"
        />
      </dl>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-neutral-900">
          Recently added jobs
        </h2>

        {recent.data && recent.data.length > 0 ? (
          <div className="mt-3 overflow-x-auto rounded-lg border border-neutral-200 bg-white">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-600">
                <tr>
                  <th scope="col" className="px-4 py-2 font-medium">Title</th>
                  <th scope="col" className="px-4 py-2 font-medium">Status</th>
                  <th scope="col" className="px-4 py-2 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {recent.data.map((job) => (
                  <tr key={job.id} className="border-b border-neutral-100 last:border-0">
                    <td className="px-4 py-2 text-neutral-900">{job.title}</td>
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
                      {formatDate(job.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 rounded-lg border border-dashed border-neutral-300 bg-white px-4 py-8 text-center text-sm text-neutral-600">
            No jobs yet.{" "}
            <Link
              href="/admin/jobs/new"
              className="underline underline-offset-2 hover:text-neutral-900"
            >
              Add your first job
            </Link>
            .
          </p>
        )}
      </section>
    </div>
  );
}
