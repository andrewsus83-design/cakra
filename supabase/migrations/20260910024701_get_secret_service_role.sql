-- Lets server-side Edge Functions (service_role only) read a decrypted key from Vault.
-- NEVER granted to anon/authenticated — the browser can never read secret values this way.
create or replace function public.get_secret(p_name text) returns text
language sql stable security definer set search_path = '' as $$
  select decrypted_secret from vault.decrypted_secrets where name = p_name limit 1;
$$;
revoke all on function public.get_secret(text) from public, anon, authenticated;
grant execute on function public.get_secret(text) to service_role;;
