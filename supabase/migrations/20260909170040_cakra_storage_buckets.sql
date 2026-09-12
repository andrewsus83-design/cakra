-- cakra storage: one public shared library + one private per-agent bucket.
insert into storage.buckets (id, name, public)
values ('assets-global','assets-global', true),
       ('assets-agent','assets-agent', false)
on conflict (id) do nothing;

-- assets-global: anyone may read (shared b-roll / icon / area library); writes are service-role only (no write policy).
create policy "assets-global public read" on storage.objects
  for select using (bucket_id = 'assets-global');

-- assets-agent: private. Each authenticated agent is scoped to files under their own <uid>/ prefix.
create policy "assets-agent read own" on storage.objects
  for select to authenticated
  using (bucket_id = 'assets-agent' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "assets-agent insert own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'assets-agent' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "assets-agent update own" on storage.objects
  for update to authenticated
  using (bucket_id = 'assets-agent' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'assets-agent' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "assets-agent delete own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'assets-agent' and (storage.foldername(name))[1] = auth.uid()::text);;
