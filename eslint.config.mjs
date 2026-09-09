import nextConfig from "eslint-config-next";

const eslintConfig = [
  ...nextConfig,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      // Generated Cloudflare/OpenNext build output. Gitignored, but ESLint's
      // flat config does not read .gitignore, so it must be listed here or
      // `npm run lint` reports errors in bundled vendor code.
      ".open-next/**",
      ".wrangler/**",
      "cloudflare-env.d.ts",
    ],
  },
];

export default eslintConfig;
