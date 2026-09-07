/**
 * TEMPORARY Phase 2 verification page.
 *
 * Exercises the real server-side Supabase client end to end inside Next.js:
 * env loading, cookie-based client creation, typed queries, the FK embed and
 * RLS behaviour. This route is scaffolding - delete it in Phase 5 when the
 * real public pages land.
 */

import { createClient } from "@/lib/supabase/server";
import { parseApplicationSteps, type JobWithCategory } from "@/lib/types";

export const dynamic = "force-dynamic";

function Row({
  label,
  ok,
  detail,
}: {
  label: string;
  ok: boolean;
  detail: string;
}) {
  return (
    <li className="flex items-start gap-3 border-b border-neutral-200 py-3 last:border-0">
      <span
        className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
          ok ? "bg-green-600" : "bg-red-600"
        }`}
        aria-hidden="true"
      >
        {ok ? "✓" : "✕"}
      </span>
      <span className="min-w-0">
        <span className="font-medium">{label}</span>
        <span className="sr-only">{ok ? " — passed" : " — failed"}</span>
        <span className="block break-words text-sm text-neutral-600">
          {detail}
        </span>
      </span>
    </li>
  );
}

export default async function Phase2CheckPage() {
  let fatal: string | null = null;
  const checks: { label: string; ok: boolean; detail: string }[] = [];
  let jobs: JobWithCategory[] = [];

  try {
    const supabase = await createClient();

    checks.push({
      label: "Server Supabase client created",
      ok: true,
      detail: "lib/supabase/server.ts resolved env and built a cookie-bound client",
    });

    const { data: session } = await supabase.auth.getUser();
    checks.push({
      label: "Auth session read",
      ok: true,
      detail: session.user
        ? `Signed in as ${session.user.email}`
        : "No user signed in - querying as the anonymous role (expected in Phase 2)",
    });

    const { data: categories, error: catError } = await supabase
      .from("categories")
      .select("id, name, slug")
      .order("name");
    checks.push({
      label: "Read categories",
      ok: !catError,
      detail: catError
        ? catError.message
        : `${categories?.length ?? 0} found: ${categories?.map((c) => c.slug).join(", ")}`,
    });

    const { data: jobRows, error: jobError } = await supabase
      .from("jobs")
      .select("*, category:categories(id, name, slug)")
      .order("published_at", { ascending: false });
    jobs = (jobRows ?? []) as JobWithCategory[];
    checks.push({
      label: "Read jobs with category embed",
      ok: !jobError,
      detail: jobError
        ? jobError.message
        : `${jobs.length} row(s) returned through the typed client`,
    });

    const leaked = jobs.filter((j) => j.status !== "published");
    checks.push({
      label: "RLS hides draft jobs",
      ok: leaked.length === 0,
      detail:
        leaked.length === 0
          ? "No unpublished rows returned, though a draft exists in the table"
          : `LEAK: ${leaked.map((j) => j.title).join(", ")}`,
    });

    const { data: draftProbe } = await supabase
      .from("jobs")
      .select("id")
      .eq("status", "draft");
    checks.push({
      label: "Explicit draft filter returns nothing",
      ok: (draftProbe?.length ?? 0) === 0,
      detail: "A client-supplied filter cannot bypass the row level policy",
    });

    const { data: admins, error: adminError } = await supabase
      .from("admin_users")
      .select("id");
    checks.push({
      label: "admin_users not readable anonymously",
      ok: !adminError && (admins?.length ?? 0) === 0,
      detail: adminError
        ? adminError.message
        : "Empty result - the admin allow-list is not exposed",
    });

    const { data: isAdmin, error: rpcError } = await supabase.rpc("is_admin");
    checks.push({
      label: "is_admin() RPC",
      ok: !rpcError && isAdmin === false,
      detail: rpcError ? rpcError.message : `Returned ${String(isAdmin)} for an anonymous visitor`,
    });

    const writeProbe = await supabase
      .from("jobs")
      .update({ title: "WRITE-PROBE" })
      .eq("status", "published")
      .select();
    checks.push({
      label: "Anonymous write affects 0 rows",
      ok: (writeProbe.data?.length ?? 0) === 0,
      detail:
        (writeProbe.data?.length ?? 0) === 0
          ? "RLS silently filtered the update - nothing was modified"
          : `MODIFIED ${writeProbe.data?.length} row(s)`,
    });
  } catch (error) {
    fatal = error instanceof Error ? error.message : String(error);
  }

  const passed = checks.filter((c) => c.ok).length;
  const allPassed = fatal === null && passed === checks.length;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <p className="mb-2 inline-block rounded bg-amber-100 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-amber-900">
        Temporary page — removed in Phase 5
      </p>
      <h1 className="text-2xl font-semibold">Phase 2 verification</h1>
      <p className="mt-2 text-neutral-600">
        Live checks executed on the server against your Supabase project through{" "}
        <code className="rounded bg-neutral-100 px-1 py-0.5 text-sm">
          lib/supabase/server.ts
        </code>
        .
      </p>

      {fatal ? (
        <div
          role="alert"
          className="mt-6 rounded border border-red-300 bg-red-50 p-4 text-red-900"
        >
          <p className="font-semibold">Connection failed</p>
          <p className="mt-1 text-sm">{fatal}</p>
        </div>
      ) : (
        <div
          className={`mt-6 rounded border p-4 ${
            allPassed
              ? "border-green-300 bg-green-50 text-green-900"
              : "border-red-300 bg-red-50 text-red-900"
          }`}
        >
          <p className="font-semibold">
            {passed} of {checks.length} checks passed
          </p>
        </div>
      )}

      <ul className="mt-6 rounded border border-neutral-200 px-4">
        {checks.map((c) => (
          <Row key={c.label} {...c} />
        ))}
      </ul>

      {jobs.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold">
            Published jobs returned by the database
          </h2>
          <p className="text-sm text-neutral-600">
            Rendered from real rows — no hardcoded data.
          </p>
          {jobs.map((job) => {
            const steps = parseApplicationSteps(job.how_to_apply);
            return (
              <article
                key={job.id}
                className="mt-4 rounded border border-neutral-200 p-4"
              >
                <h3 className="font-medium">{job.title}</h3>
                <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-neutral-700 sm:grid-cols-3">
                  <div>
                    <dt className="text-neutral-500">Company</dt>
                    <dd>{job.company_name ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Location</dt>
                    <dd>{job.location ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Category</dt>
                    <dd>{job.category?.name ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Type</dt>
                    <dd>{job.employment_type ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Status</dt>
                    <dd>{job.status}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Slug</dt>
                    <dd className="break-all">{job.slug}</dd>
                  </div>
                </dl>
                <p className="mt-3 text-sm font-medium">
                  How to apply ({steps.length} steps parsed from JSONB)
                </p>
                <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm text-neutral-700">
                  {steps.map((s) => (
                    <li key={s.step}>
                      <span className="font-medium">{s.title}</span> —{" "}
                      {s.description}
                    </li>
                  ))}
                </ol>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
