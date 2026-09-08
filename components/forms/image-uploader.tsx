"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { buildImagePath, validateImageFile } from "@/lib/storage/images";
import { STORAGE_BUCKET } from "@/lib/types";

/**
 * Featured image upload.
 *
 * The file goes straight from the browser to Supabase Storage using the
 * administrator's session, so it never passes through a server action body
 * (which has a 1 MB default limit). Storage RLS restricts writes to
 * administrators and the bucket enforces the size and MIME allow-list.
 *
 * The resulting public URL and object path are kept in hidden inputs and saved
 * with the rest of the form.
 */
export function ImageUploader({
  defaultUrl,
  defaultPath,
  defaultAlt,
  fallbackAlt,
  onDirty,
}: {
  defaultUrl: string | null;
  defaultPath: string | null;
  defaultAlt: string | null;
  fallbackAlt: string;
  onDirty?: () => void;
}) {
  const [url, setUrl] = useState(defaultUrl ?? "");
  const [path, setPath] = useState(defaultPath ?? "");
  const [alt, setAlt] = useState(defaultAlt ?? "");
  const [status, setStatus] = useState<"idle" | "uploading">("idle");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);

    const validation = validateImageFile(file);
    if (!validation.ok) {
      setError(validation.message);
      return;
    }

    setStatus("uploading");
    try {
      const supabase = createClient();
      const objectPath = buildImagePath(validation.mimeType);

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(objectPath, file, {
          contentType: validation.mimeType,
          upsert: false,
        });

      if (uploadError) {
        setError(`Image upload failed: ${uploadError.message}`);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(objectPath);

      setUrl(publicUrl);
      setPath(objectPath);
      onDirty?.();
    } catch (e) {
      setError(
        e instanceof Error ? `Image upload failed: ${e.message}` : "Image upload failed.",
      );
    } finally {
      setStatus("idle");
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeImage() {
    // Clears the reference only. The previous object is deleted by the server
    // action once the change is actually saved.
    setUrl("");
    setPath("");
    onDirty?.();
  }

  return (
    <div>
      <input type="hidden" name="featured_image_url" value={url} />
      <input type="hidden" name="featured_image_path" value={path} />

      {url ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="relative h-32 w-48 shrink-0 overflow-hidden rounded-md border border-neutral-200 bg-neutral-100">
            <Image
              src={url}
              alt={alt || fallbackAlt}
              fill
              sizes="192px"
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={status === "uploading"}
              className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium hover:bg-neutral-50 disabled:opacity-60"
            >
              {status === "uploading" ? "Uploading…" : "Replace"}
            </button>
            <button
              type="button"
              onClick={removeImage}
              className="rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={status === "uploading"}
          className="w-full rounded-md border border-dashed border-neutral-300 px-4 py-8 text-sm text-neutral-600 hover:border-neutral-400 hover:bg-neutral-50 disabled:opacity-60"
        >
          {status === "uploading"
            ? "Uploading…"
            : "Choose an image (JPEG, PNG or WebP, max 5 MB)"}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />

      {status === "uploading" && (
        <p role="status" className="mt-2 text-sm text-neutral-600">
          Uploading image…
        </p>
      )}

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-3">
        <label
          htmlFor="featured_image_alt"
          className="block text-sm font-medium text-neutral-800"
        >
          Image alt text
        </label>
        <input
          id="featured_image_alt"
          name="featured_image_alt"
          type="text"
          value={alt}
          onChange={(e) => {
            setAlt(e.target.value);
            onDirty?.();
          }}
          placeholder={fallbackAlt}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        />
        <p className="mt-1 text-xs text-neutral-500">
          Describes the image for screen readers. Falls back to the job title if
          left blank.
        </p>
      </div>
    </div>
  );
}
