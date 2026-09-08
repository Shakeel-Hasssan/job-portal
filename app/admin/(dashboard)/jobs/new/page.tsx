import type { Metadata } from "next";

import { JobForm } from "@/components/forms/job-form";
import { requireAdmin } from "@/lib/auth/admin";
import { createJobAction } from "@/lib/jobs/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Add job",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NewJobPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900">Add job</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Enter the real details of the vacancy. Save as a draft first if you are
        not ready to publish.
      </p>

      <div className="mt-6">
        <JobForm
          action={createJobAction}
          categories={categories ?? []}
          steps={[]}
        />
      </div>
    </div>
  );
}
