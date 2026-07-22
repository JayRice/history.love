-- Cross-user isolation: A cannot read or write B's rows; a non-member
-- cannot reach a relationship by guessing its UUID.
begin;
select plan(8);

-- Fixtures (as postgres).
insert into auth.users (instance_id, id, aud, role, email, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', 'aaaaaaaa-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'a@test.test', now(), now()),
  ('00000000-0000-0000-0000-000000000000', 'bbbbbbbb-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'b@test.test', now(), now()),
  ('00000000-0000-0000-0000-000000000000', 'cccccccc-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'c@test.test', now(), now());

insert into public.profiles (id, display_name, age_verified) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'A', true),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'B', true),
  ('cccccccc-0000-0000-0000-000000000003', 'C', true);

insert into public.relationships (id, created_by, status, verification_state)
values ('dddddddd-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000001', 'active', 'verified');

insert into public.relationship_members (relationship_id, profile_id, member_status, joined_at) values
  ('dddddddd-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000001', 'active', now()),
  ('dddddddd-0000-0000-0000-000000000004', 'bbbbbbbb-0000-0000-0000-000000000002', 'active', now());

-- Act as A.
select set_config('request.jwt.claims',
  json_build_object('sub', 'aaaaaaaa-0000-0000-0000-000000000001', 'role', 'authenticated')::text, true);
set local role authenticated;

select results_eq(
  $$select count(*)::int from public.profiles$$,
  array[1],
  'A sees exactly one profile (their own)'
);

select results_eq(
  $$select count(*)::int from public.profiles where id = 'bbbbbbbb-0000-0000-0000-000000000002'$$,
  array[0],
  'A cannot read B''s profile'
);

update public.profiles set display_name = 'HACKED'
where id = 'bbbbbbbb-0000-0000-0000-000000000002';

select results_eq(
  $$select count(*)::int from public.relationships where id = 'dddddddd-0000-0000-0000-000000000004'$$,
  array[1],
  'member A reads the relationship'
);

select results_eq(
  $$select count(*)::int from public.relationship_members where relationship_id = 'dddddddd-0000-0000-0000-000000000004'$$,
  array[2],
  'member A reads both membership rows'
);

-- Client cannot add itself to a relationship by id (no INSERT policy).
select throws_ok(
  $$insert into public.relationship_members (relationship_id, profile_id, member_status)
    values ('dddddddd-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000001', 'active')$$,
  '42501',
  null,
  'client INSERT into relationship_members is denied'
);

-- Act as C (non-member).
select set_config('request.jwt.claims',
  json_build_object('sub', 'cccccccc-0000-0000-0000-000000000003', 'role', 'authenticated')::text, true);

select results_eq(
  $$select count(*)::int from public.relationships where id = 'dddddddd-0000-0000-0000-000000000004'$$,
  array[0],
  'non-member cannot read the relationship by UUID'
);

select results_eq(
  $$select count(*)::int from public.relationship_members where relationship_id = 'dddddddd-0000-0000-0000-000000000004'$$,
  array[0],
  'non-member cannot enumerate membership'
);

-- Back to postgres: B's profile survived A's update attempt.
set local role postgres;
select results_eq(
  $$select display_name from public.profiles where id = 'bbbbbbbb-0000-0000-0000-000000000002'$$,
  array['B'::text],
  'A''s cross-user UPDATE changed nothing'
);

select * from finish();
rollback;
