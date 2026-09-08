"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

import { ApplicationStepsEditor } from "@/components/forms/application-steps-editor";
import { ImageUploader } from "@/components/forms/image-uploader";
import type { JobFormState } from "@/lib/jobs/actions";
import {
  EMPLOYMENT_TYPES,
  type ApplicationStep,
  type Category,
  type Job,
} from "@/lib/types";

type JobFormAction = (
  state: JobFormState,
  formData: FormData,
) => Promise<JobFormState>;

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-neutral-800">
        {label}
      </label>
      {children}
      {hint && !error ? (
        <p className="mt-1 text-xs text-neutral-500">{hint}</p>
      ) : null}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="mt-1 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
      {description ? (
        <p className="mt-0.5 text-sm text-neutral-600">{description}</p>
      ) : null}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

const inputClass =
  "mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500";

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  // Disabled while the action is in flight, which also prevents double submits.
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-neutral-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2"
    >
      {pending ? "Saving…" : isEdit ? "Save changes" : "Create job"}
    </button>
  );
}

export function JobForm({
  action,
  job,
  categories,
  steps,
  savedNotice,
}: {
  action: JobFormAction;
  job?: Job;
  categories: Pick<Category, "id" | "name">[];
  steps: ApplicationStep[];
  savedNotice?: boolean;
}) {
  const [state, formAction] = useActionState<JobFormState, FormData>(action, {});
  const [dirty, setDirty] = useState(false);
  const isEdit = Boolean(job);
  const errors = state.fieldErrors ?? {};

  // Warn before losing unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const markDirty = () => setDirty(true);

  return (
    <form action={formAction} onChange={markDirty} className="space-y-6">
      {job ? <input type="hidden" name="id" value={job.id} /> : null}

      {savedNotice && !state.error ? (
        <p
          role="status"
          className="rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-800"
        >
          Saved successfully.
        </p>
      ) : null}

      {state.error ? (
        <p
          role="alert"
          className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {state.error}
        </p>
      ) : null}

      <Section title="Basic information">
        <Field label="Job title" htmlFor="title" error={errors.title}>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={job?.title ?? ""}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? "title-error" : undefined}
            className={inputClass}
            placeholder="Senior Java Developer"
          />
        </Field>

        <Field
          label="Slug"
          htmlFor="slug"
          error={errors.slug}
          hint={
            isEdit && job?.status === "published"
              ? "This job is published. Changing the slug changes its public URL and breaks existing links."
              : "Leave blank to generate one from the title."
          }
        >
          <input
            id="slug"
            name="slug"
            type="text"
            defaultValue={job?.slug ?? ""}
            aria-invalid={Boolean(errors.slug)}
            className={inputClass}
            placeholder="senior-java-developer-jobs-in-lahore"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company" htmlFor="company_name" error={errors.company_name}>
            <input
              id="company_name"
              name="company_name"
              type="text"
              defaultValue={job?.company_name ?? ""}
              className={inputClass}
            />
          </Field>

          <Field label="Location" htmlFor="location" error={errors.location}>
            <input
              id="location"
              name="location"
              type="text"
              defaultValue={job?.location ?? ""}
              className={inputClass}
              placeholder="Lahore, Pakistan"
            />
          </Field>

          <Field
            label="Employment type"
            htmlFor="employment_type"
            error={errors.employment_type}
          >
            <select
              id="employment_type"
              name="employment_type"
              defaultValue={job?.employment_type ?? ""}
              className={inputClass}
            >
              <option value="">Not specified</option>
              {EMPLOYMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Salary" htmlFor="salary" error={errors.salary}>
            <input
              id="salary"
              name="salary"
              type="text"
              defaultValue={job?.salary ?? ""}
              className={inputClass}
              placeholder="PKR 200,000 - 300,000 per month"
            />
          </Field>
        </div>

        <Field label="Category" htmlFor="category_id" error={errors.category_id}>
          <select
            id="category_id"
            name="category_id"
            defaultValue={job?.category_id ?? ""}
            className={inputClass}
          >
            <option value="">Uncategorised</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>
      </Section>

      <Section
        title="Content"
        description="Plain text. Line breaks are preserved when the job is displayed."
      >
        <Field label="Description" htmlFor="description" error={errors.description}>
          <textarea
            id="description"
            name="description"
            rows={6}
            defaultValue={job?.description ?? ""}
            className={inputClass}
          />
        </Field>

        <Field
          label="Responsibilities"
          htmlFor="responsibilities"
          error={errors.responsibilities}
          hint="One per line."
        >
          <textarea
            id="responsibilities"
            name="responsibilities"
            rows={5}
            defaultValue={job?.responsibilities ?? ""}
            className={inputClass}
          />
        </Field>

        <Field
          label="Requirements"
          htmlFor="requirements"
          error={errors.requirements}
          hint="One per line."
        >
          <textarea
            id="requirements"
            name="requirements"
            rows={5}
            defaultValue={job?.requirements ?? ""}
            className={inputClass}
          />
        </Field>
      </Section>

      <Section title="Featured image">
        <ImageUploader
          defaultUrl={job?.featured_image_url ?? null}
          defaultPath={job?.featured_image_path ?? null}
          defaultAlt={job?.featured_image_alt ?? null}
          fallbackAlt={job?.title ?? "Job listing image"}
          onDirty={markDirty}
        />
      </Section>

      <Section
        title="SEO"
        description="Optional. Sensible values are derived from the job when these are blank."
      >
        <Field label="SEO title" htmlFor="seo_title" error={errors.seo_title}>
          <input
            id="seo_title"
            name="seo_title"
            type="text"
            defaultValue={job?.seo_title ?? ""}
            className={inputClass}
          />
        </Field>

        <Field
          label="SEO description"
          htmlFor="seo_description"
          error={errors.seo_description}
        >
          <textarea
            id="seo_description"
            name="seo_description"
            rows={2}
            defaultValue={job?.seo_description ?? ""}
            className={inputClass}
          />
        </Field>

        <Field
          label="SEO keywords"
          htmlFor="seo_keywords"
          error={errors.seo_keywords}
          hint="Comma separated."
        >
          <input
            id="seo_keywords"
            name="seo_keywords"
            type="text"
            defaultValue={job?.seo_keywords ?? ""}
            className={inputClass}
          />
        </Field>
      </Section>

      <Section
        title="Application"
        description="Candidates apply on the employer's own website."
      >
        <Field
          label="Application URL"
          htmlFor="application_url"
          error={errors.application_url}
          hint="Must start with http:// or https://"
        >
          <input
            id="application_url"
            name="application_url"
            type="url"
            required
            defaultValue={job?.application_url ?? ""}
            aria-invalid={Boolean(errors.application_url)}
            aria-describedby={
              errors.application_url ? "application_url-error" : undefined
            }
            className={inputClass}
            placeholder="https://example.com/careers/apply"
          />
        </Field>

        <div>
          <span className="block text-sm font-medium text-neutral-800">
            Application steps
          </span>
          {errors.how_to_apply ? (
            <p role="alert" className="mt-1 text-sm text-red-700">
              {errors.how_to_apply}
            </p>
          ) : null}
          <div className="mt-2">
            <ApplicationStepsEditor
              name="how_to_apply"
              defaultValue={steps}
              onDirty={markDirty}
            />
          </div>
        </div>
      </Section>

      <Section title="Publishing">
        <fieldset>
          <legend className="text-sm font-medium text-neutral-800">Status</legend>
          {errors.status ? (
            <p role="alert" className="mt-1 text-sm text-red-700">
              {errors.status}
            </p>
          ) : null}
          <div className="mt-2 space-y-2">
            <label className="flex items-start gap-2 text-sm">
              <input
                type="radio"
                name="status"
                value="draft"
                defaultChecked={(job?.status ?? "draft") === "draft"}
                className="mt-1"
              />
              <span>
                <span className="font-medium">Draft</span>
                <span className="block text-neutral-600">
                  Only visible in the admin area.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="radio"
                name="status"
                value="published"
                defaultChecked={job?.status === "published"}
                className="mt-1"
              />
              <span>
                <span className="font-medium">Published</span>
                <span className="block text-neutral-600">
                  Live on the public site and included in the sitemap.
                </span>
              </span>
            </label>
          </div>
        </fieldset>
      </Section>

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton isEdit={isEdit} />
        <Link
          href="/admin/jobs"
          className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
