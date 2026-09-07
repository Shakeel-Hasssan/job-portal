import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/login-form";
import { signOutAction } from "@/lib/auth/actions";
import { getCurrentUser, isCurrentUserAdmin } from "@/lib/auth/admin";
import { safeRedirectPath } from "@/lib/validation/auth";

export const metadata: Metadata = {
  title: "Administrator sign in",
  // The admin area must never be indexed.
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; reset?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();

  // Already signed in and authorized: skip the form.
  if (user && (await isCurrentUserAdmin())) {
    redirect(safeRedirectPath(params.next));
  }

  const notice =
    params.error === "not_authorized"
      ? {
          tone: "error" as const,
          message:
            "That account is signed in but is not an administrator of this site.",
        }
      : params.error === "invalid_link"
        ? {
            tone: "error" as const,
            message:
              "That link is invalid or has expired. Request a new password reset link.",
          }
        : params.reset === "success"
          ? {
              tone: "success" as const,
              message: "Your password has been updated. Sign in with it below.",
            }
          : undefined;

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-neutral-900">
            Administrator sign in
          </h1>
          <p className="mt-1 mb-6 text-sm text-neutral-600">
            Restricted area. Accounts are created by an existing administrator.
          </p>

          <LoginForm next={params.next} notice={notice} />
        </div>

        {user ? (
          <form action={signOutAction} className="mt-4 text-center">
            <p className="text-sm text-neutral-600">
              Currently signed in as {user.email}.
            </p>
            <button
              type="submit"
              className="mt-1 text-sm text-neutral-700 underline underline-offset-2 hover:text-neutral-900"
            >
              Sign out
            </button>
          </form>
        ) : null}
      </div>
    </main>
  );
}
