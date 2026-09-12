create or replace function public.run_voice(p_body jsonb)
returns void
language plpgsql
security definer
set search_path to ''
as $function$
declare v_secret text;
begin
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'CRON_SECRET';
  perform net.http_post(
    url := 'https://gexprynjrnfmnadbgglk.supabase.co/functions/v1/voice',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := p_body || jsonb_build_object('secret', v_secret)
  );
end;
$function$;
revoke execute on function public.run_voice(jsonb) from public, anon, authenticated;
grant execute on function public.run_voice(jsonb) to service_role;;
