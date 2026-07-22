-- Migration 0006: transitional app RPCs.
-- Server-side commands backing the existing mobile flows: onboarding,
-- handle checks, game lifecycle (round/choice merging must not trust the
-- client), and a transitional leave/unpair. Same conventions as 0004:
-- SECURITY DEFINER, empty pinned search_path, qualified names, explicit
-- grants.

-- ---------------------------------------------------------------------------
-- is_handle_taken: exact-match handle availability for onboarding.
-- Definer read so callers cannot enumerate profiles; boolean only.
-- ---------------------------------------------------------------------------
create or replace function public.is_handle_taken(p_handle text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where lower(handle) = lower(p_handle)
      and id <> coalesce((select auth.uid()), '00000000-0000-0000-0000-000000000000'::uuid)
  );
$$;
revoke all on function public.is_handle_taken(text) from public, anon;
grant execute on function public.is_handle_taken(text) to authenticated;

-- ---------------------------------------------------------------------------
-- complete_onboarding: persist the onboarding form. Structured columns for
-- real profile fields; the remaining legacy form document lands in
-- legacy_meta (dies when onboarding is rebuilt on PRD columns).
-- ---------------------------------------------------------------------------
create or replace function public.complete_onboarding(
  p_display_name text default null,
  p_handle text default null,
  p_avatar_path text default null,
  p_meta jsonb default '{}'::jsonb
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  update public.profiles
  set display_name = coalesce(p_display_name, display_name),
      handle = coalesce(lower(p_handle), handle),
      avatar_path = coalesce(p_avatar_path, avatar_path),
      legacy_meta = p_meta,
      updated_at = now()
  where id = v_uid;

  perform security.log_audit('onboarding_completed', v_uid, 'profiles', v_uid, '{}'::jsonb);
end;
$$;
revoke all on function public.complete_onboarding(text, text, text, jsonb) from public, anon;
grant execute on function public.complete_onboarding(text, text, text, jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- update_profile_meta: shallow-merge patch into legacy_meta (mood updates,
-- settings toggles). Transitional; dies with legacy_meta.
-- ---------------------------------------------------------------------------
create or replace function public.update_profile_meta(p_patch jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;
  update public.profiles
  set legacy_meta = coalesce(legacy_meta, '{}'::jsonb) || coalesce(p_patch, '{}'::jsonb),
      updated_at = now()
  where id = v_uid;
end;
$$;
revoke all on function public.update_profile_meta(jsonb) from public, anon;
grant execute on function public.update_profile_meta(jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- Game lifecycle. The caller must be an active member of the relationship;
-- choice merging happens here so a client cannot forge the partner's answer.
-- ---------------------------------------------------------------------------
create or replace function security.active_relationship_of(p_uid uuid)
returns uuid
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select rm.relationship_id
  from public.relationship_members rm
  join public.relationships r on r.id = rm.relationship_id
  where rm.profile_id = p_uid
    and rm.member_status = 'active'
    and r.status in ('pending','active')
  limit 1;
$$;
revoke all on function security.active_relationship_of(uuid) from public, anon, authenticated;

create or replace function public.start_game(p_doc jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_rel uuid;
  v_game uuid;
begin
  if v_uid is null then raise exception 'not authenticated'; end if;
  v_rel := security.active_relationship_of(v_uid);
  if v_rel is null then raise exception 'no active relationship'; end if;

  insert into public.app_games (relationship_id, created_by, doc)
  values (v_rel, v_uid, coalesce(p_doc, '{}'::jsonb))
  returning id into v_game;

  update public.relationships
  set active_game_id = v_game, updated_at = now()
  where id = v_rel;

  return v_game;
end;
$$;
revoke all on function public.start_game(jsonb) from public, anon;
grant execute on function public.start_game(jsonb) to authenticated;

-- Would You Rather choice: record the caller's pick on the latest round and
-- open the next round when both members have answered.
create or replace function public.wyr_choose(p_game_id uuid, p_choice int)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_game public.app_games%rowtype;
  v_rounds jsonb;
  v_last jsonb;
  v_last_idx int;
  v_question_ids jsonb;
begin
  if v_uid is null then raise exception 'not authenticated'; end if;
  if p_choice not in (1, 2) then raise exception 'invalid choice'; end if;

  select * into v_game from public.app_games where id = p_game_id for update;
  if not found
     or v_game.status <> 'active'
     or not security.is_relationship_member(v_game.relationship_id) then
    raise exception 'game not available';
  end if;

  v_rounds := coalesce(v_game.doc #> '{game,progress,rounds}', '[]'::jsonb);
  v_last_idx := jsonb_array_length(v_rounds) - 1;
  if v_last_idx < 0 then raise exception 'game has no rounds'; end if;
  v_last := v_rounds -> v_last_idx;

  if v_last -> 'choices' ? v_uid::text then
    raise exception 'already answered this round';
  end if;

  v_last := jsonb_set(v_last, array['choices', v_uid::text], to_jsonb(p_choice));
  v_rounds := jsonb_set(v_rounds, array[v_last_idx::text], v_last);

  -- Both answered: open the next round if questions remain.
  if (select count(*) from jsonb_object_keys(v_last -> 'choices')) >= 2 then
    v_question_ids := coalesce(v_game.doc #> '{game,questionIds}', '[]'::jsonb);
    if jsonb_array_length(v_question_ids) > jsonb_array_length(v_rounds) then
      v_rounds := v_rounds || jsonb_build_array(jsonb_build_object(
        'index', jsonb_array_length(v_rounds),
        'questionId', v_question_ids -> jsonb_array_length(v_rounds),
        'choices', '{}'::jsonb
      ));
    end if;
  end if;

  update public.app_games
  set doc = jsonb_set(doc, '{game,progress,rounds}', v_rounds),
      updated_at = now()
  where id = p_game_id;
end;
$$;
revoke all on function public.wyr_choose(uuid, int) from public, anon;
grant execute on function public.wyr_choose(uuid, int) to authenticated;

create or replace function public.end_active_game()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_rel uuid := security.active_relationship_of((select auth.uid()));
begin
  if v_uid is null then raise exception 'not authenticated'; end if;
  if v_rel is null then raise exception 'no active relationship'; end if;

  update public.app_games g
  set status = 'ended', updated_at = now()
  from public.relationships r
  where r.id = v_rel and g.id = r.active_game_id and g.status = 'active';
end;
$$;
revoke all on function public.end_active_game() from public, anon;
grant execute on function public.end_active_game() to authenticated;

create or replace function public.archive_active_game()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_rel uuid := security.active_relationship_of((select auth.uid()));
begin
  if v_uid is null then raise exception 'not authenticated'; end if;
  if v_rel is null then raise exception 'no active relationship'; end if;

  update public.app_games g
  set status = 'archived', updated_at = now()
  from public.relationships r
  where r.id = v_rel and g.id = r.active_game_id;

  update public.relationships
  set active_game_id = null, updated_at = now()
  where id = v_rel;
end;
$$;
revoke all on function public.archive_active_game() from public, anon;
grant execute on function public.archive_active_game() to authenticated;

-- ---------------------------------------------------------------------------
-- leave_relationship: transitional unpair (the calm PRD closure flow is
-- Phase 7). Either member may leave; the relationship ends, an immutable
-- status event records it, and the active game pointer clears.
-- ---------------------------------------------------------------------------
create or replace function public.leave_relationship()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_rel uuid := security.active_relationship_of((select auth.uid()));
  v_prior text;
begin
  if v_uid is null then raise exception 'not authenticated'; end if;
  if v_rel is null then raise exception 'no active relationship'; end if;

  select status into v_prior from public.relationships where id = v_rel for update;

  update public.relationship_members
  set member_status = 'ended', left_at = now()
  where relationship_id = v_rel;

  update public.relationships
  set status = 'ended', end_date = current_date, active_game_id = null, updated_at = now()
  where id = v_rel;

  insert into public.relationship_status_events (relationship_id, actor_id, prior_status, new_status)
  values (v_rel, v_uid, v_prior, 'ended');

  perform security.log_audit('relationship_left', v_uid, 'relationships', v_rel, '{}'::jsonb);
end;
$$;
revoke all on function public.leave_relationship() from public, anon;
grant execute on function public.leave_relationship() to authenticated;
