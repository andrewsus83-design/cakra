-- Cost-vs-quality tracking for the dashboard: real price rates, a weekly rollup of actual agent
-- feedback per model, and a per-model sample gallery.

-- Real price rates (USD per 1M tokens) + FX. gpt-6 left null = "verify live" (not fabricated).
insert into public.engine_config (key, value) values ('model_rates', jsonb_build_object(
  'fx_usd_idr', 16000,
  'unit', 'USD per 1M tokens (verify against live pricing pages)',
  'rates', jsonb_build_object(
    'claude-haiku-4-5', jsonb_build_object('in', 1,  'out', 5),
    'claude-sonnet-5',  jsonb_build_object('in', 3,  'out', 15),
    'claude-opus-5',    jsonb_build_object('in', 15, 'out', 75),
    'gemini-flash',     jsonb_build_object('in', 0.1,'out', 0.4),
    'gpt-6',            jsonb_build_object('in', null,'out', null, 'note','verify live — not confirmable')
  )
)) on conflict (key) do update set value = excluded.value, updated_at = now();

-- Weekly per-model rollup.
create table if not exists public.model_metrics (
  id uuid primary key default gen_random_uuid(),
  week date not null,
  model text not null,
  role text,
  generations int not null default 0,
  up_count int not null default 0,
  down_count int not null default 0,
  quality numeric,               -- up/(up+down) * 100, null until feedback exists
  tokens_in bigint not null default 0,
  tokens_out bigint not null default 0,
  est_cost_idr numeric not null default 0,
  meta jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (week, model)
);
alter table public.model_metrics enable row level security;
create policy model_metrics_admin on public.model_metrics for all using (public.is_admin_caller()) with check (public.is_admin_caller());

-- Per-model sample gallery (one reference brief -> one output per model, for side-by-side quality).
create table if not exists public.model_samples (
  id uuid primary key default gen_random_uuid(),
  model text not null,
  role text,                     -- e.g. 'compose', 'recipe_vision'
  brief text,                    -- the shared reference brief
  input jsonb not null default '{}'::jsonb,
  output text,
  tokens_in int,
  tokens_out int,
  est_cost_idr numeric,
  source text not null default 'pending' check (source in ('pending','claude_mcp','live_api')),
  quality_note text,
  is_reference boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.model_samples enable row level security;
create policy model_samples_admin on public.model_samples for all using (public.is_admin_caller()) with check (public.is_admin_caller());

-- Weekly rollup: aggregate REAL content_generations (by meta->>'model') for the current ISO week.
-- Cost from meta token counts x the rate config. Quality from actual up/down feedback.
create or replace function public.refresh_model_metrics() returns void
language plpgsql security definer set search_path = public as $$
declare
  wk date := date_trunc('week', now())::date;
  fx numeric := coalesce((select (value->>'fx_usd_idr')::numeric from public.engine_config where key='model_rates'), 16000);
  rates jsonb := coalesce((select value->'rates' from public.engine_config where key='model_rates'), '{}'::jsonb);
begin
  insert into public.model_metrics (week, model, generations, up_count, down_count, quality, tokens_in, tokens_out, est_cost_idr, updated_at)
  select
    wk,
    coalesce(g.meta->>'model','(unknown)') as model,
    count(*)::int,
    count(*) filter (where g.feedback='up')::int,
    count(*) filter (where g.feedback='down')::int,
    case when count(*) filter (where g.feedback in ('up','down')) > 0
         then round(100.0 * count(*) filter (where g.feedback='up') / count(*) filter (where g.feedback in ('up','down')), 1)
         else null end,
    coalesce(sum((g.meta->>'tokens_in')::bigint),0),
    coalesce(sum((g.meta->>'tokens_out')::bigint),0),
    coalesce(sum(
      (coalesce((g.meta->>'tokens_in')::numeric,0)/1e6) * coalesce((rates->(g.meta->>'model')->>'in')::numeric,0) * fx
    + (coalesce((g.meta->>'tokens_out')::numeric,0)/1e6) * coalesce((rates->(g.meta->>'model')->>'out')::numeric,0) * fx
    ),0),
    now()
  from public.content_generations g
  where g.created_at >= wk
  group by coalesce(g.meta->>'model','(unknown)')
  on conflict (week, model) do update set
    generations = excluded.generations, up_count = excluded.up_count, down_count = excluded.down_count,
    quality = excluded.quality, tokens_in = excluded.tokens_in, tokens_out = excluded.tokens_out,
    est_cost_idr = excluded.est_cost_idr, updated_at = now();
end; $$;

revoke all on function public.refresh_model_metrics() from anon, authenticated;;
