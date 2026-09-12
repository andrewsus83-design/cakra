create or replace function public.run_generate_asset(p_piece uuid, p_format text)
returns void language plpgsql security definer set search_path to '' as $$
declare v_secret text;
begin
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'CRON_SECRET';
  perform net.http_post(
    url := 'https://gexprynjrnfmnadbgglk.supabase.co/functions/v1/generate-asset',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object('piece_id', p_piece, 'format', p_format, 'secret', v_secret)
  );
end;
$$;
revoke all on function public.run_generate_asset(uuid, text) from public, anon, authenticated;
grant execute on function public.run_generate_asset(uuid, text) to service_role;;
