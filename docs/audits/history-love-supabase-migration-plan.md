# History.love Firebase to Supabase Migration Plan

Staged plan to move from Firebase (Auth, Firestore, Storage) plus an external HTTP API to Supabase (Auth, Postgres, Storage, Edge Functions), without a full cutover and without discarding the working relationship-memory loop. Direction, quoted from `MVP C`: preserve the product loop, replace the trust boundary, refactor incrementally.

Sequencing rule from the anti-spaghetti standard (`MVP E`): screens call use cases, use cases hold product behavior, repositories hide Supabase, migrations and RLS enforce authorization. The seam comes before the database swap so screens stop importing providers directly.

## Phase 0: Freeze and inventory

Goal: stop the ground from moving and remove the loaded footguns before touching data.

- Freeze Firebase schema changes; snapshot current collections and Storage paths for rollback.
- Inventory is already captured: collections and listeners in `history-love-current-code-map.md` §6, API endpoints §7, auth providers §6.1, `DEV_MODE` branches §11.
- Remediate the P0 items now: remove the hardcoded ngrok URL and ATS/cleartext relaxation (`app.config.ts:20,36,46`), compile out `DEV_MODE` seeding (`constants/index.ts:3`, `OnboardingScreen.tsx:114-172`), strip sensitive console logs (security-model H3), fix the corrupt dependency (`package.json:74`), close the `env.local` gitignore gap.
- Normalize environments: define `.env` schemas for local/staging/prod and validate at startup with Zod (`MVP E4`).

Files: `app.config.ts`, `constants/index.ts`, `OnboardingScreen.tsx`, `package.json`, `.gitignore`, new `src/shared/config/env.ts`. Tests: env-parse unit tests; CI check that fails on `DEV_MODE=true` or a tunnel URL for release (`MVP E7`). Rollback: config-only, revert commit. Completion: no dev URL, no fake onboarding, no secret in bundle; CI gate active. Effort: 2-3 days. Mobile release: not required.

## Phase 1: Architecture seam (behind Firebase)

Goal: introduce provider-neutral repositories, use cases, typed domain models, and TanStack Query while Firebase still runs. No behavior change for the user.

- Add repository interfaces (see below) with Firebase implementations that wrap the existing `src/database/*` and `src/server/*` calls.
- Move the six `onSnapshot` listeners out of `app/_layout.tsx` (code-map §6.2) into repository/query hooks. This alone fixes the largest coupling and shrinks the 288-line root layout.
- Introduce TanStack Query; migrate `userStore`, `relationshipStore`, `notificationsStore` server data into query caches. Keep Zustand for ephemeral UI only (onboarding progress, drafts, filters). Delete `generalStore.ts`.
- Normalize the auth return shape into one `AuthSession` object (security-model H5).

Repository interfaces (methods are the MVP command surface):

```
AuthRepository        signUp, signIn, signInOAuth, signOut, getSession, sendPasswordReset, verifyEmail
ProfileRepository     getMine, updateMine, getPublicCard, searchByExactName
RelationshipRepository getMine, getById, listMembers, getStatusEvents
InvitationRepository  create, accept, revoke, getForRelationship
MemoryRepository      list, get, add, edit, withdraw
JournalRepository     list, get, add, edit, delete(draft)
BadgeRepository       listDefinitions, issue, respond, listForProfile
RatingRepository      submitAssessment, submitRevision, listRevisions, acknowledge
ClosureRepository     end, confirm, getClosure
SafetyRepository      block, unblock, report, requestRedaction, listBlocks
NotificationRepository list, markRead, registerToken, removeToken
CalendarRepository    list, add, edit, delete
GameRepository        start, update, end, archive
```

Use cases (thin orchestration over repositories, one workflow each): `SignUpAdultUser`, `CompleteAccountVerification`, `AcceptPolicies`, `CreateRelationshipInvitation`, `AcceptRelationshipInvitation`, `ConfirmRelationship`, `AddMemory`, `ShareJournalEntry`, `IssueBadge`, `RespondToBadge`, `SubmitRatingRevision`, `RequestConversation`, `EndRelationship`, `BlockUser`, `SubmitReport`, `RequestRedaction`, `ExportAccountData`, `DeleteAccount`.

Files: new `src/features/*/data`, `src/features/*/domain`, `src/features/*/hooks`; edits to `app/_layout.tsx`, stores. Tests: repository contract tests against the Firebase impl; query-hook tests. Rollback: feature-flag the query hooks; revert to store reads. Completion: no `firebase/*` import in any `app/` or `src/pages/*` file; server state out of Zustand. Effort: 2-3 weeks. Mobile release: optional (internal build).

## Phase 2: Supabase foundation

Goal: a fully specified database before the app connects.

- Create local, staging, production Supabase projects from migration files (never share one). 
- Author the schema in `supabase/migrations/` per `history-love-security-model.md` §1, with constraints, enums, indexes on every FK and RLS predicate column, RLS enabled and forced, and the `security` helper schema.
- Create private Storage buckets (`profile-images`, `relationship-media`, `moderation-evidence`, `data-exports`) with storage RLS.
- Add pgTAP/RLS tests in `supabase/tests/database/` (security-model §5), generated TypeScript types, and sanitized seed data.

Files: `supabase/migrations/*`, `supabase/functions/*` (stubs), `supabase/tests/database/*`, `supabase/seed.sql`, `supabase/config.toml`, `src/shared/types/database.ts` (generated). Tests: migrations apply from zero; RLS isolation and block-enforcement pass on seed data. Rollback: database is not yet wired to the app; drop and recreate. Completion: security advisor findings resolved (no RLS-disabled tables, no mutable function search paths, no public buckets); RLS tests green. Effort: 3-4 weeks. Mobile release: not required.

## Phase 3: Authentication migration

Goal: Supabase Auth becomes the identity provider behind a feature flag, with a mapping table for legacy users.

- Implement `AuthRepository` on Supabase Auth: email verification, password reset, OAuth normalization, secure session storage, session revoke on reset/email-change.
- Create `legacy_identity_map` (Firebase UID → Supabase UUID). Keep both providers behind a temporary flag until account linking, password recovery, email verification, and session restoration pass.
- Migrate push-token registration to the new `device_tokens` table.

Files: `src/features/auth/*`, `legacy_identity_map` migration, auth Edge Function (signup with age gate + consent). Tests: session restoration, OAuth cancel path (regression for security-model H5), reset + revoke. Rollback: flag back to Firebase Auth. Completion: a legacy user signs in through Supabase and reaches `/home` with a mapped profile. Effort: 2-3 weeks. Mobile release: coordinated (auth change ships to devices).

## Phase 4: Core data migration

Goal: move the working loop's data with validation, in priority order.

Order: profiles, relationships, relationship_members, invitations, memories, memory_media. For each Firestore collection, transform to the relational shape and run count checks, ownership checks, sample checksum comparisons, and a rejected-row report (see §Data migration below).

Files: `src/features/{profiles,relationships,memories}/*`, migration scripts (run against sanitized fixtures, not production copied into dev). Tests: repository integration tests against staging; row-count and RLS-access validation post-import. Rollback: dual-read flag (read Firebase if a Supabase row is missing) during a bake period. Completion: memory counts and ownership match within tolerance; RLS blocks a non-member from a migrated relationship. Effort: 3-4 weeks. Mobile release: coordinated.

## Phase 5: MVP trust features (new)

Goal: build the differentiators that make this the MVP rather than the prototype. These are net-new, not migrations.

Versioned consents, private journals (private/shared/confirmed), feelings log, badge awards + lifecycle, immutable rating assessments and revisions, relationship status events, audit events, redaction markers, closure records, blocks and no-contact, reports, searchable profile + public projection. Each ships with its migration, RLS policies, RPC/Edge Function, query hooks, UI states, and tests together (`MVP E8` rule 6).

Files: `src/features/{badges,ratings,closure,safety,profiles}/*`, `supabase/functions/{create-invitation,accept-invitation,change-status,issue-badge,submit-rating,close-relationship,block,report,request-redaction,export,delete-account}`. Tests: the full `MVP D11` suite. Rollback: per-feature flags. Completion: the acceptance criteria in `MVP 12.2` pass end-to-end. Effort: 8-12 weeks. Mobile release: staged per feature.

## Phase 6: Secondary feature migration

Goal: calendar, games, notifications move after the trust foundation is stable (`MVP C3` step 7).

- Calendar and games become member-scoped tables with RLS; the working UIs (`CalendarScreen`, WYR) adapt to the new repositories. Notifications become server-generated with block/no-contact suppression, plus the missing inbox screen.

Files: `src/features/{calendar,games,notifications}/*`. Tests: member isolation, notification suppression under block. Rollback: per-feature flags. Completion: no client-authored notification sender/recipient. Effort: 3-4 weeks. Mobile release: staged.

## Phase 7: Firebase removal

Goal: delete Firebase only after production verification.

Remove `firebase` package, all listeners, `src/config/firebase.ts`, the external API paths, `DEV_MODE` data injection, the tunnel URL, and compatibility flags. Verify no `firebase/*` import remains and no legacy dependency lingers.

Files: `package.json`, `src/config/*`, `src/database/*`, `src/server/*`. Tests: build passes with Firebase removed; grep for `firebase` returns nothing in `app/`+`src/`; release gate (`MVP E7`) passes. Rollback: revert the removal commit (Supabase remains authoritative). Completion: clean bundle, release gate green. Effort: 1 week. Mobile release: coordinated final.

## Data migration and identity linking

Approach (`MVP C3` step 5, `D11` migration tests): transform, validate, report, never copy production data into ordinary dev environments; use sanitized or synthetic fixtures.

Identity: map each Firebase UID to a new Supabase UUID in `legacy_identity_map`. On first Supabase sign-in, link by verified email; handle duplicate emails and OAuth-vs-password collisions by holding for manual review rather than silently merging.

Relationships: each paired Firebase relationship becomes one `relationships` row plus two `relationship_members` rows. Discard `match_code` (single-use invitations replace it). Reject relationships missing a member, orphaned memory docs, and `DEV_MODE`-seeded records.

Normalization during transform: unify `matchCode`/`match_code` and `relationship_id`/`relationshipId` (code-map §12), convert Firestore timestamps to UTC `timestamptz`, and drop `DEV_MODE` contamination.

Media: move Firebase Storage objects to `relationship-media`/`profile-images` with server-generated paths; record missing media rather than failing the whole import.

Validation outputs per collection: source count, destination count, rejected-row count with reasons, ownership-mismatch count, missing-media count, duplicate-identity count, and sample checksum comparisons. After import, run RLS-access validation: a non-member must fail to read a migrated relationship by UUID.

Rollback: keep a dual-read flag through a bake period so the app falls back to Firebase for any row not yet present in Supabase, and remove it only after counts and access checks pass.

## Effort and coordination summary

| Phase | Effort | Mobile release |
|---|---|---|
| 0 Freeze/inventory | 2-3 days | no |
| 1 Seam | 2-3 weeks | optional |
| 2 Supabase foundation | 3-4 weeks | no |
| 3 Auth | 2-3 weeks | coordinated |
| 4 Core data | 3-4 weeks | coordinated |
| 5 Trust features | 8-12 weeks | staged |
| 6 Secondary | 3-4 weeks | staged |
| 7 Firebase removal | 1 week | coordinated |

Estimates assume one to two engineers and exclude legal review, moderation staffing, and the accessibility audit, which run in parallel per the MVP launch checklist (`MVP 13`).
