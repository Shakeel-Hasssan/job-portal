import type { Metadata } from "next";

import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Authorization boundary for every protected admin page.
 *
 * requireAdmin() revalidates the JWT with Supabase and checks the admin
 * allow-list in the database on each request. The middleware redirect is only a
 * convenience; this is the check that actually protects the pages. Individual
 * mutations re-check as well, since a layout cannot guard a server action.
 */
export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAdmin();

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminNav email={user.email ?? "Administrator"} />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
