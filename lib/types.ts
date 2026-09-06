/**
 * Application-level domain types.
 *
 * These sit on top of the raw database row types in lib/supabase/types.ts and
 * are what the rest of the app should import.
 */

import type { Json, Tables } from "@/lib/supabase/types";

export type AdminUser = Tables<"admin_users">;
export type Category = Tables<"categories">;
export type Job = Tables<"jobs">;

/** A job row with its category joined in (nullable - categories use ON DELETE SET NULL). */
export type JobWithCategory = Job & {
  category: Pick<Category, "id" | "name" | "slug"> | null;
};

export const JOB_STATUSES = ["draft", "published"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export function isJobStatus(value: string): value is JobStatus {
  return (JOB_STATUSES as readonly string[]).includes(value);
}

/**
 * Employment types offered in the admin form. Stored as free text in the
 * database so the list can grow without a migration.
 */
export const EMPLOYMENT_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Temporary",
  "Internship",
  "Volunteer",
  "Remote",
] as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

/**
 * One step of the "How to apply" instructions, stored in jobs.how_to_apply
 * as a JSONB array. Authored through the admin UI - never raw HTML.
 */
export type ApplicationStep = {
  step: number;
  title: string;
  description: string;
};

/** Runtime narrowing for the untyped JSONB column. */
export function isApplicationStep(value: unknown): value is ApplicationStep {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.step === "number" &&
    typeof candidate.title === "string" &&
    typeof candidate.description === "string"
  );
}

/**
 * Reads jobs.how_to_apply into a typed array, discarding malformed entries and
 * ordering by step. Never throws - a bad row degrades to an empty list rather
 * than breaking the page.
 */
export function parseApplicationSteps(value: Json): ApplicationStep[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isApplicationStep)
    .sort((a, b) => a.step - b.step);
}

/** Maximum featured image upload size, mirrored by the storage bucket config. */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Image MIME types accepted by the job-images bucket. */
export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

export const STORAGE_BUCKET = "job-images";
