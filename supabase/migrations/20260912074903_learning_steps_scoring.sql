-- One row per pipeline step, each independently scoreable (quality + efficiency) so every stage can
-- be measured, optimized, and tracked. route_keys link to engine_config.pipeline_models for the models.
create table if not exists public.learning_steps (
  step_no int primary key,
  key text not null,
  title text not null,
  description text,
  route_keys text[] not null default '{}',
  status text not null default 'pending' check (status in ('pending','active','done','blocked')),
  quality_score int check (quality_score between 0 and 100),
  efficiency_score int check (efficiency_score between 0 and 100),
  metrics jsonb not null default '{}'::jsonb,
  notes text,
  updated_at timestamptz not null default now()
);
alter table public.learning_steps enable row level security;
create policy learning_steps_admin on public.learning_steps for all using (public.is_admin_caller()) with check (public.is_admin_caller());

insert into public.learning_steps (step_no, key, title, description, route_keys, status) values
 (1,'ingest','Ingest', 'Tarik 100+ video Instagram dari 2 agen (Apify) → learning_media', array['1_ingest'], 'pending'),
 (2,'frames','Ekstrak frames', 'ffmpeg sampling tiap video → learning_frames', array['2_frames'], 'pending'),
 (3,'reverse','Reverse-engineering', 'GPT-6 baca tiap frame (hook, overlay, shot, transisi, grade) + Gemini index volume', array['3_vision','3_index'], 'pending'),
 (4,'recipe','Bangun resep', 'Sintesis semua parameter → resep terstruktur (Claude-MCP + Opus)', array['4_recipe'], 'pending'),
 (5,'automation','Automation aktif', 'Resep di-set active & siap dipakai editor', array[]::text[], 'pending'),
 (6,'generate','Agen generate', 'Agen input gambar/video/deskripsi/geo → resep diterapkan (Sonnet/Opus) + 3D/staging (GPT-6 async)', array['6_7_compose','6_7_visual3d'], 'pending'),
 (7,'editorial','Editorial jadi', 'Rakit hasil final + render video (Gemini/Kling)', array['6_7_video'], 'pending'),
 (8,'thumbs','Thumbs feedback', 'Agen kasih 👍 / 👎 tiap hasil', array[]::text[], 'pending'),
 (9,'relearn','Level-2 relearn', '20👎 / 100👍 → belajar ulang (Claude-MCP + GPT-6) → resep v2', array['9_relearn'], 'pending')
on conflict (step_no) do nothing;

-- Score / status / notes for a step (each stage optimized independently).
create or replace function public.admin_score_step(p_step_no int, p_quality int default null, p_efficiency int default null, p_status text default null, p_notes text default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare row public.learning_steps%rowtype;
begin
  if not public.is_admin_caller() then raise exception 'not authorized'; end if;
  update public.learning_steps set
    quality_score = coalesce(p_quality, quality_score),
    efficiency_score = coalesce(p_efficiency, efficiency_score),
    status = coalesce(nullif(p_status,''), status),
    notes = coalesce(p_notes, notes),
    updated_at = now()
  where step_no = p_step_no returning * into row;
  if row.step_no is null then raise exception 'step not found'; end if;
  return to_jsonb(row);
end; $$;
revoke all on function public.admin_score_step(int,int,int,text,text) from anon;
grant execute on function public.admin_score_step(int,int,int,text,text) to authenticated;;
