create or replace function public.seed_bgm(p jsonb)
returns int language sql security definer set search_path = public as $$
  with ins as (
    insert into public.bgm_queue (title, prompt, length_ms, tags)
    select value->>'title', value->>'prompt', (value->>'length_ms')::int, value->'tags'
    from jsonb_array_elements(p)
    returning 1)
  select count(*)::int from ins;
$$;

-- Drain the queue once a minute (self-caps at 2 concurrent = ElevenLabs limit). Unschedule when done.
select cron.schedule('bgm-drain', '* * * * *', 'select public.run_music_tick()');;
