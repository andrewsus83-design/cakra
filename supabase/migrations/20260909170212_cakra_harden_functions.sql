-- Security hardening (from get_advisors):
-- 1) pin search_path on the updated-at helper (now() is in pg_catalog, always resolvable)
alter function public.cakra_set_updated_at() set search_path = '';

-- 2) the profile-provisioning fn must ONLY run as the auth.users trigger — never via /rest/v1/rpc.
--    Revoking EXECUTE blocks direct RPC calls but does NOT stop the trigger (triggers ignore EXECUTE grants).
revoke execute on function public.cakra_handle_new_user() from public, anon, authenticated;;
