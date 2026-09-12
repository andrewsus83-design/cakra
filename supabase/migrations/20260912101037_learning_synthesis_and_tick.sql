-- Step 4 / Step 9 brain: digests for Claude-MCP recipe synthesis + relearn, recipe upsert, a cron
-- safety-net for stuck jobs, and a dry-run limit on ingestion.

create or replace function public.learn_num(t text) returns numeric language plpgsql immutable as $$
begin return t::numeric; exception when others then return null; end; $$;
revoke execute on function public.learn_num(text) from public, anon, authenticated;

-- Aggregated Step-3 findings across analyzed videos (engagement-weighted). Input for P4 synthesis.
create or replace function public.admin_learning_digest(p_source_id uuid default null) returns jsonb
language plpgsql security definer set search_path = public as $$
declare out jsonb;
begin
  if not public.is_admin_caller() then raise exception 'not authorized'; end if;
  with w as (
    select id, source_id, analysis, caption, duration_s, view_count, like_count, comment_count,
           coalesce(view_count, like_count * 20, 1)::numeric as weight
    from public.learning_media
    where status = 'analyzed' and (p_source_id is null or source_id = p_source_id)
  )
  select jsonb_build_object(
    'scope', jsonb_build_object('source_id', p_source_id, 'videos', (select count(*) from w),
      'sources', (select coalesce(jsonb_agg(jsonb_build_object('id', s.id, 'name', s.name, 'kind', s.kind, 'handle', s.handle)), '[]'::jsonb) from public.learning_sources s where s.id in (select distinct source_id from w))),
    'duration', (select jsonb_build_object('p50', percentile_cont(0.5) within group (order by duration_s), 'p90', percentile_cont(0.9) within group (order by duration_s)) from w where duration_s is not null),
    'hook_types', (select coalesce(jsonb_agg(jsonb_build_object('type', t, 'n', n, 'weight', ws, 'examples', ex) order by ws desc), '[]'::jsonb) from (
        select analysis->'index'->'hook'->>'type' t, count(*) n, sum(weight) ws, (array_agg(analysis->'index'->'hook'->>'text' order by weight desc))[1:3] ex
        from w where analysis->'index'->'hook'->>'type' is not null group by 1) x),
    'cta_types', (select coalesce(jsonb_agg(jsonb_build_object('type', t, 'n', n) order by n desc), '[]'::jsonb) from (
        select coalesce(analysis->'index'->'cta'->>'type', analysis->'caption'->>'cta_type') t, count(*) n from w group by 1) x),
    'shot_types', (select coalesce(jsonb_agg(jsonb_build_object('shot', s, 'n', n) order by n desc), '[]'::jsonb) from (
        select sc->>'shot_type' s, count(*) n from w, jsonb_array_elements(coalesce(analysis->'index'->'scenes', '[]'::jsonb)) sc group by 1) x),
    'camera_motion', (select coalesce(jsonb_agg(jsonb_build_object('motion', s, 'n', n) order by n desc), '[]'::jsonb) from (
        select sc->>'camera_motion' s, count(*) n from w, jsonb_array_elements(coalesce(analysis->'index'->'scenes', '[]'::jsonb)) sc group by 1) x),
    'scenes_avg', (select avg(jsonb_array_length(coalesce(analysis->'index'->'scenes', '[]'::jsonb))) from w),
    'music', (select jsonb_build_object(
        'present_pct', avg(case when analysis->'index'->'music'->>'present' = 'true' then 100 else 0 end),
        'genres', (select coalesce(jsonb_agg(jsonb_build_object('g', g, 'n', n) order by n desc), '[]'::jsonb) from (select analysis->'index'->'music'->>'genre' g, count(*) n from w where analysis->'index'->'music'->>'genre' is not null group by 1) y),
        'tempo', (select coalesce(jsonb_agg(jsonb_build_object('t', t, 'n', n) order by n desc), '[]'::jsonb) from (select analysis->'index'->'music'->>'tempo' t, count(*) n from w where analysis->'index'->'music'->>'tempo' is not null group by 1) y)) from w),
    'voice', (select jsonb_build_object(
        'present_pct', avg(case when analysis->'index'->'voice'->>'present' = 'true' then 100 else 0 end),
        'wpm_avg', avg(public.learn_num(analysis->'voice'->>'wpm')),
        'registers', (select coalesce(jsonb_agg(jsonb_build_object('r', r, 'n', n) order by n desc), '[]'::jsonb) from (select analysis->'voice'->>'register' r, count(*) n from w where analysis->'voice'->>'register' is not null group by 1) y),
        'openings', (select coalesce(jsonb_agg(o), '[]'::jsonb) from (select distinct analysis->'voice'->>'opening_formula' o from w where analysis->'voice'->>'opening_formula' is not null limit 8) y),
        'closings', (select coalesce(jsonb_agg(o), '[]'::jsonb) from (select distinct analysis->'voice'->>'closing_formula' o from w where analysis->'voice'->>'closing_formula' is not null limit 8) y)) from w),
    'caption', (select jsonb_build_object(
        'len_avg', avg(public.learn_num(analysis->'caption'->>'length_chars')),
        'hashtags_avg', avg(public.learn_num(analysis->'caption'->>'hashtag_count')),
        'emoji', (select coalesce(jsonb_agg(jsonb_build_object('d', d, 'n', n) order by n desc), '[]'::jsonb) from (select analysis->'caption'->>'emoji_density' d, count(*) n from w where analysis->'caption'->>'emoji_density' is not null group by 1) y),
        'structures', (select coalesce(jsonb_agg(st), '[]'::jsonb) from (select distinct analysis->'caption'->'structure' st from w where analysis->'caption'->'structure' is not null limit 6) y),
        'selling_angles', (select coalesce(jsonb_agg(jsonb_build_object('a', a, 'n', n) order by n desc), '[]'::jsonb) from (select a, count(*) n from w, jsonb_array_elements_text(coalesce(analysis->'caption'->'selling_angles', '[]'::jsonb)) a group by 1) y),
        'tones', (select coalesce(jsonb_agg(jsonb_build_object('t', t, 'n', n) order by n desc), '[]'::jsonb) from (select analysis->'caption'->>'tone' t, count(*) n from w where analysis->'caption'->>'tone' is not null group by 1) y)) from w),
    'visual', (select jsonb_build_object(
        'temperature', (select coalesce(jsonb_agg(jsonb_build_object('v', v, 'n', n) order by n desc), '[]'::jsonb) from (select analysis->'cover'->'color_grade'->>'temperature' v, count(*) n from w where analysis->'cover' is not null group by 1) y),
        'typography_position', (select coalesce(jsonb_agg(jsonb_build_object('v', v, 'n', n) order by n desc), '[]'::jsonb) from (select analysis->'cover'->'typography'->>'position' v, count(*) n from w where analysis->'cover' is not null group by 1) y),
        'font_weight', (select coalesce(jsonb_agg(jsonb_build_object('v', v, 'n', n) order by n desc), '[]'::jsonb) from (select analysis->'cover'->'typography'->>'weight' v, count(*) n from w where analysis->'cover' is not null group by 1) y),
        'quality_avg', avg(public.learn_num(analysis->'cover'->>'visual_quality_1_10'))) from w),
    'top_videos', (select coalesce(jsonb_agg(jsonb_build_object('id', id, 'views', view_count, 'likes', like_count, 'comments', comment_count, 'duration_s', duration_s,
        'hook', analysis->'index'->'hook'->>'text', 'hook_type', analysis->'index'->'hook'->>'type', 'cta', analysis->'index'->'cta'->>'text', 'caption', left(caption, 300)) order by weight desc), '[]'::jsonb)
        from (select * from w order by weight desc limit 12) t)
  ) into out;
  return out;
end; $$;
revoke all on function public.admin_learning_digest(uuid) from public, anon;
grant execute on function public.admin_learning_digest(uuid) to authenticated;

-- Level-2 input: the 👎 generations (inputs+outputs) since the flag, plus 👍 exemplars.
create or replace function public.admin_relearn_digest(p_recipe_id uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r public.content_recipes%rowtype; since timestamptz; out jsonb;
begin
  if not public.is_admin_caller() then raise exception 'not authorized'; end if;
  select * into r from public.content_recipes where id = p_recipe_id;
  if r.id is null then raise exception 'recipe not found'; end if;
  since := coalesce((r.meta->>'relearn_done_at')::timestamptz, '-infinity'::timestamptz);
  select jsonb_build_object(
    'recipe', jsonb_build_object('id', r.id, 'name', r.name, 'persona', r.persona, 'version', r.version, 'level', r.level, 'params', r.params, 'up', r.up_count, 'down', r.down_count, 'meta', r.meta),
    'thresholds', (select value from public.engine_config where key = 'relearn_thresholds'),
    'downs', (select coalesce(jsonb_agg(jsonb_build_object('id', id, 'agent_id', agent_id, 'at', feedback_at, 'inputs', inputs, 'output', output, 'model', model) order by feedback_at desc), '[]'::jsonb)
              from public.content_generations where recipe_id = r.id and feedback = 'down' and feedback_at > since),
    'ups', (select coalesce(jsonb_agg(jsonb_build_object('id', id, 'at', feedback_at, 'inputs', inputs, 'output', output) order by feedback_at desc), '[]'::jsonb)
            from (select * from public.content_generations where recipe_id = r.id and feedback = 'up' and feedback_at > since order by feedback_at desc limit 10) u),
    'distinct_down_agents', (select count(distinct agent_id) from public.content_generations where recipe_id = r.id and feedback = 'down' and feedback_at > since)
  ) into out;
  return out;
end; $$;
revoke all on function public.admin_relearn_digest(uuid) from public, anon;
grant execute on function public.admin_relearn_digest(uuid) to authenticated;

-- Write a synthesized recipe (draft). With p_parent_id: version+1, level+1 (a relearn child).
create or replace function public.admin_upsert_recipe(p_name text, p_params jsonb, p_persona text default 'blend', p_parent_id uuid default null, p_scope jsonb default '{}'::jsonb, p_id uuid default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare parent public.content_recipes%rowtype; row public.content_recipes%rowtype;
begin
  if not public.is_admin_caller() then raise exception 'not authorized'; end if;
  if p_id is not null then
    update public.content_recipes set name = p_name, params = p_params, scope = p_scope where id = p_id and status = 'draft' returning * into row;
    if row.id is null then raise exception 'draft recipe not found (only drafts are editable)'; end if;
    return to_jsonb(row);
  end if;
  if p_parent_id is not null then select * into parent from public.content_recipes where id = p_parent_id; end if;
  insert into public.content_recipes (name, persona, scope, version, level, params, status, parent_id, meta)
    values (p_name, coalesce(nullif(p_persona, ''), coalesce(parent.persona, 'blend')), p_scope,
            coalesce(parent.version, 0) + 1, case when parent.id is not null then parent.level + 1 else 1 end,
            p_params, 'draft', parent.id, jsonb_build_object('authored_by', 'claude-mcp', 'synthesized_at', now()))
    returning * into row;
  return to_jsonb(row);
end; $$;
revoke all on function public.admin_upsert_recipe(text, jsonb, text, uuid, jsonb, uuid) from public, anon;
grant execute on function public.admin_upsert_recipe(text, jsonb, text, uuid, jsonb, uuid) to authenticated;

-- P4 (synthesis) and P9 (relearn) prompts — executed by Claude-MCP at design time, stored for versioning.
update public.engine_config set value = jsonb_set(value, '{steps,4_recipe,api_id}', '"claude-mcp"'), updated_at = now() where key = 'pipeline_models';
insert into public.prompt_templates (step_key, route_key, model, version, system_prompt, user_template, output_schema, variables, author_experts) values
('4_recipe', '4_recipe', 'claude-mcp', 1,
$s$Anda tim resep cakra (CMO + Creative/Art Director + Prompt Engineer, CTO menjaga efisiensi). Dari DIGEST hasil reverse-engineering (agregat lintas video, berbobot engagement), sintesis SATU resep konten yang TERGENERALISASI: pola hook (dengan frekuensi & contoh yang digeneralisasi, bukan disalin), template scene beserta timing, gaya overlay/tipografi, template caption & tier hashtag, pustaka CTA, profil musik & suara, dan daftar do_not. Utamakan pola yang terbukti pada video berperforma tinggi. Jangan menyalin kalimat spesifik agen sumber; ubah menjadi template dengan placeholder. Sertakan evidence (jumlah video, sumber). Keluaran HARUS satu objek JSON valid sesuai OUTPUT SCHEMA (schema_version 2).$s$,
$u$PERSONA TARGET: {{persona}}

RESEP SAAT INI (untuk dibandingkan/diperbaiki, boleh null):
{{current_recipe_json}}

DIGEST (agregat Step 3):
{{digest_json}}

OUTPUT SCHEMA:
{{output_schema}}$u$,
$j${"schema_version": 2, "format_mix": {}, "duration_p50_p90": {"p50": 0, "p90": 0}, "hook_patterns": [{"pattern": "string", "freq": 0, "template": "string", "example": "string"}], "scene_templates": [{"name": "string", "t": "0-3", "shot": "string", "overlay": "string", "motion": "string"}], "overlay_style": {}, "caption_template": {}, "cta_library": [{"type": "string", "text": "string"}], "music_profile": {}, "voice_profile": {}, "do_not": ["string"], "evidence": {"videos": 0, "sources": [], "top_hooks": []}}$j$::jsonb,
array['persona','current_recipe_json','digest_json','output_schema'], array['cmo','art_director','prompt_engineer','cto']),
('9_relearn', '9_relearn', 'claude-mcp', 1,
$s$Anda tim resep cakra melakukan pembelajaran ulang level-2. Diberi resep aktif, daftar hasil yang mendapat 👎 (input + output) dan contoh 👍. Diagnosis pola kegagalan (hook lemah? caption terlalu panjang? CTA salah? fakta dilanggar? nada?) lalu hasilkan params_v2 yang memperbaiki HANYA yang terbukti bermasalah, sambil mempertahankan apa yang disukai. Jelaskan diff. Keluaran HARUS satu objek JSON valid sesuai OUTPUT SCHEMA.$s$,
$u$RESEP AKTIF:
{{recipe_json}}

HASIL 👎 (sejak relearn terakhir):
{{downs_json}}

CONTOH 👍:
{{ups_json}}

OUTPUT SCHEMA:
{{output_schema}}$u$,
$j${"diff_summary": "string", "failure_patterns": ["string"], "changed_keys": ["string"], "params_v2": {}, "rationale": "string", "expected_lift": "string"}$j$::jsonb,
array['recipe_json','downs_json','ups_json','output_schema'], array['cmo','art_director','prompt_engineer']);

-- Cron safety-net: requeue stale running jobs, dead-letter exhausted ones, re-kick idle workers.
create or replace function public.run_learn_tick() returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_secret text; k text; n_requeued int := 0; n_dead int := 0; kicked text[] := '{}';
begin
  update public.learning_jobs set status = 'dead', finished_at = now(), error = coalesce(error, '') || ' [stale>15m, attempts exhausted]'
    where status = 'running' and started_at < now() - interval '15 minutes' and attempts >= 3;
  get diagnostics n_dead = row_count;
  update public.learning_jobs set status = 'queued', error = coalesce(error, '') || ' [stale-requeued]'
    where status = 'running' and started_at < now() - interval '15 minutes';
  get diagnostics n_requeued = row_count;
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'CRON_SECRET';
  foreach k in array array['download', 'analyze'] loop
    if exists (select 1 from public.learning_jobs where kind = k and status = 'queued')
       and not exists (select 1 from public.learning_jobs where kind = k and status = 'running') then
      perform net.http_post(url := 'https://gexprynjrnfmnadbgglk.supabase.co/functions/v1/learn-' || k,
        headers := jsonb_build_object('Content-Type', 'application/json'), body := jsonb_build_object('secret', v_secret), timeout_milliseconds := 30000);
      kicked := kicked || k;
    end if;
  end loop;
  return jsonb_build_object('requeued', n_requeued, 'dead', n_dead, 'kicked', kicked);
end; $$;
revoke execute on function public.run_learn_tick() from public, anon, authenticated;
select cron.schedule('learn-tick', '*/10 * * * *', $$ select public.run_learn_tick(); $$);

-- Dry-run limit: admin_start_ingest(p_id, p_limit) — p_limit overrides target_count for this run.
drop function if exists public.admin_start_ingest(uuid);
create or replace function public.admin_start_ingest(p_id uuid, p_limit int default null) returns jsonb
language plpgsql security definer set search_path = public as $$
declare s public.learning_sources%rowtype; v_secret text; v_job uuid; v_req bigint; v_apify text; v_target int;
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
  v_target := greatest(1, least(coalesce(p_limit, s.target_count, 100), 500));
  insert into public.learning_jobs (kind, source_id, payload) values ('ingest', s.id, jsonb_build_object('handle', s.handle, 'target', v_target, 'dry_run', p_limit is not null)) returning id into v_job;
  update public.learning_sources set status = 'ingesting', last_error = null, meta = meta || jsonb_build_object('ingest_requested_at', now(), 'ingest_job_id', v_job, 'ingest_target', v_target) where id = s.id;
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'CRON_SECRET';
  select net.http_post(url := 'https://gexprynjrnfmnadbgglk.supabase.co/functions/v1/learn-ingest',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object('secret', v_secret, 'job_id', v_job, 'source_id', s.id), timeout_milliseconds := 110000) into v_req;
  return jsonb_build_object('kicked', true, 'message', case when p_limit is not null then 'Dry-run ' || v_target || ' video dimulai' else 'Ingest via Apify dimulai (' || v_target || ' video)' end, 'job_id', v_job, 'request_id', v_req);
end; $$;
revoke all on function public.admin_start_ingest(uuid, int) from public, anon;
grant execute on function public.admin_start_ingest(uuid, int) to authenticated;;
