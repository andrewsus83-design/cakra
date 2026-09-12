create or replace function public.run_music_tick()
returns jsonb
language plpgsql security definer set search_path to ''
as $$
declare v_secret text; v_inflight int; v_slots int; t record; n int := 0; v_left int;
begin
  update public.bgm_queue set status = 'pending'
    where status = 'dispatched' and dispatched_at < now() - interval '5 minutes' and attempts < 6;
  update public.bgm_queue set status = 'failed'
    where status in ('pending','dispatched') and attempts >= 6;
  select count(*) into v_left from public.bgm_queue where status in ('pending','dispatched');
  if v_left = 0 then
    perform cron.unschedule('bgm-drain');   -- library complete; stop the drain
    return jsonb_build_object('done', true);
  end if;
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
