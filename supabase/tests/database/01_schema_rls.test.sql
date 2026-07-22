-- RLS is enabled AND forced on every user-data table; helpers exist.
begin;
select plan(20);

select ok(relrowsecurity, 'RLS enabled: ' || relname)
from pg_class
where oid = any (array[
  'public.profiles'::regclass,
  'public.user_consents'::regclass,
  'public.relationships'::regclass,
  'public.relationship_members'::regclass,
  'public.relationship_invitations'::regclass,
  'public.relationship_visibility_grants'::regclass,
  'public.relationship_status_events'::regclass,
  'public.relationship_confirmations'::regclass,
  'public.blocks'::regclass,
  'public.audit_events'::regclass
]);

select ok(relforcerowsecurity, 'RLS forced: ' || relname)
from pg_class
where oid = any (array[
  'public.profiles'::regclass,
  'public.user_consents'::regclass,
  'public.relationships'::regclass,
  'public.relationship_members'::regclass,
  'public.relationship_invitations'::regclass,
  'public.relationship_visibility_grants'::regclass,
  'public.relationship_status_events'::regclass,
  'public.relationship_confirmations'::regclass,
  'public.blocks'::regclass,
  'public.audit_events'::regclass
]);

select * from finish();
rollback;
