import Link from "next/link";

export default function AdminJobNotFound() {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-4 py-16 text-center">
      <h1 className="text-xl font-semibold text-neutral-900">Job not found</h1>
      <p className="mt-2 text-sm text-neutral-600">
        This job may have been deleted by another administrator.
      </p>
      <Link
        href="/admin/jobs"
        className="mt-6 inline-block rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2"
      >
        Back to jobs
      </Link>
    </div>
  );
}
