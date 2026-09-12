create or replace function public.run_tag_clip(p_body jsonb)
returns bigint language plpgsql security definer set search_path to '' as $$
declare v_secret text; v_id bigint;
begin
  select decrypted_secret into v_secret from vault.decrypted_secrets where name='CRON_SECRET';
  select net.http_post(
    url := 'https://gexprynjrnfmnadbgglk.supabase.co/functions/v1/tag-clip',
    headers := jsonb_build_object('Content-Type','application/json'),
    body := p_body || jsonb_build_object('secret', v_secret),
    timeout_milliseconds := 40000
  ) into v_id;
  return v_id;
end; $$;
revoke all on function public.run_tag_clip(jsonb) from public, anon, authenticated;
grant execute on function public.run_tag_clip(jsonb) to service_role;;
