
-- Clip library for the recycling engine: source videos are auto-cut into tagged, reusable clips
-- (agent's own footage + the global cakra b-roll), recombined into fresh daily videos.
create table if not exists public.clips (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references auth.users(id) on delete cascade,   -- null = global cakra library clip
  source_asset uuid,                 -- parent video (assets.id), nullable
  title text,
  storage_path text not null,        -- clip file URL (assets-global bucket)
  thumb text,                        -- representative keyframe URL
  duration_s numeric,
  scene_start numeric,               -- seconds into the source video
  scene_end numeric,
  tags text[] default '{}',          -- vision auto-tags: room/scene/mood (e.g. pool, lobby, sunset, aerial)
  meta jsonb default '{}',
  used_at timestamptz,               -- last time used in an assembled video (anti-repeat rotation)
  created_at timestamptz default now()
);
create index if not exists clips_agent_idx on public.clips (agent_id);
create index if not exists clips_tags_idx on public.clips using gin (tags);

alter table public.clips enable row level security;
-- Read: everyone sees global clips; agents also see their own.
create policy "clips read" on public.clips for select using (agent_id is null or agent_id = (select auth.uid()));
-- Write: agents manage only their own clips.
create policy "clips own insert" on public.clips for insert with check (agent_id = (select auth.uid()));
create policy "clips own update" on public.clips for update using (agent_id = (select auth.uid())) with check (agent_id = (select auth.uid()));
create policy "clips own delete" on public.clips for delete using (agent_id = (select auth.uid()));
grant select, insert, update, delete on public.clips to authenticated, service_role;
;
