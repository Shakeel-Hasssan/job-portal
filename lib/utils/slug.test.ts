import { describe, expect, it } from "vitest";

import { generateUniqueSlug, slugify, withSuffix } from "@/lib/utils/slug";

describe("slugify", () => {
  it("produces the documented slug for the example title", () => {
    expect(slugify("Senior Java Developer Jobs in Lahore")).toBe(
      "senior-java-developer-jobs-in-lahore",
    );
  });

  it("lowercases and collapses separators", () => {
    expect(slugify("  Front End   Developer!! ")).toBe("front-end-developer");
    expect(slugify("C++ / C# Engineer")).toBe("c-c-engineer");
  });

  it("strips diacritics rather than dropping the letters", () => {
    expect(slugify("Ingénieur Réseau")).toBe("ingenieur-reseau");
  });

  it("removes apostrophes without leaving a stray hyphen", () => {
    expect(slugify("Developer's Assistant")).toBe("developers-assistant");
    expect(slugify("Developer’s Assistant")).toBe("developers-assistant");
  });

  it("rejects characters that would be unsafe in a URL", () => {
    expect(slugify("../../etc/passwd")).toBe("etc-passwd");
    expect(slugify("<script>alert(1)</script>")).toBe("script-alert-1-script");
    expect(slugify("job?a=1&b=2")).toBe("job-a-1-b-2");
  });

  it("returns an empty string when there is nothing usable", () => {
    expect(slugify("!!!")).toBe("");
    expect(slugify("")).toBe("");
  });

  it("caps the length and never ends with a hyphen", () => {
    const slug = slugify("a".repeat(200));
    expect(slug.length).toBeLessThanOrEqual(90);
    expect(slug.endsWith("-")).toBe(false);
  });
});

describe("withSuffix", () => {
  it("leaves the first candidate untouched", () => {
    expect(withSuffix("java-developer", 1)).toBe("java-developer");
  });

  it("appends the counter for later candidates", () => {
    expect(withSuffix("java-developer", 2)).toBe("java-developer-2");
    expect(withSuffix("java-developer", 10)).toBe("java-developer-10");
  });

  it("keeps the total length within the limit", () => {
    const result = withSuffix("a".repeat(90), 12);
    expect(result.length).toBeLessThanOrEqual(90);
    expect(result.endsWith("-12")).toBe(true);
  });
});

describe("generateUniqueSlug", () => {
  const takenBy = (taken: string[]) => async (slug: string) =>
    taken.includes(slug);

  it("uses the plain slug when it is free", async () => {
    const slug = await generateUniqueSlug(
      "Senior Java Developer Jobs in Lahore",
      takenBy([]),
    );
    expect(slug).toBe("senior-java-developer-jobs-in-lahore");
  });

  it("appends -2 on the first collision", async () => {
    const slug = await generateUniqueSlug(
      "Senior Java Developer Jobs in Lahore",
      takenBy(["senior-java-developer-jobs-in-lahore"]),
    );
    expect(slug).toBe("senior-java-developer-jobs-in-lahore-2");
  });

  it("keeps counting past repeated collisions", async () => {
    const slug = await generateUniqueSlug(
      "Java Developer",
      takenBy(["java-developer", "java-developer-2", "java-developer-3"]),
    );
    expect(slug).toBe("java-developer-4");
  });

  it("falls back when the title has no usable characters", async () => {
    const slug = await generateUniqueSlug("!!!", takenBy([]));
    expect(slug).toBe("job");
  });
});
