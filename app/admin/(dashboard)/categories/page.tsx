import type { Metadata } from "next";

import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = {
  title: "Categories",
  robots: { index: false, follow: false },
};

/** Placeholder. Category management is built in Phase 4. */
export default async function AdminCategoriesPage() {
  await requireAdmin();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900">Categories</h1>
      <p className="mt-4 rounded-lg border border-dashed border-neutral-300 bg-white px-4 py-8 text-center text-sm text-neutral-600">
        Category management is implemented in Phase 4.
      </p>
    </div>
  );
}
