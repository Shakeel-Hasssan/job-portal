import { describe, expect, it } from "vitest";

import { applicationStepsSchema, jobSchema } from "@/lib/validation/job";

const validJob = {
  title: "Senior Java Developer",
  company_name: "Example Ltd",
  location: "Lahore",
  employment_type: "Full-time",
  salary: "",
  category_id: "",
  description: "A description",
  responsibilities: "",
  requirements: "",
  featured_image_url: "",
  featured_image_path: "",
  featured_image_alt: "",
  seo_title: "",
  seo_description: "",
  seo_keywords: "",
  how_to_apply: [],
  application_url: "https://example.com/apply",
  status: "draft" as const,
};

describe("jobSchema", () => {
  it("accepts a valid job", () => {
    const result = jobSchema.safeParse(validJob);
    expect(result.success).toBe(true);
  });

  it("turns blank optional fields into null rather than empty strings", () => {
    const result = jobSchema.parse(validJob);
    expect(result.salary).toBeNull();
    expect(result.category_id).toBeNull();
    expect(result.seo_title).toBeNull();
  });

  it("requires a title of a sensible length", () => {
    expect(jobSchema.safeParse({ ...validJob, title: "" }).success).toBe(false);
    expect(jobSchema.safeParse({ ...validJob, title: "ab" }).success).toBe(false);
  });

  it("rejects dangerous application URLs", () => {
    for (const url of [
      "javascript:alert(1)",
      "data:text/html,<script>alert(1)</script>",
      "vbscript:msgbox(1)",
      "file:///etc/passwd",
      "not a url",
      "",
    ]) {
      const result = jobSchema.safeParse({ ...validJob, application_url: url });
      expect(result.success, `expected ${url} to be rejected`).toBe(false);
    }
  });

  it("accepts http and https application URLs", () => {
    expect(
      jobSchema.safeParse({ ...validJob, application_url: "http://example.com" })
        .success,
    ).toBe(true);
  });

  it("only allows the two known statuses", () => {
    expect(jobSchema.safeParse({ ...validJob, status: "published" }).success).toBe(
      true,
    );
    expect(jobSchema.safeParse({ ...validJob, status: "archived" }).success).toBe(
      false,
    );
  });

  it("rejects slugs containing unsafe characters", () => {
    expect(jobSchema.safeParse({ ...validJob, slug: "../etc" }).success).toBe(false);
    expect(jobSchema.safeParse({ ...validJob, slug: "Has Spaces" }).success).toBe(
      false,
    );
    expect(jobSchema.safeParse({ ...validJob, slug: "valid-slug-1" }).success).toBe(
      true,
    );
  });

  it("rejects a non-uuid category id", () => {
    expect(
      jobSchema.safeParse({ ...validJob, category_id: "not-a-uuid" }).success,
    ).toBe(false);
  });
});

describe("applicationStepsSchema", () => {
  it("renumbers steps into display order", () => {
    const parsed = applicationStepsSchema.parse([
      { step: 7, title: "Second", description: "b" },
      { step: 3, title: "First", description: "a" },
    ]);
    expect(parsed.map((s) => s.step)).toEqual([1, 2]);
    expect(parsed[0].title).toBe("Second");
  });

  it("requires a step title", () => {
    const result = applicationStepsSchema.safeParse([
      { step: 1, title: "", description: "x" },
    ]);
    expect(result.success).toBe(false);
  });

  it("defaults a missing description to an empty string", () => {
    const parsed = applicationStepsSchema.parse([{ step: 1, title: "Apply" }]);
    expect(parsed[0].description).toBe("");
  });

  it("accepts an empty list", () => {
    expect(applicationStepsSchema.parse([])).toEqual([]);
  });

  it("caps the number of steps", () => {
    const many = Array.from({ length: 21 }, (_, i) => ({
      step: i + 1,
      title: `Step ${i + 1}`,
      description: "",
    }));
    expect(applicationStepsSchema.safeParse(many).success).toBe(false);
  });
});
