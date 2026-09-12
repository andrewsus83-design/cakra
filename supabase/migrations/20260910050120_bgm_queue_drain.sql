create table if not exists public.bgm_queue (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  prompt text not null,
  length_ms int not null,
  tags jsonb not null default '{}'::jsonb,
  status text not null default 'pending',   -- pending | dispatched | done | failed
  attempts int not null default 0,
  dispatched_at timestamptz,
  done_at timestamptz,
  created_at timestamptz default now()
);
alter table public.bgm_queue enable row level security;  -- no policies: service-role only

-- Drains the queue while never exceeding ElevenLabs' 2-concurrent cap. Reopens stale dispatches,
-- retires tracks that fail too many times, and dispatches only into free slots.
create or replace function public.run_music_tick()
returns jsonb
language plpgsql security definer set search_path to ''
as $$
declare v_secret text; v_inflight int; v_slots int; t record; n int := 0;
begin
  update public.bgm_queue set status = 'pending'
    where status = 'dispatched' and dispatched_at < now() - interval '5 minutes' and attempts < 6;
  update public.bgm_queue set status = 'failed'
    where status in ('pending','dispatched') and attempts >= 6;
  select count(*) into v_inflight from public.bgm_queue where status = 'dispatched';
  v_slots := 2 - v_inflight;
  if v_slots <= 0 then return jsonb_build_object('inflight', v_inflight, 'dispatched', 0); end if;
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'CRON_SECRET';
  for t in select * from public.bgm_queue where status = 'pending' order by created_at limit v_slots loop
    update public.bgm_queue set status = 'dispatched', dispatched_at = now(), attempts = attempts + 1 where id = t.id;
    perform net.http_post(
      url := 'https://gexprynjrnfmnadbgglk.supabase.co/functions/v1/generate-music',
      headers := jsonb_build_object('Content-Type', 'application/json'),
      body := jsonb_build_object('secret', v_secret, 'queue_id', t.id::text, 'title', t.title, 'prompt', t.prompt, 'length_ms', t.length_ms, 'tags', t.tags)
    );
    n := n + 1;
  end loop;
  return jsonb_build_object('inflight', v_inflight, 'dispatched', n);
end;
$$;;
