-- Migration 0003: private storage buckets and object policies.
-- All buckets private; object paths carry UUIDs only (no names, emails, or
-- codes). Ownership alone is never authorization: every verb has a policy.

insert into storage.buckets (id, name, public)
values
  ('profile-images', 'profile-images', false),
  ('relationship-media', 'relationship-media', false),
  ('moderation-evidence', 'moderation-evidence', false),
  ('data-exports', 'data-exports', false)
on conflict (id) do nothing;

-- profile-images: {profile_id}/{uuid}.{ext} — owner-managed.
create policy storage_profile_images_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy storage_profile_images_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy storage_profile_images_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy storage_profile_images_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- relationship-media: {relationship_id}/{uploader_id}/{uuid}.{ext}
-- Members read; the uploader writes into their own folder; uploader deletes.
create policy storage_relationship_media_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'relationship-media'
    and security.is_relationship_member(((storage.foldername(name))[1])::uuid)
  );

create policy storage_relationship_media_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'relationship-media'
    and security.is_relationship_member(((storage.foldername(name))[1])::uuid)
    and (storage.foldername(name))[2] = (select auth.uid())::text
  );

create policy storage_relationship_media_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'relationship-media'
    and (storage.foldername(name))[2] = (select auth.uid())::text
  );

-- moderation-evidence and data-exports: no authenticated policies at all.
-- Service-role functions issue short-lived access (Phases 5 and 8).
