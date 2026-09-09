/**
 * Test stub for the `server-only` package.
 *
 * That package throws when imported outside a server context, which would stop
 * Vitest from loading modules that guard themselves with it. Aliased in
 * vitest.config.ts so the pure helpers in those modules stay testable.
 */
export {};
