-- Local/CI seed. Synthetic fixtures only; production data never lands here.
-- pgTAP lives in the seed so tests can run against `supabase db reset`
-- output without polluting production migrations.
create extension if not exists pgtap with schema extensions;

-- Two synthetic users for manual poking around (tests create their own).
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'ada@example.test', extensions.crypt('password123', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'grace@example.test', extensions.crypt('password123', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now())
on conflict (id) do update set display_name = excluded.display_name;

insert into public.profiles (id, display_name, handle, age_verified)
values
  ('11111111-1111-1111-1111-111111111111', 'Ada', 'ada', true),
  ('22222222-2222-2222-2222-222222222222', 'Grace', 'grace', true)
on conflict (id) do update set display_name = excluded.display_name;
