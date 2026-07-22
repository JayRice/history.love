-- Migration 0005: TRANSITIONAL app-parity storage.
--
-- Founder decision 2026-07-22: zero Firebase users exist; Firebase is being
-- removed outright. These tables give the existing mobile UI a working
-- Supabase backend with MINIMAL client change: each app_* table stores the
-- former Firestore document shape in a `doc` jsonb column, scoped by real
-- relationship/profile columns that carry the RLS.
--
-- DEATH PLAN: app_memories -> moments (+revisions/media) in Phase 4;
-- app_calendar_events -> calendar_events and app_games -> games/game_responses
-- in Phase 6; app_notifications -> notifications in Phase 6; the legacy_meta
-- columns disappear when onboarding and relationship screens are rebuilt on
-- PRD-shaped columns. The clean PRD table names stay unclaimed until then.

-- Signup: every new auth user gets a profiles row.
create or replace function security.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function security.handle_new_user();

-- Transitional columns.
alter table public.profiles add column legacy_meta jsonb;
alter table public.relationships add column active_game_id uuid;
alter table public.relationships add column legacy_meta jsonb;

-- ---------------------------------------------------------------------------
-- app_memories: former relationships/{id}/memories docs.
-- ---------------------------------------------------------------------------
create table public.app_memories (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid not null references public.relationships (id) on delete cascade,
  created_by uuid not null references public.profiles (id),
  doc jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index app_memories_rel_idx on public.app_memories (relationship_id, created_at desc);

alter table public.app_memories enable row level security;
alter table public.app_memories force row level security;

create policy app_memories_member_select on public.app_memories
  for select to authenticated
  using (security.is_relationship_member(relationship_id));
create policy app_memories_creator_insert on public.app_memories
  for insert to authenticated
  with check (created_by = (select auth.uid()) and security.is_relationship_member(relationship_id));
create policy app_memories_creator_update on public.app_memories
  for update to authenticated
  using (created_by = (select auth.uid()))
  with check (created_by = (select auth.uid()));
create policy app_memories_creator_delete on public.app_memories
  for delete to authenticated
  using (created_by = (select auth.uid()));

grant select, insert, update, delete on public.app_memories to authenticated;

-- ---------------------------------------------------------------------------
-- app_calendar_events: former relationships/{id}/calendarEvents docs.
-- ---------------------------------------------------------------------------
create table public.app_calendar_events (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid not null references public.relationships (id) on delete cascade,
  created_by uuid not null references public.profiles (id),
  doc jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index app_calendar_events_rel_idx on public.app_calendar_events (relationship_id);

alter table public.app_calendar_events enable row level security;
alter table public.app_calendar_events force row level security;

create policy app_calendar_events_member_select on public.app_calendar_events
  for select to authenticated
  using (security.is_relationship_member(relationship_id));
create policy app_calendar_events_member_insert on public.app_calendar_events
  for insert to authenticated
  with check (created_by = (select auth.uid()) and security.is_relationship_member(relationship_id));
create policy app_calendar_events_creator_update on public.app_calendar_events
  for update to authenticated
  using (created_by = (select auth.uid()))
  with check (created_by = (select auth.uid()));
create policy app_calendar_events_creator_delete on public.app_calendar_events
  for delete to authenticated
  using (created_by = (select auth.uid()));

grant select, insert, update, delete on public.app_calendar_events to authenticated;

-- ---------------------------------------------------------------------------
-- app_games: former relationships/{id}/games docs. Writes via RPCs only so
-- round/choice merging happens server-side.
-- ---------------------------------------------------------------------------
create table public.app_games (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid not null references public.relationships (id) on delete cascade,
  created_by uuid not null references public.profiles (id),
  status text not null default 'active' check (status in ('active','ended','archived')),
  doc jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index app_games_rel_idx on public.app_games (relationship_id, created_at desc);

alter table public.app_games enable row level security;
alter table public.app_games force row level security;

create policy app_games_member_select on public.app_games
  for select to authenticated
  using (security.is_relationship_member(relationship_id));

grant select on public.app_games to authenticated;

-- ---------------------------------------------------------------------------
-- app_notifications: former users/{uid}/notifications docs. Recipient-only;
-- the only client write is marking read. Nothing generates rows yet (the
-- legacy backend did); server-generated notifications arrive in Phase 6.
-- ---------------------------------------------------------------------------
create table public.app_notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  doc jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index app_notifications_recipient_idx
  on public.app_notifications (recipient_id, read_at, created_at desc);

alter table public.app_notifications enable row level security;
alter table public.app_notifications force row level security;

create policy app_notifications_recipient_select on public.app_notifications
  for select to authenticated
  using (recipient_id = (select auth.uid()));
create policy app_notifications_recipient_update on public.app_notifications
  for update to authenticated
  using (recipient_id = (select auth.uid()))
  with check (recipient_id = (select auth.uid()));

grant select on public.app_notifications to authenticated;
grant update (read_at) on public.app_notifications to authenticated;

-- ---------------------------------------------------------------------------
-- device_tokens: push tokens, owner-managed.
-- ---------------------------------------------------------------------------
create table public.device_tokens (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  token text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (profile_id, token)
);

alter table public.device_tokens enable row level security;
alter table public.device_tokens force row level security;

create policy device_tokens_owner_all on public.device_tokens
  for all to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

grant select, insert, update, delete on public.device_tokens to authenticated;

grant all on public.app_memories, public.app_calendar_events, public.app_games,
             public.app_notifications, public.device_tokens
  to service_role;

-- ---------------------------------------------------------------------------
-- Realtime: transitional parity with the six Firestore listeners. The PRD
-- direction trims this to games + notifications once query hooks land.
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table
  public.profiles,
  public.relationships,
  public.relationship_members,
  public.app_memories,
  public.app_calendar_events,
  public.app_games,
  public.app_notifications;
