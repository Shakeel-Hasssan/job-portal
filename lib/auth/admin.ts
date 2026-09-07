import "server-only";

import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/**
 * Server-side authentication and administrator authorization.
 *
 * Always uses supabase.auth.getUser(), which revalidates the JWT against the
 * Supabase auth server. Never use getSession() for authorization decisions - it
 * only decodes the cookie and therefore trusts data supplied by the browser.
 *
 * Administrator status is resolved by the database itself through the
 * is_admin() SECURITY DEFINER function, which consults the admin_users
 * allow-list. A user id from the client is never trusted.
 */

/** The signed-in user, or null. Does not redirect. */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) return null;
  return user;
}

/** Whether the signed-in user is on the admin allow-list. */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase.rpc("is_admin");
  if (error) return false;
  return data === true;
}

export type AdminSession = {
  user: User;
};

/**
 * Guard for protected admin pages and server actions.
 *
 * Redirects anonymous visitors to the login page, and authenticated users who
 * are not administrators to the login page with an explanatory error. Returns
 * the verified user when access is granted.
 */
export async function requireAdmin(): Promise<AdminSession> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: adminFlag, error } = await supabase.rpc("is_admin");
  if (error || adminFlag !== true) {
    redirect("/admin/login?error=not_authorized");
  }

  return { user };
}
