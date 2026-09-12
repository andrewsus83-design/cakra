-- Let a signed-in agent upload their own files into the PUBLIC assets-global bucket, namespaced
-- under uploads/<uid>/ (public URL needed so their photos work on their live site & listings).
create policy "assets-global agent insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'assets-global' and (storage.foldername(name))[1] = 'uploads' and (storage.foldername(name))[2] = auth.uid()::text);
create policy "assets-global agent update" on storage.objects for update to authenticated
  using (bucket_id = 'assets-global' and (storage.foldername(name))[1] = 'uploads' and (storage.foldername(name))[2] = auth.uid()::text)
  with check (bucket_id = 'assets-global' and (storage.foldername(name))[1] = 'uploads' and (storage.foldername(name))[2] = auth.uid()::text);
create policy "assets-global agent delete" on storage.objects for delete to authenticated
  using (bucket_id = 'assets-global' and (storage.foldername(name))[1] = 'uploads' and (storage.foldername(name))[2] = auth.uid()::text);;
