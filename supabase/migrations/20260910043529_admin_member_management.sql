-- Real member list for the backend (admin-only). Includes a live listing count.
create or replace function public.admin_list_members()
returns jsonb
language plpgsql security definer set search_path = public stable
as $$
begin
  if not public.is_admin_caller() then raise exception 'not authorized'; end if;
  return (
    select coalesce(jsonb_agg(jsonb_build_object(
      'id', p.id, 'email', p.email, 'name', p.name, 'brand', p.brand,
      'city', p.city, 'subdomain', p.subdomain, 'plan', p.plan,
      'listings', (select count(*) from public.listings l where l.agent_id = p.id),
      'created_at', p.created_at
    ) order by p.created_at desc), '[]'::jsonb)
    from public.profiles p
  );
end;
$$;
grant execute on function public.admin_list_members() to authenticated;

-- Delete a specific user (admin-only, requires 2FA via is_admin_caller). Removes the profile —
-- which cascades all their app data (listings, content, assets, leads, …) — and the auth identity.
-- Self-deletion and deleting another admin are blocked. Irreversible.
create or replace function public.admin_delete_user(p_id uuid)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare v_email text; v_auth_removed boolean := false;
begin
  if not public.is_admin_caller() then raise exception 'not authorized'; end if;
  if p_id = auth.uid() then raise exception 'Tidak bisa menghapus akun Anda sendiri'; end if;
  select email into v_email from public.profiles where id = p_id;
  if v_email is null then
    select email into v_email from auth.users where id = p_id;
  end if;
  if v_email is not null and lower(v_email) in (select lower(email) from public.admin_emails) then
    raise exception 'Tidak bisa menghapus akun admin';
  end if;

  begin
    delete from auth.users where id = p_id;
    v_auth_removed := true;
  exception when insufficient_privilege then
    v_auth_removed := false;
  end;
  delete from public.profiles where id = p_id; -- cascades all app data

  return jsonb_build_object('deleted', true, 'id', p_id, 'email', v_email, 'auth_removed', v_auth_removed);
end;
$$;
grant execute on function public.admin_delete_user(uuid) to authenticated;;
