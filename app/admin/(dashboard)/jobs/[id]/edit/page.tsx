import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JobForm } from "@/components/forms/job-form";
import { requireAdmin } from "@/lib/auth/admin";
import { updateJobAction } from "@/lib/jobs/actions";
import { createClient } from "@/lib/supabase/server";
import { parseApplicationSteps } from "@/lib/types";

export const metadata: Metadata = {
  title: "Edit job",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function EditJobPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { saved } = await searchParams;
  const supabase = await createClient();

  const [{ data: job }, { data: categories }] = await Promise.all([
    supabase.from("jobs").select("*").eq("id", id).maybeSingle(),
    supabase.from("categories").select("id, name").order("name"),
  ]);

  if (!job) {
    notFound();
  }

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-semibold text-neutral-900">Edit job</h1>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
            job.status === "published"
              ? "bg-green-100 text-green-800"
              : "bg-neutral-200 text-neutral-700"
          }`}
        >
          {job.status === "published" ? "●" : "○"} {job.status}
        </span>
      </div>
      <p className="mt-1 text-sm text-neutral-600">{job.title}</p>

      <div className="mt-6">
        <JobForm
          action={updateJobAction}
          job={job}
          categories={categories ?? []}
          steps={parseApplicationSteps(job.how_to_apply)}
          savedNotice={saved === "1"}
        />
      </div>
    </div>
  );
}
