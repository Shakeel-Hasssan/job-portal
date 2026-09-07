import type { Metadata } from "next";
import Link from "next/link";

import { ResetPasswordForm } from "@/components/admin/reset-password-form";
import { getCurrentUser } from "@/lib/auth/admin";

export const metadata: Metadata = {
  title: "Set a new password",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage() {
  // Reaching this page requires the recovery session created by /auth/callback.
  const user = await getCurrentUser();

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-neutral-900">
          Set a new password
        </h1>

        {user ? (
          <>
            <p className="mt-1 mb-6 text-sm text-neutral-600">
              Choose a new password for {user.email}.
            </p>
            <ResetPasswordForm />
          </>
        ) : (
          <>
            <p
              role="alert"
              className="mt-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800"
            >
              This reset link is invalid or has expired. Request a new one to
              continue.
            </p>
            <p className="mt-6 text-center text-sm">
              <Link
                href="/admin/forgot-password"
                className="text-neutral-600 underline underline-offset-2 hover:text-neutral-900"
              >
                Request a new reset link
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
