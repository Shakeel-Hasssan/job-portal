import Link from "next/link";

export default function CategoryNotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-2xl font-semibold text-neutral-900">
        Category not found
      </h1>
      <p className="mx-auto mt-2 max-w-md text-neutral-600">
        This category does not exist or may have been removed.
      </p>
      <Link
        href="/jobs"
        className="mt-6 inline-block rounded-md bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2"
      >
        Browse all jobs
      </Link>
    </main>
  );
}
