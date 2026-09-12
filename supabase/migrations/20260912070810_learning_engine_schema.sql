-- cakra Learning + Recipe automation engine (the "central kitchen" IP).
-- learning_sources → learning_media → learning_frames → content_recipes → content_generations(+feedback)

create or replace function public.learn_touch_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;

-- 1. Reference agents we learn from (admin-only corpus). Paraland = external_real, Newton = inhouse.
create table if not exists public.learning_sources (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('external_real','inhouse')),
  name text not null,
  handle text,
  profile_url text,
  platform text not null default 'instagram',
  persona jsonb not null default '{}'::jsonb,
  target_count int not null default 100,
  video_count int not null default 0,
  status text not null default 'pending' check (status in ('pending','ingesting','extracted','analyzed','learned','failed')),
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Each ingested video (100+ per source).
create table if not exists public.learning_media (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.learning_sources(id) on delete cascade,
  platform text not null default 'instagram',
  external_id text,
  url text,
  caption text,
  posted_at timestamptz,
  duration_s numeric,
  like_count int,
  comment_count int,
  view_count int,
  thumb_url text,
  storage_path text,
  status text not null default 'queued' check (status in ('queued','downloaded','framed','analyzed','failed')),
  analysis jsonb not null default '{}'::jsonb,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_id, external_id)
);
create index if not exists learning_media_source_idx on public.learning_media(source_id);
create index if not exists learning_media_status_idx on public.learning_media(status);

-- 3. Frames sampled from each video (Step 2), with per-frame vision analysis (Step 3).
create table if not exists public.learning_frames (
  id uuid primary key default gen_random_uuid(),
  media_id uuid not null references public.learning_media(id) on delete cascade,
  idx int not null default 0,
  ts_ms int,
  storage_path text,
  analysis jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists learning_frames_media_idx on public.learning_frames(media_id);

-- 4. The recipe (Step 4) — the learned, structured automation parameters, per persona. Readable by
--    agents ONLY when active; the corpus + drafts stay admin-only IP.
create table if not exists public.content_recipes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  persona text not null default 'blend',
  scope jsonb not null default '{}'::jsonb,
  version int not null default 1,
  level int not null default 1,
  params jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft','active','archived')),
  up_count int not null default 0,
  down_count int not null default 0,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists content_recipes_status_idx on public.content_recipes(status);

-- 5. Editor outputs (Steps 6-7) + agent feedback (Step 8). Per-agent owned.
create table if not exists public.content_generations (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null default auth.uid(),
  recipe_id uuid references public.content_recipes(id) on delete set null,
  inputs jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  status text not null default 'queued' check (status in ('queued','generating','ready','published','rejected')),
  feedback text check (feedback in ('up','down')),
  feedback_at timestamptz,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists content_generations_agent_idx on public.content_generations(agent_id);
create index if not exists content_generations_recipe_idx on public.content_generations(recipe_id);

-- updated_at triggers
create trigger trg_touch_learning_sources before update on public.learning_sources for each row execute function public.learn_touch_updated_at();
create trigger trg_touch_learning_media before update on public.learning_media for each row execute function public.learn_touch_updated_at();
create trigger trg_touch_content_recipes before update on public.content_recipes for each row execute function public.learn_touch_updated_at();
create trigger trg_touch_content_generations before update on public.content_generations for each row execute function public.learn_touch_updated_at();

-- RLS
alter table public.learning_sources enable row level security;
alter table public.learning_media enable row level security;
alter table public.learning_frames enable row level security;
alter table public.content_recipes enable row level security;
alter table public.content_generations enable row level security;

-- Corpus + drafts: admin-only (cakra IP).
create policy learning_sources_admin on public.learning_sources for all using (public.is_admin_caller()) with check (public.is_admin_caller());
create policy learning_media_admin on public.learning_media for all using (public.is_admin_caller()) with check (public.is_admin_caller());
create policy learning_frames_admin on public.learning_frames for all using (public.is_admin_caller()) with check (public.is_admin_caller());

-- Recipes: agents may READ the active recipe (so the editor can apply it); only admin writes/reads drafts.
create policy content_recipes_read on public.content_recipes for select using (status = 'active' or public.is_admin_caller());
create policy content_recipes_admin_write on public.content_recipes for all using (public.is_admin_caller()) with check (public.is_admin_caller());

-- Generations: an agent owns their own; admin sees all.
create policy content_generations_own_select on public.content_generations for select using (agent_id = auth.uid() or public.is_admin_caller());
create policy content_generations_own_insert on public.content_generations for insert with check (agent_id = auth.uid());
create policy content_generations_own_update on public.content_generations for update using (agent_id = auth.uid()) with check (agent_id = auth.uid());
create policy content_generations_admin_all on public.content_generations for all using (public.is_admin_caller()) with check (public.is_admin_caller());

-- Seed the two learning sources (Step 1). Handles/URLs to be filled with the real IG profiles.
insert into public.learning_sources (kind, name, persona, meta)
values
  ('external_real', 'Paraland Property — real agent', '{"perspective":"real established West-Jakarta luxury agency","voice":"premium, generational-legacy","positioning":"Paraland Property (Andre Tjhia et al.)"}'::jsonb, '{"seed":"user","source_prospect":"paralandproperty.com"}'::jsonb),
  ('inhouse', 'The Newton — in-house agent', '{"perspective":"in-house project marketing (single asset focus)","voice":"CBD apartment, investor-friendly","positioning":"The Newton Kuningan by Ciputra"}'::jsonb, '{"seed":"user","subdomain":"thenewton"}'::jsonb);;
