-- Model routing for the Learning engine: which model does each pipeline stage, and the hard rule
-- that Claude-via-MCP is SYSTEM orchestration/learning only ($0, design-time) while per-agent
-- real-time generation (steps 6-7) must go through paid, low-latency APIs.
create table if not exists public.engine_config (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.engine_config enable row level security;
create policy engine_config_admin on public.engine_config for all using (public.is_admin_caller()) with check (public.is_admin_caller());

insert into public.engine_config (key, value) values ('pipeline_models', jsonb_build_object(
  'principle', jsonb_build_object(
    'claude_mcp', 'SYSTEM orchestration + level-1 & level-2 LEARNING only — design-time, $0, NOT real-time and NOT per-agent scale',
    'apis_realtime', 'Steps 6-7 (agent input -> generate content/video) run per-agent in real time -> paid low-latency APIs, never MCP'
  ),
  'steps', jsonb_build_object(
    '1_ingest',        jsonb_build_object('engine','IG scraper API (Apify/RapidAPI) + object storage','llm', null),
    '2_frames',        jsonb_build_object('engine','ffmpeg worker (queue/edge)','llm', null),
    '3_vision',        jsonb_build_object('primary','gpt-6','role','Per-frame visual reverse-engineering: shot type, text overlays, framing, transitions, color grade, on-screen elements'),
    '3_index',         jsonb_build_object('primary','gemini-flash','role','High-volume pass: caption every frame/clip + embeddings -> searchable pattern index'),
    '4_recipe',        jsonb_build_object('primary','claude-mcp','heavy','claude-opus-5','role','Synthesize thousands of observations -> structured, generalizable recipe (level-1 via MCP $0; Opus API only if scale exceeds MCP budget)'),
    '6_7_compose',     jsonb_build_object('primary','claude-sonnet-5','fast','claude-haiku-4-5','role','Real-time editorial composition (script/caption/edit-plan) per agent — API'),
    '6_7_input_vision',jsonb_build_object('primary','gpt-6','alt','gemini','role','Understand the agent-uploaded images/videos in real time'),
    '6_7_video',       jsonb_build_object('primary','gemini-video','alt','kling','role','Auto-generate the video — generation API, not an LLM'),
    '9_relearn',       jsonb_build_object('primary','claude-mcp','role','Level-2 re-learning from thumbs feedback — $0 orchestration')
  )
)) on conflict (key) do update set value = excluded.value, updated_at = now();;
