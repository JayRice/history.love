# History.love MVP Engineering Implementation Plan

> **For agentic workers:** This is an execution blueprint, not a code-change plan. Before implementing any phase, read this document plus the four audit documents in `docs/audits/`. Implement phase by phase; each phase ends with a testable gate. Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` when a phase is broken into code tasks.

**Goal:** Transform the current Firebase couples-memory prototype into the History.love MVP defined in `History_Love_MVP_Product_Requirements_v2.pdf`: a consent-based verified relationship-history platform on Supabase.

**Architecture:** Expo React Native (untrusted client) → feature modules → use cases → repositories → Supabase (Postgres + RLS, Auth, private Storage, Edge Functions). Authorization lives only in RLS, database constraints, RPCs, and Edge Functions. Firebase is legacy infrastructure to be removed, not wrapped.

**Tech stack:** Expo SDK 54, React Native 0.81, React 19, expo-router 6, TypeScript strict, TanStack Query (new), Zustand (ephemeral UI only), supabase-js (new), Supabase CLI migrations, pgTAP, Zod.

**Companion documents (evidence base):**
- `docs/audits/history-love-mvp-implementation-audit.md` (findings, flows, blueprints)
- `docs/audits/history-love-current-code-map.md` (file-level inventory)
- `docs/audits/history-love-mvp-feature-matrix.md` (per-feature status)
- `docs/audits/history-love-security-model.md` (RLS matrix, findings)

## Global constraints

Copied from the PRD and the stated direction. Every phase inherits these.

- The mobile client is untrusted. No authorization via hidden UI, Zustand state, route params, client-provided permissions, or frontend checks. Authorization lives in RLS, constraints, RPCs, Edge Functions only.
- No Firebase repository implementations. Firebase code is quarantined legacy, deleted feature-by-feature as Supabase replacements land.
- Prohibited in MVP: matchmaking, swiping, recommendations, stranger messaging, background checks, public negative reviews, public relationship scores, AI relationship coach, subscriptions/payments, users under 18, precise location, biometric processing.
- Immutable history: ratings, relationship status changes, redactions, moderation actions, consent, closure. Event tables get no authenticated UPDATE or DELETE policy. Corrections are new linked rows.
- A relationship is a container plus membership rows (`relationships` + `relationship_members`). Never `partner_one_id`/`partner_two_id`.
- Migrations are the only source of schema truth. No manual dashboard schema edits.
- Server state lives in TanStack Query, never permanently in Zustand.
- No `supabase.from()`, storage, or `functions.invoke` call inside a screen or visual component.
- No service-role key, secret, or database credential in Expo env or the mobile bundle. The client gets only the publishable key.
- Blocks are checked in both directions inside every search, profile, invitation, badge, rating, notification, closure, and signed-URL path.
- Search is exact-name, opt-in, authenticated, rate-limited. Concern markers never appear in search or public profiles.
- "Verified" always means phone/email/account control, never identity or safety clearance.

---

# 1. Current State Assessment

Full detail lives in `docs/audits/history-love-current-code-map.md`. Summary of what matters for execution:

**Current architecture.** Screens read five Zustand stores and call `src/server/*` (HTTP to a personal ngrok tunnel) and `src/database/*` (Firebase Auth/Firestore/Storage) directly. `app/_layout.tsx` (288 lines) holds six Firestore `onSnapshot` listeners, image fetching, and the navigation guard. There is no repository, use-case, or server-state layer. No tests, no crash reporting, no monitoring.

**Current Expo structure.** Root `app/` route files re-export screens from `src/pages/`. `src/` splits by technical layer (`components`, `store`, `server`, `database`, `hooks`, `contexts`, `types`), not by feature. The real tab bar is Home, Timeline, Journal, Profile, Settings; calendar/games/questions sit in a misnamed `(tabs)` group with no layout and render as stack pushes.

**Current Firebase usage.** Auth (email, Google, Apple) in `src/database/auth/*` + `AuthContext`; Firestore reads via the six root-layout listeners (`users/{uid}`, `relationships/{id}`, `memories`, `calendarEvents`, `games/{activeGameId}`, `notifications`); Firestore writes for device tokens and mark-read; Storage reads via `getImages.ts`. Uploads go through the external API as multipart form data. Firestore/Storage rules are not in the repo; the external API's authorization is unreadable from here.

**Current data models.** `types/User.ts` (nested profile/partner with `match_code` and `relationship_id`), `types/Relationship.ts` (`users[]`, `profileImageIds`, `activeGame`), `types/Memory.ts`, `types/Calendar.ts`, `types/Game.ts`, `types/Notification.ts`. Naming is inconsistent (`matchCode` vs `match_code`, `relationship_id` vs `relationshipId`).

**Technical debt blocking MVP.** Committed `DEV_MODE=true` seeding a fake user; ngrok tunnel base URL with ATS/cleartext relaxation; private records logged to console; no dark theme while automatic UI style is declared; Tailwind tokens unsynchronized with the Paper theme; corrupt `package.json` dependency; broken import in `app/index.tsx`; the Consent screen collecting MVP-prohibited biometric and precise-location consent.

## Feature decision table

| Current Feature | Current Implementation | MVP Decision | Migration Strategy |
|---|---|---|---|
| Email signup/login | Firebase Auth via `useLogin`, `loginWithEmail`, `signupWithEmail` | Keep flow, replace provider | Supabase Auth repository; normalize the three inconsistent provider return shapes into one `AuthSession` |
| Google/Apple OAuth | `useGoogleLogin`, `loginWithApple`, inconsistent shapes, crash on cancelled Google login | Keep, replace provider | Supabase OAuth; re-link legacy users by provider identity + verified email |
| 13-step onboarding | `OnboardingScreen` + 13 form components; DEV_MODE seeds fake user; submits multipart to external API | Preserve UX, redesign submission | Keep form engine and slides; add 18+ gate, versioned consent step; submit via signup Edge Function; compile out DEV_MODE |
| Match-code pairing | 6-digit code, length-only validation, external API `pair_users` | Keep interaction, redesign workflow | Single-use hashed invitations with expiry and attempt caps; `create_invitation`/`accept_invitation` RPCs; keep `PinInput`/`TapToCopy` UI |
| Shared timeline | `TimelineScreen` reading Zustand mirror; feed fetch is a mock | Preserve and expand | Becomes the unified History feed over `timeline_events`; keep `TimelineEventCard`, `GalleryScreen`, filter bar |
| Memories + photos | `AddMemory`/`EditMemory`/`StoryMode`; multipart upload to API; Firebase Storage reads | Preserve, replace data layer | `moments` + `moment_media` in Postgres; private `relationship-media` bucket; one-photo MVP limit enforced server-side |
| Shared calendar | `CalendarScreen` (big-calendar + rrule), add-event modal | Preserve, deprioritize | Move under Growth; `calendar_events` table with member RLS; migrate after trust features |
| Would You Rather | Full round/choice/reveal loop; realtime via Firestore listener | Preserve as secondary | Move under Growth/Play; `games` + `game_responses`; Supabase Realtime for the active game only |
| Other 11 games | Cards in `gameData.ts`, not implemented | Hide | Show only implemented games |
| Notifications foundation | Push-token register/remove; unread listener; mark-read; no inbox | Preserve shell, redesign generation | Server-generated only (triggers/Edge Functions); client may register own tokens and mark own rows read; add inbox screen |
| Journal | Mock data, AI-prompt framing, web-CSS gradients | Keep concept, rebuild | Real `journal_entries` with private/shared/confirmed visibility; remove AI framing (deferred, legal-gated) |
| Consent screen | Mock; collects biometric + precise-location consent | Replace entirely | Versioned `user_consents` (Terms, Privacy, Community Standards, Relationship Record Consent, no-background-check ack); never biometrics or precise location |
| Subscription screen | UI only | Hide | Payments are legal-gated; keep code dormant, remove route |
| Questions screen | Header-only stub | Hide | Placeholder for future conversation prompts (Growth) |
| Profile screen | View-only | Expand | Me tab: editing, searchability, privacy center |
| Settings | Unpair only (~10% of Me requirements) | Expand | Me tab: blocks, export, deletion, consent records, visibility |
| Mood metadata | `MoodCard`, emoji map | Promote | Becomes `feelings` check-ins with explicit visibility; vector icons + text labels replace emoji-only meaning |
| Location search | Venue search via API | Product decision | Broad city/state only in MVP; precise venue storage deferred or coarsened |
| Zustand stores | Five stores mirroring Firestore docs | Replace server state | TanStack Query owns server state; Zustand keeps drafts, filters, onboarding progress; delete `generalStore.ts` |

---

# 2. Target MVP Architecture

## Mobile architecture

Recommended folder structure (expo-router supports `src/app` natively; the root `app/` directory moves under `src/` in Phase 0):

```
src/
  app/                          # route files ONLY: composition, no data access, no policy
    (auth)/                     #   sign-in, sign-up, verify
    (onboarding)/               #   adult gate, consent, profile steps
    (main)/                     #   the five tabs: home, history, add, growth, me
    (modals)/                   #   create sheets, detail views
    _layout.tsx                 #   providers + auth guard only (target < 100 lines)
  features/
    auth/
      domain/                   #   AuthSession type, SignUpAdultUser, AcceptPolicies use cases
      data/                     #   authRepository.ts (supabase-js), mappers
      hooks/                    #   useSession, useSignIn, useSignUp (TanStack Query)
      ui/                       #   feature-specific components
    profiles/                   #   profile CRUD, searchability, public card
    relationships/              #   container, members, invitations, status events, confirmations
    memories/                   #   moments, media, revisions            (maps current Memory)
    journal/                    #   journal entries + revisions
    checkins/                   #   feelings log
    badges/                     #   definitions, awards, lifecycle
    ratings/                    #   snapshots, score change events, acknowledgements
    closure/                    #   closure flow, exit badges, searchable status
    safety/                     #   blocks, no-contact, reports, redaction requests
    search/                     #   exact-name search over public cards
    notifications/              #   inbox, tokens, mark-read
    calendar/                   #   events (Growth)
    games/                      #   sessions, WYR (Growth)
  shared/
    ui/                         #   design system: HistoryCard variants, buttons, inputs,
                                #   state components (Loading/Empty/Error/Blocked/Redacted),
                                #   VisibilityLabel, tokens (light + dark)
    lib/                        #   supabase client factory, logger, dates, validation (Zod)
    config/                     #   env parsing (Zod), feature flags
    types/                      #   generated database types, shared contracts
supabase/
  migrations/                   #   immutable timestamped SQL, the only schema truth
  functions/                    #   Edge Functions (Deno)
  tests/database/               #   pgTAP + RLS attack tests
  seed.sql                      #   synthetic fixtures (never production data)
  config.toml
```

**Layer responsibilities and the dependency rule:**

```
Screens (src/app + features/*/ui)
   ↓  render state, handle navigation; never fetch, never decide policy
Hooks (features/*/hooks)
   ↓  TanStack Query wrappers: query keys, cache, loading/error, optimistic updates
Use cases (features/*/domain)
   ↓  product workflow and validation order; no React, no Supabase types
Repositories (features/*/data)
   ↓  map domain operations to supabase-js queries/RPCs; normalize errors;
      map rows to domain models (no raw DB rows reach UI)
Supabase
      Postgres + RLS, Auth, Storage, Edge Functions: the ONLY authorization layer
```

Enforcement: ESLint import-boundary rules fail the build when `src/app` or `features/*/ui` imports `@supabase/*` or `features/*/data`, and when one feature imports another feature's `data` layer (cross-feature access goes through the other feature's domain contract). CI greps the bundle for the service-role key pattern and fails on a hit.

**Services:** cross-cutting concerns (logger, analytics, push registration) live in `shared/lib` and are injected into repositories/use cases, never imported by screens directly.

**State rules:** every server resource has a typed query key (`['profile','me']`, `['relationship', relId]`, `['moments', relId]`, `['timeline', relId]`, `['badges', profileId]`, `['ratings', relId]`, `['notifications','unread']`, `['blocks']`, `['search', name]`) with a documented invalidation trigger. Zustand keeps: onboarding step state, unsent drafts, active History filters, UI preferences. Nothing else.

**Realtime policy:** Supabase Realtime subscriptions only for the active game session and the notification inbox. Everything else is fetch + invalidate. Do not replicate the six legacy listeners.

---

# 3. Supabase Database Migration Plan

Naming follows the PRD (section 9.2). Mapping from the audit's security model: `moments` = audit "memories", `score_change_events` = audit "rating_revisions", `badge_events` = audit "badge_award_events". Every table: UUID PK (`gen_random_uuid()`), `created_at timestamptz default now()`, FK indexes, RLS enabled AND forced, explicit grants, a retention class. Helper predicates live in a non-exposed `security` schema (`security.is_relationship_member(uuid)`, `security.is_blocked(uuid, uuid)`) as `SECURITY DEFINER` with pinned `search_path` (SQL pattern in `history-love-security-model.md` §2).

## Foundation (migration group 01)

**profiles.** Canonical private account row. Columns: `id uuid PK references auth.users`, `display_name`, `handle unique`, `legal_name`, `birth_year int`, `birth_month int`, `age_verified boolean not null default false`, `city`, `state`, `pronouns`, `avatar_path`, `search_status` enum (`private|not_dating|healing|open_conversation|open_serious`) default `private`, `search_visible_at timestamptz`, `verification_state` jsonb (email/phone booleans), `comms_prefs jsonb`, `updated_at`. Relationships: 1:1 auth.users; referenced by everything. RLS: owner SELECT full row; owner UPDATE on an allowlisted column set (never `age_verified`, `verification_state`); no client INSERT (signup Edge Function creates it); no DELETE (deletion job). Indexes: `handle`, `(search_status, search_visible_at)`. Mutable. Search never queries this table.

**user_consents.** Versioned, separable consent ledger. Columns: `id`, `profile_id FK`, `consent_type` enum (`terms|privacy|community_standards|relationship_record|search_visibility|no_background_check_ack|comms_email|comms_sms`), `policy_version text`, `accepted_at`, `withdrawn_at`, `ip_hash`, `device_meta jsonb`. RLS: owner SELECT; INSERT only via RPC/Edge Function; no UPDATE/DELETE (withdrawal is a new row). Indexes: `(profile_id, consent_type, accepted_at desc)`. **Immutable.**

**legacy_identity_map.** Firebase → Supabase identity bridge. Columns: `firebase_uid text unique`, `profile_id uuid FK`, `email_at_migration text`, `auth_provider text`, `linked_at`, `link_method` enum (`hash_import|email_reset|oauth_relink|manual`). Lives in a non-exposed schema (`private.legacy_identity_map`). RLS: no client access at all; service role only. **Immutable.**

**relationships.** The container. Columns: `id`, `relationship_type` enum (`dating|committed|engaged|married`), `status` enum (`pending|active|ended|separated|divorced|frozen`), `verification_state` enum (`unverified|pending_second|verified`), `start_date date`, `end_date date`, `created_by FK profiles`. RLS: SELECT for active or historical members (`security.is_relationship_member`); INSERT/UPDATE only via RPC (no client may set `verification_state` or `status` directly); no DELETE. Indexes: `status`, `created_by`. Mutable projection; every change mirrored by a status event.

**relationship_members.** Membership and per-member state. Columns: `id`, `relationship_id FK`, `profile_id FK`, `role` enum (`member`), `member_status` enum (`invited|active|ended|separated|left`), `joined_at`, `left_at`, `visibility_consent_at`. Constraint: `unique(relationship_id, profile_id)`; a partial unique index enforcing max two `active` members per relationship (MVP cap without hardcoding columns). RLS: member reads own row plus limited co-member fields; all writes via invitation/closure RPCs; a client can never INSERT itself into a relationship by id. Indexes: `relationship_id`, `profile_id`. Mutable via RPC only.

**relationship_invitations.** Match-code replacement. Columns: `id`, `relationship_id FK`, `inviter_id FK`, `invited_email_hash text`, `code_hash text` (SHA-256 of a cryptographically random code; plaintext returned exactly once by the RPC), `expires_at` (default now + 7 days), `attempt_count int default 0`, `max_attempts int default 5`, `accepted_at`, `accepted_by FK`, `revoked_at`. RLS: inviter SELECT own; all lifecycle via `create_invitation`/`accept_invitation`/`revoke_invitation` RPCs; no client writes. Indexes: `code_hash`, `expires_at`. Retention: delete/minimize 30 days after expiration. Mutable via RPC only.

**relationship_visibility_grants.** Per-member consent for public display. Columns: `id`, `relationship_id FK`, `profile_id FK`, `status_visibility` enum (`private|status_only|partner_identified|public_dates`), `partner_identity_visibility boolean`, `history_visibility` enum, `updated_at`. Constraint: `unique(relationship_id, profile_id)`. RLS: member SELECT for own relationship; owner UPDATE own row via RPC (RPC recomputes least-public resolution and refreshes the public projection). Mutable; every change also writes an audit event.

Also in group 01, because later policies reference them: **blocks** and **audit_events** (defined under Safety below), and the `security` helper schema.

## History system (migration group 02)

**moments.** Shared memories. Columns: `id`, `relationship_id FK`, `created_by FK`, `title`, `body`, `event_date date`, `feeling_tags text[]`, `visibility` enum (`only_me|shared|public_if_both`), `acknowledged_by FK null`, `acknowledged_at`, `withdrawn_at`, `updated_at`. RLS: SELECT member AND (creator OR visibility != `only_me`) AND not withdrawn (withdrawn rows visible only as markers); INSERT creator = auth.uid() AND member; UPDATE creator only, trigger writes a revision; no DELETE (withdrawal sets `withdrawn_at`). Indexes: `(relationship_id, event_date desc)`. Mutable with revision trail.

**moment_revisions** (support table): prior title/body/visibility snapshot per edit, append-only, member SELECT. **Immutable.**

**moment_media.** Columns: `id`, `moment_id FK`, `storage_path`, `mime_type`, `byte_size`, `withdrawn_at`. Constraint: MVP one-photo limit enforced by a unique partial index on `moment_id where withdrawn_at is null` plus the upload Edge Function. RLS: SELECT via parent moment's visibility; writes via Edge Function only. Mutable (withdrawal only).

**journal_entries.** Columns: `id`, `author_id FK`, `relationship_id FK null` (journals can outlive or precede a relationship), `title`, `body`, `mood_tag`, `visibility` enum (`private|shared|confirmed`) default `private`, `redaction_state` enum default `none`, `updated_at`. RLS: SELECT author only for `private` (including after breakup, forever); `shared`/`confirmed` add member read; INSERT author; UPDATE author with revision trigger; DELETE only while never-shared drafts. Journal bodies never appear in exports of the partner, admin views, analytics, or logs (PRD acceptance criterion). Indexes: `(author_id, created_at desc)`. Mutable with revision trail (`journal_entry_revisions`, append-only).

**feelings.** Structured check-ins. Columns: `id`, `relationship_id FK`, `author_id FK`, `feeling_tag` enum (`appreciated|loved|respected|heard|unsupported|disappointed|confused|disconnected`), `note`, `visibility` enum (`only_me|shared`), `created_at`. RLS: author INSERT; SELECT author, plus member when shared; no UPDATE/DELETE. Indexes: `(relationship_id, created_at desc)`. **Immutable.**

**timeline_events.** The unified History feed. Columns: `id`, `relationship_id FK`, `event_type` enum (`moment|feeling|badge|rating_change|status_change|redaction|closure|confirmation`), `source_table text`, `source_id uuid`, `actor_id FK null`, `visibility` enum, `occurred_at`, `summary jsonb` (safe display fields only, no private bodies). Populated exclusively by triggers on the source tables; no client writes of any kind. RLS: SELECT member AND per-row visibility. Indexes: `(relationship_id, occurred_at desc)`, `event_type`. **Immutable.** Rationale: one indexed feed table beats a seven-way UNION view for pagination, and the trigger boundary guarantees the feed can never contain a row its source would not permit.

## Gamification (migration group 03)

**badge_definitions.** Controlled taxonomy (seed from PRD Appendix A). Columns: `id`, `slug unique`, `label`, `badge_class` enum (`moment_award|pattern|milestone|growth|concern|exit|platform`), `public_eligible boolean`, `min_evidence_days int null` (30 for pattern badges), `active boolean`, `version int`. RLS: SELECT all authenticated; writes admin/service role only. Mutable, versioned, admin-managed.

**badge_awards** (projection, current state). Columns: `id`, `badge_definition_id FK`, `relationship_id FK`, `issuer_id FK`, `recipient_id FK`, `state` enum (`draft|given|accepted|published|disputed|improved|resolved|withdrawn|archived`), `visibility` enum (`private|shared|public`), `evidence_moment_id FK null`, `updated_at`. Constraints: issuer != recipient (no self-awards); issuer and recipient must both be members; concern-class badges can never have `visibility = public` (CHECK against definition class via trigger). RLS: issuer + recipient SELECT; all state changes via `issue_badge` / `respond_to_badge` RPCs (which enforce rate limits, the 30-day pattern window, and block checks); no client UPDATE/DELETE. Indexes: `recipient_id`, `(relationship_id, state)`.

**badge_events.** Append-only lifecycle ledger: `id`, `badge_award_id FK`, `actor_id FK`, `prior_state`, `new_state`, `reason`, `created_at`. Written by the badge RPCs; member SELECT. **Immutable.** The award row is the projection; this table is the truth of what happened.

## Ratings (migration group 04)

**rating_snapshots.** Initial and current per-category assessment. Columns: `id`, `relationship_id FK`, `rater_id FK`, `category` enum (the ten PRD 6.1 categories), `score numeric(2,1)` CHECK 1.0-5.0, `first_rated_at`, `current_score numeric(2,1)`, `updated_at`. Constraint: `unique(relationship_id, rater_id, category)`. `current_score` is maintained by the score-change RPC transactionally, never written directly. RLS: rater INSERT via RPC after 30-day relationship age check; rater SELECT own; partner SELECT only when the linked change events are shared. Mutable projection only.

**score_change_events.** The immutable audit history. Columns: `id`, `rating_snapshot_id FK`, `relationship_id FK`, `rater_id FK`, `category`, `previous_score`, `new_score`, `reason_code` enum (`new_incident|repeated_pattern|improved_behavior|misunderstanding_resolved|perspective_changed|correction|other`), `private_note`, `visibility` enum (`only_me|shared`), `acknowledgement` enum (`not_seen|seen|acknowledged|disputed|resolved`) default `not_seen`, `cooling_hold_until timestamptz null`, `prior_event_id FK null`, `created_at`. RLS: rater INSERT via `submit_score_change` RPC only (the RPC computes the cooling hold: a drop ≥ 2.0 within 24h of a conflict marker delays shared visibility 24h unless a safety reason is flagged); rater SELECT; partner SELECT when `visibility = shared` and `cooling_hold_until` passed; acknowledgement UPDATE limited to the partner and only the `acknowledgement` column; no other UPDATE, no DELETE. Indexes: `(relationship_id, created_at desc)`, `rating_snapshot_id`. **Immutable** (acknowledgement column is the single sanctioned mutable field, constrained by a column-level policy).

## Closure (migration group 05)

**closure_events.** Columns: `id`, `relationship_id FK`, `initiated_by FK`, `end_status` enum (`ended|separated|divorced|temporarily_apart|no_contact_requested|safety_exit`), `end_date date`, `confirmation_state` enum (`unrequested|requested|confirmed|disputed`), `confirmed_by FK null`, `lessons_journal_id FK null` (private journal entry), `public_history_choice jsonb`, `created_at`. RLS: either member may INSERT via `close_relationship` RPC (independent right to end; no partner permission); member SELECT; confirmation/dispute via RPC; no UPDATE/DELETE otherwise. The RPC transactionally: writes the closure event, appends a `relationship_status_events` row, sets `relationships.status`, freezes new shared badges/concerns/rating requests (state checks inside every write RPC), and preserves journals. **Immutable.**

**closure_badges** (support): `closure_event_id FK`, `badge_definition_id FK` (exit class only), `is_primary boolean`, `approved_by_recipient_at null`. Publication requires recipient approval. Append-only.

**searchable_status.** Implemented as the `profiles.search_status` + `search_visible_at` columns plus an append-only `search_status_events` table (`profile_id`, `prior_status`, `new_status`, `changed_at`, `via` enum). Defaults to `private` after any closure event (trigger). Changing to a visible status requires the `search_visibility` consent row and, later, step-up auth. Events **immutable**; profile columns mutable via RPC.

## Safety (migration group 06; `blocks` and `audit_events` created in group 01)

**blocks.** Columns: `id`, `blocker_id FK`, `blocked_id FK`, `mode` enum (`block|no_contact`), `created_at`. Constraint: `unique(blocker_id, blocked_id)`; blocker != blocked. RLS: blocker SELECT own list; blocker INSERT/DELETE own rows (this pair of writes is the one safety action allowed directly, so it can never fail on a server hop); `security.is_blocked(a,b)` checks both directions and is referenced inside search, invitation, badge, rating-share, notification, closure, and profile policies/RPCs. Indexes: both id columns. Silent: no notification to the blocked user, ever.

**reports.** Columns: `id`, `reporter_id FK`, `subject_profile_id FK null`, `subject_relationship_id FK null`, `category` enum (the ten PRD 8.1 categories), `body`, `evidence_refs jsonb`, `status` enum (`open|in_review|resolved|dismissed`), `priority` enum, `created_at`. Lives in a non-exposed `private` schema. Client access only through a `submit_report` Edge Function and a `get_my_report_status` RPC returning status only. Moderator access via service role in the admin app. Reporter notes never exposed to the accused. Mutable server-side; every status change writes `audit_events`.

**disputes.** Columns: `id`, `opened_by FK`, `target_type` enum (`relationship_fact|badge|public_date|image|exit_outcome`), `target_id uuid`, `structured_context jsonb`, `status` enum (`open|upheld|corrected|redacted|withdrawn|removed|restricted`), `decided_by`, `reason_code`, `appeal_of FK null` (one appeal, different reviewer), `created_at`. Non-exposed schema; Edge Function create; moderator decide. Disputed items are hidden or labeled pending review by severity. Mutable server-side with full audit.

**redaction_events.** Columns: `id`, `target_table`, `target_id`, `requested_by FK`, `action` enum (`withdrawn_by_author|redacted|corrected|removed_policy|legal_hold`), `general_reason text` (safe for display), `decided_by`, `created_at`. RLS: member SELECT of marker fields only (who, when, general reason; never original content); INSERT via redaction RPC/moderation only; no UPDATE/DELETE. Source rows keep their content in restricted form; projections and `timeline_events.summary` show only the marker. **Immutable.**

**audit_events.** Columns: `id`, `event_type text`, `actor_id uuid null`, `subject_type`, `subject_id`, `payload jsonb` (no private content: no journal bodies, notes, codes, tokens), `created_at`. Written only by triggers and SECURITY DEFINER functions; authenticated role has no INSERT/UPDATE/DELETE grant at all. Member SELECT of a privacy-filtered subset via a view; moderators read detail in the admin app. Indexes: `(subject_type, subject_id)`, `created_at`. **Immutable.** Retention 12-24 months per class.

## Supporting tables (created alongside their owning phase)

`relationship_status_events` (append-only status ledger, group 01), `relationship_confirmations` (90-day confirmations, group 01), `rating_acknowledgement` handled as the constrained column above, `notifications` (recipient-only, system-insert, group 02), `device_tokens` (owner insert/delete, group 02), `calendar_events` and `games`/`game_responses` (Growth phases), `data_export_jobs` and `deletion_jobs` (privacy phases), `public_profile_cards` (security-invoker view or RPC-backed projection, Search phase).

---

# 4. Authentication Migration Strategy

Constraint honored: users must not lose their accounts or be told to recreate them. Firebase Auth remains alive (read-only, no schema changes) until the bake period ends. No Firebase repository is written; the legacy Firebase auth code keeps running untouched until the cutover release, then is deleted.

**Step 1: Export and map.** Export Firebase users with `firebase auth:export` (includes scrypt password hashes and the project's scrypt parameters: `signer_key`, `salt_separator`, `rounds`, `mem_cost`). Build `private.legacy_identity_map` rows: `firebase_uid`, email, provider(s). Counts become the migration checksum.

**Step 2: Import identities into Supabase Auth.**
- **Email+password users:** import into `auth.users` with the Firebase scrypt hash. Supabase Auth (GoTrue) supports Firebase scrypt password hashes on import, so users keep their existing passwords. Verify this against the current Supabase migration guide on a staging project with a known test password **before** relying on it; if the verification fails on the current Supabase version, fall back per user to `link_method = email_reset`: the account is imported with an unusable password and the first sign-in runs "set your password" via a reset email. Either way the account, email, and data continuity are preserved.
- **Google/Apple users:** import with the same email; on first Supabase OAuth sign-in the provider identity links by verified email. Record `link_method = oauth_relink`. Apple caveat: private-relay emails link only if the same relay address is returned; keep those users flagged for manual review if the emails mismatch.
- **Duplicate emails / provider collisions:** never auto-merge. Hold in a review queue; the affected user resolves via a support flow.

**Step 3: Profile bootstrap.** A migration script (service role, run against staging first with sanitized fixtures) creates one `profiles` row per imported auth user, carrying display name, avatar path (after Storage migration), and city/state. `legacy_identity_map.profile_id` links back. Firestore relationship docs translate to `relationships` + two `relationship_members` rows keyed through the map.

**Step 4: Session migration.** Firebase sessions cannot transfer. The cutover mobile release replaces the Firebase auth stack with the Supabase `AuthRepository`; every user signs in once on first launch of the new version. The sign-in screen states why. Password users authenticate against the imported hash (or the reset path); OAuth users tap the same provider button. Supabase session tokens then persist in `expo-secure-store` (not AsyncStorage).

**Step 5: Verification.** Email verification runs through Supabase Auth email OTP at first sign-in for any account not already verified; privileged actions (invitations, searchable status, badge publication, score submission) check `email_confirmed_at` server-side. Phone verification (Supabase Auth SMS OTP) ships in the closed-beta phase and is security-only.

**Rollback strategy.** The cutover is a mobile release, so rollback is a release rollback: the previous binary still speaks to the untouched Firebase project. Preconditions held until the bake period ends: Firebase project untouched, no Firestore writes disabled, EAS previous build promotable, migration scripts idempotent (re-runnable after fixes because imports key on `firebase_uid`). Bake exit criteria: sign-in success rate at parity, zero unresolved identity-collision tickets, count checks green (`auth.users` imported = exported minus rejected, with a rejected-row report).

**Tests required before cutover:** staging E2E of password sign-in with an imported hash, OAuth relink for both providers, reset-fallback path, session restore after app restart, sign-out, revocation after password reset, and an RLS probe proving the freshly linked user reads only their own migrated rows.

---

# 5. Feature-by-Feature Migration Roadmap

Phases are strictly ordered; each ends with a gate. "Backend changes" means Supabase migrations/functions; the legacy external API receives no new work at any phase and dies with Firebase.

## Phase 0: Repository cleanup and architecture foundation

- **Goal:** a safe, structured codebase with no loaded footguns, before any Supabase code.
- **Database changes:** none.
- **Mobile changes:** remove `DEV_MODE` seeding, ngrok URL, ATS/cleartext relaxation, sensitive console logs, corrupt dependency, broken imports, dead files (audit P0 list). Move `app/` → `src/app`. Create the `features/` + `shared/` skeleton and move existing screens into their future feature homes (mechanical moves, no rewrites). Add TanStack Query provider, Zod env parsing, ESLint import-boundary rules, TypeScript strict fixes. Add the dark token palette and mirror tokens into `tailwind.config.js`.
- **Backend changes:** none.
- **Tests required:** env-parse unit tests; CI gates (no DEV_MODE, no tunnel URL, no secret in bundle, boundary lint passing); app boots and legacy flows still work (manual smoke).
- **Risks:** the file moves touch every import; mitigate with one mechanical commit per move batch and the smoke test after each.

## Phase 1: Supabase foundation

- **Goal:** the complete foundation schema exists, tested, before the app connects.
- **Database changes:** migration groups 01 (foundation + blocks + audit_events + security helpers), Storage buckets (`profile-images`, `relationship-media`, `moderation-evidence`, `data-exports`, all private, storage RLS on all verbs), seed data, generated TypeScript types.
- **Mobile changes:** `shared/lib/supabase.ts` client factory (publishable key from validated env); generated types wired into `shared/types`.
- **Backend changes:** local/staging/production Supabase projects created from migrations only; security advisors clean.
- **Tests required:** pgTAP: migrations apply from zero; RLS isolation (user A vs user B, non-member vs relationship by guessed UUID); block-predicate tests; storage isolation; immutability probes on `user_consents`, `audit_events`, `relationship_status_events`.
- **Risks:** schema decisions harden here; review this plan's section 3 against the PRD before writing migration 0001. Rollback: drop and recreate (nothing depends on it yet).

## Phase 2: Authentication migration

- **Goal:** Supabase Auth is the identity provider; legacy users keep their accounts.
- **Database changes:** `private.legacy_identity_map`; signup Edge Function (age gate + consent + profile row, one transaction).
- **Mobile changes:** `features/auth` repository/hooks/use cases; rebuild the auth guard in `src/app/_layout.tsx` on the Supabase session; onboarding gains the 18+ step and the versioned-consent step (replacing the prohibited Consent screen); secure session storage via `expo-secure-store`.
- **Backend changes:** Firebase user export + import scripts; identity-collision review queue.
- **Tests required:** section 4's pre-cutover list; E2E signup with age-gate rejection; consent persistence.
- **Risks:** highest-user-impact phase. Mitigate with the staging hash-import verification, the reset fallback, and the release-rollback plan. This is the first coordinated mobile release.

## Phase 3: Relationship verification

- **Goal:** invitations replace match codes; relationships become verified containers with immutable status history.
- **Database changes:** RPCs `create_invitation`, `accept_invitation`, `revoke_invitation`, `confirm_relationship`, `update_visibility_grant`; triggers writing `relationship_status_events` and `timeline_events`; migration script converting existing Firestore pairs into containers + members (count/ownership/rejected-row reports).
- **Mobile changes:** `features/relationships`; PairScreen UI adapts to invitation create/accept (keep `PinInput`, `TapToCopy`); visibility-selection screen; Home relationship card reads the new model.
- **Backend changes:** none beyond RPCs.
- **Tests required:** pgTAP invitation-abuse suite (expired, reused, brute-forced, blocked, over-capacity, malformed: all fail without information leakage); E2E invite → accept → verified; status-event immutability.
- **Risks:** data migration of existing pairs; DEV_MODE-contaminated records must be rejected by the transform, not imported.

## Phase 4: Memories and timeline

- **Goal:** the memory loop runs on Supabase; the History feed exists.
- **Database changes:** migration group 02 (`moments`, `moment_revisions`, `moment_media`, `journal_entries` + revisions, `feelings`, `timeline_events`, `notifications`, `device_tokens`); `upload_moment_media` Edge Function (MIME/size/file-signature validation, EXIF strip, one-photo limit); feed triggers.
- **Mobile changes:** `features/memories`, `features/journal`, `features/checkins`; Timeline becomes History over `['timeline', relId]`; Add tab ships (memory, journal, check-in types); visibility labels render on every card; the six legacy Firestore listeners die as each read moves; journal rebuilt without AI framing.
- **Backend changes:** Firestore memories + Storage objects migrated (counts, ownership, missing-media report).
- **Tests required:** RLS: member isolation, `only_me` invisibility to the partner, journal author-only including post-breakup; component states (loading/empty/error/blocked/redacted); E2E add memory, add journal.
- **Risks:** media migration volume; run staging first, keep the missing-media report, never block the feed on a missing image.

## Phase 5: Badges

- **Goal:** the controlled badge system with full lifecycle.
- **Database changes:** migration group 03; `issue_badge`, `respond_to_badge` RPCs with anti-gaming guards (rate limits, 30-day pattern window, taxonomy checks, block checks, closure freeze).
- **Mobile changes:** `features/badges`; Add → Badge flow; badge cards in History; badge state UI (given/accepted/disputed/withdrawn/archived).
- **Backend changes:** taxonomy seed from PRD Appendix A.
- **Tests required:** pgTAP anti-gaming suite (self-award, anonymous, flood, repeat-window, non-member, blocked, post-closure all rejected); lifecycle-transition legality; concern-class never public.
- **Risks:** taxonomy governance is a product decision; seed the PRD list and version it.

## Phase 6: Ratings and score history

- **Goal:** transparent, immutable score history with cooling periods.
- **Database changes:** migration group 04; `submit_initial_assessment`, `submit_score_change`, `acknowledge_score_change` RPCs; cooling-hold logic server-side; 30-day relationship-age check.
- **Mobile changes:** `features/ratings`; Growth → Ratings; the score-change sheet previews old value, new value, reason, visibility, permanence before submit; history timeline per category.
- **Tests required:** immutability probes (no UPDATE/DELETE on events); cooling-period timing; correction links to prior event; partner sees shared changes only after hold expiry; acknowledgement column-only update.
- **Risks:** the cooling rule is subtle; encode it in one RPC and test the clock with injected timestamps.

## Phase 7: Closure

- **Goal:** respectful, independent breakup with preserved history.
- **Database changes:** migration group 05; `close_relationship`, `confirm_closure`, `dispute_closure`, `set_searchable_status` RPCs; freeze checks added to every earlier write RPC; post-closure search default trigger.
- **Mobile changes:** `features/closure`; the calm closure flow (status, date, confirmation choice, exit badges, private lessons, public-history choice, searchable choice); History shows closure events; read-only historical access.
- **Tests required:** independent end without partner consent; freeze verified against badge/rating/moment RPCs; journal preservation; exit-badge publication requires recipient approval; search defaults to private post-closure.
- **Risks:** emotional-tone UX matters as much as the data model; copy review before release.

## Phase 8: Safety and moderation

- **Goal:** blocks/no-contact UX, reports, disputes, redaction, and the moderation boundary. (The `blocks` table and predicate have existed since Phase 1; this phase ships the user-facing controls and the moderation pipeline.)
- **Database changes:** migration group 06 remainder (`reports`, `disputes`, `redaction_events` in the private schema); `submit_report`, `request_redaction` Edge Functions; moderation service role.
- **Mobile changes:** `features/safety`; block/no-contact reachable within two taps from profiles, relationship settings, and safety surfaces; report flow with the ten categories; emergency copy ("not an emergency service"); redaction markers in History; Me → Blocks.
- **Backend changes:** minimal admin surface (can start as SQL runbooks + a protected internal tool; a separate admin app before public pilot) with MFA, reason-required access, audit logging.
- **Tests required:** the full block-enforcement matrix (search, profile, invite, badge, rating share, notification, closure, deep link, signed URL, both directions); report privacy (accused never sees reporter notes); redaction markers show no original content.
- **Risks:** moderation is an operational commitment, not just code; staffing and playbooks gate the beta, not this phase.

## Phase 9: Search

- **Goal:** exact-name, opt-in, consent-gated public search.
- **Database changes:** `public_profile_cards` projection (security-invoker view or RPC), refreshed by visibility-grant and badge-publication RPCs; `search_profiles` RPC (exact/prefix match, min query length, per-account and per-device rate limits, block checks inside the query, generic no-result responses).
- **Mobile changes:** `features/search`; search screen; the privacy-review screen before enabling searchability; public profile view (verification indicator, availability, approved badges, mutually approved exit summaries, change markers).
- **Tests required:** enumeration resistance (rate limits, generic messages); block invisibility in both directions; projection contains only opted-in fields; concern markers absent from every search path.
- **Risks:** this is the highest reputational-risk surface; it ships last deliberately, after redaction and disputes exist.

---

# 6. MVP Screen Map

Navigation: five tabs. Home, History, Add (center), Growth, Me. Modals/sheets hang off tabs. Journal is reachable in two taps from Add (write) and History (read), by design not a tab. Every card shows its visibility label (Only me / Shared / Confirmed / Approved profile / Moderation only). Block and no-contact are reachable within two taps from any profile or relationship surface.

### Home
- **Purpose:** current verified relationship at a glance; quick actions; recent recognition; notifications entry.
- **Components:** relationship card (verification + visibility state), quick-action row, recent-recognition card, notification bell with unread count, mood/check-in prompt. Reuses `HomeScreen`, `RelationshipCard`, `MoodCard`.
- **Data:** `['profile','me']`, `['relationship', relId]`, `['timeline', relId]` (top 3), `['notifications','unread']`.
- **Permissions:** authenticated; relationship data via member RLS.
- **Empty:** no relationship → warm invite prompt ("Invite your partner") leading to Add → Invitation. Pending invitation → status card.
- **Loading:** skeleton cards, no spinners over content.
- **Error:** inline retry card; cached data stays visible.

### History
- **Purpose:** the trustworthy unified feed of the relationship.
- **Components:** typed `HistoryCard` variants (moment, feeling, badge, score event, status change, redaction marker, closure), filter bar, date jump, gallery. Reuses `TimelineScreen`, `TimelineEventCard`, `GalleryScreen`, `MemoryFilterBar`.
- **Data:** `['timeline', relId]` paginated; per-card detail queries on open.
- **Permissions:** member RLS + per-row visibility; redacted rows render marker-only.
- **Empty:** "Your history starts with a memory" → Add.
- **Loading:** paged skeleton list.
- **Error:** inline retry; offline banner with cached feed. Special states: blocked (feature frozen banner), disputed (pending-review label), closed relationship (read-only banner, calm copy).

### Add
- **Purpose:** create the right entry fast; the emotional core action.
- **Components:** type sheet (Memory, Journal entry, Check-in, Badge, Concern, Calendar event, Photo), each row showing who will see it; then the per-type sheet (reuses `AddMemoryScreen`, `AddCalendarEventScreen`, `PhotoInput`; new journal editor, badge picker, check-in picker).
- **Data:** `['badge-definitions']` for the picker; mutations invalidate `['timeline', relId]` and the type's list key.
- **Permissions:** all writes via member-checked inserts or RPCs; badge/concern via `issue_badge` with server-side guards; closure-frozen relationships reject writes server-side and the UI explains why.
- **Empty:** no relationship → only Journal and Invitation types available.
- **Loading:** submit spinners in-button; optimistic add to feed with rollback.
- **Error:** field-level errors near fields; offline queues a draft in Zustand.

### Growth
- **Purpose:** ratings, check-ins over time, calendar, games, future prompts.
- **Components:** ratings dashboard (per-category current + history), score-change sheet (previews old/new/reason/visibility/permanence), check-in trends, calendar (reuses `CalendarScreen`), games grid (reuses `GamesScreen`, WYR).
- **Data:** `['ratings', relId]`, `['feelings', relId]`, `['calendar', relId]`, `['games', relId]`.
- **Permissions:** rater-only writes via RPCs; 30-day gate and cooling holds enforced server-side and mirrored in UI copy.
- **Empty:** pre-30-day → "Your first assessment unlocks after 30 days"; no events → prompts.
- **Loading:** per-module skeletons; modules fail independently.
- **Error:** per-module inline retry. Special: cooling-hold notice on a held share.

### Me
- **Purpose:** identity, visibility, privacy, safety, data rights.
- **Components:** identity block (edit profile), searchable-status row + privacy-review screen, relationship visibility, privacy center (consent records, export, deletion), blocks list, settings rows. Reuses `ProfileScreen`, `SettingsScreen`, `RelationshipSettings`.
- **Data:** `['profile','me']`, `['consents']`, `['blocks']`, `['visibility-grants', relId]`, export/deletion job status.
- **Permissions:** owner RLS; searchable-status and deletion/export require step-up auth (re-authentication; MFA when available); destructive actions confirm with typed labels, never color alone.
- **Empty:** blocks list empty state is neutral, not celebratory.
- **Loading:** row-level skeletons.
- **Error:** inline; deletion/export show job progress and a failure-with-support path.

### Off-tab screens
Auth (sign in/up/verify/reset), onboarding (welcome → 18+ → consent → profile steps → optional invitation), invitation accept (deep link, block-checked server-side), public profile view (search result: minimum approved fields only), report flow, closure flow, notification inbox, story mode (kept as-is visually).

---

# 7. Security Implementation Plan

Working checklist; every box maps to a pgTAP test or CI gate. Full policy matrix: `docs/audits/history-love-security-model.md` §2.

**RLS**
- [ ] RLS enabled AND forced on every table in `public`; CI fails on any RLS-disabled table (security advisor check).
- [ ] Relationship isolation: non-members cannot SELECT/INSERT/UPDATE/DELETE any relationship-scoped row, including by guessed UUID.
- [ ] Membership only via RPC: the authenticated role has no INSERT grant on `relationship_members`.
- [ ] Private journal protection: author-only forever; never in partner queries, admin support views, analytics, logs, or partner exports.
- [ ] Block enforcement: `security.is_blocked` referenced in search, profile, invitation, badge, rating-share, notification, closure, and deep-link paths; tested in both directions.
- [ ] Badge permissions: issuer+recipient only; no self/anonymous awards; concern class never public; lifecycle only via RPC.
- [ ] Rating immutability: no authenticated UPDATE/DELETE on `score_change_events`; acknowledgement column-only exception tested.
- [ ] Status/consent/audit/closure/redaction tables: append-only proven by failing UPDATE/DELETE probes.
- [ ] Moderation boundaries: `reports`/`disputes` in a non-exposed schema; authenticated role has zero grants; access only via Edge Functions and the service role.
- [ ] All SECURITY DEFINER helpers: pinned `search_path`, minimal grants, schema-qualified names.
- [ ] Public search touches only `public_profile_cards`, never base tables.

**Storage**
- [ ] All four buckets private; no public bucket exists.
- [ ] `storage.objects` RLS for SELECT/INSERT/UPDATE/DELETE per bucket path convention; ownership alone is not authorization.
- [ ] Signed URLs short-lived; issuance paths block-checked; URLs never logged.
- [ ] Upload Edge Function validates MIME allowlist, size cap, file signature (magic bytes, not extension), strips EXIF/GPS; one-photo limit on moments.
- [ ] Object names server-generated UUIDs; no names/emails/codes in paths.
- [ ] Deletion via the Storage API, never by deleting metadata rows.

**Admin**
- [ ] Separate admin application (never the mobile app, never shared credentials); service-role key exists only there and in CI secrets.
- [ ] MFA mandatory for all admin/moderator accounts; short sessions.
- [ ] Reason-required access: every moderation action records actor, reason code, and an `audit_events` row; admins cannot edit audit rows.
- [ ] Support role cannot alter ratings, badges, or relationship history (role-scoped functions, not raw table access).
- [ ] Moderators cannot read private journals absent the documented legal/safety escalation.

**Client and pipeline**
- [ ] Only the publishable key ships in the app; CI greps bundle + source maps for `service_role` and secret patterns.
- [ ] Sessions in `expo-secure-store`; tokens, invite codes, journal bodies, signed URLs never logged.
- [ ] Rate limits on signup, login, reset, search, invitations, badge issuance, report creation, signed-URL generation.
- [ ] Release gate: no dev URL, no Firebase config (post-Phase-4 per feature, absolute by cutover), no test credentials, no DEV_MODE, no debug menu.

---

# 8. Testing Strategy

**Database (pgTAP, run in CI against a from-zero migration + seed):**
- Migration application from empty database, twice (idempotency of the chain).
- RLS attack tests per table: cross-user SELECT/INSERT/UPDATE/DELETE probes as two seeded users plus an anonymous role; UUID-guessing probes.
- Immutability probes on every append-only table.
- Block-matrix tests: seeded block, then every enforcement point probed in both directions.
- Invitation-abuse suite: expired, reused, over-attempts, revoked, blocked, capacity-full, malformed.
- Storage policy tests: non-member read/write/list/delete fail; path spoofing fails.

**Repository (integration, local Supabase via CLI):**
- Every repository method against realistic auth claims: happy path, denied-by-RLS path (asserting the normalized domain error), and mapper correctness (row → domain model).
- RPC contract tests: `accept_invitation`, `submit_score_change` (cooling clock via injected timestamps), `close_relationship` (freeze side-effects), `issue_badge` (anti-gaming rejections).

**Mobile (component, Jest + React Native Testing Library):**
- Every critical screen renders: loading, empty, error, blocked, disputed, redacted, archived, closed-relationship, pending-invitation, consent-required.
- The score-change sheet shows old value, new value, reason, visibility, permanence before enabling submit.
- Visibility labels render on every `HistoryCard` variant.
- Auth guard routing: signed-out → auth; no profile → onboarding; complete → tabs.

**E2E (Maestro or Detox against staging), the required flows:**
1. Signup with age-gate rejection (17) and acceptance (18+).
2. Email verification gate blocking invitation until verified.
3. Relationship invite: create, share, expire, revoke.
4. Relationship acceptance: accept → both see verified; blocked inviter fails silently-generic.
5. Memory creation with photo; appears in both partners' History; `only_me` entry invisible to partner.
6. Badge creation: issue → accept → publish; concern stays private; flood attempt rejected.
7. Rating update: initial assessment post-30-days (seeded clock), score change with reason, cooling hold on a big drop, partner acknowledgement.
8. Breakup flow: one-sided closure, freeze verified (badge issuance fails), journal survives, search defaults private.
9. Blocking: block → search/profile/invite/notification invisibility both directions.
10. Export/delete: export job completes with a valid archive; deletion completes; partner's shared history handled per policy; deleted user cannot sign in.

**CI order:** lint + boundaries + types → unit → pgTAP (fresh DB) → repository integration → component → E2E (staging, on release branches) → release gate greps.

---

# 9. First 30 Days Engineering Plan

Assumes one primary engineer using Claude Code daily, full-time. Foundation and security first; no feature sprawl. Each week ends with a demoable, tested gate. Days are working days.

**Week 1 (Days 1-5): Phase 0, cleanup and skeleton.**
- Day 1: P0 footguns. Remove DEV_MODE seed, ngrok URL + ATS/cleartext, sensitive console logs, corrupt dependency, dead files/imports. Close the `env.local` gitignore gap. Commit per fix. Smoke-test legacy app still boots.
- Day 2: Env + tooling. Zod env parsing in `shared/config`; CI workflow with lint, typecheck, and the release-gate greps (DEV_MODE, tunnel URL, secrets).
- Day 3: Move `app/` → `src/app`; create `features/` + `shared/` skeletons; mechanical screen moves in batches with smoke tests between.
- Day 4: TanStack Query provider; ESLint import-boundary rules wired and failing on a deliberate violation; delete `generalStore.ts`.
- Day 5: Token work: dark palette, Tailwind mirror of `src/theme/colors.ts`; buffer for Week 1 spillover. **Gate: clean CI, structured repo, legacy flows still functional.**

**Week 2 (Days 6-10): Phase 1, Supabase foundation.**
- Day 6: Local + staging Supabase projects via CLI; `config.toml`; migration 0001: `security` schema + helpers, `profiles`, `user_consents`.
- Day 7: Migration 0002-0003: `relationships`, `relationship_members`, `relationship_invitations`, `relationship_visibility_grants`, `relationship_status_events`, `relationship_confirmations`, `blocks`, `audit_events` + triggers.
- Day 8: Storage buckets + `storage.objects` policies; seed.sql with two synthetic users, one relationship, one block.
- Day 9: pgTAP harness in CI; RLS isolation + immutability + block-predicate tests written and passing.
- Day 10: Generated TS types into `shared/types`; `shared/lib/supabase.ts`; invitation RPCs (`create/accept/revoke_invitation`) drafted + pgTAP abuse suite. **Gate: from-zero migration + full pgTAP suite green in CI.**

**Week 3 (Days 11-15): Phase 2, auth.**
- Day 11: `features/auth` repository + hooks + `AuthSession` domain type; secure-store session persistence.
- Day 12: Signup Edge Function (age gate + consent + profile row, one transaction); onboarding consent step replacing the prohibited Consent screen; delete `ConsentVerificationScreen`.
- Day 13: Rebuild the root auth guard on Supabase session; sign-in/up/reset screens wired; email-verification gate.
- Day 14: Firebase export script; `legacy_identity_map`; staging import with scrypt hash verification against a known test password; document pass/fail and the fallback decision.
- Day 15: OAuth (Google, Apple) through Supabase; normalize shapes; E2E: signup, age-gate rejection, verification gate. **Gate: a new user signs up through Supabase end-to-end on staging; a migrated test user signs in with their old password (or the documented reset path).**

**Week 4 (Days 16-20): Phase 3, relationship verification.**
- Day 16: `features/relationships` repository/hooks; invitation UI on the existing PairScreen bones.
- Day 17: Accept flow + deep link (block-checked server-side); visibility-grant screen; Home card on the new model.
- Day 18: Status-event triggers → `timeline_events` scaffolding; confirmation RPC.
- Day 19: Firestore pair → container migration script against sanitized staging fixtures; count/ownership/rejected-row report.
- Day 20: E2E invite → accept → verified; abuse-suite green. **Gate: two staging users form a verified relationship via invitation; legacy pairs migrate cleanly on staging.**

**Days 21-30 (Weeks 5-6 of the calendar month): Phase 4 start, memories on Supabase.**
- Days 21-22: Migration group 02 (`moments`, revisions, media, `journal_entries`, `feelings`, `timeline_events`, `notifications`, `device_tokens`) + pgTAP.
- Days 23-24: `upload_moment_media` Edge Function (validation, EXIF strip, one-photo limit); `features/memories` repository/hooks.
- Days 25-26: History feed on `['timeline', relId]`; visibility labels on cards; the first two legacy listeners deleted.
- Days 27-28: Add tab with Memory + Journal + Check-in; journal rebuilt (no AI framing); drafts in Zustand.
- Days 29-30: Media migration dry-run on staging; component-state tests; E2E add-memory + journal privacy. **Gate: the core loop (invite → verify → add memory → shared History) runs entirely on Supabase in staging.**

Explicitly deferred beyond day 30: badges, ratings, closure, safety UI, search, calendar/games migration, admin app, production cutover. That ordering is the point: by day 30 the trust boundary is real and the emotional core loop lives on it.

---

# 10. Final Recommendation

**1. What should be built first?** The Phase 1 foundation schema with RLS, the `security` helpers, `blocks`, and the append-only event tables, all under pgTAP. Every later feature inherits its guarantees from this layer, and the PRD's acceptance criteria are untestable without it. Second: auth migration, because identity continuity is the riskiest user-facing step and everything downstream keys on `auth.uid()`.

**2. What should intentionally wait?** Search ships last among MVP features, deliberately after redaction, disputes, and blocks exist, because it is the highest reputational-risk surface. Calendar and games wait until the trust core is stable (they already work on legacy code and lose nothing by waiting). Phone verification waits for beta. The separate admin app can start as protected runbooks and harden before public pilot. Everything in the prohibited list (AI, payments, discovery, messaging, background checks, biometrics) waits for its own legal gate and is not scaffolded "for later".

**3. What parts of the existing app should be preserved?** The Expo client and the emotional loop: the 13-step onboarding form engine and slides, the pairing interaction (`PinInput`, `TapToCopy`), the timeline/gallery/story-mode visual work, memory create/edit sheets, the calendar (big-calendar + rrule) and Would You Rather implementations, the notification-token plumbing, and the component library (`Screen`, buttons, inputs, cards, feedback states). These carry the product's warmth and represent most of the visible work already done.

**4. What parts should be deleted?** All of `src/config/firebase.ts`, `src/database/*`, and `src/server/*` (feature-by-feature as replacements land, absolutely by cutover); the six root-layout listeners; the server-state Zustand stores; `ConsentVerificationScreen` (collects prohibited biometric/location data, replaced in Week 3); the mock server functions (`getTimeline`, `getProfile`, `getMessages`, `getVenues`, `saveConsentRecord`, `saveJournalEntry`); the Subscription route (hidden, code dormant); the Questions stub; `generalStore.ts`; the stray `Untitled` file and empty `stop-slop/` directory; the corrupt package.json entry; DEV_MODE and everything it gates.

**5. Biggest technical risks?** (a) Auth migration: hash-import compatibility must be verified on staging before commitment; the reset-fallback and release-rollback plans are the safety net. (b) The unknown external backend: relationship/memory data lives behind an API whose code is elsewhere; the Firestore export is the recovery path if the API's data model diverges from what the client suggests. (c) RLS subtlety: visibility resolution (least-public wins), block bidirectionality, and the cooling clock are easy to get almost-right; the pgTAP attack suites are non-negotiable. (d) Solo-engineer bus factor across a 6-9 month build; the phase gates and this document are the mitigation.

**6. Biggest product risks?** (a) The trust features (immutable ratings, badges, closure) are unproven with real couples; the closed alpha exists to test whether transparency feels safe rather than surveillant. (b) Moderation is an operational commitment; shipping safety UI without staffed review would be worse than shipping later. (c) Search plus relationship history is the reputational blast radius; the consent gates, controlled taxonomy, and prohibited-label list must survive every design conversation. (d) Legal exposure: the PRD's own gates (outside counsel before public pilot, state matrix, no biometric/location collection) are load-bearing; the deleted Consent screen proves how easily a prototype drifts into prohibited territory.

Do not optimize for speed at the expense of this architecture. The layering (screens → hooks → use cases → repositories → Supabase) plus migrations-as-truth plus append-only history is precisely the foundation that later AI features, growth, search, and moderation scale on without a rewrite.
