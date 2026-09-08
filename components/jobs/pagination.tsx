import Link from "next/link";

/**
 * Server-rendered pagination.
 *
 * Existing filters are carried across pages by rebuilding the query string, so
 * /jobs?search=java&page=2 keeps the search when the visitor moves on.
 */
export function Pagination({
  page,
  pageCount,
  basePath,
  params,
}: {
  page: number;
  pageCount: number;
  basePath: string;
  params: Record<string, string | undefined>;
}) {
  if (pageCount <= 1) return null;

  const hrefFor = (target: number) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value) query.set(key, value);
    }
    if (target > 1) query.set("page", String(target));
    const qs = query.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  // A compact window around the current page, always including first and last.
  const pages: number[] = [];
  const add = (n: number) => {
    if (n >= 1 && n <= pageCount && !pages.includes(n)) pages.push(n);
  };
  add(1);
  for (let i = page - 1; i <= page + 1; i += 1) add(i);
  add(pageCount);
  pages.sort((a, b) => a - b);

  const linkClass =
    "inline-flex min-w-9 items-center justify-center rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50";

  return (
    <nav aria-label="Pagination" className="mt-8 flex flex-wrap items-center gap-1">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} rel="prev" className={linkClass}>
          ← Previous
        </Link>
      ) : (
        <span
          aria-hidden="true"
          className={`${linkClass} cursor-not-allowed opacity-40`}
        >
          ← Previous
        </span>
      )}

      {pages.map((n, index) => {
        const previous = pages[index - 1];
        const gap = previous !== undefined && n - previous > 1;
        return (
          <span key={n} className="flex items-center gap-1">
            {gap ? (
              <span aria-hidden="true" className="px-1 text-neutral-400">
                …
              </span>
            ) : null}
            {n === page ? (
              <span
                aria-current="page"
                className="inline-flex min-w-9 items-center justify-center rounded-md border border-neutral-900 bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white"
              >
                {n}
              </span>
            ) : (
              <Link href={hrefFor(n)} className={linkClass} aria-label={`Page ${n}`}>
                {n}
              </Link>
            )}
          </span>
        );
      })}

      {page < pageCount ? (
        <Link href={hrefFor(page + 1)} rel="next" className={linkClass}>
          Next →
        </Link>
      ) : (
        <span
          aria-hidden="true"
          className={`${linkClass} cursor-not-allowed opacity-40`}
        >
          Next →
        </span>
      )}
    </nav>
  );
}
