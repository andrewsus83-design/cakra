-- Each ingested video is decomposed into separate learnable facets, saved individually so every
-- lens can study its own signal: video (edit/motion), audio (music/sound), caption (copy/hook/CTA),
-- voice_tts (narration transcript + voice style, to later match TTS), image (post stills/composition),
-- frame (sampled moments for deep vision).
create table if not exists public.learning_assets (
  id uuid primary key default gen_random_uuid(),
  media_id uuid references public.learning_media(id) on delete cascade,
  source_id uuid references public.learning_sources(id) on delete cascade,
  kind text not null check (kind in ('video','audio','caption','voice_tts','image','frame')),
  storage_path text,          -- binary facets: video/audio/image/frame files
  content text,               -- text facets: caption text, voice_tts transcript
  duration_ms int,
  idx int not null default 0,
  analysis jsonb not null default '{}'::jsonb,   -- per-facet vision/text/audio analysis
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists learning_assets_media_idx on public.learning_assets(media_id);
create index if not exists learning_assets_source_idx on public.learning_assets(source_id);
create index if not exists learning_assets_kind_idx on public.learning_assets(kind);
create trigger trg_touch_learning_assets before update on public.learning_assets for each row execute function public.learn_touch_updated_at();

alter table public.learning_assets enable row level security;
create policy learning_assets_admin on public.learning_assets for all using (public.is_admin_caller()) with check (public.is_admin_caller());

-- refine step 2 description to name the facets it extracts
update public.learning_steps set description = 'ffmpeg dekomposisi tiap video → 6 facet: video, audio, caption, voice/TTS (transkrip + gaya suara), images, frames' where step_no = 2;

-- expose per-facet counts in the panel RPC
create or replace function public.admin_learning_panel() returns jsonb
language plpgsql security definer set search_path = public as $$
declare out jsonb;
begin
  if not public.is_admin_caller() then raise exception 'not authorized'; end if;
  select jsonb_build_object(
    'sources', (select coalesce(jsonb_agg(to_jsonb(s) order by s.created_at), '[]'::jsonb) from public.learning_sources s),
    'steps', (select coalesce(jsonb_agg(to_jsonb(st) order by st.step_no), '[]'::jsonb) from public.learning_steps st),
    'experts', (select value from public.engine_config where key='experts'),
    'media_total', (select count(*) from public.learning_media),
    'media_analyzed', (select count(*) from public.learning_media where status='analyzed'),
    'frames_total', (select count(*) from public.learning_frames),
    'assets', (select coalesce(jsonb_object_agg(kind, c), '{}'::jsonb) from (select kind, count(*) c from public.learning_assets group by kind) t),
    'recipes', (select coalesce(jsonb_agg(jsonb_build_object('id',id,'name',name,'persona',persona,'version',version,'level',level,'status',status,'up',up_count,'down',down_count,'relearn_due',coalesce((meta->>'relearn_due')::boolean,false)) order by created_at desc), '[]'::jsonb) from public.content_recipes),
    'gen_total', (select count(*) from public.content_generations),
    'gen_up', (select count(*) from public.content_generations where feedback='up'),
    'gen_down', (select count(*) from public.content_generations where feedback='down'),
    'samples', (select coalesce(jsonb_agg(jsonb_build_object('model',model,'role',role,'brief',brief,'output',output,'cost_idr',est_cost_idr,'source',source,'note',quality_note) order by est_cost_idr desc nulls last), '[]'::jsonb) from public.model_samples),
    'metrics', (select coalesce(jsonb_agg(to_jsonb(m) order by m.est_cost_idr desc), '[]'::jsonb) from public.model_metrics m where m.week = date_trunc('week', now())::date),
    'routing', (select value from public.engine_config where key='pipeline_models'),
    'rates', (select value from public.engine_config where key='model_rates'),
    'plan_limits', (select value from public.engine_config where key='plan_limits')
  ) into out;
  return out;
end; $$;;
