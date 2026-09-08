import Link from "next/link";

/**
 * Filter controls for the job list.
 *
 * A plain GET form, so filtering works without JavaScript and every result set
 * has a shareable URL such as /jobs?search=java&location=lahore&page=2.
 */
export function JobFilters({
  action = "/jobs",
  values,
  locations,
  employmentTypes,
  categories,
  hideCategory = false,
}: {
  action?: string;
  values: {
    search?: string;
    location?: string;
    employmentType?: string;
    category?: string;
  };
  locations: string[];
  employmentTypes: string[];
  categories: { name: string; slug: string }[];
  hideCategory?: boolean;
}) {
  const hasFilters = Boolean(
    values.search || values.location || values.employmentType || values.category,
  );

  const selectClass =
    "mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500";

  return (
    <form
      action={action}
      role="search"
      className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className={hideCategory ? "sm:col-span-2" : ""}>
          <label htmlFor="search" className="block text-sm font-medium text-neutral-800">
            Keywords
          </label>
          <input
            id="search"
            name="search"
            type="search"
            defaultValue={values.search ?? ""}
            placeholder="Title, company or location"
            className={selectClass}
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-neutral-800">
            Location
          </label>
          <input
            id="location"
            name="location"
            type="text"
            list="location-options"
            defaultValue={values.location ?? ""}
            placeholder="Any location"
            className={selectClass}
          />
          <datalist id="location-options">
            {locations.map((location) => (
              <option key={location} value={location} />
            ))}
          </datalist>
        </div>

        <div>
          <label
            htmlFor="employmentType"
            className="block text-sm font-medium text-neutral-800"
          >
            Employment type
          </label>
          <select
            id="employmentType"
            name="employmentType"
            defaultValue={values.employmentType ?? ""}
            className={selectClass}
          >
            <option value="">Any type</option>
            {employmentTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {hideCategory ? null : (
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-neutral-800"
            >
              Category
            </label>
            <select
              id="category"
              name="category"
              defaultValue={values.category ?? ""}
              className={selectClass}
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2"
        >
          Apply filters
        </button>
        {hasFilters ? (
          <Link
            href={action}
            className="text-sm text-neutral-600 underline underline-offset-2 hover:text-neutral-900"
          >
            Clear all
          </Link>
        ) : null}
      </div>
    </form>
  );
}
