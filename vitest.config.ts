import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

/**
 * Unit tests for business logic: slug generation, URL safety, job and
 * application-step validation, and the post-login redirect guard.
 *
 * These deliberately avoid touching Supabase - they cover the pure functions
 * that decide what is safe to store and where a user may be sent.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  // These tests import no CSS. Declaring an empty PostCSS config stops Vite
  // from discovering postcss.config.mjs, whose Tailwind 4 plugin it cannot
  // load through its CJS PostCSS loader.
  css: {
    postcss: { plugins: [] },
  },
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules/**", ".next/**"],
  },
});
