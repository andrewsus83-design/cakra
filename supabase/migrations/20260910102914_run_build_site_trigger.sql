create or replace function public.run_build_site(p_agent uuid)
returns void
language plpgsql
security definer
set search_path to ''
as $function$
declare v_secret text;
begin
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'CRON_SECRET';
  perform net.http_post(
    url := 'https://gexprynjrnfmnadbgglk.supabase.co/functions/v1/build-site',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object('agent_id', p_agent, 'secret', v_secret)
  );
end;
$function$;
revoke execute on function public.run_build_site(uuid) from public, anon, authenticated;
grant execute on function public.run_build_site(uuid) to service_role;;
