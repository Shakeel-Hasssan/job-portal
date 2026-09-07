-- =============================================================================
-- create_admin.sql - grant administrator access to an existing Supabase user.
--
-- The admin_users table has no RLS write policy by design, so it can only be
-- changed from the SQL editor or with the service role. That is what stops an
-- ordinary signed-in user from promoting themselves.
--
-- STEP 1: create the person's account first.
--   Supabase dashboard -> Authentication -> Users -> "Add user"
--   Choose "Auto Confirm User" so they can sign in without email confirmation.
--
-- STEP 2: replace the email below and run this file.
-- =============================================================================

insert into public.admin_users (user_id)
select id
from auth.users
where email = 'REPLACE_WITH_YOUR_EMAIL@example.com'
on conflict (user_id) do nothing;

-- Verify the result: this should return exactly one row per administrator.
select
  au.id            as admin_users_id,
  u.email,
  u.last_sign_in_at,
  au.created_at    as granted_at
from public.admin_users au
join auth.users u on u.id = au.user_id
order by au.created_at;

-- -----------------------------------------------------------------------------
-- To REVOKE administrator access (the auth account itself is left intact):
--
--   delete from public.admin_users
--   where user_id = (select id from auth.users where email = 'someone@example.com');
-- -----------------------------------------------------------------------------
