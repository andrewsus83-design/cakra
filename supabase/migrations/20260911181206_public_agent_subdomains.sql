-- Lists agent subdomains for build-time static generation of the crawlable per-agent GEO pages.
-- Returns only subdomains (no sensitive data); anon-callable (the static build uses the anon key).
create or replace function public.public_agent_subdomains()
returns jsonb language sql stable security definer set search_path to 'public' as $function$
  select coalesce(jsonb_agg(subdomain order by subdomain), '[]'::jsonb)
  from public.profiles
  where subdomain is not null and btrim(subdomain) <> '';
$function$;
grant execute on function public.public_agent_subdomains() to anon, authenticated;;
