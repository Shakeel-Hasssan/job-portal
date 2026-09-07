import type { Metadata } from "next";

import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = {
  title: "Add job",
  robots: { index: false, follow: false },
};

/** Placeholder. The job form is built in Phase 4. */
export default async function AdminNewJobPage() {
  await requireAdmin();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900">Add job</h1>
      <p className="mt-4 rounded-lg border border-dashed border-neutral-300 bg-white px-4 py-8 text-center text-sm text-neutral-600">
        The job form is implemented in Phase 4.
      </p>
    </div>
  );
}
