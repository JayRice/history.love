-- Block predicate + the full invitation lifecycle and its abuse cases.
begin;
select plan(14);

insert into auth.users (instance_id, id, aud, role, email, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', 'aaaaaaaa-2222-0000-0000-000000000001', 'authenticated', 'authenticated', 'inviter@test.test', now(), now()),
  ('00000000-0000-0000-0000-000000000000', 'bbbbbbbb-2222-0000-0000-000000000002', 'authenticated', 'authenticated', 'acceptor@test.test', now(), now()),
  ('00000000-0000-0000-0000-000000000000', 'cccccccc-2222-0000-0000-000000000003', 'authenticated', 'authenticated', 'blocked@test.test', now(), now());
-- profiles auto-created by the signup trigger.
update public.profiles set age_verified = true where id in
  ('aaaaaaaa-2222-0000-0000-000000000001','bbbbbbbb-2222-0000-0000-000000000002','cccccccc-2222-0000-0000-000000000003');

-- ---- Blocks ---------------------------------------------------------------
select set_config('request.jwt.claims',
  json_build_object('sub', 'aaaaaaaa-2222-0000-0000-000000000001', 'role', 'authenticated')::text, true);
set local role authenticated;

insert into public.blocks (blocker_id, blocked_id)
values ('aaaaaaaa-2222-0000-0000-000000000001', 'cccccccc-2222-0000-0000-000000000003');

select ok(
  security.is_blocked('aaaaaaaa-2222-0000-0000-000000000001', 'cccccccc-2222-0000-0000-000000000003'),
  'is_blocked true forward'
);
select ok(
  security.is_blocked('cccccccc-2222-0000-0000-000000000003', 'aaaaaaaa-2222-0000-0000-000000000001'),
  'is_blocked true in reverse (both directions)'
);

-- Blocked party cannot see the block row.
select set_config('request.jwt.claims',
  json_build_object('sub', 'cccccccc-2222-0000-0000-000000000003', 'role', 'authenticated')::text, true);
select results_eq(
  $$select count(*)::int from public.blocks$$,
  array[0],
  'blocked user sees zero block rows'
);

-- ---- Invitation lifecycle -------------------------------------------------
select set_config('request.jwt.claims',
  json_build_object('sub', 'aaaaaaaa-2222-0000-0000-000000000001', 'role', 'authenticated')::text, true);

create temp table t_inv as
select * from public.create_invitation('dating', null);

select results_eq(
  $$select length(code)::int from t_inv$$,
  array[10],
  'create_invitation returns a 10-char plaintext code once'
);

-- Inviter sees the invitation row; only the hash is stored.
select results_eq(
  $$select count(*)::int from public.relationship_invitations i, t_inv t
    where i.id = t.invitation_id and i.code_hash <> t.code$$,
  array[1],
  'stored value is a hash, not the plaintext code'
);

-- Self-accept fails.
select throws_ok(
  $$select public.accept_invitation((select code from t_inv))$$,
  'invitation is not valid',
  'inviter cannot accept their own invitation'
);

-- Blocked user cannot accept.
select set_config('request.jwt.claims',
  json_build_object('sub', 'cccccccc-2222-0000-0000-000000000003', 'role', 'authenticated')::text, true);
select throws_ok(
  $$select public.accept_invitation((select code from t_inv))$$,
  'invitation is not valid',
  'blocked user cannot accept'
);

-- Wrong code fails without information leakage.
select set_config('request.jwt.claims',
  json_build_object('sub', 'bbbbbbbb-2222-0000-0000-000000000002', 'role', 'authenticated')::text, true);
select throws_ok(
  $$select public.accept_invitation('0000000000')$$,
  'invitation is not valid',
  'wrong code fails with the generic message'
);

-- Happy path.
select lives_ok(
  $$select public.accept_invitation((select code from t_inv))$$,
  'acceptor redeems the invitation'
);

select results_eq(
  $$select count(*)::int from public.relationship_members rm, t_inv t
    where rm.relationship_id = t.relationship_id and rm.member_status = 'active'$$,
  array[2],
  'both members active after acceptance'
);

select results_eq(
  $$select r.verification_state from public.relationships r, t_inv t where r.id = t.relationship_id$$,
  array['verified'::text],
  'relationship verified after both parties joined'
);

-- Reuse fails.
select set_config('request.jwt.claims',
  json_build_object('sub', 'cccccccc-2222-0000-0000-000000000003', 'role', 'authenticated')::text, true);
set local role postgres;
delete from public.blocks; -- unblock C so only reuse is under test
set local role authenticated;
select throws_ok(
  $$select public.accept_invitation((select code from t_inv))$$,
  'invitation is not valid',
  'accepted code cannot be reused'
);

-- Capacity: a third member can never be added (database trigger).
set local role postgres;
select throws_ok(
  $$insert into public.relationship_members (relationship_id, profile_id, member_status, joined_at)
    select relationship_id, 'cccccccc-2222-0000-0000-000000000003', 'active', now() from t_inv$$,
  'relationship already has two active members',
  'capacity trigger caps active members at two'
);

-- Expired invitation fails.
insert into auth.users (instance_id, id, aud, role, email, created_at, updated_at)
values ('00000000-0000-0000-0000-000000000000', 'dddddddd-2222-0000-0000-000000000005', 'authenticated', 'authenticated', 'expired@test.test', now(), now());
update public.profiles set age_verified = true where id = 'dddddddd-2222-0000-0000-000000000005';

select set_config('request.jwt.claims',
  json_build_object('sub', 'dddddddd-2222-0000-0000-000000000005', 'role', 'authenticated')::text, true);
set local role authenticated;
create temp table t_inv2 as
select * from public.create_invitation('dating', null);

set local role postgres;
update public.relationship_invitations
set expires_at = now() - interval '1 day'
where id = (select invitation_id from t_inv2);

select set_config('request.jwt.claims',
  json_build_object('sub', 'cccccccc-2222-0000-0000-000000000003', 'role', 'authenticated')::text, true);
set local role authenticated;
select throws_ok(
  $$select public.accept_invitation((select code from t_inv2))$$,
  'invitation is not valid',
  'expired invitation cannot be accepted'
);

select * from finish();
rollback;
