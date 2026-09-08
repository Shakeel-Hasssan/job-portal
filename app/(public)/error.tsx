"use client";

import { useEffect } from "react";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-20 text-center">
      <div
        role="alert"
        className="rounded-lg border border-red-300 bg-red-50 p-8 text-red-900"
      >
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm">
          This page could not be loaded. Please try again in a moment.
        </p>
        {error.digest ? (
          <p className="mt-2 text-xs text-red-700">Reference: {error.digest}</p>
        ) : null}
        <button
          type="button"
          onClick={reset}
          className="mt-5 rounded-md bg-red-700 px-5 py-2 text-sm font-medium text-white transition hover:bg-red-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
