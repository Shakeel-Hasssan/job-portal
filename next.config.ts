import type { NextConfig } from "next";

/**
 * Allow next/image to load featured images from the Supabase Storage CDN.
 *
 * The hostname is derived from the configured project URL rather than
 * hardcoded, so staging and production each allow their own bucket and nothing
 * else. When the variable is absent (for example a CI type check with no env),
 * no remote pattern is added and local builds still succeed.
 */
function supabaseImagePatterns(): NonNullable<
  NonNullable<NextConfig["images"]>["remotePatterns"]
> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return [];

  try {
    const { hostname } = new URL(url);
    return [
      {
        protocol: "https",
        hostname,
        pathname: "/storage/v1/object/public/**",
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseImagePatterns(),
  },
};

export default nextConfig;
