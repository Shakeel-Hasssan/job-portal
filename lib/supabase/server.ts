import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabaseEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 *
 * The session lives in cookies, so this client always acts as the currently
 * signed-in user and is subject to Row Level Security. Never use the service
 * role key here.
 *
 * Must be called per request - do not hoist the returned client into a
 * module-level singleton, or requests would share another user's session.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const { url, publishableKey } = getSupabaseEnv();

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return cookieStore.getAll();
    },
    setAll(cookiesToSet) {
      try {
        for (const { name, value, options } of cookiesToSet) {
          cookieStore.set(name, value, options);
        }
      } catch {
        // Server Components cannot set cookies. This is safe to ignore
        // because the middleware added in Phase 3 refreshes the session on
        // every request.
      }
    },
  };

  return createServerClient<Database>(url, publishableKey, {
    cookies: cookieMethods,
  });
}
