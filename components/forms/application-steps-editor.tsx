"use client";

import { useId, useState } from "react";

import type { ApplicationStep } from "@/lib/types";

/**
 * Structured editor for the "How to apply" instructions.
 *
 * Administrators add, edit, remove and reorder steps; they never write HTML.
 * The result is serialised into a hidden input as JSON because HTML forms
 * cannot express nested arrays.
 */
export function ApplicationStepsEditor({
  name,
  defaultValue,
  onDirty,
}: {
  name: string;
  defaultValue: ApplicationStep[];
  onDirty?: () => void;
}) {
  const [steps, setSteps] = useState<ApplicationStep[]>(defaultValue);
  const baseId = useId();

  const update = (next: ApplicationStep[]) => {
    // Keep step numbers contiguous and in display order.
    setSteps(next.map((step, index) => ({ ...step, step: index + 1 })));
    onDirty?.();
  };

  const addStep = () =>
    update([...steps, { step: steps.length + 1, title: "", description: "" }]);

  const removeStep = (index: number) =>
    update(steps.filter((_, i) => i !== index));

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= steps.length) return;
    const next = [...steps];
    [next[index], next[target]] = [next[target], next[index]];
    update(next);
  };

  const edit = (index: number, patch: Partial<ApplicationStep>) =>
    update(steps.map((s, i) => (i === index ? { ...s, ...patch } : s)));

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(steps)} />

      {steps.length === 0 ? (
        <p className="rounded-md border border-dashed border-neutral-300 px-4 py-6 text-center text-sm text-neutral-600">
          No application steps yet. Add one to tell candidates how to apply.
        </p>
      ) : (
        <ol className="space-y-3">
          {steps.map((step, index) => (
            <li
              key={index}
              className="rounded-md border border-neutral-200 bg-neutral-50 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-neutral-700">
                  Step {index + 1}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label={`Move step ${index + 1} up`}
                    className="rounded border border-neutral-300 bg-white px-2 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === steps.length - 1}
                    aria-label={`Move step ${index + 1} down`}
                    className="rounded border border-neutral-300 bg-white px-2 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeStep(index)}
                    aria-label={`Remove step ${index + 1}`}
                    className="rounded border border-red-300 bg-white px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="mt-2 space-y-2">
                <div>
                  <label
                    htmlFor={`${baseId}-title-${index}`}
                    className="block text-xs font-medium text-neutral-700"
                  >
                    Step title
                  </label>
                  <input
                    id={`${baseId}-title-${index}`}
                    type="text"
                    value={step.title}
                    onChange={(e) => edit(index, { title: e.target.value })}
                    placeholder="Visit the application page"
                    className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor={`${baseId}-desc-${index}`}
                    className="block text-xs font-medium text-neutral-700"
                  >
                    Description
                  </label>
                  <textarea
                    id={`${baseId}-desc-${index}`}
                    value={step.description}
                    onChange={(e) => edit(index, { description: e.target.value })}
                    rows={2}
                    placeholder="Open the official application website."
                    className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                  />
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}

      <button
        type="button"
        onClick={addStep}
        className="mt-3 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500"
      >
        + Add step
      </button>
    </div>
  );
}
