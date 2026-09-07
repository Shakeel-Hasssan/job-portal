import type { InputHTMLAttributes, ReactNode } from "react";

type FieldProps = {
  label: string;
  name: string;
  error?: string;
  hint?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>;

/**
 * Labelled form input with accessible error wiring.
 *
 * The error is announced via aria-describedby and marked with aria-invalid, and
 * is shown with an icon as well as colour so state is not communicated by
 * colour alone.
 */
export function Field({ label, name, error, hint, id, ...inputProps }: FieldProps) {
  const inputId = id ?? name;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-sm font-medium text-neutral-800">
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`w-full rounded-md border px-3 py-2 text-sm text-neutral-900 outline-none transition focus:ring-2 focus:ring-offset-1 ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-neutral-300 focus:border-neutral-500 focus:ring-neutral-400"
        }`}
        {...inputProps}
      />
      {hint ? (
        <p id={hintId} className="text-xs text-neutral-500">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="flex items-start gap-1 text-sm text-red-700">
          <span aria-hidden="true">⚠</span>
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}

/** Form-level alert used for success and error banners. */
export function FormMessage({
  tone,
  children,
}: {
  tone: "error" | "success";
  children: ReactNode;
}) {
  const isError = tone === "error";
  return (
    <div
      role={isError ? "alert" : "status"}
      className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${
        isError
          ? "border-red-300 bg-red-50 text-red-800"
          : "border-green-300 bg-green-50 text-green-800"
      }`}
    >
      <span aria-hidden="true">{isError ? "⚠" : "✓"}</span>
      <span>{children}</span>
    </div>
  );
}
