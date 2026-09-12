-- Ingestion-layer fixes from the audit (R3, R4, R5, R9) + jobs table + private bucket + real dispatch.

-- R4: dedupe key must be real
alter table public.learning_media alter column external_id set not null;
alter table public.learning_media add constraint learning_media_external_id_nonempty check (external_id <> '');
alter table public.learning_media add column if not exists media_type text not null default 'video';
alter table public.learning_media add constraint learning_media_media_type_check check (media_type in ('video','image','sidecar'));
alter table public.learning_media drop constraint learning_media_status_check;
alter table public.learning_media add constraint learning_media_status_check
  check (status in ('queued','downloading','downloaded','indexed','framed','analyzed','failed','skipped'));
alter table public.learning_media
  add column if not exists attempts int not null default 0,
  add column if not exists last_error text,
  add column if not exists dispatched_at timestamptz,
  add column if not exists analyzed_at timestamptz;
create index if not exists learning_media_status_created_idx on public.learning_media(status, created_at);

-- R5: ONE facet store. learning_assets wins; learning_frames dropped.
drop table if exists public.learning_frames;
alter table public.learning_assets alter column media_id set not null;
alter table public.learning_assets add column if not exists ts_ms int, add column if not exists analyzed_at timestamptz;
create unique index if not exists learning_assets_media_kind_idx_key on public.learning_assets(media_id, kind, idx);
create index if not exists learning_assets_pending_idx on public.learning_assets(kind) where analyzed_at is null;
create or replace function public.learn_assets_set_source() returns trigger language plpgsql set search_path = '' as $$
begin select source_id into new.source_id from public.learning_media where id = new.media_id; return new; end; $$;
revoke execute on function public.learn_assets_set_source() from public, anon, authenticated;
create trigger trg_learning_assets_source before insert or update of media_id on public.learning_assets for each row execute function public.learn_assets_set_source();

-- sources: richer states, unique handle per platform, error field
alter table public.learning_sources drop constraint learning_sources_status_check;
alter table public.learning_sources add constraint learning_sources_status_check
  check (status in ('pending','ingesting','extracted','analyzed','learned','failed','blocked','paused'));
alter table public.learning_sources add column if not exists last_error text;
create unique index if not exists learning_sources_platform_handle_key on public.learning_sources(platform, lower(handle)) where handle is not null;

-- jobs: dispatch + observability (retries, dead-letter)
create table if not exists public.learning_jobs (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('ingest','download','analyze','synthesize','relearn')),
  source_id uuid references public.learning_sources(id) on delete cascade,
  media_id uuid references public.learning_media(id) on delete cascade,
  status text not null default 'queued' check (status in ('queued','running','done','failed','dead')),
  attempts int not null default 0,
  payload jsonb not null default '{}'::jsonb,
  result jsonb not null default '{}'::jsonb,
  error text,
  started_at timestamptz, finished_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists learning_jobs_status_idx on public.learning_jobs(status, kind, created_at);
alter table public.learning_jobs enable row level security;
create policy learning_jobs_admin on public.learning_jobs for all using (public.is_admin_caller()) with check (public.is_admin_caller());
revoke all on public.learning_jobs from anon, authenticated;
create trigger trg_touch_learning_jobs before update on public.learning_jobs for each row execute function public.learn_touch_updated_at();

-- private bucket for raw video/audio/frames (service-role writes only; admin can read)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('learning-media', 'learning-media', false, 209715200, array['video/mp4','video/quicktime','image/jpeg','image/png','image/webp','audio/mpeg','audio/mp4','audio/wav'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
create policy "learning-media admin read" on storage.objects for select using (bucket_id = 'learning-media' and public.is_admin_caller());

-- R3: admin_start_ingest = guard + job row + REAL dispatch (pg_net -> learn-ingest, CRON_SECRET) + honest message
create or replace function public.admin_start_ingest(p_id uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare s public.learning_sources%rowtype; v_secret text; v_job uuid; v_req bigint; v_apify text;
begin
  if not public.is_admin_caller() then raise exception 'not authorized'; end if;
  select * into s from public.learning_sources where id = p_id;
  if s.id is null then raise exception 'source not found'; end if;
  if s.handle is null or s.handle = '' then raise exception 'Isi handle Instagram dulu'; end if;
  if s.status not in ('pending','failed') then raise exception 'Sumber sedang/sudah diproses (status: %)', s.status; end if;
  select decrypted_secret into v_apify from vault.decrypted_secrets where name = 'APIFY_TOKEN';
  if v_apify is null or v_apify = '' then
    return jsonb_build_object('kicked', false, 'message', 'APIFY_TOKEN belum diisi di LLM & API — permintaan belum dikirim');
  end if;
  insert into public.learning_jobs (kind, source_id, payload) values ('ingest', s.id, jsonb_build_object('handle', s.handle, 'target', s.target_count)) returning id into v_job;
  update public.learning_sources set status = 'ingesting', last_error = null, meta = meta || jsonb_build_object('ingest_requested_at', now(), 'ingest_job_id', v_job) where id = s.id;
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'CRON_SECRET';
  select net.http_post(
    url := 'https://gexprynjrnfmnadbgglk.supabase.co/functions/v1/learn-ingest',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object('secret', v_secret, 'job_id', v_job, 'source_id', s.id),
    timeout_milliseconds := 110000
  ) into v_req;
  return jsonb_build_object('kicked', true, 'message', 'Ingest via Apify dimulai', 'job_id', v_job, 'request_id', v_req);
end; $$;
revoke all on function public.admin_start_ingest(uuid) from public, anon;
grant execute on function public.admin_start_ingest(uuid) to authenticated;

create or replace function public.admin_reset_learning_source(p_id uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare s public.learning_sources%rowtype;
begin
  if not public.is_admin_caller() then raise exception 'not authorized'; end if;
  update public.learning_sources set status = 'pending', last_error = null where id = p_id returning * into s;
  if s.id is null then raise exception 'source not found'; end if;
  return to_jsonb(s);
end; $$;
revoke all on function public.admin_reset_learning_source(uuid) from public, anon;
grant execute on function public.admin_reset_learning_source(uuid) to authenticated;

-- R9 + R5 in the panel: computed counts, frames from learning_assets, jobs summary
create or replace function public.admin_learning_panel() returns jsonb
language plpgsql security definer set search_path = public as $$
declare out jsonb;
begin
  if not public.is_admin_caller() then raise exception 'not authorized'; end if;
  select jsonb_build_object(
    'sources', (select coalesce(jsonb_agg(
        to_jsonb(s) || jsonb_build_object(
          'video_count', (select count(*) from public.learning_media m where m.source_id = s.id and m.media_type = 'video'),
          'media_analyzed', (select count(*) from public.learning_media m where m.source_id = s.id and m.status = 'analyzed'),
          'media_failed', (select count(*) from public.learning_media m where m.source_id = s.id and m.status = 'failed')
        ) order by s.created_at), '[]'::jsonb) from public.learning_sources s),
    'steps', (select coalesce(jsonb_agg(to_jsonb(st) order by st.step_no), '[]'::jsonb) from public.learning_steps st),
    'experts', (select value from public.engine_config where key = 'experts'),
    'media_total', (select count(*) from public.learning_media where media_type = 'video'),
    'media_analyzed', (select count(*) from public.learning_media where status = 'analyzed'),
    'media_failed', (select count(*) from public.learning_media where status = 'failed'),
    'frames_total', (select count(*) from public.learning_assets where kind = 'frame'),
    'assets', (select coalesce(jsonb_object_agg(kind, c), '{}'::jsonb) from (select kind, count(*) c from public.learning_assets group by kind) t),
    'jobs', (select coalesce(jsonb_object_agg(status, c), '{}'::jsonb) from (select status, count(*) c from public.learning_jobs group by status) t),
    'last_errors', (select coalesce(jsonb_agg(jsonb_build_object('kind', kind, 'error', error, 'at', finished_at) order by finished_at desc), '[]'::jsonb) from (select kind, error, finished_at from public.learning_jobs where status in ('failed','dead') order by finished_at desc limit 5) e),
    'recipes', (select coalesce(jsonb_agg(jsonb_build_object('id', id, 'name', name, 'persona', persona, 'version', version, 'level', level, 'status', status, 'up', up_count, 'down', down_count, 'relearn_due', (status <> 'archived' and coalesce((meta->>'relearn_due')::boolean, false)), 'flagged_at', meta->>'relearn_flagged_at') order by created_at desc), '[]'::jsonb) from public.content_recipes),
    'gen_total', (select count(*) from public.content_generations where status in ('ready','published')),
    'gen_failed', (select count(*) from public.content_generations where status = 'failed'),
    'gen_up', (select count(*) from public.content_generations where feedback = 'up'),
    'gen_down', (select count(*) from public.content_generations where feedback = 'down'),
    'samples', (select coalesce(jsonb_agg(jsonb_build_object('id', id, 'model', model, 'role', role, 'brief', brief, 'output', output, 'cost_idr', est_cost_idr, 'source', source, 'note', quality_note) order by est_cost_idr desc nulls last), '[]'::jsonb) from public.model_samples),
    'metrics', (select coalesce(jsonb_agg(to_jsonb(m) order by m.est_cost_idr desc), '[]'::jsonb) from public.model_metrics m where m.week = (select max(week) from public.model_metrics)),
    'routing', (select value from public.engine_config where key = 'pipeline_models'),
    'rates', (select value from public.engine_config where key = 'model_rates'),
    'plan_limits', (select value from public.engine_config where key = 'plan_limits'),
    'thresholds', (select value from public.engine_config where key = 'relearn_thresholds')
  ) into out;
  return out;
end; $$;;
