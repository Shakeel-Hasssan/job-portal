import { describe, expect, it } from "vitest";

import { isApplicationStep, isJobStatus, parseApplicationSteps } from "@/lib/types";

describe("parseApplicationSteps", () => {
  it("reads well-formed steps in step order", () => {
    const steps = parseApplicationSteps([
      { step: 2, title: "Second", description: "b" },
      { step: 1, title: "First", description: "a" },
    ]);
    expect(steps.map((s) => s.title)).toEqual(["First", "Second"]);
  });

  it("discards malformed entries instead of throwing", () => {
    const steps = parseApplicationSteps([
      { step: 1, title: "Good", description: "ok" },
      { step: "2", title: "Bad step type", description: "x" },
      { title: "Missing step" },
      null,
      "not an object",
      42,
    ]);
    expect(steps).toHaveLength(1);
    expect(steps[0].title).toBe("Good");
  });

  it("returns an empty array for non-array JSON", () => {
    expect(parseApplicationSteps(null)).toEqual([]);
    expect(parseApplicationSteps({})).toEqual([]);
    expect(parseApplicationSteps("steps")).toEqual([]);
    expect(parseApplicationSteps(7)).toEqual([]);
  });
});

describe("isApplicationStep", () => {
  it("accepts a complete step", () => {
    expect(isApplicationStep({ step: 1, title: "t", description: "d" })).toBe(true);
  });

  it("rejects arrays, null and partial objects", () => {
    expect(isApplicationStep([])).toBe(false);
    expect(isApplicationStep(null)).toBe(false);
    expect(isApplicationStep({ step: 1, title: "t" })).toBe(false);
  });
});

describe("isJobStatus", () => {
  it("recognises the two valid statuses", () => {
    expect(isJobStatus("draft")).toBe(true);
    expect(isJobStatus("published")).toBe(true);
  });

  it("rejects anything else", () => {
    expect(isJobStatus("archived")).toBe(false);
    expect(isJobStatus("")).toBe(false);
  });
});
