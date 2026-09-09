# Job Portal

A job listing website built with Next.js 16 (App Router), TypeScript, Tailwind CSS
and Supabase, designed to be deployed to Cloudflare Workers.

Visitors browse, search and filter published job listings and follow the
employer's own application link. Administrators sign in to a protected admin
area to create, edit, publish and delete listings, upload featured images and
manage categories.

Applications are never submitted through this site — every listing links out to
the employer's own application page.

---

## Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment variables](#environment-variables)
- [Supabase setup](#supabase-setup)
- [Local development](#local-development)
- [Testing, linting and type checking](#testing-linting-and-type-checking)
- [Build](#build)
- [Deployment to Cloudflare Workers](#deployment-to-cloudflare-workers)
- [Connecting a Hostinger domain](#connecting-a-hostinger-domain)
- [Project structure](#project-structure)
- [Security model](#security-model)
- [Before going live](#before-going-live)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Requirement | Version | Notes |
| --- | --- | --- |
| Node.js | **22 or newer** (developed on 24 LTS) | **Wrangler 4 refuses to run below Node 22**, so `npm run preview` and `npm run deploy` require it. `@supabase/supabase-js` also warns below 22. Node 20 can still run the dev server, tests and `npm run build`, but cannot deploy. |
| npm | 11+ recommended | Ships with Node. npm 10.5.x has a resolver bug (`Cannot read properties of null (reading 'edgesOut')`) that breaks some dependency upgrades. |
| Git | any recent | For cloning and deployment. |
| Supabase account | free tier is fine | Provides PostgreSQL, authentication and file storage. |
| Cloudflare account | free tier is fine | Hosts the application on Workers. |

Check your versions:

```bash
node -v && npm -v && git --version
```

---

## Installation

```bash
git clone https://github.com/Shakeel-Hasssan/job-portal.git
```

```bash
cd job-portal && npm install
```

---

## Environment variables

Copy the example file and fill it in:

```bash
cp .env.example .env.local
```

`.env.local` is git-ignored and must never be committed.

| Variable | Required | Exposed to the browser | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Yes | Your Supabase project URL, e.g. `https://abcdefgh.supabase.co`. Found under **Project Settings → Data API**. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Yes | The publishable (anon) key. It is *designed* to be public — every query it makes is still gated by Row Level Security. Found under **Project Settings → API Keys**. |
| `NEXT_PUBLIC_SITE_URL` | Yes | Yes | The canonical public origin, e.g. `https://jobs.example.com`. Used for canonical URLs, the sitemap, and Open Graph tags. **Must be the real domain in production** — otherwise you will publish canonical links pointing at `localhost`. No trailing slash. |
| `SUPABASE_SERVICE_ROLE_KEY` | No | **Never** | Not required by any current feature. It bypasses Row Level Security entirely. If a future server-side task needs it, set it as a Cloudflare *secret* — never as a `NEXT_PUBLIC_` variable and never in `wrangler.jsonc`. |

> **Note on `NEXT_PUBLIC_*` variables:** Next.js inlines these into the client
> bundle at **build** time, not at runtime. They must be present in whatever
> environment runs `npm run build`, not only in the deployed Worker.

---

## Supabase setup

### 1. Create the project

Create a new project at [supabase.com/dashboard](https://supabase.com/dashboard),
then copy the project URL and publishable key into `.env.local`.

### 2. Run the migrations

Open the **SQL Editor** in the Supabase dashboard and run these files **in order**:

1. `supabase/migrations/001_initial_schema.sql` — tables, constraints, indexes,
   the `updated_at` trigger, the `is_admin()` helper and all Row Level Security
   policies.
2. `supabase/migrations/002_storage.sql` — the `job-images` storage bucket and
   its access policies. **Must run second**: it depends on `is_admin()`.

Optionally run `supabase/seed.sql` to insert three categories and two clearly
fictional demo jobs. Delete those rows before launching publicly — the file
contains the exact `delete` statement.

### 3. Verify the storage bucket

Under **Storage**, confirm a `job-images` bucket exists, is public, has a 5 MB
file size limit and allows only `image/jpeg`, `image/png` and `image/webp`.

The bucket is public so featured images can be served from the CDN and used in
social previews. Writes remain administrator-only through its RLS policies.

### 4. Create the first administrator

There is no public sign-up — this is deliberate.

1. In the dashboard go to **Authentication → Users → Add user**.
2. Enter an email and a strong password, and tick **Auto Confirm User**.
   Without auto-confirm the account cannot sign in until it is confirmed.
3. Open `supabase/create_admin.sql`, replace the placeholder email with the one
   you just used, and run it in the SQL Editor.

The script prints a row on success. If it returns nothing, the email did not
match a user in `auth.users`.

> **Why a script rather than a page:** the `admin_users` table has a SELECT
> policy but deliberately **no** insert, update or delete policy, so the
> allow-list cannot be modified through the public API at all. Granting admin
> access requires database-level access, which closes off privilege escalation.

---

## Local development

```bash
npm run dev
```

The site runs at <http://localhost:3000>, with the admin area at
<http://localhost:3000/admin>.

---

## Testing, linting and type checking

```bash
npm test
```

```bash
npm run typecheck
```

```bash
npm run lint
```

The test suite (Vitest) covers the business logic where a mistake would be
costly: slug generation and collision handling, URL protocol validation, job and
application-step validation, the post-login redirect guard, structured-data
generation, and search-term sanitisation.

Run the tests in watch mode while developing with `npm run test:watch`.

---

## Build

```bash
npm run build
```

This is the standard Next.js production build, and it is what CI should run.
It requires the `NEXT_PUBLIC_*` variables to be present.

---

## Deployment to Cloudflare Workers

Deployment uses [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare),
which compiles the Next.js server into a Worker. This is the current Workers
path — **not** the older Cloudflare Pages `next-on-pages` flow, and no
Vercel-specific APIs are used anywhere in the project.

> **Node 22 or newer is required from here on.** `npm run cf:build` succeeds on
> Node 20, but Wrangler 4 exits immediately below Node 22 with
> *"Wrangler requires at least Node.js v22.0.0"*.

> **Status:** the Workers build completes and produces `.open-next/worker.js`,
> and `wrangler deploy --dry-run` validates the configuration and bindings
> (44 assets, ~13 MB / 3 MB gzipped). The application has **not** been deployed
> to Cloudflare, so the account-specific steps below — `wrangler login`, the
> real deploy, and the domain attachment — have not been executed.

> **A note on middleware:** the OpenNext build prints
> *"Node.js middleware support is experimental in cloudflare"*. This project's
> `proxy.ts` only refreshes the Supabase session — it is a convenience, not the
> security boundary. Every protected page and every mutating action performs its
> own server-side authorization check, so an issue there would affect session
> refresh, not access control. Test sign-in via `npm run preview` before relying
> on a deployment.

### 1. Set the production environment variables *for the build*

> **This is the single easiest thing to get wrong.** Next.js inlines
> `NEXT_PUBLIC_*` values into the compiled output at **build** time. Putting
> them in `wrangler.jsonc` has **no effect** — this was verified by setting
> `NEXT_PUBLIC_SITE_URL` there to a different value and watching the built
> pages still emit the build-time origin. Deploy with the wrong build
> environment and you will publish canonical URLs, a sitemap and Open Graph
> tags all pointing at `localhost:3000`.

Set these wherever the build runs:

| Where you build | Where to set them |
| --- | --- |
| Locally, then `npm run deploy` | `.env.local` |
| Cloudflare Workers Builds / CI | The build-time environment variables in that system |

The values needed are `NEXT_PUBLIC_SITE_URL` (your real production origin),
`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

After deploying, confirm it worked by checking that
`https://your-domain.com/sitemap.xml` shows your domain and not `localhost`.

In `wrangler.jsonc`, change `name` if `job-portal` is already taken in your
account. Add a `vars` block only for genuine runtime values, and never for
secrets — that file is committed.

### 2. Authenticate

```bash
npx wrangler login
```

### 3. Preview the Worker build locally

```bash
npm run preview
```

This builds with OpenNext and serves the compiled Worker through Wrangler,
which is the closest local approximation of the production runtime. Test the
admin sign-in and a job page here before deploying.

### 4. Deploy

```bash
npm run deploy
```

### 5. Add any server-only secrets

Only if a future feature needs it:

```bash
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

Never place that key in `wrangler.jsonc` — that file is committed to git.

### 6. Update Supabase authentication URLs

In the Supabase dashboard under **Authentication → URL Configuration**:

- Set **Site URL** to your production domain.
- Add `https://your-domain.com/auth/callback` to **Redirect URLs**.

Password reset links will not work until this is done.

---

## Connecting a Hostinger domain

The domain is registered at Hostinger; DNS is served by Cloudflare.

1. **Add the site to Cloudflare** — in the Cloudflare dashboard choose
   *Add a site*, enter your domain, and pick a plan (Free is sufficient).
   Cloudflare will scan the existing DNS records.
2. **Copy the two Cloudflare nameservers** shown at the end of that flow.
3. **Point Hostinger at them** — in hPanel go to **Domains → your domain → DNS /
   Nameservers**, choose *Change nameservers* / *Use custom nameservers*, and
   enter the two Cloudflare nameservers. Save.
4. **Wait for propagation** — usually well under an hour, but it can take up to
   24 hours. Cloudflare emails you when the zone is active.
5. **Attach the domain to the Worker** — in the Cloudflare dashboard open
   **Workers & Pages → job-portal → Settings → Domains & Routes**, then *Add* a
   custom domain such as `jobs.example.com` or the apex domain. Cloudflare
   creates the DNS record and issues the TLS certificate automatically.
6. **Set SSL/TLS mode** to **Full (strict)** under SSL/TLS → Overview.
7. **Update `NEXT_PUBLIC_SITE_URL`** to the live domain, then rebuild and
   redeploy so canonical URLs, the sitemap and Open Graph tags use it.

Verify afterwards that `https://your-domain.com/sitemap.xml` and
`https://your-domain.com/robots.txt` both show the real domain.

---

## Project structure

```
app/
  (public)/            Public site: home, jobs, job detail, categories, legal pages
  admin/
    login/             Sign-in, forgot password, reset password
    (dashboard)/       Protected admin area: dashboard, jobs, categories
  auth/callback/       Supabase email link exchange
  robots.ts            robots.txt
  sitemap.ts           Dynamic sitemap
components/
  admin/               Admin navigation, job row actions, category manager
  forms/               Job form, application-steps editor, image uploader
  jobs/                Job card, filters, pagination
  layout/              Site header and footer
lib/
  auth/                Session and administrator authorization
  categories/          Category server actions
  jobs/                Job server actions and public queries
  seo/                 Metadata and JobPosting structured data
  storage/             Featured image validation and safe paths
  supabase/            Browser, server and proxy clients; database types
  utils/               Slugs, URL safety, formatting
  validation/          Zod schemas
supabase/
  migrations/          001_initial_schema.sql, 002_storage.sql
  seed.sql             Optional demo data
  create_admin.sql     Grants an existing auth user admin access
proxy.ts               Refreshes the Supabase session on every request
```

---

## Security model

- **Authorization is enforced server-side.** Every protected page calls
  `requireAdmin()`, and every mutating server action calls it again
  independently — a layout cannot guard a server action, because actions are
  separately addressable endpoints.
- **`getUser()`, never `getSession()`.** `getSession()` only decodes the cookie
  and therefore trusts data supplied by the browser. `getUser()` revalidates the
  token with Supabase.
- **Administrator status comes from the database** via the `is_admin()`
  `SECURITY DEFINER` function reading the `admin_users` allow-list. A user id
  supplied by the client is never trusted.
- **Row Level Security is the real boundary.** Anonymous visitors can read only
  published jobs. Note that RLS denies a write by matching **zero rows**, not by
  raising an error, so the server actions check the number of affected rows
  rather than trusting a 2xx response.
- **Job content is rendered as text**, never with `dangerouslySetInnerHTML`, so
  markup cannot be injected into a public page. The single exception is the
  JSON-LD block, which is escaped by `serializeJsonLd`.
- **Application URLs are restricted to `http(s)`** by a Zod refinement, a
  database check constraint, and again at render time. Outbound links carry
  `rel="noopener noreferrer nofollow"`.
- **Uploads** are validated for MIME type and size, stored under a generated
  UUID path (the submitted filename is never trusted), and restricted to
  administrators by storage RLS.
- **Post-login redirects** are validated by `safeRedirectPath`, which rejects
  absolute URLs, protocol-relative `//host` values and backslash tricks.
- **Login errors are deliberately generic** and password reset always reports
  success, so neither can be used to discover which emails have accounts.

---

## Before going live

- [ ] Confirm you are on Node 22+ (required for Wrangler).
- [ ] Delete the demo rows inserted by `seed.sql`.
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the real domain and redeploy.
- [ ] Replace the placeholder content on `/about` and `/contact`.
- [ ] **Have `/privacy-policy` and `/terms` reviewed by a qualified
      professional.** They are placeholder wording, not legal advice, and make
      no claim of compliance with any particular law. This is especially
      important if you later add analytics or advertising.
- [ ] Confirm the Supabase **Site URL** and **Redirect URLs** point at the live
      domain.
- [ ] Sign in and run through creating, publishing and deleting a job.
- [ ] Check `/sitemap.xml` and `/robots.txt` on the live domain.

---

## Troubleshooting

**`Supabase environment is not configured`**
`.env.local` is missing or incomplete. Copy `.env.example` and fill in the URL
and publishable key. The message names the specific variable at fault.

**Signing in says the account is not authorized**
The user exists in Supabase Auth but is not in `admin_users`. Run
`supabase/create_admin.sql` with that exact email.

**Signing in fails with correct credentials**
The user was created without **Auto Confirm User**. Confirm the account from the
Supabase dashboard, or delete and recreate it with auto-confirm ticked.

**Password reset emails link somewhere wrong, or the link is rejected**
Set **Site URL** and add `/auth/callback` to **Redirect URLs** in Supabase under
Authentication → URL Configuration.

**`Could not find the table 'public.jobs' in the schema cache`**
The migrations have not been run. Run `001_initial_schema.sql`, then
`002_storage.sql`, in the SQL Editor.

**Saving a job reports "You may not have permission"**
The write matched zero rows, which is how RLS denies it. Confirm your user is in
`admin_users` and that `001_initial_schema.sql` ran completely.

**Image upload fails with "new row violates row-level security policy"**
`002_storage.sql` has not been run, or the signed-in user is not an
administrator.

**Images do not display after upload**
`next.config.ts` derives its allowed image host from
`NEXT_PUBLIC_SUPABASE_URL`. If that variable changed, restart the dev server —
the value is read when the config loads.

**Canonical URLs or the sitemap point at `localhost`**
`NEXT_PUBLIC_SITE_URL` was not set at **build** time. Set it and rebuild;
`NEXT_PUBLIC_*` values are inlined during the build, not read at runtime.

**`Wrangler requires at least Node.js v22.0.0. You are using v20.x`**
Exactly what it says: Wrangler 4 will not run below Node 22. Install Node 22 or
newer (24 LTS is what this project is developed against) and re-run.
`npm run cf:build` works on Node 20; only `preview` and `deploy` are blocked.

**`npm ERR! Cannot read properties of null (reading 'edgesOut')`**
A resolver bug in npm 10.5.x, not a problem with the project. It persists even
after deleting `node_modules` and `package-lock.json`. The fix is a newer npm —
Node 22/24 ships npm 11, which resolves it.

**`npm warn allow-scripts ... packages have install scripts not yet covered`**
npm 11 blocks postinstall scripts by default. The packages listed (`esbuild`,
`workerd`, `unrs-resolver`) still work here, because their platform binaries
ship in prebuilt per-platform packages rather than being downloaded by the
script. If a local `preview` ever fails to start the Workers runtime, run
`npm approve-scripts --allow-scripts-pending` and reinstall.

**`npm audit` reports vulnerabilities**
At the time of writing there are 4 high advisories, all in **development**
dependencies and all from the same root: `sharp` (libheif CVEs) pulled in by
`miniflare`, which comes from `wrangler`. None of it ships in the deployed
Worker, which contains only the built application. Do **not** run
`npm audit fix --force` — it downgrades Wrangler and breaks the deployment
path. The advisories clear when Cloudflare updates Miniflare's `sharp`.

**ESLint crashes with `Converting circular structure to JSON`**
An older `eslint.config.mjs` used `FlatCompat`. This project imports the flat
config from `eslint-config-next` directly; make sure your copy matches.

---

## Licence

No licence has been specified. Add one before publishing the repository.
