import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name must be 100 characters or fewer"),

  slug: z
    .string()
    .trim()
    .max(90, "Slug must be 90 characters or fewer")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug may only contain lowercase letters, numbers and hyphens",
    )
    .optional()
    .or(z.literal("").transform(() => undefined)),

  description: z
    .string()
    .trim()
    .max(500, "Description must be 500 characters or fewer")
    .transform((value) => (value.length === 0 ? null : value))
    .nullable(),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export function parseCategoryForm(formData: FormData) {
  return categorySchema.safeParse({
    name: formData.get("name") ?? "",
    slug: formData.get("slug") ?? "",
    description: formData.get("description") ?? "",
  });
}
