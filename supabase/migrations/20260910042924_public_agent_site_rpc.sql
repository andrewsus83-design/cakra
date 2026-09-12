-- Public site data for an agent, resolved by subdomain OR agent id (anon). Returns only public
-- display fields (never auth/email), so a live agent site can render the agent's real persona
-- instead of the demo template. profiles has no public-read policy by design; this SECURITY
-- DEFINER function is the single controlled surface.
create or replace function public.public_agent_site(p_key text)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare v jsonb; pr public.profiles%rowtype; is_uuid boolean;
begin
  is_uuid := p_key ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
  if is_uuid then
    select * into pr from public.profiles where id = p_key::uuid limit 1;
  else
    select * into pr from public.profiles where lower(subdomain) = lower(p_key) limit 1;
  end if;
  if pr.id is null then return jsonb_build_object('found', false); end if;
  return jsonb_build_object(
    'found', true,
    'aid', pr.id,
    'name', pr.name,
    'brand', pr.brand,
    'tagline', pr.tagline,
    'city', pr.city,
    'areas', pr.areas,
    'specializations', pr.specializations,
    'subdomain', pr.subdomain,
    'palette', pr.palette,
    'font', pr.font,
    'tone', pr.tone,
    'experience', pr.onboarding->>'pengalaman',
    'target', coalesce(pr.target, pr.onboarding->>'target'),
    'price_band', pr.price_band,
    'bio', pr.onboarding->>'bio_cerita',
    'services', pr.onboarding->'layanan',
    'differentiators', pr.onboarding->'keunggulan',
    'foreign_buyer', pr.onboarding->>'pembeli_asing',
    'office', pr.onboarding->>'alamat_kantor',
    'hours', pr.onboarding->>'jam_operasional',
    'certifications', pr.onboarding->>'sertifikasi',
    'testimonials', pr.onboarding->>'testimoni',
    'socials', jsonb_build_object(
      'wa', pr.whatsapp,
      'ig', pr.onboarding->>'ig',
      'tt', pr.onboarding->>'tiktok',
      'fb', pr.onboarding->>'fb',
      'yt', pr.onboarding->>'youtube'
    ),
    'advertorial', pr.onboarding->'advertorial'
  );
end;
$$;
grant execute on function public.public_agent_site(text) to anon, authenticated;;
