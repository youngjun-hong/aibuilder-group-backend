-- Work/Insight 이미지(히어로·본문·썸네일) 업로드용 공개 버킷.
-- 공개 마케팅 이미지라 읽기는 완전 공개, 쓰기는 로그인한 빌더/관리자만.
insert into storage.buckets (id, name, public)
values ('content-media', 'content-media', true)
on conflict (id) do nothing;

create policy "content_media_public_read" on storage.objects
  for select using (bucket_id = 'content-media');

create policy "content_media_authenticated_write" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'content-media');

create policy "content_media_authenticated_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'content-media');

create policy "content_media_authenticated_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'content-media');
