"use client";

import { useActionState } from "react";

import { requestPasswordResetAction, type AuthFormState } from "@/lib/auth/actions";
import { Field, FormMessage } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

const initialState: AuthFormState = {};

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(
    requestPasswordResetAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.error ? <FormMessage tone="error">{state.error}</FormMessage> : null}
      {state.success ? (
        <FormMessage tone="success">{state.success}</FormMessage>
      ) : null}

      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="username"
        required
        error={state.fieldErrors?.email}
      />

      <SubmitButton pendingLabel="Sending...">Send reset link</SubmitButton>
    </form>
  );
}
