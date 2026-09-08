import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "How to get in touch about a listing on this site.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-neutral-900">Contact</h1>

      <div className="mt-6 space-y-4 text-neutral-700">
        <p>
          Get in touch if a listing looks incorrect or out of date, if you would
          like a listing removed, or if you have a question about how the site
          works.
        </p>
        <p>
          We cannot answer questions about the status of your application. Those
          are handled by the employer named on the listing, so please contact
          them through their own application page.
        </p>
      </div>

      <p className="mt-8 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Placeholder page. Add a real contact email address or contact form here
        before launching the site publicly.
      </p>
    </main>
  );
}
