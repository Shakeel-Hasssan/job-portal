/**
 * URL safety helpers.
 *
 * Application links point at third-party websites, so every URL is checked
 * before it is stored and before it is rendered as an href. Only http and
 * https are ever allowed - javascript:, data:, vbscript:, file: and friends
 * are rejected. The database enforces the same rule with a check constraint.
 */

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

/** True when the value is a well-formed http(s) URL. */
export function isSafeExternalUrl(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length === 0) return false;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return false;
  }

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) return false;
  // Reject things like "https://" with no host.
  if (parsed.hostname.length === 0) return false;

  return true;
}

/**
 * Returns the URL when it is safe to use as an href, otherwise null.
 * Render an apply button only when this returns a value.
 */
export function safeExternalUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return isSafeExternalUrl(trimmed) ? trimmed : null;
}

/** Hostname for display next to an outbound link, or null when unsafe. */
export function externalUrlHost(value: string | null | undefined): string | null {
  const safe = safeExternalUrl(value);
  if (!safe) return null;
  try {
    return new URL(safe).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}
