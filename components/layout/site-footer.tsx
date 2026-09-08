import Link from "next/link";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap justify-between gap-6">
          <div>
            <p className="font-semibold text-neutral-900">Job Portal</p>
            <p className="mt-1 max-w-sm text-sm text-neutral-600">
              Job listings with clear application instructions. Applications are
              made on the employer&apos;s own website.
            </p>
          </div>

          <nav aria-label="Footer" className="flex gap-10 text-sm">
            <div>
              <p className="font-medium text-neutral-900">Browse</p>
              <ul className="mt-2 space-y-1 text-neutral-600">
                <li>
                  <Link href="/jobs" className="hover:text-neutral-900 hover:underline">
                    All jobs
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-neutral-900 hover:underline">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-neutral-900 hover:underline">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-medium text-neutral-900">Legal</p>
              <ul className="mt-2 space-y-1 text-neutral-600">
                <li>
                  <Link
                    href="/privacy-policy"
                    className="hover:text-neutral-900 hover:underline"
                  >
                    Privacy policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-neutral-900 hover:underline">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        <p className="mt-8 border-t border-neutral-100 pt-6 text-sm text-neutral-500">
          © {year} Job Portal. Job details are provided by employers; verify them
          before applying.
        </p>
      </div>
    </footer>
  );
}
