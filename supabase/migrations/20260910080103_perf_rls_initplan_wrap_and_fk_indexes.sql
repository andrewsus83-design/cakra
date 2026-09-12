-- Non-destructive performance remediation: additive covering indexes + in-place policy
-- predicate rewrites (auth.uid() -> (select auth.uid())). No policy is dropped; predicates
-- are logically identical, only evaluated once per query instead of once per row.

create index if not exists content_pieces_job_id_idx    on public.content_pieces (job_id);
create index if not exists content_pieces_master_id_idx on public.content_pieces (master_id);
create index if not exists leads_listing_id_idx         on public.leads (listing_id);
create index if not exists video_jobs_listing_id_idx    on public.video_jobs (listing_id);

alter policy "own profile"       on public.profiles        using ((select auth.uid()) = id)       with check ((select auth.uid()) = id);
alter policy "own content_jobs"  on public.content_jobs     using ((select auth.uid()) = agent_id) with check ((select auth.uid()) = agent_id);
alter policy "own content"       on public.content_pieces   using ((select auth.uid()) = agent_id) with check ((select auth.uid()) = agent_id);
alter policy "own listings"      on public.listings         using ((select auth.uid()) = agent_id) with check ((select auth.uid()) = agent_id);
alter policy "own video_jobs"    on public.video_jobs       using ((select auth.uid()) = agent_id) with check ((select auth.uid()) = agent_id);
alter policy "own voices"        on public.voices           using ((select auth.uid()) = agent_id) with check ((select auth.uid()) = agent_id);
alter policy "own leads"         on public.leads            using ((select auth.uid()) = agent_id) with check ((select auth.uid()) = agent_id);
alter policy "own scores"        on public.presence_scores  using ((select auth.uid()) = agent_id) with check ((select auth.uid()) = agent_id);
alter policy "own subs"          on public.subscriptions    using ((select auth.uid()) = agent_id);
alter policy "read assets"       on public.assets           using ((agent_id is null) or ((select auth.uid()) = agent_id));
alter policy "insert own assets" on public.assets           with check ((select auth.uid()) = agent_id);
alter policy "update own assets" on public.assets           using ((select auth.uid()) = agent_id);
alter policy "delete own assets" on public.assets           using ((select auth.uid()) = agent_id);;
