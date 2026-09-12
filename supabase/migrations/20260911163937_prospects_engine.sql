-- ============================================================================
-- cakra outbound — agent prospecting engine.
-- A prospect = a top real-estate agent we research, build a demo site for, score,
-- and prep a full pitch package (site + score + tips + 30-day plan + slides) so the
-- operator can sell. Admin-only (is_admin_caller). Demo sites stay PRIVATE (preview_token).
-- ============================================================================
create table if not exists public.prospects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  agency text,
  area text,
  city text default 'Jakarta',
  source text,
  source_url text,
  contact jsonb default '{}'::jsonb,        -- {phone,email,ig,tiktok,website}
  signals jsonb default '{}'::jsonb,        -- {listing_freshness,value,pricing,testimonials,digital_presence,notes}
  value_score numeric default 0,            -- composite rank 0-100 (real value, not just price)
  rank int,
  status text not null default 'discovered',-- discovered|building|ready|contacted|won|lost|dismissed|error
  listings jsonb default '[]'::jsonb,       -- their REAL scraped listings (portals + own site)
  site jsonb,                               -- built advertorial {id,en,seo,geo,lead}
  score jsonb,                              -- {web,social,overall,gaps[]}
  tips jsonb,                               -- tips & tricks
  content_plan jsonb,                       -- 30-day plan items
  slides jsonb,                             -- pitch deck {title, brief, slides[]}
  preview_token text default encode(gen_random_bytes(9),'hex'),
  meta jsonb default '{}'::jsonb,           -- pipeline status/errors/timings
  batch_date date,                          -- the morning it became "ready"
  ready_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create unique index if not exists prospects_ident on public.prospects (lower(name), lower(coalesce(agency,'')));
create index if not exists prospects_status_idx on public.prospects(status);
create index if not exists prospects_rank_idx on public.prospects(rank);
create index if not exists prospects_batch_idx on public.prospects(batch_date);

alter table public.prospects enable row level security;
drop policy if exists "prospects admin all" on public.prospects;
create policy "prospects admin all" on public.prospects for all
  using (public.is_admin_caller()) with check (public.is_admin_caller());

-- ---- read/manage (admin-gated) ----
create or replace function public.admin_list_prospects(p_status text default null, p_limit int default 200)
returns jsonb language plpgsql security definer set search_path to '' as $function$
declare v jsonb;
begin
  if not public.is_admin_caller() then raise exception 'not authorized'; end if;
  select coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb) into v from (
    select * from public.prospects
    where (p_status is null or status = p_status)
    order by (batch_date = current_date) desc nulls last, rank nulls last, value_score desc
    limit p_limit
  ) t;
  return v;
end; $function$;

create or replace function public.admin_prospect_stats()
returns jsonb language plpgsql security definer set search_path to '' as $function$
declare v jsonb;
begin
  if not public.is_admin_caller() then raise exception 'not authorized'; end if;
  select jsonb_build_object(
    'total', count(*),
    'discovered', count(*) filter (where status='discovered'),
    'building', count(*) filter (where status='building'),
    'ready', count(*) filter (where status='ready'),
    'today', count(*) filter (where status='ready' and batch_date = current_date),
    'contacted', count(*) filter (where status='contacted'),
    'won', count(*) filter (where status='won'),
    'lost', count(*) filter (where status='lost')
  ) into v from public.prospects;
  return coalesce(v, '{}'::jsonb);
end; $function$;

create or replace function public.admin_set_prospect_status(p_id uuid, p_status text)
returns void language plpgsql security definer set search_path to '' as $function$
begin
  if not public.is_admin_caller() then raise exception 'not authorized'; end if;
  update public.prospects set status = p_status, updated_at = now() where id = p_id;
end; $function$;

-- ---- pipeline triggers (secret-gated at the edge; mirror run_build_site_pro) ----
create or replace function public.run_discover_prospects()
returns bigint language plpgsql security definer set search_path to '' as $function$
declare v_secret text; v_id bigint;
begin
  select decrypted_secret into v_secret from vault.decrypted_secrets where name='CRON_SECRET';
  select net.http_post(
    url := 'https://gexprynjrnfmnadbgglk.supabase.co/functions/v1/discover-prospects',
    headers := jsonb_build_object('Content-Type','application/json'),
    body := jsonb_build_object('secret', v_secret),
    timeout_milliseconds := 110000
  ) into v_id;
  return v_id;
end; $function$;

create or replace function public.run_prospect_tick(p_id uuid default null)
returns bigint language plpgsql security definer set search_path to '' as $function$
declare v_secret text; v_id bigint;
begin
  select decrypted_secret into v_secret from vault.decrypted_secrets where name='CRON_SECRET';
  select net.http_post(
    url := 'https://gexprynjrnfmnadbgglk.supabase.co/functions/v1/prospect-pipeline',
    headers := jsonb_build_object('Content-Type','application/json'),
    body := jsonb_build_object('secret', v_secret, 'prospect_id', p_id),
    timeout_milliseconds := 110000
  ) into v_id;
  return v_id;
end; $function$;;
