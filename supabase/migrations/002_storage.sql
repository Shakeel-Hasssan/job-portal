-- =============================================================================
-- 002_storage.sql
-- Storage bucket for job featured images.
--
-- Depends on public.is_admin() from 001_initial_schema.sql - run that first.
--
-- Note: creating policies on storage.objects requires elevated privileges. Run
-- this from the Supabase SQL editor or `supabase db push`, not from the client.
-- =============================================================================

-- Public bucket: featured images are served directly from the Supabase CDN so
-- they can be used in <img> tags and Open Graph previews without signed URLs.
-- Writes remain administrator-only via the policies below.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'job-images',
  'job-images',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Read: anyone may read objects in this bucket.
drop policy if exists job_images_select_public on storage.objects;
create policy job_images_select_public
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'job-images');

-- Write: administrators only.
drop policy if exists job_images_insert_admin on storage.objects;
create policy job_images_insert_admin
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'job-images' and public.is_admin());

drop policy if exists job_images_update_admin on storage.objects;
create policy job_images_update_admin
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'job-images' and public.is_admin())
  with check (bucket_id = 'job-images' and public.is_admin());

drop policy if exists job_images_delete_admin on storage.objects;
create policy job_images_delete_admin
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'job-images' and public.is_admin());
