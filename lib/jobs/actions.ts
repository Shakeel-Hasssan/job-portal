"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { STORAGE_BUCKET } from "@/lib/types";
import { generateUniqueSlug, slugify } from "@/lib/utils/slug";
import { collectFieldErrors, parseJobForm } from "@/lib/validation/job";

export type JobFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

/**
 * Every action here calls requireAdmin() first. A layout cannot protect a
 * server action - actions are independently addressable endpoints, so each one
 * re-verifies the session and the admin allow-list.
 *
 * Writes use .select() and check the number of affected rows. Row Level
 * Security denies a write by matching zero rows, not by raising an error, so a
 * write that returns no error but no rows means "not permitted" and must not be
 * reported to the administrator as success.
 */

async function slugExists(
  supabase: Awaited<ReturnType<typeof createClient>>,
  slug: string,
  excludeId?: string,
): Promise<boolean> {
  let query = supabase.from("jobs").select("id").eq("slug", slug).limit(1);
  if (excludeId) {
    query = query.neq("id", excludeId);
  }
  const { data } = await query;
  return (data?.length ?? 0) > 0;
}

/** Best-effort removal of a storage object. Never throws. */
async function removeImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  path: string | null | undefined,
): Promise<void> {
  if (!path) return;
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);
  if (error) {
    // An orphaned file is harmless; losing the database write is not.
    console.error(`Failed to remove storage object ${path}:`, error.message);
  }
}

export async function createJobAction(
  _prevState: JobFormState,
  formData: FormData,
): Promise<JobFormState> {
  await requireAdmin();

  const parsed = parseJobForm(formData);
  if (!parsed.success) {
    return { fieldErrors: collectFieldErrors(parsed.error) };
  }

  const input = parsed.data;
  const supabase = await createClient();

  const requestedSlug = input.slug ? slugify(input.slug) : "";
  const slug = requestedSlug
    ? await generateUniqueSlug(requestedSlug, (candidate) =>
        slugExists(supabase, candidate),
      )
    : await generateUniqueSlug(input.title, (candidate) =>
        slugExists(supabase, candidate),
      );

  const { slug: _ignored, ...rest } = input;

  const { data, error } = await supabase
    .from("jobs")
    .insert({
      ...rest,
      slug,
      how_to_apply: input.how_to_apply,
      // A published job must carry a publication date (database constraint).
      published_at: input.status === "published" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return {
        fieldErrors: { slug: "That slug is already in use. Try a different one." },
      };
    }
    return { error: `Unable to save job: ${error.message}` };
  }

  if (!data) {
    return { error: "Unable to save job. You may not have permission." };
  }

  revalidatePath("/admin/jobs");
  revalidatePath("/admin");
  redirect(`/admin/jobs/${data.id}/edit?saved=1`);
}

export async function updateJobAction(
  _prevState: JobFormState,
  formData: FormData,
): Promise<JobFormState> {
  await requireAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) {
    return { error: "Missing job id." };
  }

  const parsed = parseJobForm(formData);
  if (!parsed.success) {
    return { fieldErrors: collectFieldErrors(parsed.error) };
  }

  const input = parsed.data;
  const supabase = await createClient();

  const { data: existing, error: loadError } = await supabase
    .from("jobs")
    .select("id, slug, status, published_at, featured_image_path")
    .eq("id", id)
    .maybeSingle();

  if (loadError) {
    return { error: `Unable to load job: ${loadError.message}` };
  }
  if (!existing) {
    return { error: "That job no longer exists." };
  }

  // Published URLs stay stable for SEO unless the administrator deliberately
  // edits the slug field.
  const requestedSlug = input.slug ? slugify(input.slug) : "";
  let slug = existing.slug;
  if (requestedSlug && requestedSlug !== existing.slug) {
    slug = await generateUniqueSlug(requestedSlug, (candidate) =>
      slugExists(supabase, candidate, id),
    );
  } else if (!requestedSlug && existing.status === "draft") {
    slug = await generateUniqueSlug(input.title, (candidate) =>
      slugExists(supabase, candidate, id),
    );
  }

  // Set published_at the first time a job is published; keep the original date
  // on later edits so the public "posted on" date does not jump.
  let publishedAt: string | null = existing.published_at;
  if (input.status === "published" && !existing.published_at) {
    publishedAt = new Date().toISOString();
  } else if (input.status === "draft") {
    publishedAt = null;
  }

  const { slug: _ignored, ...rest } = input;

  const { data, error } = await supabase
    .from("jobs")
    .update({
      ...rest,
      slug,
      how_to_apply: input.how_to_apply,
      published_at: publishedAt,
    })
    .eq("id", id)
    .select("id, featured_image_path");

  if (error) {
    if (error.code === "23505") {
      return {
        fieldErrors: { slug: "That slug is already in use. Try a different one." },
      };
    }
    return { error: `Unable to save job: ${error.message}` };
  }

  // Zero rows means RLS refused the write.
  if (!data || data.length === 0) {
    return { error: "Unable to save job. You may not have permission." };
  }

  // The featured image changed, so the previous file is now unreferenced.
  if (
    existing.featured_image_path &&
    existing.featured_image_path !== input.featured_image_path
  ) {
    await removeImage(supabase, existing.featured_image_path);
  }

  revalidatePath("/admin/jobs");
  revalidatePath("/admin");
  revalidatePath(`/admin/jobs/${id}/edit`);
  redirect(`/admin/jobs/${id}/edit?saved=1`);
}

/**
 * Deletes a job and its featured image.
 *
 * The database row is removed first, then the storage object. The spec suggests
 * the reverse order, but deleting the file first risks leaving a live job
 * pointing at a missing image if the row delete then fails. An orphaned file is
 * the safer failure mode.
 */
export async function deleteJobAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) {
    throw new Error("Missing job id.");
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("jobs")
    .select("id, featured_image_path")
    .eq("id", id)
    .maybeSingle();

  const { data, error } = await supabase
    .from("jobs")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    throw new Error(`Unable to delete job: ${error.message}`);
  }
  if (!data || data.length === 0) {
    throw new Error("Unable to delete job. You may not have permission.");
  }

  await removeImage(supabase, existing?.featured_image_path);

  revalidatePath("/admin/jobs");
  revalidatePath("/admin");
  redirect("/admin/jobs?deleted=1");
}

/** Publishes or unpublishes a job from the list view. */
export async function setJobStatusAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = formData.get("id");
  const status = formData.get("status");

  if (typeof id !== "string" || id.length === 0) {
    throw new Error("Missing job id.");
  }
  if (status !== "draft" && status !== "published") {
    throw new Error("Invalid status.");
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("jobs")
    .select("published_at")
    .eq("id", id)
    .maybeSingle();

  const publishedAt =
    status === "published"
      ? (existing?.published_at ?? new Date().toISOString())
      : null;

  const { data, error } = await supabase
    .from("jobs")
    .update({ status, published_at: publishedAt })
    .eq("id", id)
    .select("id");

  if (error) {
    throw new Error(`Unable to update status: ${error.message}`);
  }
  if (!data || data.length === 0) {
    throw new Error("Unable to update status. You may not have permission.");
  }

  revalidatePath("/admin/jobs");
  revalidatePath("/admin");
}
