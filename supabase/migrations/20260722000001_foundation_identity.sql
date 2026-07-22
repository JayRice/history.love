-- Migration 0001: identity foundation.
-- profiles and user_consents (append-only).
-- Blueprint: docs/plans/history-love-mvp-implementation-plan.md section 3,
-- docs/audits/history-love-security-model.md.
-- Note: the planned legacy_identity_map was dropped by founder decision
-- (2026-07-22): there are zero Firebase users to migrate.

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- Non-exposed schemas. `private` holds data no client role may ever touch;
-- `security` holds definer helpers (populated in migration 0002).
-- ---------------------------------------------------------------------------
create schema if not exists private;
create schema if not exists security;

revoke all on schema private from public, anon, authenticated;
grant usage on schema security to authenticated;

-- ---------------------------------------------------------------------------
-- profiles: canonical private account row. 1:1 with auth.users.
-- Search NEVER reads this table (public_profile_cards projection, Phase 9).
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  handle text unique,
  legal_name text,
  birth_year int check (birth_year between 1900 and 2100),
  birth_month int check (birth_month between 1 and 12),
  age_verified boolean not null default false,
  city text,
  state text,
  pronouns text,
  avatar_path text,
  search_status text not null default 'private'
    check (search_status in ('private','not_dating','healing','open_conversation','open_serious')),
  search_visible_at timestamptz,
  verification_state jsonb not null default '{}'::jsonb,
  comms_prefs jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_search_status_idx on public.profiles (search_status, search_visible_at);

alter table public.profiles enable row level security;
alter table public.profiles force row level security;

create policy profiles_owner_select on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

create policy profiles_owner_update on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- No INSERT policy: the signup flow (service role / Edge Function, Phase 2)
-- creates the row. No DELETE policy: deletion is a job (Phase 5).

-- Column-level protection: owners may update presentation fields only.
-- age_verified, verification_state, and the search columns change through
-- trusted paths (signup function, searchable-status RPC with step-up auth).
create or replace function security.protect_profile_columns()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  if current_setting('request.jwt.claims', true) is not null
     and coalesce(current_setting('role', true), '') = 'authenticated' then
    if new.age_verified is distinct from old.age_verified
       or new.verification_state is distinct from old.verification_state
       or new.search_status is distinct from old.search_status
       or new.search_visible_at is distinct from old.search_visible_at then
      raise exception 'protected profile columns can only change through trusted functions';
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_protect_columns
  before update on public.profiles
  for each row execute function security.protect_profile_columns();

-- ---------------------------------------------------------------------------
-- user_consents: versioned, separable, APPEND-ONLY consent ledger.
-- Withdrawal is a new row carrying withdrawn_at, never an update.
-- ---------------------------------------------------------------------------
create table public.user_consents (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  consent_type text not null check (consent_type in (
    'terms','privacy','community_standards','relationship_record',
    'search_visibility','no_background_check_ack','comms_email','comms_sms'
  )),
  policy_version text not null,
  accepted_at timestamptz not null default now(),
  withdrawn_at timestamptz,
  ip_hash text,
  device_meta jsonb not null default '{}'::jsonb
);

create index user_consents_lookup_idx
  on public.user_consents (profile_id, consent_type, accepted_at desc);

alter table public.user_consents enable row level security;
alter table public.user_consents force row level security;

create policy user_consents_owner_select on public.user_consents
  for select to authenticated
  using (profile_id = (select auth.uid()));

-- No INSERT/UPDATE/DELETE policies for authenticated: rows are written by
-- security.accept_policy (migration 0004) and trusted signup flows only.

-- ---------------------------------------------------------------------------
-- Table grants: the grant is the ceiling, RLS restricts rows within it.
-- No UPDATE/DELETE grant on append-only tables means forgery attempts fail
-- loudly (42501), not silently.
-- ---------------------------------------------------------------------------
grant select, update on public.profiles to authenticated;
grant select on public.user_consents to authenticated;
grant all on public.profiles, public.user_consents to service_role;
grant usage on schema private to service_role;
