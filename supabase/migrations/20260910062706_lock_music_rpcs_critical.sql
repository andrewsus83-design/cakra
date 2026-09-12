-- CRITICAL: these SECURITY DEFINER functions read CRON_SECRET from the vault and fan out to the
-- billed generate-music Edge Function. Postgres granted EXECUTE to PUBLIC by default → an anon
-- caller could trigger unbounded ElevenLabs cost. Lock to service_role only (pg_cron runs as owner).
revoke execute on function public.run_music_batch(jsonb) from public, anon, authenticated;
revoke execute on function public.run_music_tick() from public, anon, authenticated;
revoke execute on function public.seed_bgm(jsonb) from public, anon, authenticated;
grant execute on function public.run_music_batch(jsonb) to service_role;
grant execute on function public.run_music_tick() to service_role;
grant execute on function public.seed_bgm(jsonb) to service_role;

-- defense-in-depth: hard cap the batch size inside run_music_batch
create or replace function public.run_music_batch(p_tracks jsonb)
returns int
language plpgsql
security definer
set search_path to ''
as $$
declare v_secret text; t jsonb; n int := 0;
begin
  if jsonb_typeof(p_tracks) <> 'array' or jsonb_array_length(p_tracks) > 50 then
    raise exception 'invalid batch (max 50)';
  end if;
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'CRON_SECRET';
  for t in select value from jsonb_array_elements(p_tracks) loop
    perform net.http_post(
      url := 'https://gexprynjrnfmnadbgglk.supabase.co/functions/v1/generate-music',
      headers := jsonb_build_object('Content-Type', 'application/json'),
      body := jsonb_build_object('secret', v_secret, 'title', t->>'title', 'prompt', t->>'prompt', 'length_ms', (t->>'length_ms')::int, 'tags', t->'tags')
    );
    n := n + 1;
  end loop;
  return n;
end;
$$;
revoke execute on function public.run_music_batch(jsonb) from public, anon, authenticated;
grant execute on function public.run_music_batch(jsonb) to service_role;;
