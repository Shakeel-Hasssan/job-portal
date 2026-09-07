import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { safeRedirectPath } from "@/lib/validation/auth";

/**
 * Exchanges the one-time code from a Supabase email link (password recovery,
 * email confirmation) for a session cookie, then forwards the user onward.
 *
 * The `next` parameter is constrained to relative paths so a crafted link
 * cannot turn this route into an open redirect.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeRedirectPath(
    searchParams.get("next"),
    "/admin/reset-password",
  );

  if (!code) {
    return NextResponse.redirect(`${origin}/admin/login?error=invalid_link`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/admin/login?error=invalid_link`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
