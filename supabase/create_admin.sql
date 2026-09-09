-- =============================================================================
-- create_admin.sql - grant an existing Supabase Auth user administrator access.
--
-- There is deliberately no public sign-up and no API route that writes to
-- admin_users: that table has a SELECT policy but no insert, update or delete
-- policy, so the allow-list can only be changed with database-level access.
-- That is what prevents privilege escalation through the public API.
--
-- HOW TO USE
--
--   1. Create the user first: Supabase dashboard -> Authentication -> Users ->
--      Add user. Tick "Auto Confirm User", or the account cannot sign in.
--   2. Replace the email below with that user's email.
--   3. Run this file in the SQL Editor.
--
-- The SELECT at the end prints one row on success. If it returns nothing, the
-- email did not match any user in auth.users - check for a typo.
-- =============================================================================

insert into public.admin_users (user_id)
select id
from auth.users
where email = 'REPLACE_WITH_YOUR_EMAIL@example.com'
on conflict (user_id) do nothing;

-- Confirm the grant.
select
  u.email,
  a.created_at as granted_at
from public.admin_users a
join auth.users u on u.id = a.user_id
order by a.created_at;

-- -----------------------------------------------------------------------------
-- To REVOKE administrator access (the account itself is left intact):
--
--   delete from public.admin_users
--   where user_id = (
--     select id from auth.users where email = 'REPLACE_WITH_YOUR_EMAIL@example.com'
--   );
-- -----------------------------------------------------------------------------
