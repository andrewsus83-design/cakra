-- Token-gated PRIVATE preview for a prospect's built demo site.
-- Anon-callable BUT returns data only for an exact unguessable preview_token match, and ONLY the
-- fields needed to render the site — NEVER the sales intel (score/gaps/tips/plan/slides/signals).
-- Prospects have no public subdomain; this token link is the only way to see their preview.
create or replace function public.preview_prospect(p_token text)
returns jsonb language plpgsql security definer set search_path to '' as $function$
declare v jsonb;
begin
  if p_token is null or length(p_token) < 12 then return null; end if;
  select jsonb_build_object(
    'name', p.name,
    'brand', coalesce(p.agency, p.name),
    'area', p.area,
    'city', p.city,
    'contact', p.contact,
    'listings', p.listings,
    'site', p.site,
    'preview', true
  ) into v
  from public.prospects p
  where p.preview_token = p_token
    and p.site is not null
    and p.status in ('ready','building','contacted','won');
  return v;  -- null when the token does not match → nothing leaks, no enumeration
end; $function$;

revoke all on function public.preview_prospect(text) from public;
grant execute on function public.preview_prospect(text) to anon, authenticated;;
