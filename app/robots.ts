import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/env";

/**
 * robots.txt
 *
 * Public content stays fully crawlable - /jobs, /jobs/[slug] and /category are
 * deliberately not listed under any disallow rule. Only the admin area, the
 * auth callback and private API paths are blocked.
 *
 * Note that Disallow is a crawling directive, not an access control: the admin
 * area is protected by server-side authorization, not by this file.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/auth/", "/api/private/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
