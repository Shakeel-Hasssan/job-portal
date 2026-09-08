"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormStatus } from "react-dom";

import { deleteJobAction, setJobStatusAction } from "@/lib/jobs/actions";

function PendingButton({
  children,
  className,
  label,
}: {
  children: React.ReactNode;
  className: string;
  label?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className} aria-label={label}>
      {pending ? "Working…" : children}
    </button>
  );
}

const buttonClass =
  "rounded border border-neutral-300 bg-white px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-60";

export function JobRowActions({
  id,
  slug,
  status,
  title,
}: {
  id: string;
  slug: string;
  status: string;
  title: string;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-1">
      {status === "published" ? (
        <Link
          href={`/jobs/${slug}`}
          className={buttonClass}
          target="_blank"
          rel="noopener noreferrer"
        >
          View
        </Link>
      ) : null}

      <Link href={`/admin/jobs/${id}/edit`} className={buttonClass}>
        Edit
      </Link>

      <form action={setJobStatusAction}>
        <input type="hidden" name="id" value={id} />
        <input
          type="hidden"
          name="status"
          value={status === "published" ? "draft" : "published"}
        />
        <PendingButton className={buttonClass}>
          {status === "published" ? "Unpublish" : "Publish"}
        </PendingButton>
      </form>

      {confirming ? (
        <span className="flex items-center gap-1 rounded border border-red-300 bg-red-50 px-2 py-1">
          <span className="text-xs text-red-800">Delete “{title}”?</span>
          <form action={deleteJobAction}>
            <input type="hidden" name="id" value={id} />
            <PendingButton className="rounded bg-red-700 px-2 py-0.5 text-xs font-medium text-white hover:bg-red-800">
              Yes, delete
            </PendingButton>
          </form>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="rounded border border-neutral-300 bg-white px-2 py-0.5 text-xs"
          >
            Cancel
          </button>
        </span>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="rounded border border-red-300 bg-white px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
        >
          Delete
        </button>
      )}
    </div>
  );
}
