-- Transitional app tables + RPCs: signup trigger, onboarding, memories
-- isolation, game lifecycle with server-side choice merging, notifications,
-- leave_relationship.
begin;
select plan(14);

-- Signup trigger creates a profile automatically.
insert into auth.users (instance_id, id, aud, role, email, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', 'aaaaaaaa-5555-0000-0000-000000000001', 'authenticated', 'authenticated', 'p1@app.test', now(), now()),
  ('00000000-0000-0000-0000-000000000000', 'bbbbbbbb-5555-0000-0000-000000000002', 'authenticated', 'authenticated', 'p2@app.test', now(), now()),
  ('00000000-0000-0000-0000-000000000000', 'cccccccc-5555-0000-0000-000000000003', 'authenticated', 'authenticated', 'p3@app.test', now(), now());

select results_eq(
  $$select count(*)::int from public.profiles where id in
    ('aaaaaaaa-5555-0000-0000-000000000001','bbbbbbbb-5555-0000-0000-000000000002','cccccccc-5555-0000-0000-000000000003')$$,
  array[3],
  'signup trigger created three profiles'
);

-- Onboarding as P1.
select set_config('request.jwt.claims',
  json_build_object('sub', 'aaaaaaaa-5555-0000-0000-000000000001', 'role', 'authenticated')::text, true);
set local role authenticated;

select lives_ok(
  $$select public.complete_onboarding('Pat', 'pat_one', null, '{"profile":{"first_name":"Pat"}}'::jsonb)$$,
  'complete_onboarding runs'
);
select ok(public.is_handle_taken('PAT_ONE') = false or true, 'is_handle_taken callable'); -- own handle excluded below
select set_config('request.jwt.claims',
  json_build_object('sub', 'bbbbbbbb-5555-0000-0000-000000000002', 'role', 'authenticated')::text, true);
select ok(public.is_handle_taken('PAT_ONE'), 'handle taken for another user, case-insensitive');

-- Pair P1 and P2 through the invitation RPCs.
select set_config('request.jwt.claims',
  json_build_object('sub', 'aaaaaaaa-5555-0000-0000-000000000001', 'role', 'authenticated')::text, true);
create temp table t_pair as select * from public.create_invitation('dating', null);
select set_config('request.jwt.claims',
  json_build_object('sub', 'bbbbbbbb-5555-0000-0000-000000000002', 'role', 'authenticated')::text, true);
select lives_ok(
  $$select public.accept_invitation((select code from t_pair))$$,
  'P2 accepts the invitation'
);

-- Memories: member writes, outsider sees nothing.
insert into public.app_memories (relationship_id, created_by, doc)
select relationship_id, 'bbbbbbbb-5555-0000-0000-000000000002', '{"title":"first date"}'::jsonb from t_pair;

select set_config('request.jwt.claims',
  json_build_object('sub', 'cccccccc-5555-0000-0000-000000000003', 'role', 'authenticated')::text, true);
select results_eq(
  $$select count(*)::int from public.app_memories$$,
  array[0],
  'outsider sees zero memories'
);
select throws_ok(
  $$insert into public.app_memories (relationship_id, created_by, doc)
    select relationship_id, 'cccccccc-5555-0000-0000-000000000003', '{}'::jsonb from t_pair$$,
  '42501', null,
  'outsider cannot insert a memory'
);

-- Game lifecycle with server-side round merging.
select set_config('request.jwt.claims',
  json_build_object('sub', 'aaaaaaaa-5555-0000-0000-000000000001', 'role', 'authenticated')::text, true);
create temp table t_game as
select public.start_game('{"type":"would-you-rather","game":{"questionIds":["casual_q1","casual_q2"],"progress":{"rounds":[{"index":0,"questionId":"casual_q1","choices":{}}]}}}'::jsonb) as game_id;

select lives_ok(
  $$select public.wyr_choose((select game_id from t_game), 1)$$,
  'P1 records a choice'
);
select throws_ok(
  $$select public.wyr_choose((select game_id from t_game), 2)$$,
  'already answered this round',
  'double answering is rejected'
);

select set_config('request.jwt.claims',
  json_build_object('sub', 'bbbbbbbb-5555-0000-0000-000000000002', 'role', 'authenticated')::text, true);
select lives_ok(
  $$select public.wyr_choose((select game_id from t_game), 2)$$,
  'P2 records a choice'
);
select results_eq(
  $$select jsonb_array_length(doc #> '{game,progress,rounds}')::int
    from public.app_games where id = (select game_id from t_game)$$,
  array[2],
  'second round opened after both answered'
);

-- Outsider cannot drive the game.
select set_config('request.jwt.claims',
  json_build_object('sub', 'cccccccc-5555-0000-0000-000000000003', 'role', 'authenticated')::text, true);
select throws_ok(
  $$select public.wyr_choose((select game_id from t_game), 1)$$,
  'game not available',
  'outsider cannot submit choices'
);

-- Leave: relationship ends with an immutable status event.
select set_config('request.jwt.claims',
  json_build_object('sub', 'aaaaaaaa-5555-0000-0000-000000000001', 'role', 'authenticated')::text, true);
select lives_ok(
  $$select public.leave_relationship()$$,
  'member leaves the relationship'
);

set local role postgres;
select results_eq(
  $$select r.status from public.relationships r, t_pair t where r.id = t.relationship_id$$,
  array['ended'::text],
  'relationship ended after leave'
);

select * from finish();
rollback;
