/**
 * SEO-friendly slug generation.
 *
 * "Senior Java Developer Jobs in Lahore" -> "senior-java-developer-jobs-in-lahore"
 */

const MAX_SLUG_LENGTH = 90;

/** Converts arbitrary text into a lowercase, hyphenated, URL-safe slug. */
export function slugify(input: string): string {
  const slug = input
    .normalize("NFKD")
    // Strip combining marks left behind by the decomposition above.
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    // Drop apostrophes entirely so "developer's" -> "developers", not
    // "developer-s".
    .replace(/['‘’]/g, "")
    // Everything that is not a letter or digit becomes a separator.
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/g, "");

  return slug;
}

/**
 * Appends a numeric suffix to a base slug: foo -> foo-2 -> foo-3.
 * Trims the base when needed so the result stays within the length limit.
 */
export function withSuffix(base: string, suffix: number): string {
  if (suffix < 2) return base;
  const tail = `-${suffix}`;
  const trimmed = base.slice(0, MAX_SLUG_LENGTH - tail.length).replace(/-+$/g, "");
  return `${trimmed}${tail}`;
}

/**
 * Produces a slug that is unique among existing jobs.
 *
 * `isTaken` is injected so this stays pure and testable; callers pass a
 * function that queries the database. `excludeId` lets a job keep its own slug
 * while being edited.
 *
 * The database also has a unique constraint on jobs.slug - this is a
 * convenience so administrators get a clean slug rather than a constraint
 * error, not the uniqueness guarantee itself.
 */
export async function generateUniqueSlug(
  title: string,
  isTaken: (slug: string) => Promise<boolean>,
  options: { fallback?: string; maxAttempts?: number } = {},
): Promise<string> {
  const { fallback = "job", maxAttempts = 50 } = options;

  const base = slugify(title) || fallback;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const candidate = withSuffix(base, attempt);
    if (!(await isTaken(candidate))) {
      return candidate;
    }
  }

  // Extremely unlikely; keeps the operation moving instead of failing.
  return `${base}-${Date.now()}`;
}
