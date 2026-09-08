import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_BYTES,
  STORAGE_BUCKET,
  type AllowedImageMimeType,
} from "@/lib/types";

/**
 * Featured image storage helpers.
 *
 * Uploads go directly from the browser to Supabase Storage using the
 * administrator's session, so a 5 MB image never has to pass through a server
 * action body. The bucket itself enforces the size limit and MIME allow-list
 * (see supabase/migrations/002_storage.sql), and its RLS policies restrict
 * writes to administrators - the checks here are for fast feedback, not
 * security.
 */

const EXTENSION_BY_MIME: Record<AllowedImageMimeType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function isAllowedImageMimeType(
  value: string,
): value is AllowedImageMimeType {
  return (ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(value);
}

export type ImageValidationResult =
  | { ok: true; mimeType: AllowedImageMimeType }
  | { ok: false; message: string };

/** Checks a selected file before attempting an upload. */
export function validateImageFile(file: File): ImageValidationResult {
  if (!isAllowedImageMimeType(file.type)) {
    return {
      ok: false,
      message: "Choose a JPEG, PNG or WebP image.",
    };
  }

  if (file.size > MAX_IMAGE_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      ok: false,
      message: `That image is ${mb} MB. The maximum size is 5 MB.`,
    };
  }

  if (file.size === 0) {
    return { ok: false, message: "That file is empty." };
  }

  return { ok: true, mimeType: file.type };
}

/**
 * Builds a safe, unique storage path.
 *
 * The original filename is never used: it could contain path traversal
 * sequences, unicode tricks, or simply collide with another upload. The
 * extension is derived from the validated MIME type rather than the name.
 */
export function buildImagePath(mimeType: AllowedImageMimeType): string {
  const extension = EXTENSION_BY_MIME[mimeType];
  return `jobs/${crypto.randomUUID()}.${extension}`;
}

export { STORAGE_BUCKET };
