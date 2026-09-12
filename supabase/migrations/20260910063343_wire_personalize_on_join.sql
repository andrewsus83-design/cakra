-- H4: generate 2 personalized contents for an agent (idempotent per day, enforced in the edge fn).
create or replace function public.personalize_agent(p_agent uuid)
returns void language plpgsql security definer set search_path to '' as $$
declare v_secret text;
begin
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'CRON_SECRET';
  perform net.http_post(
    url := 'https://gexprynjrnfmnadbgglk.supabase.co/functions/v1/generate-content',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object('mode', 'personalize', 'secret', v_secret, 'agent_id', p_agent::text));
end; $$;
revoke execute on function public.personalize_agent(uuid) from public, anon, authenticated;

-- Fire once when an agent publishes (onboarding sets their subdomain).
create or replace function public.on_profile_publish()
returns trigger language plpgsql security definer set search_path to '' as $$
begin
  if new.subdomain is not null and (old.subdomain is distinct from new.subdomain) then
    perform public.personalize_agent(new.id);
  end if;
  return new;
end; $$;
drop trigger if exists trg_profile_publish on public.profiles;
create trigger trg_profile_publish after update of subdomain on public.profiles
  for each row execute function public.on_profile_publish();

-- Daily 2/day: personalize for every published agent, 15 min after the masters cron.
create or replace function public.run_daily_personalize()
returns void language plpgsql security definer set search_path to '' as $$
declare v_secret text; r record;
begin
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'CRON_SECRET';
  for r in select id from public.profiles where subdomain is not null loop
    perform net.http_post(
      url := 'https://gexprynjrnfmnadbgglk.supabase.co/functions/v1/generate-content',
      headers := jsonb_build_object('Content-Type', 'application/json'),
      body := jsonb_build_object('mode', 'personalize', 'secret', v_secret, 'agent_id', r.id::text));
  end loop;
end; $$;
revoke execute on function public.run_daily_personalize() from public, anon, authenticated;
select cron.schedule('daily-personalize', '15 1 * * *', 'select public.run_daily_personalize()');;
