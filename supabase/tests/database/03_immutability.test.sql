-- Append-only guarantees: authenticated clients cannot rewrite history.
-- Grants omit UPDATE/DELETE on event tables, so forgery fails loudly (42501).
begin;
select plan(8);

insert into auth.users (instance_id, id, aud, role, email, created_at, updated_at)
values ('00000000-0000-0000-0000-000000000000', 'aaaaaaaa-1111-0000-0000-000000000001', 'authenticated', 'authenticated', 'imm@test.test', now(), now());
update public.profiles set display_name = 'Imm', age_verified = true where id = 'aaaaaaaa-1111-0000-0000-000000000001';
insert into public.user_consents (id, profile_id, consent_type, policy_version)
values ('eeeeeeee-1111-0000-0000-000000000009', 'aaaaaaaa-1111-0000-0000-000000000001', 'terms', 'v1');
insert into public.relationships (id, created_by, status)
values ('dddddddd-1111-0000-0000-000000000004', 'aaaaaaaa-1111-0000-0000-000000000001', 'active');
insert into public.relationship_members (relationship_id, profile_id, member_status, joined_at)
values ('dddddddd-1111-0000-0000-000000000004', 'aaaaaaaa-1111-0000-0000-000000000001', 'active', now());
insert into public.relationship_status_events (id, relationship_id, actor_id, new_status)
values ('ffffffff-1111-0000-0000-000000000008', 'dddddddd-1111-0000-0000-000000000004', 'aaaaaaaa-1111-0000-0000-000000000001', 'active');

select set_config('request.jwt.claims',
  json_build_object('sub', 'aaaaaaaa-1111-0000-0000-000000000001', 'role', 'authenticated')::text, true);
set local role authenticated;

select throws_ok(
  $$update public.user_consents set policy_version = 'FORGED'$$,
  '42501', null,
  'consents cannot be updated (no grant)'
);
select throws_ok(
  $$delete from public.user_consents$$,
  '42501', null,
  'consents cannot be deleted (no grant)'
);
select throws_ok(
  $$insert into public.user_consents (profile_id, consent_type, policy_version)
    values ('aaaaaaaa-1111-0000-0000-000000000001', 'terms', 'forged')$$,
  '42501', null,
  'consents cannot be inserted directly (RPC only)'
);
select throws_ok(
  $$update public.relationship_status_events set new_status = 'FORGED'$$,
  '42501', null,
  'status events cannot be updated'
);
select throws_ok(
  $$delete from public.relationship_status_events$$,
  '42501', null,
  'status events cannot be deleted'
);
select throws_ok(
  $$select count(*) from public.audit_events$$,
  '42501', null,
  'audit ledger is invisible to authenticated'
);
select throws_ok(
  $$insert into public.audit_events (event_type) values ('forged')$$,
  '42501', null,
  'audit ledger rejects direct inserts'
);
select throws_ok(
  $$select security.log_audit('forged', null, null, null)$$,
  '42501', null,
  'log_audit is not executable by authenticated'
);

select * from finish();
rollback;
