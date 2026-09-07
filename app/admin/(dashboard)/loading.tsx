export default function AdminLoading() {
  return (
    <div role="status" aria-live="polite" className="animate-pulse">
      <span className="sr-only">Loading…</span>
      <div className="h-8 w-48 rounded bg-neutral-200" />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 rounded-lg border border-neutral-200 bg-white p-5"
          >
            <div className="h-3 w-20 rounded bg-neutral-200" />
            <div className="mt-3 h-7 w-12 rounded bg-neutral-200" />
          </div>
        ))}
      </div>
      <div className="mt-10 h-40 rounded-lg border border-neutral-200 bg-white" />
    </div>
  );
}
