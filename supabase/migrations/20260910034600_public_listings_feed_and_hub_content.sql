-- General marketplace: every agent's live listings aggregated for cakra.xyz/listing,
-- with lightweight agent attribution (name/brand/subdomain) via SECURITY DEFINER so we
-- do NOT open the profiles table to anon. Only 'dijual'/'disewa' rows are public.
create or replace function public.public_all_listings(p_limit int default 60)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(jsonb_agg(row order by created_at desc), '[]'::jsonb)
  from (
    select jsonb_build_object(
      'id', l.id,
      'title', l.title,
      'status', l.status,
      'price', l.price,
      'price_label', l.price_label,
      'location', l.location,
      'area', l.area,
      'beds', l.beds,
      'baths', l.baths,
      'size_m2', l.size_m2,
      'images', l.images,
      'rating', l.rating,
      'agent_id', l.agent_id,
      'agent_name', p.name,
      'agent_brand', p.brand,
      'agent_city', p.city,
      'agent_subdomain', p.subdomain
    ) as row, l.created_at
    from public.listings l
    left join public.profiles p on p.id = l.agent_id
    where l.status in ('dijual','disewa')
    order by l.created_at desc
    limit greatest(1, least(coalesce(p_limit, 60), 200))
  ) s;
$$;
grant execute on function public.public_all_listings(int) to anon, authenticated;

-- Hub (admin backend): browse every agent's generated content pieces so cakra can
-- repurpose them for its own social channels. Admin-only.
create or replace function public.admin_content_pieces(p_days int default 7)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if not public.is_admin_caller() then
    raise exception 'not authorized';
  end if;
  return (
    select coalesce(jsonb_agg(jsonb_build_object(
      'id', cp.id,
      'agent_id', cp.agent_id,
      'agent_name', p.name,
      'agent_brand', p.brand,
      'mirror', cp.mirror,
      'type', cp.type,
      'title', cp.title,
      'status', cp.status,
      'content', cp.content,
      'master_id', cp.master_id,
      'created_at', cp.created_at
    ) order by cp.created_at desc), '[]'::jsonb)
    from public.content_pieces cp
    left join public.profiles p on p.id = cp.agent_id
    where cp.created_at >= (now() - make_interval(days => greatest(1, least(coalesce(p_days,7), 60))))
  );
end;
$$;
grant execute on function public.admin_content_pieces(int) to authenticated;;
