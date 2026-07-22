-- Migration 0002: relationship container model, blocks, audit, helpers.
-- A relationship is a container plus membership rows. Never
-- partner_one_id/partner_two_id. Event tables are append-only: no
-- authenticated UPDATE or DELETE policy exists, and none may be added.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table public.relationships (
  id uuid primary key default gen_random_uuid(),
  relationship_type text not null default 'dating'
    check (relationship_type in ('dating','committed','engaged','married')),
  status text not null default 'pending'
    check (status in ('pending','active','ended','separated','divorced','frozen')),
  verification_state text not null default 'unverified'
    check (verification_state in ('unverified','pending_second','verified')),
  start_date date,
  end_date date,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index relationships_status_idx on public.relationships (status);
create index relationships_created_by_idx on public.relationships (created_by);

create table public.relationship_members (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid not null references public.relationships (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member' check (role in ('member')),
  member_status text not null default 'invited'
    check (member_status in ('invited','active','ended','separated','left')),
  joined_at timestamptz,
  left_at timestamptz,
  visibility_consent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (relationship_id, profile_id)
);
create index relationship_members_profile_idx on public.relationship_members (profile_id);
create index relationship_members_relationship_idx on public.relationship_members (relationship_id);

create table public.relationship_invitations (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid not null references public.relationships (id) on delete cascade,
  inviter_id uuid not null references public.profiles (id),
  invited_email_hash text,
  code_hash text not null,
  expires_at timestamptz not null default now() + interval '7 days',
  attempt_count int not null default 0,
  max_attempts int not null default 5,
  accepted_at timestamptz,
  accepted_by uuid references public.profiles (id),
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);
create index relationship_invitations_code_idx on public.relationship_invitations (code_hash);
create index relationship_invitations_expiry_idx on public.relationship_invitations (expires_at);
create index relationship_invitations_relationship_idx on public.relationship_invitations (relationship_id);

create table public.relationship_visibility_grants (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid not null references public.relationships (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  status_visibility text not null default 'private'
    check (status_visibility in ('private','status_only','partner_identified','public_dates')),
  partner_identity_visibility boolean not null default false,
  history_visibility text not null default 'private'
    check (history_visibility in ('private','members','public')),
  updated_at timestamptz not null default now(),
  unique (relationship_id, profile_id)
);
create index relationship_visibility_grants_rel_idx
  on public.relationship_visibility_grants (relationship_id);

-- APPEND-ONLY proof of every status change.
create table public.relationship_status_events (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid not null references public.relationships (id) on delete cascade,
  actor_id uuid references public.profiles (id),
  prior_status text,
  new_status text not null,
  effective_at timestamptz not null default now(),
  confirmation_state text not null default 'unrequested'
    check (confirmation_state in ('unrequested','requested','confirmed','disputed')),
  created_at timestamptz not null default now()
);
create index relationship_status_events_rel_idx
  on public.relationship_status_events (relationship_id, created_at desc);

-- APPEND-ONLY 90-day / inactivity confirmations.
create table public.relationship_confirmations (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid not null references public.relationships (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  confirmed_at timestamptz not null default now(),
  prompt_cycle int
);
create index relationship_confirmations_rel_idx
  on public.relationship_confirmations (relationship_id);

-- blocks: immediate, silent, checked in BOTH directions by every
-- discovery/contact path. Client-writable by design so the one critical
-- safety action never depends on a server hop.
create table public.blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  mode text not null default 'block' check (mode in ('block','no_contact')),
  created_at timestamptz not null default now(),
  unique (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);
create index blocks_blocker_idx on public.blocks (blocker_id);
create index blocks_blocked_idx on public.blocks (blocked_id);

-- APPEND-ONLY audit ledger. Authenticated clients have NO access of any
-- kind; trusted functions write rows. Payloads never contain private
-- content (journal bodies, notes, codes, tokens).
create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  actor_id uuid,
  subject_type text,
  subject_id uuid,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index audit_events_subject_idx on public.audit_events (subject_type, subject_id);
create index audit_events_created_idx on public.audit_events (created_at);

-- ---------------------------------------------------------------------------
-- security helpers (definer, pinned search_path, minimal grants)
-- ---------------------------------------------------------------------------
create or replace function security.is_relationship_member(p_relationship_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select exists (
    select 1
    from public.relationship_members rm
    where rm.relationship_id = p_relationship_id
      and rm.profile_id = (select auth.uid())
      and rm.member_status in ('active','ended','separated')
  );
$$;
revoke all on function security.is_relationship_member(uuid) from public;
grant execute on function security.is_relationship_member(uuid) to authenticated;

create or replace function security.is_blocked(p_a uuid, p_b uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select exists (
    select 1 from public.blocks b
    where (b.blocker_id = p_a and b.blocked_id = p_b)
       or (b.blocker_id = p_b and b.blocked_id = p_a)
  );
$$;
revoke all on function security.is_blocked(uuid, uuid) from public;
grant execute on function security.is_blocked(uuid, uuid) to authenticated;

create or replace function security.log_audit(
  p_event_type text,
  p_actor_id uuid,
  p_subject_type text,
  p_subject_id uuid,
  p_payload jsonb default '{}'::jsonb
) returns void
language sql
security definer
set search_path = pg_catalog
as $$
  insert into public.audit_events (event_type, actor_id, subject_type, subject_id, payload)
  values (p_event_type, p_actor_id, p_subject_type, p_subject_id, p_payload);
$$;
revoke all on function security.log_audit(text, uuid, text, uuid, jsonb) from public, anon, authenticated;

-- MVP cap: at most two ACTIVE members per relationship, enforced in the
-- database rather than by hardcoded partner columns.
create or replace function security.enforce_member_capacity()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  if new.member_status = 'active' then
    if (select count(*) from public.relationship_members rm
        where rm.relationship_id = new.relationship_id
          and rm.member_status = 'active'
          and rm.id <> new.id) >= 2 then
      raise exception 'relationship already has two active members';
    end if;
  end if;
  return new;
end;
$$;

create trigger relationship_members_capacity
  before insert or update on public.relationship_members
  for each row execute function security.enforce_member_capacity();

-- ---------------------------------------------------------------------------
-- Table grants (ceiling; RLS restricts rows). Read-only for authenticated on
-- everything except blocks: the one direct safety write. Append-only tables
-- carry no UPDATE/DELETE grant at all, so history cannot be rewritten even
-- if a policy were ever added by mistake.
-- ---------------------------------------------------------------------------
grant select on public.relationships,
                public.relationship_members,
                public.relationship_invitations,
                public.relationship_visibility_grants,
                public.relationship_status_events,
                public.relationship_confirmations
  to authenticated;
grant select, insert, delete on public.blocks to authenticated;
-- audit_events: zero grants for authenticated (writes via security.log_audit).
grant all on public.relationships,
             public.relationship_members,
             public.relationship_invitations,
             public.relationship_visibility_grants,
             public.relationship_status_events,
             public.relationship_confirmations,
             public.blocks,
             public.audit_events
  to service_role;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.relationships enable row level security;
alter table public.relationships force row level security;
alter table public.relationship_members enable row level security;
alter table public.relationship_members force row level security;
alter table public.relationship_invitations enable row level security;
alter table public.relationship_invitations force row level security;
alter table public.relationship_visibility_grants enable row level security;
alter table public.relationship_visibility_grants force row level security;
alter table public.relationship_status_events enable row level security;
alter table public.relationship_status_events force row level security;
alter table public.relationship_confirmations enable row level security;
alter table public.relationship_confirmations force row level security;
alter table public.blocks enable row level security;
alter table public.blocks force row level security;
alter table public.audit_events enable row level security;
alter table public.audit_events force row level security;

-- relationships: members read; ALL writes via RPCs (no client policies).
create policy relationships_member_select on public.relationships
  for select to authenticated
  using (security.is_relationship_member(id));

-- relationship_members: a member reads their own row and co-member rows.
-- No client writes: membership changes only through invitation/closure RPCs,
-- so a client can never add itself to a relationship by id.
create policy relationship_members_select on public.relationship_members
  for select to authenticated
  using (
    profile_id = (select auth.uid())
    or security.is_relationship_member(relationship_id)
  );

-- invitations: inviter sees their own. Lifecycle via RPCs only; the code
-- hash never round-trips to clients in cleartext-comparable form.
create policy relationship_invitations_inviter_select on public.relationship_invitations
  for select to authenticated
  using (inviter_id = (select auth.uid()));

-- visibility grants: members read; changes via RPC (Phase 3) so least-public
-- resolution and projections stay server-computed.
create policy relationship_visibility_grants_select on public.relationship_visibility_grants
  for select to authenticated
  using (security.is_relationship_member(relationship_id));

-- status events / confirmations: members read; append via trusted functions.
create policy relationship_status_events_select on public.relationship_status_events
  for select to authenticated
  using (security.is_relationship_member(relationship_id));

create policy relationship_confirmations_select on public.relationship_confirmations
  for select to authenticated
  using (security.is_relationship_member(relationship_id));

-- blocks: blocker manages own rows; the blocked party never sees the row.
create policy blocks_owner_select on public.blocks
  for select to authenticated
  using (blocker_id = (select auth.uid()));

create policy blocks_owner_insert on public.blocks
  for insert to authenticated
  with check (blocker_id = (select auth.uid()));

create policy blocks_owner_delete on public.blocks
  for delete to authenticated
  using (blocker_id = (select auth.uid()));

-- audit_events: zero policies for authenticated on purpose. Enabled+forced
-- RLS with no policy means no access; writes go through security.log_audit.
