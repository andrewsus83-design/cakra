-- Consolidate the duplicate permissive SELECT policies on content_pieces and listings into one
-- combined SELECT policy each, plus per-write owner policies. Access semantics are IDENTICAL:
--   content_pieces SELECT: owner OR status='published'  (was: "own content" ALL + "public content")
--   listings SELECT: owner OR status in (dijual,disewa)  (was: "own listings" ALL + "public listings")
-- Owner INSERT/UPDATE/DELETE preserved exactly. auth.uid() wrapped in (select ...) for performance.

drop policy if exists "own content"    on public.content_pieces;
drop policy if exists "public content" on public.content_pieces;
create policy "content_pieces_select" on public.content_pieces for select
  using (((select auth.uid()) = agent_id) or (status = 'published'::content_status_t));
create policy "content_pieces_insert" on public.content_pieces for insert
  with check ((select auth.uid()) = agent_id);
create policy "content_pieces_update" on public.content_pieces for update
  using ((select auth.uid()) = agent_id) with check ((select auth.uid()) = agent_id);
create policy "content_pieces_delete" on public.content_pieces for delete
  using ((select auth.uid()) = agent_id);

drop policy if exists "own listings"    on public.listings;
drop policy if exists "public listings" on public.listings;
create policy "listings_select" on public.listings for select
  using (((select auth.uid()) = agent_id) or (status = any (array['dijual'::listing_status_t, 'disewa'::listing_status_t])));
create policy "listings_insert" on public.listings for insert
  with check ((select auth.uid()) = agent_id);
create policy "listings_update" on public.listings for update
  using ((select auth.uid()) = agent_id) with check ((select auth.uid()) = agent_id);
create policy "listings_delete" on public.listings for delete
  using ((select auth.uid()) = agent_id);;
