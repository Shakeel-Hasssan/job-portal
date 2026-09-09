import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * OpenNext configuration for Cloudflare Workers.
 *
 * The defaults are deliberate for a first deployment: no incremental cache, no
 * queue, no tag cache. Public pages already declare `revalidate = 60` and are
 * rendered per request, which is correct for a job board where a newly
 * published listing should appear quickly.
 *
 * When traffic justifies it, an R2 incremental cache can be added here
 * (`incrementalCache: r2IncrementalCache`) together with an R2 bucket binding
 * in wrangler.jsonc. That is a deliberate later step, not a default - caching
 * rendered pages introduces staleness that has to be reasoned about.
 */
export default defineCloudflareConfig();
