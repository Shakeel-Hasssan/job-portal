-- =============================================================================
-- 001_initial_schema.sql
-- Core schema for the job portal: admin_users, categories, jobs.
--
-- Run this in the Supabase SQL editor (or via `supabase db push`) BEFORE
-- 002_storage.sql, which depends on the public.is_admin() helper defined here.
-- =============================================================================

-- Trigram index support for case-insensitive partial search on job text fields.
create extension if not exists pg_trgm;

-- -----------------------------------------------------------------------------
-- Tables
-- -----------------------------------------------------------------------------

-- Allow-list of Supabase Auth users who may administer the site.
-- Rows are inserted manually (SQL editor / service role) - there is deliberately
-- no RLS write policy, so this table cannot be modified through the public API.
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  company_name text,
  location text,
  employment_type text,
  salary text,
  category_id uuid references public.categories (id) on delete set null,
  description text,
  responsibilities text,
  requirements text,
  featured_image_url text,
  featured_image_path text,
  featured_image_alt text,
  seo_title text,
  seo_description text,
  seo_keywords text,
  how_to_apply jsonb not null default '[]'::jsonb,
  application_url text not null,
  status text not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint jobs_status_check
    check (status in ('draft', 'published')),

  -- Defence in depth: the application layer also validates this, but the
  -- database refuses to store javascript:, data:, vbscript: and similar URLs.
  constraint jobs_application_url_check
    check (application_url ~* '^https?://'),

  -- how_to_apply holds an array of application steps (see lib/types.ts).
  constraint jobs_how_to_apply_is_array_check
    check (jsonb_typeof(how_to_apply) = 'array'),

  -- A published job always has a publication date.
  constraint jobs_published_at_required_check
    check (status <> 'published' or published_at is not null)
);

-- -----------------------------------------------------------------------------
-- Indexes
-- jobs.slug and categories.slug are already indexed by their unique constraints.
-- -----------------------------------------------------------------------------

create index if not exists jobs_status_idx
  on public.jobs (status);

create index if not exists jobs_published_at_idx
  on public.jobs (published_at desc nulls last);

create index if not exists jobs_category_id_idx
  on public.jobs (category_id);

create index if not exists jobs_created_at_idx
  on public.jobs (created_at desc);

-- Serves the main public listing query (published jobs, newest first).
create index if not exists jobs_published_listing_idx
  on public.jobs (published_at desc)
  where status = 'published';

-- Case-insensitive partial search (ILIKE '%term%') on the searchable fields.
create index if not exists jobs_title_trgm_idx
  on public.jobs using gin (title gin_trgm_ops);

create index if not exists jobs_company_name_trgm_idx
  on public.jobs using gin (company_name gin_trgm_ops);

create index if not exists jobs_location_trgm_idx
  on public.jobs using gin (location gin_trgm_ops);

-- -----------------------------------------------------------------------------
-- updated_at trigger
-- -----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists jobs_set_updated_at on public.jobs;

create trigger jobs_set_updated_at
  before update on public.jobs
  for each row
  execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Authorization helper
--
-- SECURITY DEFINER so that RLS policies can consult admin_users without being
-- blocked by (or recursing into) that table's own RLS policies. search_path is
-- pinned to defeat search_path hijacking.
-- -----------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------

alter table public.admin_users enable row level security;
alter table public.categories  enable row level security;
alter table public.jobs        enable row level security;

-- admin_users: administrators may read the allow-list. No insert/update/delete
-- policy exists, so the allow-list can only be changed with elevated access.
drop policy if exists admin_users_select_admin on public.admin_users;
create policy admin_users_select_admin
  on public.admin_users
  for select
  to authenticated
  using (public.is_admin());

-- categories: world readable, administrator writable.
drop policy if exists categories_select_public on public.categories;
create policy categories_select_public
  on public.categories
  for select
  to anon, authenticated
  using (true);

drop policy if exists categories_insert_admin on public.categories;
create policy categories_insert_admin
  on public.categories
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists categories_update_admin on public.categories;
create policy categories_update_admin
  on public.categories
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists categories_delete_admin on public.categories;
create policy categories_delete_admin
  on public.categories
  for delete
  to authenticated
  using (public.is_admin());

-- jobs: the public sees published jobs only; administrators see and manage all.
-- Multiple permissive SELECT policies are OR'd together.
drop policy if exists jobs_select_published on public.jobs;
create policy jobs_select_published
  on public.jobs
  for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists jobs_select_admin on public.jobs;
create policy jobs_select_admin
  on public.jobs
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists jobs_insert_admin on public.jobs;
create policy jobs_insert_admin
  on public.jobs
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists jobs_update_admin on public.jobs;
create policy jobs_update_admin
  on public.jobs
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists jobs_delete_admin on public.jobs;
create policy jobs_delete_admin
  on public.jobs
  for delete
  to authenticated
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- Grants (RLS still governs which rows each role may touch)
-- -----------------------------------------------------------------------------

grant usage on schema public to anon, authenticated;

grant select on public.jobs, public.categories to anon, authenticated;
grant insert, update, delete on public.jobs, public.categories to authenticated;
grant select on public.admin_users to authenticated;
