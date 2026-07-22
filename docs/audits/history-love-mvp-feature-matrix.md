# History.love MVP Feature Matrix

Maps every MVP requirement from `History_Love_MVP_Product_Requirements_v2.pdf` to current code, migration treatment, target Supabase entities, and priority. Read `history-love-current-code-map.md` for the file-level evidence behind each "Current status".

Status values: Fully implemented, Implemented with limitations, Partial, UI only, Mocked, Broken, Stub, Not implemented, Off-spec (present but conflicts with the product doc).

Treatment values: Keep, Adapt (keep UI, replace data layer), Redesign (keep pattern, rebuild workflow), Hide, Replace, Remove, Defer, Product-decision.

Priority tiers map to the MVP rollout gates: **P0** migration/trust-boundary blocker, **P1** closed alpha, **P2** closed beta, **P3** secondary engagement, **P4** deferred.

## A. Authentication and account security

| Feature | Current status | Required MVP behavior | Reusable code | Treatment | Supabase entities | Server command | RLS | Priority | Evidence |
|---|---|---|---|---|---|---|---|---|---|
| Email signup/login | Implemented w/ limits | Verified email before privileged actions | `Auth/*`, `useLogin`, `loginWithEmail`, `signupWithEmail` | Adapt | `auth.users`, `profiles` | Supabase Auth | own-row | P0 | code-map §6.1 |
| Google / Apple OAuth | Implemented w/ limits, inconsistent shapes | Normalize into one session object | `useGoogleLogin`, `loginWithApple` | Adapt | `auth.identities` | Supabase Auth | own-row | P1 | code-map §12 |
| Session restore | Implemented | Secure mobile session storage; revoke on reset | `AuthContext`, Firebase persistence | Replace | `auth.sessions` | Supabase Auth | n/a | P0 | code-map §8 |
| Adult 18+ age gate | Off-spec (a "sober / not coerced" toggle in Consent) | DOB assertion ≥18; reject and minimize minor data | none reusable | Replace | `profiles.age_verified`, `birth_year_month` | signup Edge Function | own-row | P1 | Consent screen |
| Email verification | Not implemented | Required gate | none | Replace | Supabase Auth | Auth email OTP | n/a | P1 | Verified absent |
| Phone verification | Not implemented | SMS OTP for security only | none | Replace | Supabase Auth | Auth phone OTP | n/a | P2 | Verified absent |
| Terms / Privacy / Community / Record consent | Mocked, off-spec | Versioned, separable, append-only | Consent screen shell only | Redesign | `user_consents` | consent RPC | append-only | P1 | `saveConsentRecord.ts` mock |
| No-background-check acknowledgement | Not implemented | Shown at onboarding + Safety Center | none | Replace | `user_consents` | consent RPC | append-only | P1 | Verified absent |
| Password reset | Not implemented | Standard reset + session revoke | none | Replace | Supabase Auth | Auth reset | n/a | P1 | Verified absent |
| Email change | Not implemented | Step-up auth + session revoke | none | Replace | Supabase Auth | Auth + Edge | own-row | P2 | Verified absent |
| MFA (users) / step-up | Not implemented | Encourage users; require step-up for delete/export/searchable | none | Replace | Supabase Auth MFA | Auth | n/a | P2 | Verified absent |
| Account deletion | Not implemented | End-to-end, with shared-history protection | none | Replace | `deletion_jobs`, `audit_events` | delete Edge Function | own-row + step-up | P1 | Verified absent |
| Data export | Not implemented | JSON/CSV minimum | none | Replace | `data_export_jobs` | export Edge Function | own-row + step-up | P2 | Verified absent |

Onboarding note: `OnboardingScreen.tsx` is a working 13-step form and ports well, but `:114-172` seeds a fake "Sarah Martinez" user under `DEV_MODE=true`. Compile that branch out (code-map §11).

## B. Profiles and discoverability

| Feature | Current status | Required MVP behavior | Reusable | Treatment | Entities | Command | RLS | Priority |
|---|---|---|---|---|---|---|---|---|
| Private profile | Partial (view) | Owner-only canonical fields | `ProfileScreen` | Adapt | `profiles` | direct | owner | P1 |
| Profile editing | Not implemented | Edit allowlisted fields | none | Replace | `profiles` | direct + validation | owner allowlist | P1 |
| Relationship-shared fields | Not implemented | Visible to active members | none | Replace | `relationship_visibility_grants` | RPC | member | P2 |
| Public profile projection | Not implemented | Safe view, opted-in fields only | none | Replace | `public_profile_cards` | security-invoker view / RPC | no direct base access | P2 |
| Exact-name search + opt-in | Not implemented | Authenticated, rate-limited, block-aware | none | Replace | `public_profile_cards`, `blocks` | search RPC | block both directions | P2 |
| Searchable status | Not implemented | Private / not dating / healing / open / on-date; default off after breakup | none | Replace | `profiles.search_status`, `search_visible_at` | RPC | owner | P2 |
| Verification wording | Off-spec risk | "phone/email verified", never identity/safety | Start/onboarding copy | Redesign | `profiles.verification_*` | n/a | n/a | P1 |
| Broad city/state | Partial (onboarding collects) | Broad only; no precise location | onboarding forms | Adapt | `profiles.city`, `state` | direct | owner | P2 |
| Public badges / exit summaries | Not implemented | Recipient-accepted + published only | none | Replace | `badge_awards`, `closure_events` | RPC | recipient consent | P2 |
| Change markers | Not implemented | Public shows corrected/withdrawn/redacted + date | none | Replace | `redaction_events` | trigger | member/public marker | P2 |
| Anti-enumeration | Not implemented | Generic messages, min length, per-device limits | none | Replace | search RPC | rate limit | P2 |

## C. Relationship creation and verification

Current pairing is a symmetric 6-digit match code (`PairScreen.tsx`, `getMatchCode.ts`, `pairUsers.ts`). The MVP requires single-use, hashed, expiring, rate-limited invitations with independent visibility selection and immutable status events. Keep the pairing interaction, rebuild the workflow.

| Feature | Current status | Required MVP behavior | Reusable | Treatment | Entities | Command | RLS | Priority |
|---|---|---|---|---|---|---|---|---|
| Invitation create | Implemented (match code) | Cryptographic code, store hash, return plaintext once, expiry, attempt cap | `PairScreen`, `PinInput`, `TapToCopy` | Redesign | `relationship_invitations` | create-invitation RPC | member of relationship | P1 |
| Invitation accept | Implemented (pair) | Validate identity, expiry, attempts, block, capacity, consent in one tx | `PairScreen` accept path | Redesign | `relationships`, `relationship_members` | accept-invitation RPC | tx-guarded | P1 |
| Relationship type + approx start date | Partial (onboarding) | Proposed on invite | onboarding relationship form | Adapt | `relationships` | RPC | member | P1 |
| Reject / report impersonation / propose corrections | Not implemented | On accept flow | none | Replace | `reports`, `relationship_status_events` | RPC | member/moderator | P1/P2 |
| Independent visibility selection | Not implemented | Each member sets status/identity/history visibility; least-public wins | none | Replace | `relationship_visibility_grants` | RPC | member | P2 |
| Mutual verification | Implicit (both paired) | Verified only after both accept the record | pairing | Redesign | `relationships.verification_state` | RPC | member | P1 |
| Immutable status events | Not implemented | Append-only proof of every status change | none | Replace | `relationship_status_events` | trigger/RPC | insert-only | P1 |
| 90-day + inactivity confirmation | Not implemented | Prompt both; one-sided end removes public current-status | none | Replace | `relationship_confirmations` | scheduled job + RPC | member | P2 |
| One-sided end / dispute freeze | Not implemented | Freeze public details, route to moderation | none | Replace | `relationship_status_events`, `disputes` | RPC | member/moderator | P2 |

Legacy migration: existing paired relationships map to a `relationships` container plus two `relationship_members` rows. Existing `match_code` values are dead after migration (single-use invitations replace them).

## D. Relationship workspace

| Feature | Current status | Required MVP behavior | Reusable | Treatment | Entities | Command | RLS | Priority |
|---|---|---|---|---|---|---|---|---|
| Unified History feed | Partial (timeline; feed fetch mocked) | One stream: memories, feelings, badges, ratings, status, redactions, closure | `TimelineScreen`, `TimelineEventCard`, `GalleryScreen` | Adapt + expand | multiple + a feed view | feed RPC/view | member | P1→P2 |
| Shared moments (memories) | Implemented w/ limits | Text, one photo, date, feeling tags, acknowledgement | `AddMemory`, `EditMemory`, `StoryMode`, `MemoryTile` | Adapt | `memories`, `memory_media`, `memory_revisions` | Edge Function (upload+insert) | member + visibility | P1 |
| One-photo MVP limit | Not enforced (multi-photo FormData) | Enforce one photo in MVP | memory upload | Adapt | `memory_media` | Edge Function | member | P1 |
| Private journal | Mocked; coarse `isPrivate` boolean | Author-only; private/shared/confirmed visibility; revisions | `JournalScreen` shell | Redesign | `journal_entries`, `journal_entry_revisions` | direct + revision trigger | author-only | P1 |
| Feelings log | Not implemented (mood metadata only) | Structured tags with visibility | `MoodCard` on Home | Redesign | `feelings_logs` | direct | member + visibility | P2 |
| Acknowledgements | Not implemented | Partner acknowledges a shared moment | none | Replace | `memories.acknowledged_*` or event | RPC | member | P2 |
| Conversation request | Not implemented | Turn a private concern into a calm shared prompt | none | Replace | `conversation_requests` | RPC | member | P2 |
| Resolution status | Not implemented | Not discussed → improved/unresolved/archived | none | Replace | `resolution_events` | RPC | member | P2 |
| Calendar | Implemented w/ limits | Move under Growth | `CalendarScreen`, rrule/icons helpers, `AddCalendarEvent` | Adapt | `calendar_events` | direct + RLS | member | P3 |
| Games (WYR) | Implemented w/ limits (1 of 12) | Move under Growth/Play | games screens, WYR, `gameData` | Adapt | `games`, `game_responses` | RPC | member | P3 |
| Timeline/status/redaction markers | Not implemented | New event types in the feed | `TimelineEventCard` variants | Adapt | status/redaction events | trigger | member | P2 |

Visibility labels ("Only me", "Shared", "Public if both approve", "Confirmed", "Approved profile", "Moderation only") are required on every card (`MVP 4.4`, `F4`). No screen renders a visibility label today. Add to the shared card component (see the audit's UI section).

## E. Badges and achievements

Not implemented anywhere in the client. No badge screens, types, or data. The full lifecycle (Draft → Given → Accepted → Published → Disputed → Improved → Resolved → Withdrawn → Archived, `MVP 5.2`) and the controlled taxonomy (`Appendix A`) are net-new.

| Feature | Status | Treatment | Entities | Command | RLS | Priority |
|---|---|---|---|---|---|---|
| Badge definitions (taxonomy) | Not implemented | Replace | `badge_definitions` | admin-managed | read-all, admin-write | P2 |
| Moment / pattern / milestone / growth awards | Not implemented | Replace | `badge_awards`, `badge_award_events` | issue-badge RPC | issuer+recipient | P2 |
| Concern markers (private) | Not implemented | Replace | `badge_awards` (class=concern) | issue RPC | member private, never search | P2 |
| Recipient accept / publish / dispute / withdraw / archive | Not implemented | Replace | `badge_award_events` | respond-badge RPC | recipient consent | P2 |
| Anti-gaming (rate limits, 30-day pattern window, no self/anon award) | Not implemented | Replace | constraints + RPC guards | issue RPC | server-enforced | P2 |
| Platform badges (Account/Relationship Verified, 90-day) | Not implemented | Replace | `badge_awards` (issuer=platform) | trigger | read | P2 |

## F. Ratings and immutable score history

Not implemented. Net-new and event-sourced. Old scores never overwrite (`MVP 6.2`, `D9`).

| Feature | Status | Treatment | Entities | Command | RLS | Priority |
|---|---|---|---|---|---|---|
| Initial assessment (after 30 days, 1-5, 10 categories) | Not implemented | Replace | `rating_assessments` | submit RPC | rater-only insert | P2 |
| Score update with reason code + note | Not implemented | Replace | `rating_revisions` | submit-revision RPC | rater insert only, no update/delete | P2 |
| Previous/new score audit fields | Not implemented | Replace | `rating_revisions` | RPC | append-only | P2 |
| Visibility (only me / shared) + acknowledgement | Not implemented | Replace | `rating_revisions`, `rating_acknowledgements` | RPC | member | P2 |
| Cooling period (drop ≥2 within 24h holds shared notify) | Not implemented | Replace | `rating_revisions` + scheduled release | RPC + job | server | P2 |
| Correction retains original, marks "corrected" | Not implemented | Replace | `rating_revisions` (linked prior) | RPC | append-only | P2 |
| Current-score projection | Not implemented | Replace | view over revisions | view | member | P2 |

## G. Breakup and closure

Only unpair exists (`RelationshipSettings.tsx:26` → `unpairUsers`). The MVP closure workflow (`MVP 7`) is net-new: independent right to end, freeze, snapshot, exit badges, lessons learned, searchable-status choice, no-contact.

| Feature | Status | Treatment | Entities | Command | RLS | Priority |
|---|---|---|---|---|---|---|
| Independent end (no partner permission) | Partial (unpair) | Redesign | `relationship_status_events`, `closure_events` | close-relationship RPC | member | P2 |
| Freeze new shared badges/concerns/ratings | Not implemented | Replace | status check in RPCs | RPC guards | server | P2 |
| Closure snapshot + end status/date | Not implemented | Replace | `closure_events` | RPC | member | P2 |
| Mutual confirmation | Not implemented | Replace | `closure_events.confirmation_state` | RPC | member | P2 |
| Exit badges (controlled, neutral/positive) | Not implemented | Replace | `closure_badges`, `badge_definitions` | RPC | recipient consent | P2 |
| Lessons learned / future boundaries (private) | Not implemented | Replace | `journal_entries` (closure-scoped) | direct | author-only | P2 |
| Searchable status after breakup (default off) | Not implemented | Replace | `profiles.search_status` | RPC + step-up | owner | P2 |
| No-contact | Not implemented | Replace | `blocks` / no-contact flag | RPC | both directions | P1 |
| Historical read-only access | Not implemented | Replace | closure snapshot grant | RLS | historical member | P2 |
| Dispute handling | Not implemented | Replace | `disputes` | RPC + moderation | moderator | P2 |

## H. Safety and moderation

Not implemented. No blocks, reports, no-contact, moderation, or redaction. `MVP 8` and acceptance criterion "a blocked user cannot find, invite, notify, badge, mention, or access the blocker through any API path" (`MVP 12.2`) are hard alpha gates.

| Feature | Status | Treatment | Entities | Command | RLS | Priority |
|---|---|---|---|---|---|---|
| Block (immediate, silent) | Not implemented | Replace | `blocks` | block RPC | blocker read; both-direction checks everywhere | P1 |
| No-contact mode | Not implemented | Replace | `blocks`/flag | RPC | both directions | P1 |
| Reports (10 categories) | Not implemented | Replace | `reports` | report Edge Function | reporter status only | P1 |
| Disputes + appeals | Not implemented | Replace | `disputes`, `moderation_actions` | Edge Function | moderator | P2 |
| Redaction / correction / withdrawal | Not implemented | Replace | `redaction_requests`, `redaction_events` | redaction RPC | restricted audit | P2 |
| Moderator review / audit logs | Not implemented | Replace (separate admin app) | `moderation_actions`, `audit_events` | server role | moderator only | P2 |
| Emergency copy ("not an emergency service") | Not implemented | Replace | static + Safety Center | n/a | n/a | P1 |
| Support vs compliance role separation | Not implemented | Replace | role tables | server | least-privilege | P2 |

## I. Privacy rights

Not implemented. Nationwide baseline required (`MVP 10.2`).

| Feature | Status | Treatment | Entities | Command | Priority |
|---|---|---|---|---|---|
| Access (download data) | Not implemented | Replace | `data_export_jobs` | export Edge Function | P2 |
| Correction | Not implemented | Replace | `profiles`, correction RPC | RPC | P2 |
| Deletion | Not implemented | Replace | `deletion_jobs` | delete Edge Function | P1 |
| Portability (JSON/CSV) | Not implemented | Replace | `data_export_jobs` | Edge Function | P2 |
| Consent withdrawal (search off, unpublish badges, revoke sharing) | Not implemented | Replace | `user_consents`, grants | RPC | P2 |
| Communication preferences | Not implemented | Replace | `profiles.comms_prefs` | direct | P3 |
| Retention categories + legal hold | Not implemented | Replace | retention class per table + `legal_holds` | server | P2 |

## J. Notifications

Foundation exists: push-token register/remove (`handleFcmMessaging.ts`), unread listener + store, `markRead.ts`. No inbox screen. Notifications must be server-generated from trusted events; the client must never set sender/recipient (`MVP C1`, `D3`).

| Feature | Status | Treatment | Entities | Command | RLS | Priority |
|---|---|---|---|---|---|---|
| Push-token register/remove | Implemented | Adapt | `device_tokens` | direct (own) | owner | P2 |
| Unread listener + mark-read | Implemented (Firestore) | Adapt | `notifications` | direct read + mark-read | recipient only | P2 |
| Notification inbox screen | Not implemented | Replace | `notifications` | query hook | recipient | P2 |
| Server-generated rules (invite/badge/rating/closure/confirm/moderation/security) | Not implemented | Replace | triggers/Edge | trigger insert only | recipient | P2 |
| Block / no-contact suppression | Not implemented | Replace | join `blocks` in generation | server | both directions | P1 |

## K. Media and storage

Uploads currently go to the external API as multipart form data; downloads use Firebase Storage `getDownloadURL` (`getImages.ts`). MVP requires private buckets, storage RLS, signed URLs, MIME/size limits, file-signature checks, EXIF stripping, and a prohibition on intimate content (`MVP D7`).

| Feature | Status | Treatment | Entities/buckets | Command | Priority |
|---|---|---|---|---|---|
| Profile images | Implemented (API upload + Firebase read) | Replace | `profile-images` bucket (private MVP) | upload via Edge/signed | P1 |
| Memory images | Implemented; multi-photo | Adapt + enforce one-photo | `relationship-media` bucket | Edge Function | P1 |
| Private buckets + storage RLS | Not implemented | Replace | `storage.objects` policies | n/a | P1 |
| Signed URLs, short expiry | Not implemented | Replace | Storage API | server | P1 |
| MIME/size/file-signature/EXIF strip | Not implemented | Replace | bucket + Edge validation | Edge | P1 |
| Malware scan, intimate-content prohibition | Not implemented | Replace | scan pipeline + moderation | Edge/job | P2 |
| Export files / moderation evidence buckets | Not implemented | Replace | `data-exports`, `moderation-evidence` | server | P2 |

## L. Analytics and observability

None present. No analytics SDK, no crash reporting, no structured logging. Instead, sensitive data leaks to `console.log`: `fetchServer.ts:56` (full response), `handleOnboarding.ts:20,35` (image uri, backend URL), `saveConsentRecord.ts:16` and `saveJournalEntry.ts:16` (full private records), `app/_layout.tsx:47,111,125` (app flow + game data).

| Feature | Status | Treatment | Priority |
|---|---|---|---|
| Privacy-safe product analytics (pseudonymous IDs, no journal/notes/names) | Not implemented | Replace | P2 |
| Crash reporting | Not implemented | Replace | P1 |
| Structured logs + correlation IDs | Not implemented | Replace | P2 |
| Security alerts (RLS failures, invite brute force, enumeration, export abuse, admin anomalies) | Not implemented | Replace | P2 |
| Backup/restore verification | Not implemented (Firebase-console unknown) | Replace | P2 |
| Remove sensitive console logs | Present as leak | Remove | P0 |

## Scope-control cross-check (prohibited/deferred)

Screens or code that touch MVP-prohibited categories, to hide or replace before any external build:

- `ConsentVerificationScreen.tsx`: biometric consent (`:160-220`) and precise-location consent (`:144-149`). Prohibited (`MVP 4`, `11.3`, `13.3`). Replace.
- `SubscriptionScreen.tsx` and `/(modals)/subscription`: payments/subscriptions deferred (`MVP 4`, `13.3`). Hide.
- `Journal` "AI Prompt" / "AI-powered prompts" copy (`JournalScreen.tsx:200-210`): AI features are deferred and legal-gated (`MVP 13.3`). Remove AI framing for MVP; keep the journal.
- Precise location: `LocationSearchScreen`, `utils/geo.ts`, `fetchLocations.ts` support venue search for calendar events. Broad city/state is allowed; precise location and check-ins are excluded. Confirm the calendar location feature stores only coarse data or defer it (Product-decision).
