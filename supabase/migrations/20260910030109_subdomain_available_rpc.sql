-- Public availability check for onboarding: returns only true/false, never other agents' data.
create or replace function public.subdomain_available(p_sub text) returns boolean
language sql stable security definer set search_path = '' as $$
  select length(coalesce(p_sub, '')) >= 3
     and not exists (select 1 from public.profiles where lower(subdomain) = lower(p_sub));
$$;
revoke all on function public.subdomain_available(text) from public;
grant execute on function public.subdomain_available(text) to anon, authenticated;;
