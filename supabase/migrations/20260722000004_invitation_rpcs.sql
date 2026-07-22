-- Migration 0004: trusted commands (RPCs) for consent and invitations.
-- Sensitive multi-step operations run server-side in one transaction.
-- All functions: SECURITY DEFINER, pinned empty search_path, fully
-- qualified names, revoked from public/anon, granted to authenticated.

-- ---------------------------------------------------------------------------
-- accept_policy: append one consent row for the caller.
-- ---------------------------------------------------------------------------
create or replace function public.accept_policy(
  p_consent_type text,
  p_policy_version text
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_id uuid;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  insert into public.user_consents (profile_id, consent_type, policy_version)
  values (v_uid, p_consent_type, p_policy_version)
  returning id into v_id;

  perform security.log_audit('consent_accepted', v_uid, 'user_consents', v_id,
    jsonb_build_object('consent_type', p_consent_type, 'policy_version', p_policy_version));

  return v_id;
end;
$$;
revoke all on function public.accept_policy(text, text) from public, anon;
grant execute on function public.accept_policy(text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- create_invitation: create a pending relationship container, the caller's
-- membership, and a single-use hashed invitation code. Returns the plaintext
-- code EXACTLY ONCE; only the hash is stored.
-- ---------------------------------------------------------------------------
create or replace function public.create_invitation(
  p_relationship_type text default 'dating',
  p_start_date date default null
) returns table (invitation_id uuid, relationship_id uuid, code text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_relationship_id uuid;
  v_invitation_id uuid;
  v_code text;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  -- MVP: one active relationship per user.
  if exists (
    select 1
    from public.relationship_members rm
    join public.relationships r on r.id = rm.relationship_id
    where rm.profile_id = v_uid
      and rm.member_status = 'active'
      and r.status in ('pending','active')
  ) then
    raise exception 'caller already has an active relationship';
  end if;

  insert into public.relationships (relationship_type, start_date, created_by)
  values (p_relationship_type, p_start_date, v_uid)
  returning id into v_relationship_id;

  insert into public.relationship_members (relationship_id, profile_id, member_status, joined_at)
  values (v_relationship_id, v_uid, 'active', now());

  -- 10 hex chars from 5 random bytes: not guessable within 5 attempts.
  v_code := encode(extensions.gen_random_bytes(5), 'hex');

  insert into public.relationship_invitations (relationship_id, inviter_id, code_hash)
  values (v_relationship_id, v_uid, encode(extensions.digest(v_code, 'sha256'), 'hex'))
  returning id into v_invitation_id;

  insert into public.relationship_status_events (relationship_id, actor_id, prior_status, new_status)
  values (v_relationship_id, v_uid, null, 'pending');

  perform security.log_audit('invitation_created', v_uid, 'relationship_invitations', v_invitation_id,
    jsonb_build_object('relationship_id', v_relationship_id));

  return query select v_invitation_id, v_relationship_id, v_code;
end;
$$;
revoke all on function public.create_invitation(text, date) from public, anon;
grant execute on function public.create_invitation(text, date) to authenticated;

-- ---------------------------------------------------------------------------
-- accept_invitation: validate code, expiry, attempts, revocation, block
-- state, and capacity in one transaction, then activate the relationship.
-- Failures raise a single generic message so nothing leaks about which
-- check failed.
-- ---------------------------------------------------------------------------
create or replace function public.accept_invitation(p_code text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_inv public.relationship_invitations%rowtype;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  select * into v_inv
  from public.relationship_invitations
  where code_hash = encode(extensions.digest(p_code, 'sha256'), 'hex')
  for update;

  if not found
     or v_inv.revoked_at is not null
     or v_inv.accepted_at is not null
     or v_inv.expires_at < now()
     or v_inv.attempt_count >= v_inv.max_attempts
     or v_inv.inviter_id = v_uid
     or security.is_blocked(v_inv.inviter_id, v_uid)
  then
    if found then
      update public.relationship_invitations
      set attempt_count = attempt_count + 1
      where id = v_inv.id;
    end if;
    raise exception 'invitation is not valid';
  end if;

  -- MVP: acceptor must not already have an active relationship.
  if exists (
    select 1
    from public.relationship_members rm
    join public.relationships r on r.id = rm.relationship_id
    where rm.profile_id = v_uid
      and rm.member_status = 'active'
      and r.status in ('pending','active')
  ) then
    raise exception 'invitation is not valid';
  end if;

  update public.relationship_invitations
  set accepted_at = now(), accepted_by = v_uid
  where id = v_inv.id;

  insert into public.relationship_members (relationship_id, profile_id, member_status, joined_at)
  values (v_inv.relationship_id, v_uid, 'active', now());

  update public.relationships
  set status = 'active', verification_state = 'verified', updated_at = now()
  where id = v_inv.relationship_id;

  insert into public.relationship_status_events (relationship_id, actor_id, prior_status, new_status, confirmation_state)
  values (v_inv.relationship_id, v_uid, 'pending', 'active', 'confirmed');

  perform security.log_audit('invitation_accepted', v_uid, 'relationships', v_inv.relationship_id, '{}'::jsonb);

  return v_inv.relationship_id;
end;
$$;
revoke all on function public.accept_invitation(text) from public, anon;
grant execute on function public.accept_invitation(text) to authenticated;

-- ---------------------------------------------------------------------------
-- revoke_invitation: inviter cancels an open invitation.
-- ---------------------------------------------------------------------------
create or replace function public.revoke_invitation(p_invitation_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_count int;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  update public.relationship_invitations
  set revoked_at = now()
  where id = p_invitation_id
    and inviter_id = v_uid
    and accepted_at is null
    and revoked_at is null;

  get diagnostics v_count = row_count;
  if v_count = 0 then
    raise exception 'invitation is not valid';
  end if;

  perform security.log_audit('invitation_revoked', v_uid, 'relationship_invitations', p_invitation_id, '{}'::jsonb);
end;
$$;
revoke all on function public.revoke_invitation(uuid) from public, anon;
grant execute on function public.revoke_invitation(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- confirm_relationship: append a periodic (90-day) confirmation for the
-- calling member.
-- ---------------------------------------------------------------------------
create or replace function public.confirm_relationship(p_relationship_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_id uuid;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  if not exists (
    select 1 from public.relationship_members rm
    where rm.relationship_id = p_relationship_id
      and rm.profile_id = v_uid
      and rm.member_status = 'active'
  ) then
    raise exception 'not an active member';
  end if;

  insert into public.relationship_confirmations (relationship_id, profile_id)
  values (p_relationship_id, v_uid)
  returning id into v_id;

  perform security.log_audit('relationship_confirmed', v_uid, 'relationships', p_relationship_id, '{}'::jsonb);

  return v_id;
end;
$$;
revoke all on function public.confirm_relationship(uuid) from public, anon;
grant execute on function public.confirm_relationship(uuid) to authenticated;
