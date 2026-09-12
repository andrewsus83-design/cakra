-- Fan out a batch of BGM track specs to the generate-music Edge Function (reads CRON_SECRET from
-- Vault internally, like run_daily_masters). Called server-side; returns how many were dispatched.
create or replace function public.run_music_batch(p_tracks jsonb)
returns int
language plpgsql
security definer
set search_path to ''
as $$
declare v_secret text; t jsonb; n int := 0;
begin
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'CRON_SECRET';
  for t in select value from jsonb_array_elements(p_tracks) loop
    perform net.http_post(
      url := 'https://gexprynjrnfmnadbgglk.supabase.co/functions/v1/generate-music',
      headers := jsonb_build_object('Content-Type', 'application/json'),
      body := jsonb_build_object(
        'secret', v_secret,
        'title', t->>'title',
        'prompt', t->>'prompt',
        'length_ms', (t->>'length_ms')::int,
        'tags', t->'tags'
      )
    );
    n := n + 1;
  end loop;
  return n;
end;
$$;;
