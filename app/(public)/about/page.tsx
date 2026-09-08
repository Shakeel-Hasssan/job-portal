import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "About this job listing website and how it works.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-neutral-900">About</h1>

      <div className="mt-6 space-y-4 text-neutral-700">
        <p>
          This site publishes job listings and explains how to apply for each
          one. Listings are compiled and published by the site administrator.
        </p>
        <p>
          Applications are never submitted through this website. Each listing
          links to the employer&apos;s own application page, and any details you
          provide are handled by that employer under their own privacy practices.
        </p>
        <p>
          We aim to keep listings accurate and current, but details can change or
          close without notice. Always confirm the role, the deadline and the
          employer on the official application page before applying, and be
          cautious of any listing that asks for payment.
        </p>
      </div>

      <p className="mt-8 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        This page is placeholder content. Replace it with details about your own
        organisation before launching the site publicly.
      </p>
    </main>
  );
}
