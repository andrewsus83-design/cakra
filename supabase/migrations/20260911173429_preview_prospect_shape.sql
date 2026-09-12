-- Return the SAME shape as public_agent_site() so the real /demo template + SiteSkin render a
-- prospect's private preview unchanged. Exposes site + public contact + their listings ONLY —
-- never score/gaps/tips/plan/slides/signals (operator's sales intel stays admin-only).
create or replace function public.preview_prospect(p_token text)
returns jsonb language plpgsql security definer set search_path to '' as $function$
declare p public.prospects%rowtype;
begin
  if p_token is null or length(p_token) < 12 then return jsonb_build_object('found', false); end if;
  select * into p from public.prospects
    where preview_token = p_token and site is not null
      and status in ('ready','building','contacted','won')
    limit 1;
  if p.id is null then return jsonb_build_object('found', false); end if;
  return jsonb_build_object(
    'found', true, 'preview', true,
    'aid', null, 'subdomain', null,               -- no public subdomain for a prospect
    'name', p.name, 'brand', coalesce(p.agency, p.name),
    'tagline', p.site->'id'->>'hero_sub',
    'city', p.city,
    'areas', case when p.area is not null then jsonb_build_array(p.area) else '[]'::jsonb end,
    'specializations', '[]'::jsonb,
    'palette', null, 'font', null, 'tone', null,
    'target', null, 'price_band', null, 'bio', null, 'foreign_buyer', null,
    'positioning', 'agen properti',
    'socials', jsonb_build_object('wa', p.contact->>'phone', 'ig', p.contact->>'ig',
                                  'tt', p.contact->>'tiktok', 'fb', null, 'yt', p.contact->>'youtube'),
    'listings', p.listings,
    'advertorial', p.site
  );
end; $function$;
revoke all on function public.preview_prospect(text) from public;
grant execute on function public.preview_prospect(text) to anon, authenticated;;
