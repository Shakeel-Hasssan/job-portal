import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

/**
 * Refreshes the Supabase auth session on every matched request.
 *
 * Server Components cannot write cookies, so without this the access token
 * would never be rotated and users would be silently logged out when it
 * expires. The refreshed cookies are attached to the response returned here.
 *
 * This is a convenience layer only - it is NOT the authorization boundary.
 * Every protected page performs its own server-side admin check via
 * lib/auth/admin.ts.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const { url, publishableKey } = getSupabaseEnv();

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return request.cookies.getAll();
    },
    setAll(cookiesToSet) {
      for (const { name, value } of cookiesToSet) {
        request.cookies.set(name, value);
      }
      response = NextResponse.next({ request });
      for (const { name, value, options } of cookiesToSet) {
        response.cookies.set(name, value, options);
      }
    },
  };

  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: cookieMethods,
  });

  // Revalidates the token with Supabase and rotates cookies when needed.
  // Do not remove: calling getUser() is what triggers the refresh.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Cheap early redirect for anonymous visitors. Real enforcement still lives
  // in the admin layout, which re-checks the session and the admin allow-list.
  const { pathname } = request.nextUrl;
  const isAdminArea = pathname === "/admin" || pathname.startsWith("/admin/");
  const isPublicAuthRoute =
    pathname.startsWith("/admin/login") ||
    pathname.startsWith("/admin/forgot-password") ||
    pathname.startsWith("/admin/reset-password");

  if (isAdminArea && !isPublicAuthRoute && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.search = "";
    // Preserve where the user was heading so login can send them back.
    if (pathname !== "/admin") {
      loginUrl.searchParams.set("next", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return response;
}
