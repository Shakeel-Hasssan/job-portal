"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
  type CategoryFormState,
} from "@/lib/categories/actions";
import type { Category } from "@/lib/types";

const inputClass =
  "mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded bg-red-700 px-2 py-1 text-xs font-medium text-white hover:bg-red-800 disabled:opacity-60"
    >
      {pending ? "Deleting…" : "Yes, delete"}
    </button>
  );
}

function CategoryRow({ category, jobCount }: { category: Category; jobCount: number }) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [state, formAction] = useActionState<CategoryFormState, FormData>(
    updateCategoryAction,
    {},
  );

  if (editing) {
    return (
      <li className="border-b border-neutral-100 p-4 last:border-0">
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="id" value={category.id} />
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor={`name-${category.id}`}
                className="block text-sm font-medium text-neutral-800"
              >
                Name
              </label>
              <input
                id={`name-${category.id}`}
                name="name"
                defaultValue={category.name}
                className={inputClass}
                required
              />
              {state.fieldErrors?.name ? (
                <p role="alert" className="mt-1 text-sm text-red-700">
                  {state.fieldErrors.name}
                </p>
              ) : null}
            </div>
            <div>
              <label
                htmlFor={`slug-${category.id}`}
                className="block text-sm font-medium text-neutral-800"
              >
                Slug
              </label>
              <input
                id={`slug-${category.id}`}
                name="slug"
                defaultValue={category.slug}
                className={inputClass}
              />
              {state.fieldErrors?.slug ? (
                <p role="alert" className="mt-1 text-sm text-red-700">
                  {state.fieldErrors.slug}
                </p>
              ) : null}
            </div>
          </div>
          <div>
            <label
              htmlFor={`description-${category.id}`}
              className="block text-sm font-medium text-neutral-800"
            >
              Description
            </label>
            <textarea
              id={`description-${category.id}`}
              name="description"
              rows={2}
              defaultValue={category.description ?? ""}
              className={inputClass}
            />
          </div>
          {state.error ? (
            <p role="alert" className="text-sm text-red-700">
              {state.error}
            </p>
          ) : null}
          {state.success ? (
            <p role="status" className="text-sm text-green-700">
              {state.success}
            </p>
          ) : null}
          <div className="flex gap-2">
            <SubmitButton label="Save" />
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium"
            >
              Done
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="flex flex-wrap items-center gap-3 border-b border-neutral-100 p-4 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-neutral-900">{category.name}</p>
        <p className="text-sm text-neutral-600">
          <code className="rounded bg-neutral-100 px-1">/category/{category.slug}</code>
          {" · "}
          {jobCount} {jobCount === 1 ? "job" : "jobs"}
        </p>
        {category.description ? (
          <p className="mt-1 text-sm text-neutral-600">{category.description}</p>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded border border-neutral-300 bg-white px-3 py-1 text-xs font-medium hover:bg-neutral-50"
        >
          Edit
        </button>

        {confirming ? (
          <span className="flex items-center gap-2 rounded border border-red-300 bg-red-50 px-2 py-1">
            <span className="text-xs text-red-800">
              Delete? {jobCount > 0 ? `${jobCount} job(s) become uncategorised.` : ""}
            </span>
            <form action={deleteCategoryAction}>
              <input type="hidden" name="id" value={category.id} />
              <DeleteButton />
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
            className="rounded border border-red-300 bg-white px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
          >
            Delete
          </button>
        )}
      </div>
    </li>
  );
}

export function CategoryManager({
  categories,
  jobCounts,
}: {
  categories: Category[];
  jobCounts: Record<string, number>;
}) {
  const [state, formAction] = useActionState<CategoryFormState, FormData>(
    createCategoryAction,
    {},
  );

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[20rem_1fr]">
      <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-neutral-900">Add category</h2>
        <form action={formAction} className="mt-4 space-y-3">
          <div>
            <label htmlFor="new-name" className="block text-sm font-medium text-neutral-800">
              Name
            </label>
            <input id="new-name" name="name" required className={inputClass} />
            {state.fieldErrors?.name ? (
              <p role="alert" className="mt-1 text-sm text-red-700">
                {state.fieldErrors.name}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="new-slug" className="block text-sm font-medium text-neutral-800">
              Slug
            </label>
            <input id="new-slug" name="slug" className={inputClass} />
            <p className="mt-1 text-xs text-neutral-500">
              Leave blank to generate from the name.
            </p>
            {state.fieldErrors?.slug ? (
              <p role="alert" className="mt-1 text-sm text-red-700">
                {state.fieldErrors.slug}
              </p>
            ) : null}
          </div>
          <div>
            <label
              htmlFor="new-description"
              className="block text-sm font-medium text-neutral-800"
            >
              Description
            </label>
            <textarea id="new-description" name="description" rows={3} className={inputClass} />
          </div>

          {state.error ? (
            <p role="alert" className="text-sm text-red-700">
              {state.error}
            </p>
          ) : null}
          {state.success ? (
            <p role="status" className="text-sm text-green-700">
              {state.success}
            </p>
          ) : null}

          <SubmitButton label="Create category" />
        </form>
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white shadow-sm">
        <h2 className="border-b border-neutral-200 px-5 py-3 text-base font-semibold text-neutral-900">
          Categories ({categories.length})
        </h2>
        {categories.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-neutral-600">
            No categories yet.
          </p>
        ) : (
          <ul>
            {categories.map((category) => (
              <CategoryRow
                key={category.id}
                category={category}
                jobCount={jobCounts[category.id] ?? 0}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
