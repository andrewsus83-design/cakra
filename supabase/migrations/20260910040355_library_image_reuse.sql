-- Track library-image usage so each content reuses an UNUSED tag-matched image, and only
-- when the unused pool is exhausted does the pipeline generate a fresh one via OpenART MCP.
alter table public.assets
  add column if not exists used_at timestamptz,
  add column if not exists used_by uuid,
  add column if not exists used_for uuid;

create index if not exists assets_library_unused_idx
  on public.assets (type) where agent_id is null and used_at is null;

-- Claim one unused global library image, preferring tag matches (location > property_type > category).
-- Marks it used atomically (FOR UPDATE SKIP LOCKED) and returns its public URL + id, or null when the
-- unused pool is empty (caller then generates a new image via OpenART).
create or replace function public.claim_library_image(
  p_agent uuid default null,
  p_content uuid default null,
  p_location text default null,
  p_property_type text default null,
  p_category text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid; v_path text; v_meta jsonb; v_url text;
begin
  select a.id, a.storage_path, a.meta into v_id, v_path, v_meta
  from public.assets a
  where a.agent_id is null and a.type = 'image' and a.used_at is null
  order by (
    (case when p_location is not null and lower(a.meta->>'location') = lower(p_location) then 4 else 0 end) +
    (case when p_property_type is not null and lower(a.meta->>'property_type') = lower(p_property_type) then 2 else 0 end) +
    (case when p_category is not null and lower(a.meta->>'category') = lower(p_category) then 1 else 0 end)
  ) desc, a.created_at asc
  limit 1
  for update skip locked;

  if v_id is null then return null; end if;

  update public.assets set used_at = now(), used_by = p_agent, used_for = p_content where id = v_id;

  if v_path like 'http%' then v_url := v_path;
  else v_url := 'https://gexprynjrnfmnadbgglk.supabase.co/storage/v1/object/public/assets-global/' || v_path;
  end if;

  return jsonb_build_object('id', v_id, 'url', v_url, 'meta', v_meta);
end;
$$;
grant execute on function public.claim_library_image(uuid, uuid, text, text, text) to service_role;

-- Admin: library health — total vs unused, and unused counts per location (to flag when to restock).
create or replace function public.admin_library_stats()
returns jsonb
language plpgsql security definer set search_path = public stable
as $$
begin
  if not public.is_admin_caller() then raise exception 'not authorized'; end if;
  return jsonb_build_object(
    'total', (select count(*) from public.assets where agent_id is null and type='image'),
    'unused', (select count(*) from public.assets where agent_id is null and type='image' and used_at is null),
    'by_location', (select coalesce(jsonb_object_agg(loc, cnt), '{}'::jsonb) from (
        select coalesce(meta->>'location','(untagged)') as loc, count(*) filter (where used_at is null) as cnt
        from public.assets where agent_id is null and type='image' group by 1) s)
  );
end;
$$;
grant execute on function public.admin_library_stats() to authenticated;;
