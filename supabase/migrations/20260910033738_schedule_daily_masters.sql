-- Server-side runner: posts to the generate-content Edge Function, reading CRON_SECRET from Vault.
-- SECURITY DEFINER; the secret is used internally and never returned.
create or replace function public.run_daily_masters() returns void
language plpgsql security definer set search_path = '' as $$
declare v_secret text;
begin
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'CRON_SECRET';
  perform net.http_post(
    url := 'https://gexprynjrnfmnadbgglk.supabase.co/functions/v1/generate-content',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object('mode', 'master', 'secret', v_secret)
  );
end $$;
revoke all on function public.run_daily_masters() from public, anon, authenticated;

-- 08:00 Asia/Jakarta = 01:00 UTC, every day.
select cron.schedule('daily-master-content', '0 1 * * *', 'select public.run_daily_masters()');;
