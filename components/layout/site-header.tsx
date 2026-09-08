import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-neutral-900"
        >
          Job Portal
        </Link>

        <nav aria-label="Main" className="flex items-center gap-1 text-sm">
          <Link
            href="/jobs"
            className="rounded px-3 py-1.5 text-neutral-700 hover:bg-neutral-100"
          >
            Browse jobs
          </Link>
          <Link
            href="/about"
            className="rounded px-3 py-1.5 text-neutral-700 hover:bg-neutral-100"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="rounded px-3 py-1.5 text-neutral-700 hover:bg-neutral-100"
          >
            Contact
          </Link>
        </nav>

        <form
          action="/jobs"
          role="search"
          className="ml-auto flex w-full items-center gap-2 sm:w-auto"
        >
          <label htmlFor="header-search" className="sr-only">
            Search jobs
          </label>
          <input
            id="header-search"
            type="search"
            name="search"
            placeholder="Search jobs…"
            className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 sm:w-56"
          />
          <button
            type="submit"
            className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2"
          >
            Search
          </button>
        </form>
      </div>
    </header>
  );
}
