import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms of use for this job listing website.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-neutral-900">Terms of use</h1>

      <div className="mt-6 space-y-6 text-neutral-700">
        <section>
          <h2 className="text-lg font-semibold text-neutral-900">
            Using this site
          </h2>
          <p className="mt-2">
            This website publishes job listings for information. Using it means
            you accept these terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900">
            Accuracy of listings
          </h2>
          <p className="mt-2">
            Listings are published in good faith but may become inaccurate or out
            of date, and roles can close at any time. We do not guarantee that any
            listing is current, complete or still open. Verify the details on the
            employer&apos;s official application page before applying.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900">
            No employment relationship
          </h2>
          <p className="mt-2">
            This site is not an employer, recruiter or agent for the employers
            listed. We do not receive applications, take part in hiring decisions,
            or guarantee any outcome. Never pay a fee to apply for a job.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900">External sites</h2>
          <p className="mt-2">
            Application links lead to websites we do not operate or control, and
            we are not responsible for their content or practices.
          </p>
        </section>
      </div>

      <p className="mt-8 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Placeholder wording, not legal advice. Have a qualified professional
        review and adapt it before launching the site publicly.
      </p>
    </main>
  );
}
