import { z } from "zod";

/**
 * Environment access, validated with Zod.
 *
 * Two rules govern this file:
 *
 * 1. `process.env.NEXT_PUBLIC_*` is written out literally so that Next.js can
 *    statically inline the values into the client bundle. Do not refactor these
 *    into dynamic lookups such as process.env[key].
 * 2. Validation happens lazily, on first use, rather than at import time. A
 *    missing variable then surfaces as a clear runtime error instead of
 *    breaking `next build` for people who have not configured Supabase yet.
 *
 * Server-only secrets (e.g. SUPABASE_SERVICE_ROLE_KEY) must never be read from
 * this module's public helpers - see getServiceRoleKey() for the guard.
 */

const supabaseEnvSchema = z.object({
  url: z
    .string({ required_error: "NEXT_PUBLIC_SUPABASE_URL is not set" })
    .min(1, "NEXT_PUBLIC_SUPABASE_URL is not set")
    .url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  publishableKey: z
    .string({ required_error: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not set" })
    .min(1, "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not set"),
});

export type SupabaseEnv = z.infer<typeof supabaseEnvSchema>;

let cachedSupabaseEnv: SupabaseEnv | null = null;

/**
 * Public Supabase credentials. Safe to use in both server and client code -
 * the publishable (anon) key is designed to be exposed to the browser and is
 * only useful in combination with Row Level Security.
 */
export function getSupabaseEnv(): SupabaseEnv {
  if (cachedSupabaseEnv) return cachedSupabaseEnv;

  const parsed = supabaseEnvSchema.safeParse({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });

  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => issue.message).join("; ");
    throw new Error(
      `Supabase environment is not configured: ${details}. ` +
        "Copy .env.example to .env.local and fill in the values from your " +
        "Supabase project settings.",
    );
  }

  cachedSupabaseEnv = parsed.data;
  return cachedSupabaseEnv;
}

/**
 * Canonical public origin, used for canonical URLs, sitemap entries and Open
 * Graph metadata. Falls back to localhost for local development. Any trailing
 * slash is stripped so callers can safely append paths.
 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const value = raw && raw.length > 0 ? raw : "http://localhost:3000";
  return value.replace(/\/+$/, "");
}

/** Builds an absolute URL against the canonical site origin. */
export function absoluteUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}

/**
 * Server-only Supabase service role key.
 *
 * Throws if called from the browser. This key bypasses Row Level Security, so
 * it must never reach client code. It is not required for normal operation -
 * all current features work with the publishable key plus RLS.
 */
export function getServiceRoleKey(): string {
  if (typeof window !== "undefined") {
    throw new Error("getServiceRoleKey() must never be called in the browser");
  }

  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  return key;
}
