export default function PublicLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto max-w-6xl animate-pulse px-4 py-10"
    >
      <span className="sr-only">Loading…</span>
      <div className="h-8 w-56 rounded bg-neutral-200" />
      <div className="mt-2 h-4 w-32 rounded bg-neutral-200" />
      <div className="mt-6 h-28 rounded-lg bg-neutral-200" />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-56 rounded-lg bg-neutral-200" />
        ))}
      </div>
    </div>
  );
}
