-- Audit fixes for the GENERATION + QUALITY loop (B1, B2, B3, R1-security, R2, R6, R7, R8, R10, B4).
-- Quota deliberately NOT enforced (product decision 2026-09-12). Ingestion items deferred.

-- ── B1: RLS policies call is_admin_caller() but authenticated had no EXECUTE → 42501 for every agent.
-- Grant to authenticated ONLY. Never anon (content_recipes_read = active OR admin → anon would read all recipes).
grant execute on function public.is_admin_caller() to authenticated;
revoke all on public.learning_sources, public.learning_media, public.learning_frames, public.learning_assets,
  public.content_recipes, public.content_generations, public.model_metrics, public.model_samples,
  public.learning_steps, public.engine_config from anon;

-- ── R2: leftover PUBLIC execute grants → callable by anon.
revoke execute on function public.refresh_model_metrics() from public;
revoke execute on function public.run_discover_prospects() from public;
revoke execute on function public.run_prospect_tick(uuid) from public;
revoke execute on function public.content_feedback_apply() from public, anon, authenticated;
revoke execute on function public.learn_touch_updated_at() from public, anon, authenticated;
alter function public.learn_touch_updated_at() set search_path = '';

-- ── R6: recipe lineage, guards, single-active-per-persona.
alter table public.content_recipes add column if not exists parent_id uuid references public.content_recipes(id) on delete set null;
create index if not exists content_recipes_parent_idx on public.content_recipes(parent_id);
alter table public.content_recipes add constraint content_recipes_counts_nonneg check (up_count >= 0 and down_count >= 0);
alter table public.content_recipes add constraint content_recipes_version_pos check (version > 0);
alter table public.content_recipes add constraint content_recipes_level_pos check (level >= 1);
alter table public.content_recipes add constraint content_recipes_parent_not_self check (parent_id is distinct from id);
create unique index if not exists content_recipes_one_active_per_persona on public.content_recipes(persona) where status = 'active';

-- ── R7 + R10: generation status 'failed', typed cost/model/error columns, FK to profiles.
alter table public.content_generations drop constraint content_generations_status_check;
alter table public.content_generations add constraint content_generations_status_check
  check (status in ('queued','generating','ready','published','rejected','failed'));
alter table public.content_generations
  add column if not exists model text,
  add column if not exists tokens_in int,
  add column if not exists tokens_out int,
  add column if not exists est_cost_idr numeric,
  add column if not exists error text,
  add column if not exists finished_at timestamptz;
alter table public.content_generations add constraint content_generations_agent_id_fkey
  foreign key (agent_id) references public.profiles(id) on delete cascade;
create index if not exists content_generations_agent_created_idx on public.content_generations(agent_id, created_at desc);
create index if not exists content_generations_created_idx on public.content_generations(created_at);
create index if not exists content_generations_recipe_fb_idx on public.content_generations(recipe_id, feedback, feedback_at);

-- ── R1 (security part only): agents get NO direct DML on content_generations; writes go through RPCs.
revoke insert, update, delete on public.content_generations from anon, authenticated;
drop policy if exists content_generations_own_insert on public.content_generations;
drop policy if exists content_generations_own_update on public.content_generations;

-- ── R8: stamp feedback_at server-side (BEFORE), count on INSERT too.
create or replace function public.content_feedback_stamp() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.feedback is null then new.feedback_at := null;
  elsif tg_op = 'INSERT' or new.feedback is distinct from old.feedback then new.feedback_at := now();
  else new.feedback_at := old.feedback_at;
  end if;
  return new;
end; $$;
revoke execute on function public.content_feedback_stamp() from public, anon, authenticated;
drop trigger if exists trg_content_feedback_stamp on public.content_generations;
create trigger trg_content_feedback_stamp before insert or update of feedback on public.content_generations
  for each row execute function public.content_feedback_stamp();
alter table public.content_generations add constraint content_generations_feedback_at_consistent
  check ((feedback is null) = (feedback_at is null));

-- ── B2 + B3: delta-based counters, only delivered generations on an ACTIVE recipe, no re-fire,
--    watermarks are NOT moved at flag time (admin_ack_relearn moves them), configurable thresholds.
insert into public.engine_config (key, value) values ('relearn_thresholds', jsonb_build_object('down', 20, 'up', 100))
  on conflict (key) do nothing;

create or replace function public.content_feedback_apply() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  r public.content_recipes%rowtype;
  up_delta int; down_delta int; since_up int; since_down int; th_down int; th_up int; cfg jsonb;
  base_up int; base_down int;
begin
  if new.recipe_id is null then return new; end if;
  if new.status not in ('ready','published') then return new; end if;
  up_delta   := (new.feedback is not distinct from 'up')::int   - (case when tg_op = 'UPDATE' then (old.feedback is not distinct from 'up')::int   else 0 end);
  down_delta := (new.feedback is not distinct from 'down')::int - (case when tg_op = 'UPDATE' then (old.feedback is not distinct from 'down')::int else 0 end);
  if up_delta = 0 and down_delta = 0 then return new; end if;

  update public.content_recipes
    set up_count = greatest(0, up_count + up_delta), down_count = greatest(0, down_count + down_delta)
    where id = new.recipe_id and status = 'active'
    returning * into r;
  if r.id is null then return new; end if;
  if coalesce((r.meta->>'relearn_due')::boolean, false) then return new; end if;

  select value into cfg from public.engine_config where key = 'relearn_thresholds';
  th_down := coalesce((cfg->>'down')::int, 20);
  th_up   := coalesce((cfg->>'up')::int, 100);
  base_up   := case when jsonb_typeof(r.meta->'relearn_up_at')   = 'number' then (r.meta->>'relearn_up_at')::int   else 0 end;
  base_down := case when jsonb_typeof(r.meta->'relearn_down_at') = 'number' then (r.meta->>'relearn_down_at')::int else 0 end;
  since_up   := r.up_count   - base_up;
  since_down := r.down_count - base_down;

  if since_down >= th_down or since_up >= th_up then
    update public.content_recipes
      set meta = r.meta
        || jsonb_build_object('relearn_due', true,
             'relearn_reasons', (select coalesce(jsonb_agg(x), '[]'::jsonb) from (select 'down_threshold' as x where since_down >= th_down union all select 'up_threshold' where since_up >= th_up) t),
             'relearn_flagged_at', now(),
             'relearn_flag_up', r.up_count, 'relearn_flag_down', r.down_count)
      where id = r.id;
  end if;
  return new;
end; $$;
revoke execute on function public.content_feedback_apply() from public, anon, authenticated;
drop trigger if exists trg_content_feedback on public.content_generations;
create trigger trg_content_feedback after insert or update of feedback on public.content_generations
  for each row when (new.recipe_id is not null) execute function public.content_feedback_apply();

-- ── Agent write paths (the ONLY way agents create/feed back generations). No quota by design.
create or replace function public.agent_start_generation(p_inputs jsonb default '{}'::jsonb, p_premium boolean default false)
returns uuid language plpgsql security definer set search_path = public as $$
declare rid uuid; gid uuid;
begin
  if auth.uid() is null then raise exception 'not authorized'; end if;
  select id into rid from public.content_recipes where status = 'active' order by level desc, version desc limit 1;
  if rid is null then raise exception 'Belum ada resep aktif'; end if;
  insert into public.content_generations (agent_id, recipe_id, inputs, status, meta)
    values (auth.uid(), rid, coalesce(p_inputs, '{}'::jsonb), 'queued', jsonb_build_object('premium', p_premium, 'requested_at', now()))
    returning id into gid;
  return gid;
end; $$;
revoke all on function public.agent_start_generation(jsonb, boolean) from public, anon;
grant execute on function public.agent_start_generation(jsonb, boolean) to authenticated;

create or replace function public.content_feedback_set(p_id uuid, p_feedback text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not authorized'; end if;
  if p_feedback is not null and p_feedback not in ('up','down') then raise exception 'bad feedback'; end if;
  update public.content_generations g set feedback = p_feedback
    where g.id = p_id and g.agent_id = auth.uid() and g.status in ('ready','published');
  if not found then raise exception 'not allowed'; end if;
end; $$;
revoke all on function public.content_feedback_set(uuid, text) from public, anon;
grant execute on function public.content_feedback_set(uuid, text) to authenticated;

-- ── Admin recipe lifecycle: activate (archiving the persona's current active first) + ack relearn.
create or replace function public.admin_set_recipe_status(p_id uuid, p_status text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare row public.content_recipes%rowtype;
begin
  if not public.is_admin_caller() then raise exception 'not authorized'; end if;
  if p_status not in ('draft','active','archived') then raise exception 'bad status'; end if;
  if p_status = 'active' then
    update public.content_recipes set status = 'archived'
      where status = 'active' and id <> p_id and persona = (select persona from public.content_recipes where id = p_id);
  end if;
  update public.content_recipes set status = p_status where id = p_id returning * into row;
  if row.id is null then raise exception 'recipe not found'; end if;
  return to_jsonb(row);
end; $$;
revoke all on function public.admin_set_recipe_status(uuid, text) from public, anon;
grant execute on function public.admin_set_recipe_status(uuid, text) to authenticated;

create or replace function public.admin_ack_relearn(p_recipe_id uuid, p_new_recipe_id uuid default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare old public.content_recipes%rowtype;
begin
  if not public.is_admin_caller() then raise exception 'not authorized'; end if;
  update public.content_recipes set meta = meta
      || jsonb_build_object('relearn_due', false, 'relearn_done_at', now(), 'relearn_up_at', up_count, 'relearn_down_at', down_count)
    where id = p_recipe_id returning * into old;
  if old.id is null then raise exception 'recipe not found'; end if;
  if p_new_recipe_id is not null then
    update public.content_recipes set parent_id = old.id, version = old.version + 1, level = greatest(level, old.level + 1)
      where id = p_new_recipe_id;
    perform public.admin_set_recipe_status(p_new_recipe_id, 'active');
  end if;
  return to_jsonb(old);
end; $$;
revoke all on function public.admin_ack_relearn(uuid, uuid) from public, anon;
grant execute on function public.admin_ack_relearn(uuid, uuid) to authenticated;

-- ── B4: bounded weekly rollup with guarded casts + finalize-last-week job.
create or replace function public.refresh_model_metrics(p_week date default null) returns void
language plpgsql security definer set search_path = public as $$
declare
  wk date := coalesce(p_week, date_trunc('week', now())::date);
  fx numeric := coalesce((select (value->>'fx_usd_idr')::numeric from public.engine_config where key='model_rates'), 16000);
  rates jsonb := coalesce((select value->'rates' from public.engine_config where key='model_rates'), '{}'::jsonb);
begin
  if coalesce(auth.role(),'') in ('anon','authenticated') and not public.is_admin_caller() then raise exception 'not authorized'; end if;
  insert into public.model_metrics (week, model, generations, up_count, down_count, quality, tokens_in, tokens_out, est_cost_idr, updated_at)
  select wk, coalesce(g.model, g.meta->>'model', '(unknown)'),
    count(*)::int,
    count(*) filter (where g.feedback='up')::int,
    count(*) filter (where g.feedback='down')::int,
    case when count(*) filter (where g.feedback in ('up','down')) > 0
         then round(100.0 * count(*) filter (where g.feedback='up') / count(*) filter (where g.feedback in ('up','down')), 1) else null end,
    coalesce(sum(coalesce(g.tokens_in, 0)), 0),
    coalesce(sum(coalesce(g.tokens_out, 0)), 0),
    coalesce(sum(coalesce(g.est_cost_idr,
      (coalesce(g.tokens_in,0)/1e6) * coalesce((rates->coalesce(g.model, g.meta->>'model')->>'in')::numeric,0) * fx
    + (coalesce(g.tokens_out,0)/1e6) * coalesce((rates->coalesce(g.model, g.meta->>'model')->>'out')::numeric,0) * fx)), 0),
    now()
  from public.content_generations g
  where g.created_at >= wk and g.created_at < wk + 7 and g.status in ('ready','published')
  group by coalesce(g.model, g.meta->>'model', '(unknown)')
  on conflict (week, model) do update set
    generations = excluded.generations, up_count = excluded.up_count, down_count = excluded.down_count,
    quality = excluded.quality, tokens_in = excluded.tokens_in, tokens_out = excluded.tokens_out,
    est_cost_idr = excluded.est_cost_idr, updated_at = now();
end; $$;
revoke execute on function public.refresh_model_metrics(date) from public, anon, authenticated;
select cron.unschedule('refresh-model-metrics-weekly');
select cron.schedule('refresh-model-metrics-finalize', '5 1 * * 1', $$ select public.refresh_model_metrics((date_trunc('week', now()) - interval '1 week')::date); $$);
select cron.schedule('refresh-model-metrics-hourly', '5 * * * *', $$ select public.refresh_model_metrics(); $$);

-- touch triggers that were missing
create trigger trg_touch_learning_steps before update on public.learning_steps for each row execute function public.learn_touch_updated_at();
create trigger trg_touch_engine_config before update on public.engine_config for each row execute function public.learn_touch_updated_at();
create trigger trg_touch_model_samples before update on public.model_samples for each row execute function public.learn_touch_updated_at();;
