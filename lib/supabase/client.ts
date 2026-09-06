import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

/**
 * Supabase client for Client Components.
 *
 * Uses the publishable (anon) key only - every query is still gated by Row
 * Level Security. @supabase/ssr keeps the session in cookies so that the
 * server-side client in lib/supabase/server.ts sees the same session.
 */
export function createClient() {
  const { url, publishableKey } = getSupabaseEnv();
  return createBrowserClient<Database>(url, publishableKey);
}
