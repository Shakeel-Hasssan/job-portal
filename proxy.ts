import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

/**
 * Next.js 16 "proxy" convention (the former `middleware.ts`). Runs before every
 * matched request so the Supabase auth session can be refreshed and its cookies
 * rotated onto the response.
 *
 * This is not the authorization boundary - see app/admin/(dashboard)/layout.tsx
 * and lib/auth/admin.ts for the server-side checks that actually protect pages.
 */
export function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Every path except static assets and image files, so the session is
     * refreshed on normal page navigations.
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
