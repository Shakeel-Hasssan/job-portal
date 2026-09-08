import type { Metadata } from "next";

import { CategoryManager } from "@/components/admin/category-manager";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Categories",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [{ data: categories, error }, { data: jobs }] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase.from("jobs").select("category_id"),
  ]);

  // Counted here rather than with a per-row query, so the page stays at two
  // round trips regardless of how many categories exist.
  const jobCounts: Record<string, number> = {};
  for (const job of jobs ?? []) {
    if (job.category_id) {
      jobCounts[job.category_id] = (jobCounts[job.category_id] ?? 0) + 1;
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900">Categories</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Deleting a category keeps its jobs — they simply become uncategorised.
      </p>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          Unable to load categories: {error.message}
        </p>
      ) : null}

      <CategoryManager categories={categories ?? []} jobCounts={jobCounts} />
    </div>
  );
}
