import { describe, expect, it } from "vitest";

import { externalUrlHost, isSafeExternalUrl, safeExternalUrl } from "@/lib/utils/url";

describe("isSafeExternalUrl", () => {
  it("accepts http and https", () => {
    expect(isSafeExternalUrl("https://example.com/careers")).toBe(true);
    expect(isSafeExternalUrl("http://example.com")).toBe(true);
    expect(isSafeExternalUrl("  https://example.com/apply?id=1  ")).toBe(true);
  });

  it("rejects script-bearing protocols", () => {
    expect(isSafeExternalUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeExternalUrl("JavaScript:alert(1)")).toBe(false);
    expect(isSafeExternalUrl("  javascript:alert(1)")).toBe(false);
    expect(isSafeExternalUrl("data:text/html,<script>alert(1)</script>")).toBe(false);
    expect(isSafeExternalUrl("vbscript:msgbox(1)")).toBe(false);
  });

  it("rejects other non-web protocols", () => {
    expect(isSafeExternalUrl("file:///etc/passwd")).toBe(false);
    expect(isSafeExternalUrl("ftp://example.com")).toBe(false);
    expect(isSafeExternalUrl("mailto:jobs@example.com")).toBe(false);
  });

  it("rejects malformed input", () => {
    expect(isSafeExternalUrl("")).toBe(false);
    expect(isSafeExternalUrl("   ")).toBe(false);
    expect(isSafeExternalUrl("not a url")).toBe(false);
    expect(isSafeExternalUrl("example.com")).toBe(false);
    expect(isSafeExternalUrl("https://")).toBe(false);
  });
});

describe("safeExternalUrl", () => {
  it("returns the trimmed url when safe", () => {
    expect(safeExternalUrl(" https://example.com ")).toBe("https://example.com");
  });

  it("returns null for unsafe or missing values", () => {
    expect(safeExternalUrl("javascript:alert(1)")).toBeNull();
    expect(safeExternalUrl(null)).toBeNull();
    expect(safeExternalUrl(undefined)).toBeNull();
    expect(safeExternalUrl("")).toBeNull();
  });
});

describe("externalUrlHost", () => {
  it("returns the hostname without a www prefix", () => {
    expect(externalUrlHost("https://www.example.com/apply")).toBe("example.com");
    expect(externalUrlHost("https://careers.example.co.uk/x")).toBe(
      "careers.example.co.uk",
    );
  });

  it("returns null for unsafe urls", () => {
    expect(externalUrlHost("javascript:alert(1)")).toBeNull();
    expect(externalUrlHost(null)).toBeNull();
  });
});
