-- Admin curation gate for the SHARED cakra.xyz/listing marketplace.
-- An agent's own subdomain site still shows their own listings automatically;
-- appearing on the general cakra feed additionally requires admin approval.
alter table public.listings
  add column if not exists public_featured boolean not null default false,
  add column if not exists featured_at timestamptz;

-- Public feed now requires BOTH: sellable status AND admin approval.
create or replace function public.public_all_listings(p_limit int default 60)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(jsonb_agg(row order by featured_at desc nulls last, created_at desc), '[]'::jsonb)
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
    ) as row, l.created_at, l.featured_at
    from public.listings l
    left join public.profiles p on p.id = l.agent_id
    where l.status in ('dijual','disewa') and l.public_featured = true
    order by l.featured_at desc nulls last, l.created_at desc
    limit greatest(1, least(coalesce(p_limit, 60), 200))
  ) s;
$$;
grant execute on function public.public_all_listings(int) to anon, authenticated;

-- Admin moderation queue: every agent listing, any status, with approval flag.
create or replace function public.admin_list_listings(p_limit int default 200)
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
      'id', l.id,
      'title', l.title,
      'status', l.status,
      'price_label', l.price_label,
      'location', l.location,
      'area', l.area,
      'beds', l.beds,
      'baths', l.baths,
      'size_m2', l.size_m2,
      'images', l.images,
      'public_featured', l.public_featured,
      'featured_at', l.featured_at,
      'agent_id', l.agent_id,
      'agent_name', p.name,
      'agent_brand', p.brand,
      'agent_subdomain', p.subdomain,
      'created_at', l.created_at
    ) order by l.public_featured asc, l.created_at desc), '[]'::jsonb)
    from public.listings l
    left join public.profiles p on p.id = l.agent_id
    limit greatest(1, least(coalesce(p_limit,200), 500))
  );
end;
$$;
grant execute on function public.admin_list_listings(int) to authenticated;

-- Admin approve/unpublish a listing to the general cakra feed.
create or replace function public.admin_set_listing_featured(p_id uuid, p_on boolean)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin_caller() then
    raise exception 'not authorized';
  end if;
  update public.listings
    set public_featured = coalesce(p_on, false),
        featured_at = case when coalesce(p_on,false) then now() else null end
    where id = p_id;
  return jsonb_build_object('id', p_id, 'public_featured', coalesce(p_on,false));
end;
$$;
grant execute on function public.admin_set_listing_featured(uuid, boolean) to authenticated;;
