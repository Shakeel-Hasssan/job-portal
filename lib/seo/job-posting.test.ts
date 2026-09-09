import { describe, expect, it } from "vitest";

import { buildJobPostingSchema, serializeJsonLd } from "@/lib/seo/job-posting";
import type { JobWithCategory } from "@/lib/types";

const baseJob: JobWithCategory = {
  id: "00000000-0000-4000-8000-000000000000",
  title: "Frontend Developer",
  slug: "frontend-developer",
  company_name: null,
  location: null,
  employment_type: null,
  salary: null,
  category_id: null,
  description: "Build interfaces.",
  responsibilities: null,
  requirements: null,
  featured_image_url: null,
  featured_image_path: null,
  featured_image_alt: null,
  seo_title: null,
  seo_description: null,
  seo_keywords: null,
  how_to_apply: [],
  application_url: "https://example.com/apply",
  status: "published",
  published_at: "2026-01-15T10:00:00.000Z",
  created_at: "2026-01-15T10:00:00.000Z",
  updated_at: "2026-01-15T10:00:00.000Z",
  category: null,
};

describe("buildJobPostingSchema", () => {
  it("emits the core properties", () => {
    const schema = buildJobPostingSchema(baseJob);
    expect(schema["@type"]).toBe("JobPosting");
    expect(schema.title).toBe("Frontend Developer");
    expect(schema.datePosted).toBe("2026-01-15T10:00:00.000Z");
    expect(schema.directApply).toBe(false);
  });

  it("omits properties that are not known rather than inventing them", () => {
    const schema = buildJobPostingSchema(baseJob);
    expect(schema).not.toHaveProperty("hiringOrganization");
    expect(schema).not.toHaveProperty("jobLocation");
    expect(schema).not.toHaveProperty("employmentType");
    expect(schema).not.toHaveProperty("occupationalCategory");
  });

  it("never emits baseSalary, because the salary column is free text", () => {
    const schema = buildJobPostingSchema({
      ...baseJob,
      salary: "PKR 200,000 - 300,000 per month",
    });
    expect(schema).not.toHaveProperty("baseSalary");
  });

  it("omits datePosted when the job has no publication date", () => {
    const schema = buildJobPostingSchema({ ...baseJob, published_at: null });
    expect(schema).not.toHaveProperty("datePosted");
  });

  it("includes the employer and place when they are known", () => {
    const schema = buildJobPostingSchema({
      ...baseJob,
      company_name: "Example Ltd",
      location: "Lahore",
    });
    expect(schema.hiringOrganization).toEqual({
      "@type": "Organization",
      name: "Example Ltd",
    });
    expect(schema.jobLocation).toEqual({
      "@type": "Place",
      address: { "@type": "PostalAddress", addressLocality: "Lahore" },
    });
  });

  it("maps employment types onto the schema.org enumeration", () => {
    const cases: [string, string][] = [
      ["Full-time", "FULL_TIME"],
      ["Part-time", "PART_TIME"],
      ["Contract", "CONTRACTOR"],
      ["Internship", "INTERN"],
    ];
    for (const [input, expected] of cases) {
      const schema = buildJobPostingSchema({ ...baseJob, employment_type: input });
      expect(schema.employmentType).toBe(expected);
    }
  });

  it("omits employmentType for values with no schema equivalent", () => {
    // "Remote" is a work arrangement, not an employment type.
    const schema = buildJobPostingSchema({ ...baseJob, employment_type: "Remote" });
    expect(schema).not.toHaveProperty("employmentType");
  });
});

describe("serializeJsonLd", () => {
  it("escapes characters that could break out of a script tag", () => {
    const output = serializeJsonLd({ title: "</script><img onerror=alert(1)>" });
    expect(output).not.toContain("</script>");
    expect(output).not.toContain("<");
    expect(output).not.toContain(">");
    expect(output).toContain("\\u003c");
  });

  it("escapes ampersands and unicode line separators", () => {
    // U+2028/U+2029 are valid in JSON but are line terminators in JavaScript
    // source, so an unescaped one would break the inlined script tag.
    const lineSep = String.fromCharCode(0x2028);
    const paraSep = String.fromCharCode(0x2029);
    const output = serializeJsonLd({
      a: "x & y",
      b: `line${lineSep}sep${paraSep}end`,
    });
    expect(output).toContain("\\u0026");
    expect(output).toContain("\\u2028");
    expect(output).toContain("\\u2029");
    expect(output).not.toContain(lineSep);
    expect(output).not.toContain(paraSep);
  });

  it("still produces valid JSON", () => {
    const schema = buildJobPostingSchema({
      ...baseJob,
      company_name: "A & B <Ltd>",
    });
    expect(() => JSON.parse(serializeJsonLd(schema))).not.toThrow();
    const parsed = JSON.parse(serializeJsonLd(schema)) as Record<string, unknown>;
    expect((parsed.hiringOrganization as { name: string }).name).toBe("A & B <Ltd>");
  });
});
