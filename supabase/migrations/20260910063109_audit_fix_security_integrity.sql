-- M17/L5/M16: default-deny EXECUTE on internal/admin SECURITY DEFINER functions (Postgres grants
-- EXECUTE to PUBLIC by default). Admin RPCs keep `authenticated` (internally gated by is_admin_caller);
-- is_admin_caller + claim_library_image are internal-only.
do $$ declare r record; begin
  for r in select p.oid::regprocedure sig from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname in ('is_admin_caller','claim_library_image','admin_content_masters','admin_content_pieces','admin_delete_user','admin_library_stats','admin_list_listings','admin_list_members','admin_secret_status','admin_set_secret','admin_set_listing_featured')
  loop execute format('revoke execute on function %s from anon, public', r.sig); end loop;
  for r in select p.oid::regprocedure sig from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname in ('is_admin_caller','claim_library_image')
  loop execute format('revoke execute on function %s from authenticated', r.sig); end loop;
end $$;
grant execute on function public.claim_library_image(uuid, uuid, text, text, text) to service_role;

-- M3: subdomain validity + reserved-name blacklist
create or replace function public.subdomain_available(p_sub text)
returns boolean language sql stable security definer set search_path to '' as $$
  select lower(coalesce(p_sub,'')) ~ '^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$'
     and lower(p_sub) not in ('www','member','sample','app','api','admin','cakra','mail','ftp','smtp','staging','dev','test','static','cdn','assets','asset','blog','help','support','status','demo','login','signup','onboarding','reset','hub','harga','contact','about','faq','kalkulator','listing','privacy','terms')
     and not exists (select 1 from public.profiles where lower(subdomain) = lower(p_sub));
$$;

-- L6: only expose PUBLISHED sites (subdomain set) so random UUIDs / unpublished profiles don't leak PII
create or replace function public.public_agent_site(p_key text)
returns jsonb language plpgsql security definer set search_path = public stable as $$
declare pr public.profiles%rowtype; is_uuid boolean;
begin
  is_uuid := p_key ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
  if is_uuid then select * into pr from public.profiles where id = p_key::uuid limit 1;
  else select * into pr from public.profiles where lower(subdomain) = lower(p_key) limit 1; end if;
  if pr.id is null or pr.subdomain is null then return jsonb_build_object('found', false); end if;
  return jsonb_build_object('found', true, 'aid', pr.id, 'name', pr.name, 'brand', pr.brand, 'tagline', pr.tagline,
    'city', pr.city, 'areas', pr.areas, 'specializations', pr.specializations, 'subdomain', pr.subdomain,
    'palette', pr.palette, 'font', pr.font, 'tone', pr.tone, 'experience', pr.onboarding->>'pengalaman',
    'target', coalesce(pr.target, pr.onboarding->>'target'), 'price_band', pr.price_band, 'bio', pr.onboarding->>'bio_cerita',
    'services', pr.onboarding->'layanan', 'differentiators', pr.onboarding->'keunggulan', 'foreign_buyer', pr.onboarding->>'pembeli_asing',
    'office', pr.onboarding->>'alamat_kantor', 'hours', pr.onboarding->>'jam_operasional', 'certifications', pr.onboarding->>'sertifikasi',
    'testimonials', pr.onboarding->>'testimoni',
    'socials', jsonb_build_object('wa', pr.whatsapp, 'ig', pr.onboarding->>'ig', 'tt', pr.onboarding->>'tiktok', 'fb', pr.onboarding->>'fb', 'yt', pr.onboarding->>'youtube'),
    'advertorial', pr.onboarding->'advertorial');
end; $$;

-- M14: idempotent drain-arming; H5: run_music_batch becomes enqueue-only (no direct fan-out)
create or replace function public.arm_bgm_drain()
returns void language plpgsql security definer set search_path to '' as $$
begin
  if not exists (select 1 from cron.job where jobname = 'bgm-drain') then
    perform cron.schedule('bgm-drain', '* * * * *', 'select public.run_music_tick()');
  end if;
end; $$;
revoke execute on function public.arm_bgm_drain() from public, anon, authenticated;

create or replace function public.seed_bgm(p jsonb)
returns int language plpgsql security definer set search_path to '' as $$
declare n int;
begin
  if jsonb_typeof(p) <> 'array' or jsonb_array_length(p) > 200 then raise exception 'invalid batch'; end if;
  insert into public.bgm_queue (title, prompt, length_ms, tags)
    select value->>'title', value->>'prompt', (value->>'length_ms')::int, value->'tags' from jsonb_array_elements(p);
  get diagnostics n = row_count;
  perform public.arm_bgm_drain();
  return n;
end; $$;
revoke execute on function public.seed_bgm(jsonb) from public, anon, authenticated;
grant execute on function public.seed_bgm(jsonb) to service_role;

create or replace function public.run_music_batch(p_tracks jsonb)
returns int language plpgsql security definer set search_path to '' as $$
begin
  return public.seed_bgm(p_tracks);   -- deprecated: enqueue only, drained at 2-concurrent by run_music_tick
end; $$;
revoke execute on function public.run_music_batch(jsonb) from public, anon, authenticated;
grant execute on function public.run_music_batch(jsonb) to service_role;

-- M13: widen stale-reopen window so a slow-but-live generation is never double-dispatched
create or replace function public.run_music_tick()
returns jsonb language plpgsql security definer set search_path to '' as $$
declare v_secret text; v_inflight int; v_slots int; t record; n int := 0; v_left int;
begin
  update public.bgm_queue set status='pending' where status='dispatched' and dispatched_at < now() - interval '10 minutes' and attempts < 6;
  update public.bgm_queue set status='failed' where status in ('pending','dispatched') and attempts >= 6;
  select count(*) into v_left from public.bgm_queue where status in ('pending','dispatched');
  if v_left = 0 then perform cron.unschedule('bgm-drain'); return jsonb_build_object('done', true); end if;
  select count(*) into v_inflight from public.bgm_queue where status='dispatched';
  v_slots := 2 - v_inflight;
  if v_slots <= 0 then return jsonb_build_object('inflight', v_inflight, 'dispatched', 0); end if;
  select decrypted_secret into v_secret from vault.decrypted_secrets where name='CRON_SECRET';
  for t in select * from public.bgm_queue where status='pending' order by created_at limit v_slots loop
    update public.bgm_queue set status='dispatched', dispatched_at=now(), attempts=attempts+1 where id=t.id;
    perform net.http_post(url:='https://gexprynjrnfmnadbgglk.supabase.co/functions/v1/generate-music',
      headers:=jsonb_build_object('Content-Type','application/json'),
      body:=jsonb_build_object('secret',v_secret,'queue_id',t.id::text,'title',t.title,'prompt',t.prompt,'length_ms',t.length_ms,'tags',t.tags));
    n := n + 1;
  end loop;
  return jsonb_build_object('inflight', v_inflight, 'dispatched', n);
end; $$;
revoke execute on function public.run_music_tick() from public, anon, authenticated;
grant execute on function public.run_music_tick() to service_role;

-- M9/M10: enforce upload limits + MIME whitelist at the storage layer (blocks oversize + text/html/svg)
update storage.buckets
  set file_size_limit = 26214400,
      allowed_mime_types = array['image/jpeg','image/jpg','image/png','image/webp','image/gif','audio/mpeg','audio/mp3','audio/wav','audio/x-wav','audio/mp4','audio/aac','audio/ogg']
  where id = 'assets-global';;
