create or replace function public.run_content_plan(p_agent uuid)
returns bigint language plpgsql security definer set search_path to '' as $$
declare v_secret text; v_id bigint;
begin
  select decrypted_secret into v_secret from vault.decrypted_secrets where name='CRON_SECRET';
  select net.http_post(
    url := 'https://gexprynjrnfmnadbgglk.supabase.co/functions/v1/content-plan',
    headers := jsonb_build_object('Content-Type','application/json'),
    body := jsonb_build_object('agent_id', p_agent, 'secret', v_secret),
    timeout_milliseconds := 30000
  ) into v_id;
  return v_id;
end; $$;
revoke all on function public.run_content_plan(uuid) from public, anon, authenticated;
grant execute on function public.run_content_plan(uuid) to service_role;;
