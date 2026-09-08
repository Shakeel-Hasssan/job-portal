"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { generateUniqueSlug, slugify } from "@/lib/utils/slug";
import { parseCategoryForm } from "@/lib/validation/category";

export type CategoryFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: string;
};

async function slugExists(
  supabase: Awaited<ReturnType<typeof createClient>>,
  slug: string,
  excludeId?: string,
): Promise<boolean> {
  let query = supabase.from("categories").select("id").eq("slug", slug).limit(1);
  if (excludeId) query = query.neq("id", excludeId);
  const { data } = await query;
  return (data?.length ?? 0) > 0;
}

export async function createCategoryAction(
  _prevState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  await requireAdmin();

  const parsed = parseCategoryForm(formData);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return { fieldErrors };
  }

  const input = parsed.data;
  const supabase = await createClient();

  const base = input.slug ? slugify(input.slug) : input.name;
  const slug = await generateUniqueSlug(
    base,
    (candidate) => slugExists(supabase, candidate),
    { fallback: "category" },
  );

  const { data, error } = await supabase
    .from("categories")
    .insert({ name: input.name, slug, description: input.description })
    .select("id");

  if (error) {
    if (error.code === "23505") {
      return { fieldErrors: { slug: "That slug is already in use." } };
    }
    return { error: `Unable to create category: ${error.message}` };
  }
  if (!data || data.length === 0) {
    return { error: "Unable to create category. You may not have permission." };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/admin");
  return { success: `Category "${input.name}" created.` };
}

export async function updateCategoryAction(
  _prevState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  await requireAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) {
    return { error: "Missing category id." };
  }

  const parsed = parseCategoryForm(formData);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return { fieldErrors };
  }

  const input = parsed.data;
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("categories")
    .select("slug")
    .eq("id", id)
    .maybeSingle();

  let slug = existing?.slug ?? slugify(input.name);
  const requested = input.slug ? slugify(input.slug) : "";
  if (requested && requested !== existing?.slug) {
    slug = await generateUniqueSlug(
      requested,
      (candidate) => slugExists(supabase, candidate, id),
      { fallback: "category" },
    );
  }

  const { data, error } = await supabase
    .from("categories")
    .update({ name: input.name, slug, description: input.description })
    .eq("id", id)
    .select("id");

  if (error) {
    if (error.code === "23505") {
      return { fieldErrors: { slug: "That slug is already in use." } };
    }
    return { error: `Unable to update category: ${error.message}` };
  }
  if (!data || data.length === 0) {
    return { error: "Unable to update category. You may not have permission." };
  }

  revalidatePath("/admin/categories");
  return { success: `Category "${input.name}" updated.` };
}

/**
 * Deletes a category.
 *
 * jobs.category_id uses ON DELETE SET NULL, so jobs in this category survive
 * and simply become uncategorised - no job data is lost.
 */
export async function deleteCategoryAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) {
    throw new Error("Missing category id.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    throw new Error(`Unable to delete category: ${error.message}`);
  }
  if (!data || data.length === 0) {
    throw new Error("Unable to delete category. You may not have permission.");
  }

  revalidatePath("/admin/categories");
  revalidatePath("/admin");
}
