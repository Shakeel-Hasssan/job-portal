import { z } from "zod";

import { isSafeExternalUrl } from "@/lib/utils/url";

/**
 * Validation for the job form.
 *
 * The same schema runs in the browser (for immediate feedback) and again in the
 * server action, which is the authoritative check - a client can post anything.
 */

/** Trims a value and turns blanks into null, so empty inputs are not stored as "". */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Must be ${max} characters or fewer`)
    .transform((value) => (value.length === 0 ? null : value))
    .nullable();

export const applicationStepSchema = z.object({
  step: z.number().int().min(1),
  title: z
    .string()
    .trim()
    .min(1, "Step title is required")
    .max(200, "Step title must be 200 characters or fewer"),
  description: z
    .string()
    .trim()
    .max(2000, "Step description must be 2000 characters or fewer")
    .default(""),
});

export type ApplicationStepInput = z.infer<typeof applicationStepSchema>;

export const applicationStepsSchema = z
  .array(applicationStepSchema)
  .max(20, "A job can have at most 20 application steps")
  // Renumber so the stored steps are always 1..n in display order, whatever
  // the client sent.
  .transform((steps) =>
    steps.map((step, index) => ({ ...step, step: index + 1 })),
  );

export const jobSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Job title must be at least 3 characters")
    .max(200, "Job title must be 200 characters or fewer"),

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

  company_name: optionalText(200),
  location: optionalText(200),
  employment_type: optionalText(100),
  salary: optionalText(100),

  category_id: z
    .string()
    .trim()
    .uuid("Select a valid category")
    .nullable()
    .or(z.literal("").transform(() => null)),

  description: optionalText(20000),
  responsibilities: optionalText(20000),
  requirements: optionalText(20000),

  featured_image_url: optionalText(2000),
  featured_image_path: optionalText(500),
  featured_image_alt: optionalText(300),

  seo_title: optionalText(200),
  seo_description: optionalText(400),
  seo_keywords: optionalText(400),

  how_to_apply: applicationStepsSchema,

  application_url: z
    .string()
    .trim()
    .min(1, "Application URL is required")
    .refine(isSafeExternalUrl, {
      message: "Enter a valid http:// or https:// link",
    }),

  status: z.enum(["draft", "published"], {
    errorMap: () => ({ message: "Status must be draft or published" }),
  }),
});

export type JobInput = z.infer<typeof jobSchema>;

/**
 * Parses a submitted job form.
 *
 * Application steps arrive as a JSON string in a hidden field because HTML
 * forms cannot express nested arrays.
 */
export function parseJobForm(formData: FormData) {
  let steps: unknown = [];
  const rawSteps = formData.get("how_to_apply");
  if (typeof rawSteps === "string" && rawSteps.trim().length > 0) {
    try {
      steps = JSON.parse(rawSteps);
    } catch {
      steps = null; // Surfaces as a validation error below.
    }
  }

  return jobSchema.safeParse({
    title: formData.get("title") ?? "",
    slug: formData.get("slug") ?? "",
    company_name: formData.get("company_name") ?? "",
    location: formData.get("location") ?? "",
    employment_type: formData.get("employment_type") ?? "",
    salary: formData.get("salary") ?? "",
    category_id: formData.get("category_id") ?? "",
    description: formData.get("description") ?? "",
    responsibilities: formData.get("responsibilities") ?? "",
    requirements: formData.get("requirements") ?? "",
    featured_image_url: formData.get("featured_image_url") ?? "",
    featured_image_path: formData.get("featured_image_path") ?? "",
    featured_image_alt: formData.get("featured_image_alt") ?? "",
    seo_title: formData.get("seo_title") ?? "",
    seo_description: formData.get("seo_description") ?? "",
    seo_keywords: formData.get("seo_keywords") ?? "",
    how_to_apply: steps,
    application_url: formData.get("application_url") ?? "",
    status: formData.get("status") ?? "draft",
  });
}

/** Collapses Zod issues into one message per field for rendering next to inputs. */
export function collectFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }
  return fieldErrors;
}
