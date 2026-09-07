"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signInAction, type AuthFormState } from "@/lib/auth/actions";
import { Field, FormMessage } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

const initialState: AuthFormState = {};

export function LoginForm({
  next,
  notice,
}: {
  next?: string;
  notice?: { tone: "error" | "success"; message: string };
}) {
  const [state, formAction] = useActionState(signInAction, initialState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {notice ? (
        <FormMessage tone={notice.tone}>{notice.message}</FormMessage>
      ) : null}

      {state.error ? <FormMessage tone="error">{state.error}</FormMessage> : null}

      {next ? <input type="hidden" name="next" value={next} /> : null}

      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="username"
        required
        error={state.fieldErrors?.email}
      />

      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        error={state.fieldErrors?.password}
      />

      <SubmitButton pendingLabel="Signing in...">Sign in</SubmitButton>

      <p className="text-center text-sm">
        <Link
          href="/admin/forgot-password"
          className="text-neutral-600 underline underline-offset-2 hover:text-neutral-900"
        >
          Forgot your password?
        </Link>
      </p>
    </form>
  );
}
