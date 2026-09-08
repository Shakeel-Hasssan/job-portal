import { describe, expect, it } from "vitest";

import { safeRedirectPath } from "@/lib/validation/auth";

/**
 * safeRedirectPath guards the post-login and email-callback redirects. A miss
 * here would let a crafted link bounce an administrator to an attacker's site
 * immediately after authenticating.
 */
describe("safeRedirectPath", () => {
  it("allows in-app absolute paths", () => {
    expect(safeRedirectPath("/admin/jobs")).toBe("/admin/jobs");
    expect(safeRedirectPath("/admin/jobs/new")).toBe("/admin/jobs/new");
  });

  it("falls back to /admin for missing or empty values", () => {
    expect(safeRedirectPath(undefined)).toBe("/admin");
    expect(safeRedirectPath(null)).toBe("/admin");
    expect(safeRedirectPath("")).toBe("/admin");
    expect(safeRedirectPath("   ")).toBe("/admin");
  });

  it("rejects protocol-relative urls", () => {
    expect(safeRedirectPath("//evil.com")).toBe("/admin");
    expect(safeRedirectPath("//evil.com/path")).toBe("/admin");
  });

  it("rejects absolute urls", () => {
    expect(safeRedirectPath("https://evil.com")).toBe("/admin");
    expect(safeRedirectPath("http://evil.com")).toBe("/admin");
    expect(safeRedirectPath("javascript:alert(1)")).toBe("/admin");
  });

  it("rejects backslash tricks", () => {
    expect(safeRedirectPath("/\\evil.com")).toBe("/admin");
    expect(safeRedirectPath("\\\\evil.com")).toBe("/admin");
  });

  it("rejects paths that do not start with a slash", () => {
    expect(safeRedirectPath("admin/jobs")).toBe("/admin");
    expect(safeRedirectPath("evil.com")).toBe("/admin");
  });
});
