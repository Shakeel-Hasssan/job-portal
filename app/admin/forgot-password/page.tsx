import type { Metadata } from "next";
import Link from "next/link";

import { ForgotPasswordForm } from "@/components/admin/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset your password",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-neutral-900">
          Reset your password
        </h1>
        <p className="mt-1 mb-6 text-sm text-neutral-600">
          Enter your administrator email and we will send you a reset link.
        </p>

        <ForgotPasswordForm />

        <p className="mt-6 text-center text-sm">
          <Link
            href="/admin/login"
            className="text-neutral-600 underline underline-offset-2 hover:text-neutral-900"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
