import { describe, expect, it } from "vitest";

import { JOBS_PER_PAGE, parsePage, sanitizeSearchTerm } from "@/lib/jobs/queries";

/**
 * These guard the two places where a visitor's raw query string reaches the
 * database layer.
 */

describe("sanitizeSearchTerm", () => {
  it("keeps ordinary search text intact", () => {
    expect(sanitizeSearchTerm("java developer")).toBe("java developer");
    expect(sanitizeSearchTerm("  Lahore  ")).toBe("Lahore");
  });

  it("strips characters that are PostgREST filter grammar", () => {
    // Commas separate filter clauses and parentheses group them, so an
    // unstripped term could change the shape of the query.
    expect(sanitizeSearchTerm("a,b")).toBe("a b");
    expect(sanitizeSearchTerm("x)or(status.eq.draft")).not.toContain(")");
    expect(sanitizeSearchTerm("x)or(status.eq.draft")).not.toContain("(");
    expect(sanitizeSearchTerm("a:b")).toBe("a b");
  });

  it("strips LIKE wildcards so a term cannot match everything", () => {
    expect(sanitizeSearchTerm("%")).toBe("");
    expect(sanitizeSearchTerm("_")).toBe("");
    expect(sanitizeSearchTerm("%%%")).toBe("");
    expect(sanitizeSearchTerm("a%b")).toBe("a b");
  });

  it("strips quotes and backslashes", () => {
    expect(sanitizeSearchTerm('"quoted"')).toBe("quoted");
    expect(sanitizeSearchTerm("back\\slash")).toBe("back slash");
  });

  it("collapses whitespace and caps the length", () => {
    expect(sanitizeSearchTerm("a    b")).toBe("a b");
    expect(sanitizeSearchTerm("x".repeat(500))).toHaveLength(100);
  });
});

describe("parsePage", () => {
  it("defaults to the first page", () => {
    expect(parsePage(undefined)).toBe(1);
    expect(parsePage("")).toBe(1);
    expect(parsePage("abc")).toBe(1);
  });

  it("rejects zero and negative pages", () => {
    expect(parsePage("0")).toBe(1);
    expect(parsePage("-5")).toBe(1);
  });

  it("reads a valid page number", () => {
    expect(parsePage("2")).toBe(2);
    expect(parsePage("37")).toBe(37);
  });

  it("clamps absurd page numbers", () => {
    // Without a cap, a hand-edited URL would ask the database for an enormous
    // offset. PostgREST answers an out-of-range offset with 416, which the
    // listing query translates into an empty page rather than an error.
    expect(parsePage("999999999")).toBe(10_000);
    expect(parsePage("1e9")).toBe(1);
  });
});

describe("JOBS_PER_PAGE", () => {
  it("is a sensible page size", () => {
    expect(JOBS_PER_PAGE).toBe(12);
  });
});
