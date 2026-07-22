# History.love Security and Data Model

Target Supabase domain model, authorization plan, storage security, and current security findings. Grounded in `MVP 9`, Appendix D (Supabase security architecture), and the current code (`history-love-current-code-map.md`).

Security rule zero, quoted from `MVP D`: the mobile app is an untrusted client. A hidden button, disabled screen, obscured identifier, or client-side role check is never authorization. Every read and write must be independently permitted by Postgres RLS, a narrowly scoped database function, or an authenticated server function.

## 1. Domain model

Design principle: a relationship is a container plus membership rows, never two hardcoded participant columns. The handoff PDF's `partner_one_id`/`partner_two_id` sketch is rejected for exactly the reasons the MVP gives (`MVP C2`): it cannot express invitations, disputes, historical access, or per-member visibility. MVP limits a relationship to two active members, but permissions never depend on a fixed column pair.

Conventions for every table: UUID primary key, `created_at`/`updated_at` timestamps, explicit grants, RLS enabled and forced, foreign keys indexed, a retention class, and controlled-vocabulary states via enums or check constraints. Event tables get no authenticated UPDATE or DELETE policy.

### 1.1 Identity and consent

| Table | Purpose | Key fields | Mutability | Client writes? | Notes |
|---|---|---|---|---|---|
| `profiles` | Canonical private profile | `id` (=auth uid), `display_name`, `legal_name`, `birth_year`, `birth_month`, `age_verified`, `city`, `state`, `pronouns`, `search_status`, `search_visible_at`, `verification_state` | Mutable (allowlist) | Owner, allowlisted fields | Never queried by search directly |
| `legacy_identity_map` | Firebase UID → Supabase UUID | `firebase_uid`, `profile_id`, `linked_at` | Append-only | No | Migration only; non-exposed schema |
| `user_consents` | Versioned terms/privacy/community/record/search/comms consents | `id`, `profile_id`, `consent_type`, `policy_version`, `accepted_at`, `withdrawn_at`, `ip_hash`, `device_risk` | Append-only | Insert via RPC | Separable consent types |
| `public_profile_cards` | Sanitized search projection | derived: `display_name`, `avatar_url`, `verification_indicator`, `search_status`, approved strengths, verified relationship count, approved exit summaries | Read-only view/RPC | No | security-invoker view or RPC; block-aware |

### 1.2 Relationships

| Table | Purpose | Key fields | Mutability | Client writes? |
|---|---|---|---|---|
| `relationships` | The relationship record | `id`, `relationship_type`, `status`, `start_date`, `end_date`, `verification_state`, `created_at` | Status via RPC only | No direct status/verification write |
| `relationship_members` | Membership + role/state | `id`, `relationship_id`, `profile_id`, `member_status` (active/ended/separated/left), `joined_at`, `left_at`, `visibility_consent_at` | Via RPC only | Cannot self-insert |
| `relationship_invitations` | Single-use invite (match-code replacement) | `id`, `relationship_id`, `invited_email_hash`, `code_hash`, `expires_at`, `accepted_at`, `revoked_at`, `attempt_count` | Via RPC | No; stores only hash |
| `relationship_status_events` | Append-only status proof | `id`, `relationship_id`, `actor_id`, `prior_status`, `new_status`, `effective_at`, `confirmation_state` | Append-only | No |
| `relationship_visibility_grants` | Per-member visibility consent | `id`, `relationship_id`, `profile_id`, `status_visibility`, `partner_identity_visibility`, `history_visibility` | Mutable (own) | Via RPC |
| `relationship_confirmations` | 90-day/inactivity confirmations | `id`, `relationship_id`, `profile_id`, `confirmed_at`, `prompt_cycle` | Append-only | Via RPC |

### 1.3 Workspace content

| Table | Purpose | Mutability | Notes |
|---|---|---|---|
| `journal_entries` | Private/shared/confirmed text | Edit → revision | Author-only read even after breakup |
| `journal_entry_revisions` | Journal edit history | Append-only | Shared/confirmed edits create revisions |
| `memories` | Shared moments | Edit → revision; delete → withdrawal | `created_by`, `relationship_id`, `visibility` |
| `memory_revisions` | Memory edit history | Append-only | |
| `memory_media` | One photo per memory (MVP) | Insert/withdraw | Path in `relationship-media` bucket |
| `feelings_logs` | Structured feeling tags | Append-only | Visibility per entry |
| `conversation_requests` | Concern → calm shared prompt | Mutable state | Member-scoped |
| `resolution_events` | Resolution status transitions | Append-only | |

### 1.4 Recognition and ratings

| Table | Purpose | Mutability |
|---|---|---|
| `badge_definitions` | Controlled taxonomy + policy class | Admin-managed, versioned |
| `badge_awards` | Issuer, recipient, relationship, class, lifecycle, visibility, evidence ref | Response state via RPC |
| `badge_award_events` | Lifecycle transitions (given/accepted/published/disputed/withdrawn/archived) | Append-only |
| `rating_assessments` | Initial 10-category 1-5 assessment | Insert-only |
| `rating_revisions` | Every score change, linked to prior | Append-only; no UPDATE/DELETE |
| `rating_acknowledgements` | Not seen/seen/acknowledged/disputed/resolved | Mutable state |

### 1.5 Closure, safety, audit

| Table | Purpose | Mutability |
|---|---|---|
| `closure_events` | End status/date, mutual confirmation | Append-only; publication needs recipient consent |
| `closure_badges` | Exit badges attached to closure | Insert via RPC |
| `blocks` | User-to-user block + no-contact | Owner insert/delete; checked both directions everywhere |
| `reports` | Safety/content reports (non-exposed schema) | Create via Edge Function |
| `disputes` | Disputes/appeals (non-exposed schema) | Server-side updates |
| `moderation_actions` | Moderator decisions | Append-only, server role |
| `redaction_requests` | Request, reason category, reviewer, decision | Mutable state (server) |
| `redaction_events` | Visible-marker state | Append-only |
| `audit_events` | Security/business-critical state changes | Trigger/function insert only; no client grants |
| `legal_holds` | Retention pause | Server only |

### 1.6 Notifications, media jobs, secondary

| Table | Purpose | Mutability |
|---|---|---|
| `notifications` | Recipient-only inbox | System insert; recipient marks read |
| `device_tokens` | Push tokens | Owner insert/delete |
| `calendar_events` | Shared calendar | Member CRUD |
| `games`, `game_responses` | Game sessions and answers | RPC |
| `privacy_requests` | Access/correct/delete/export/appeal | Create + server process |
| `data_export_jobs` | Export job + expiring file | Server |
| `deletion_jobs` | Deletion job + shared-history handling | Server |

## 2. RLS and authorization plan

Enable and force RLS on every user-data table. Centralize membership checks in a non-exposed `security` schema helper with a fixed `search_path` and minimal grants, per `MVP D4`:

```sql
create schema if not exists security;
create or replace function security.is_relationship_member(p_relationship_id uuid)
returns boolean language sql stable security definer
set search_path = pg_catalog as $$
  select exists (
    select 1 from public.relationship_members rm
    where rm.relationship_id = p_relationship_id
      and rm.profile_id = (select auth.uid())
      and rm.member_status in ('active','ended','separated')
  );
$$;
revoke all on function security.is_relationship_member(uuid) from public;
grant execute on function security.is_relationship_member(uuid) to authenticated;
```

A second helper `security.is_blocked(a uuid, b uuid)` checks blocks in both directions and is joined into search, invitation, notification, badge, and profile-view paths.

### 2.1 Policy matrix

| Table/surface | SELECT | INSERT | UPDATE | DELETE | Invariant |
|---|---|---|---|---|---|
| `profiles` | Owner full; approved internal roles | Owner (signup) | Owner, allowlisted cols | none | Search never reads this table |
| `public_profile_cards` | Authenticated, exact-name, rate-limited, block-aware | none | none | none | Minimum fields only; view or RPC |
| `relationships` | Active/historical members | RPC | RPC | none | No client verification/public write |
| `relationship_members` | Member reads own + limited co-member | RPC (invitation) | RPC | none | Cannot self-add by id |
| `relationship_invitations` | Inviter/member | RPC | RPC | none | Only hash stored; attempts capped |
| `relationship_status_events` | Members | trigger/RPC | none | none | Append-only |
| `relationship_visibility_grants` | Members | own via RPC | own | none | Least-public resolution server-side |
| `memories` | Member + visibility permits | Creator + member | Creator (→revision) | none (→withdrawal) | No public access to private text |
| `journal_entries` | Author only (incl. post-breakup) | Author | Author (→revision) | Author (drafts only) | Never in partner/admin/analytics/export |
| `feelings_logs` | Member + visibility | Author | none | none | Private by default |
| `badge_awards` | Issuer + recipient; public via projection | Issuer, allowed taxonomy | Recipient response state | none | No self/anon award; no free text |
| `rating_assessments` | Relationship participants | Rater | none | none | |
| `rating_revisions` | Participants; public via aggregate | Rater only | none | none | Old values immutable |
| `rating_acknowledgements` | Participants | Recipient | Recipient | none | |
| `closure_events` | Members/historical | Either member via RPC | RPC | none | Publication needs affected consent |
| `blocks` | Blocker reads own; system checks both | Owner | none | Owner | Immediate visibility removal |
| `reports`/`disputes` | Reporter sees status; accused sees policy-permitted | Edge Function | server | none | Never expose reporter private notes |
| `moderation_actions` | Moderators | server role | none | none | Immutable |
| `audit_events` | Members read filtered subset; moderators authorized detail | trigger/service | none | none | No client writes |
| `notifications` | Recipient only | system/trigger | Recipient (read) | none | Client cannot choose recipient |
| `redaction_requests`/`events` | Restricted audit | RPC | server | none | Public marker holds no sensitive text |

### 2.2 Immutable-history example

```sql
alter table public.rating_revisions enable row level security;
alter table public.rating_revisions force row level security;

create policy rating_revision_read on public.rating_revisions
  for select to authenticated
  using (security.is_relationship_member(relationship_id));

create policy rating_revision_insert on public.rating_revisions
  for insert to authenticated
  with check (
    rater_id = (select auth.uid())
    and security.is_relationship_member(relationship_id)
  );
-- No authenticated UPDATE or DELETE policy exists.
-- A correction is a new revision linked to the prior revision.
```

### 2.3 Privileged operations that must run in RPC or Edge Functions

Direct client table writes are forbidden for anything multi-step or reputation-bearing. Route these through server code (`MVP D5`):

create/accept invitation, change relationship status, publish profile facts, issue/respond to badge, submit rating revision, request conversation, end relationship, block, report, request redaction, export data, delete account, all moderation actions.

### 2.4 Block and no-contact enforcement points

A block must remove visibility in both directions across every surface. Enforce the `security.is_blocked` check inside: exact-name search, profile view, invitation create/accept, relationship access, badge issuance, rating sharing, notification generation, closure requests, mentions, public history, signed-URL issuance, and deep-link resolution. Acceptance criterion (`MVP 12.2`): a blocked user cannot find, invite, notify, badge, mention, or access the blocker through any API path.

## 3. Storage security

Private buckets by default (`MVP D7`). Object paths carry no names, emails, relationship descriptions, or invite codes; server generates object names.

| Bucket | Visibility | Path | Access |
|---|---|---|---|
| `profile-images` | Private in MVP | `{profile_id}/{uuid}.{ext}` | Owner upload/update; public profile gets a transformed approved image via controlled URL |
| `relationship-media` | Private | `{relationship_id}/{uploader_id}/{uuid}.{ext}` | Members read only when the linked memory visibility allows |
| `moderation-evidence` | Private internal | `{case_id}/{uuid}.{ext}` | No mobile access; moderation function issues short-lived access |
| `data-exports` | Private temporary | `{profile_id}/{job_id}.zip` | Owner short-lived signed URL; auto-delete after retention |

Storage RLS on `storage.objects` for SELECT/INSERT/UPDATE/DELETE. Ownership alone is not authorization. Restrict MIME types and file sizes at bucket and app layers, verify file signatures rather than trusting extensions or client Content-Type, strip EXIF/location metadata, and keep signed-URL expiry short. Delete through the Storage API, not by removing metadata rows.

## 4. Security and privacy findings

Severity reflects current-state risk. Confidence notes what would raise it. Anything depending on the external API or Firebase rules is labeled for external verification and not overstated.

### Critical

**C1. Authorization model is unverifiable and likely client-trusted.**
Evidence: no Firestore/Storage rules in the repo; the external API derives identity from a Firebase bearer token (`fetchServer.ts:34`) but its authorization logic is not in this repo. Impact: cross-relationship reads/writes cannot be ruled out. Failure scenario: a user with a valid token calls a mutation for a relationship they do not belong to and the backend trusts it. Remediation: rebuild authorization as Supabase RLS + RPC from the product rules; do not port Firebase permission assumptions. Migration phase: 2. Confidence: high that it is unverifiable; **Backend/Firebase-console** needed to confirm actual exposure.

**C2. No immutable history, consent persistence, block enforcement, deletion, or export exist.**
Evidence: none of these features are implemented (feature matrix E, F, H, I). Impact: the MVP's core safety and transparency guarantees are absent; several are alpha acceptance criteria (`MVP 12.2`). Remediation: implement per this document before any external users. Phase: 5. Confidence: high (Verified absent).

### High

**H1. Development tunnel as the only API base URL, with transport security relaxed.**
Evidence: `app.config.ts:46` hardcodes an ngrok URL; `:20` `NSAllowsArbitraryLoads:true`; `:36` `usesCleartextTraffic:true`. Impact: no prod/staging separation, cleartext allowed app-wide, tunnel can serve anything. Failure scenario: a build ships pointing at a personal tunnel; traffic is interceptable. Remediation: environment-specific HTTPS URLs, remove ATS/cleartext relaxation, fail-closed production config. Phase: 0-1. Confidence: high (Verified).

**H2. `DEV_MODE=true` committed, injecting fake onboarding data.**
Evidence: `constants/index.ts:3`; `OnboardingScreen.tsx:114-172` seeds "Sarah Martinez"; `:132` a fake Google photo URL. Impact: fabricated profile data can reach a real backend; a release could ship with the seed active. Remediation: compile out of production; CI fails if `DEV_MODE` or test credentials are enabled for release (`MVP E7`). Phase: 0. Confidence: high (Verified).

**H3. Private content and identifiers written to console logs.**
Evidence: `saveConsentRecord.ts:16` (full consent record), `saveJournalEntry.ts:16` (full journal entry), `fetchServer.ts:56` (full response), `handleOnboarding.ts:20,35` (image uri, backend URL), `markRead.ts:6` (uid + notification id), `getImages.ts:13` (full Firebase error). Impact: private relationship data in device logs and any log aggregation. Remediation: remove; adopt structured logging that excludes private content (`MVP D10`). Phase: 0-1. Confidence: high (Verified).

**H4. Consent screen collects prohibited data categories.**
Evidence: `ConsentVerificationScreen.tsx:160-220` biometric consent (fingerprint + voice signature) and `:144-149` precise-location consent. The MVP excludes biometrics (BIPA risk) and precise location (`MVP 4`, `11.3`). Impact: collecting these creates the exact legal exposure the MVP is designed to avoid, plus it is a mock with no persistence (`:46-62`). Failure scenario: the flow ships and the app is now processing biometric identifiers. Remediation: replace with the versioned-consent flow (Terms/Privacy/Community/Record + 18+ + no-background-check). Phase: 1. Confidence: high (Verified). **Legal review** recommended.

**H5. Auth provider return-shape inconsistency crashes on cancelled Google login.**
Evidence: `useGoogleLogin.ts` returns `null` on cancel; `useLogin.ts:49` does `if (response.success)` unconditionally; `:52` passes stale `error`. Impact: unhandled exception on a common user action. Remediation: normalize all providers into one `AuthSession` object and validate before use (`MVP C4`). Phase: 1. Confidence: high (Traced); **Runtime** to confirm the throw.

### Medium

**M1. Firebase web config hardcoded in source and duplicated in env.**
Evidence: `src/config/firebase.ts:11-19`; `.env.local` holds the same `firebaseApiKey`; `.gitignore` covers `.env*.local` and `.env` but not the dotless `env.local`, which is staged (`git ls-files` shows it). Impact: a Firebase web API key is a public client identifier, so the key itself is low-severity, but the gitignore gap invites committing real secrets, and the real risk is that Firebase security depends on rules that are unknown (see C1). Remediation: read config from validated env, close the gitignore gap, keep all secret keys server-side. Phase: 0. Confidence: high (Verified).

**M2. Match code is a weak shared secret with unknown server controls.**
Evidence: `isValidMatchCode.ts` only checks length 6; generation and rate limiting are in the backend (`getMatchCode.ts`, `pairUsers.ts`). Impact: a 6-character code is brute-forceable without server rate limits, which cannot be verified here. Remediation: replace with hashed single-use invitations, expiry, and attempt caps (`MVP C2`, `D5`). Phase: 3-5. Confidence: medium; **Backend** to confirm current limits.

**M3. Notifications and device tokens are client-writable in Firestore.**
Evidence: `handleFcmMessaging.ts:35,54` client `setDoc`/`deleteDoc`; `markRead.ts:8` client `updateDoc`. Impact: acceptable for tokens if rules restrict to `uid`, but notification generation must be server-only in the target (`MVP D3`). Remediation: notifications inserted by triggers/functions; client may only mark-read own rows. Phase: 6. Confidence: medium (Verified writes); **Firebase-console** for current rules.

**M4. No dark theme despite automatic UI style.**
Evidence: `paperTheme.ts` extends `MD3LightTheme` only; hardcoded `text-gray-900` in Consent/Journal. Impact: unreadable text and failed contrast in dark mode (accessibility, a launch requirement `MVP 11.1`). Remediation: add a dark palette and token-driven theming. Phase: UI track. Confidence: high (Verified).

### Low

**L1. Corrupt dependency `"undefined": "\\"` in `package.json:74`.** Remove.
**L2. Dead imports and unmounted providers** (`ToastProvider` never mounted; `app/index.tsx:6` broken import). Cleanup reduces confusion, low direct risk.
**L3. `getTimeline` ships a mock in place of the real fetch** (`getTimeline.ts:10-12`). The History feed shows nothing from the server today. Runtime-confirm.

### Informational

- No automated tests, no crash reporting, no monitoring (`MVP C4` Critical for tests; feature matrix L). Track under P0/P1.
- Two toast systems and two date/util conventions add maintenance drag without direct security impact.
- `usernameTaken` and `handleOnboarding` bypass the shared `fetchServer` client, duplicating token/URL logic.

## 5. Required security tests (map to `MVP D11`)

RLS isolation (A cannot touch B; non-member cannot access a relationship by guessing UUIDs), block enforcement in both directions across every surface, immutable-record rejection (no client update/delete of rating revisions, status events, audit events, moderation), storage isolation (non-member read/list/delete fails, path spoofing fails, MIME/size enforced, expired URL not regenerable), privilege boundary (no service key in bundle/source maps/logs/CI/crash reports), invitation abuse (expired/reused/brute-forced/over-capacity/malformed fail without leakage), deletion/export (recent-auth, ownership, shared-history handling, completeness), and migration (counts, ownership, media links, identity mapping, rollback against a sanitized fixture).
