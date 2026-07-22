# History.love MVP Implementation Audit

Read-only engineering audit of the Expo React Native client at `history.love`, measured against `History_Love_MVP_Product_Requirements_v2.pdf` (the authoritative spec) and the `HistoryLove_Supabase_Migration_Handoff.pdf`. No source files were modified. This document synthesizes and links four supporting documents:

- `history-love-current-code-map.md` (repository facts, dependency map, Firebase and API inventories)
- `history-love-mvp-feature-matrix.md` (feature-by-feature status and treatment)
- `history-love-security-model.md` (domain model, RLS, storage, findings)
- `history-love-supabase-migration-plan.md` (phased migration, data linking)

Evidence discipline: claims cite `file:line`. Labels distinguish Verified (read directly), Traced (followed through imports), Inference, Runtime (needs a running app), Backend (needs the external API repo), Firebase-console (needs Firebase rules), Product-decision, and Legal review. A screen existing is not a working flow; a hidden control is not security; an API is not authorized until its implementation is read.

## 1. Executive summary

History.love today is a working couples memory app: signup, a 13-step onboarding, match-code pairing, a shared memory timeline, a shared calendar, and one working game (Would You Rather). That emotional loop is real and worth keeping. The product the MVP describes is a different thing built on top of that loop: a consent-based, verified relationship-history platform with immutable ratings, a controlled badge system, independent breakup and closure, exact-name search with per-field consent, and a safety and moderation spine. Most of that second thing does not exist yet.

Three facts set the whole plan.

First, the trust boundary is in the wrong place. The mobile client holds the business logic, copies every server document into Zustand through six `onSnapshot` listeners wired directly into the root route file (`app/_layout.tsx:121-235`), and talks to an external API whose authorization cannot be read from this repo. Firestore and Storage rules are not in the repo either. Nothing here can be called secure, because the code that would enforce security is not visible (security-model C1).

Second, the current build carries prototype shortcuts that must not ship: a committed `DEV_MODE=true` that seeds a fake "Sarah Martinez" user during onboarding (`OnboardingScreen.tsx:114-172`), a personal ngrok tunnel as the only API URL with transport security relaxed app-wide (`app.config.ts:20,36,46`), and private consent and journal records printed to `console.log` (`saveConsentRecord.ts:16`, `saveJournalEntry.ts:16`).

Third, one existing screen actively works against the product. The Consent flow collects biometric consent (fingerprint plus voice signature) and precise-location consent (`ConsentVerificationScreen.tsx:144-220`), both of which the MVP explicitly excludes and legal-gates. It is also a mock with no persistence. This is not an incomplete feature; it is the wrong feature.

The recommended path matches the MVP's own portability decision: preserve the product loop, replace the trust boundary, refactor incrementally. Put a repository and use-case seam around Firebase first, stand up a fully specified Supabase schema with RLS and immutable-history tables second, migrate the working core third, and only then build the differentiators (consent, journals, badges, ratings, closure, safety, search) as new feature modules. Calendar, games, AI, and subscriptions follow the security and history foundation, not the other way around.

The single most useful thing to build first is the schema-plus-RLS foundation with the block, consent, and immutable-history tables, because every other feature depends on those guarantees and because the acceptance criteria in `MVP 12.2` cannot be met without them.

## 2. Current product and architecture

Stack: Expo SDK 54, React Native 0.81.4, React 19, expo-router 6, Zustand 5, React Native Paper 5 plus NativeWind 2, Firebase 12 (Auth, Firestore, Storage), and an external HTTP API (code-map §1). No server-state library, no Supabase, no tests.

Architecture in one line: screens read Zustand stores and call `src/server/*` (HTTP) and `src/database/*` (Firebase) directly, while `app/_layout.tsx` runs every realtime listener and the navigation guard in a single 288-line component. There is no layer between UI and providers. This is the coupling the migration exists to remove.

## 3. Repository map

See `history-love-current-code-map.md` §1-§4. Top-level `app/` holds thin route files; `src/` holds all logic in `components`, `contexts`, `store`, `server`, `database`, `hooks`, `logic`, `lib`, `data`, `utils`, `theme`, `types`, `pages`. Dead weight to remove: `src/store/generalStore.ts` (empty), `stop-slop/` (empty dir), the stray root `Untitled` file, the corrupt `package.json:74` dependency, and several dead Firebase imports (code-map §11).

## 4. Route and screen inventory

See `history-love-current-code-map.md` §2-§4. Twenty-eight route files, a five-tab bar (Home, Timeline, Journal, Profile, Settings), a misnamed `(tabs)` group with no layout that renders calendar/games/questions as stack pushes, and a modal stack driven imperatively through `ModalContext`.

## 5. Existing end-to-end flows

Four flows carry the current product. Each is documented in the required format; the remaining flows (memory create/edit, calendar event create, game session) follow the same shape and are covered in the feature matrix.

### Flow: Signup and onboarding

- Purpose: create an account and a profile, and reach the paired or single home state.
- Actors: unregistered visitor becoming a verified adult user.
- Entry points: `/start` social/email buttons, `/register`.
- Prerequisites: none.
- Current implementation: `RegisterScreen` and `useLogin` call Firebase Auth; the nav guard (`app/_layout.tsx:239-253`) routes a signed-in user with no profile to `/onboarding`; `OnboardingScreen` runs 13 steps and submits via `handleOnboarding` (multipart to the external API), then `router.replace("/home")`.
- Current sequence: auth create → guard → onboarding forms → `handleOnboarding` → user doc written server-side → `onSnapshot` rehydrates `userStore` → guard routes to `/home`.
- Current files: `Auth/RegisterScreen.tsx`, `useLogin.ts`, `OnboardingScreen.tsx`, `server/user/handleOnboarding.ts`, `app/_layout.tsx`.
- Current data sources: Firebase Auth, external API, Firestore `users/{uid}`.
- Current authorization: Firebase bearer token; backend logic unverified (Backend).
- Required MVP behavior: 18+ DOB assertion, email and phone verification, and separable acceptance of Terms, Privacy, Community Standards, and Relationship Record Consent, plus a no-background-check acknowledgement (`MVP 4.1`). Store age eligibility as a boolean plus birth year/month, not full DOB.
- Target entities: `profiles`, `user_consents`. Target repository: `AuthRepository`, `ProfileRepository`. Use case: `SignUpAdultUser` then `AcceptPolicies`. Server: signup Edge Function that enforces the age gate and writes consent atomically.
- Required RLS: owner-only profile writes on an allowlist; append-only consent.
- Required UI changes: replace the "sober / not coerced / biometric / location" consent (`ConsentVerificationScreen`) with a versioned-policy flow; remove the `DEV_MODE` seed.
- Failure states: under-18 rejection with data minimization; unverified email blocks privileged actions.
- Block/no-contact impact: none at signup.
- Audit events: consent acceptance recorded append-only.
- Notifications: verification emails/SMS.
- Tests: age-gate rejection, consent persistence, verified-email gating (E2E).
- Migration dependencies: Phase 3 (auth), Phase 5 (consent).
- Implementation status: Implemented with limitations plus an off-spec consent step.
- Recommended sequence: P0 remove seed, P1 age gate and consent.
- Evidence: `OnboardingScreen.tsx:114-172,350-363`; `ConsentVerificationScreen.tsx:16-75`.

### Flow: Partner pairing

- Purpose: connect two accounts into a relationship.
- Actors: two verified adult users.
- Entry points: `/(modals)/pair`, onboarding partner step.
- Prerequisites: signed-in profile.
- Current implementation: `PairScreen` shows the user's 6-digit code (`getMatchCode`) and accepts a partner code, validated only by length (`isValidMatchCode`), then `pairUsers(code)` and `router.replace("/pair_congratulations")`.
- Current files: `Pair/PairScreen.tsx`, `server/getMatchCode.ts`, `server/pairUsers.ts`, `logic/isValidMatchCode.ts`, `components/inputs/PinInput.tsx`.
- Current data sources: external API.
- Current authorization: bearer token; server rate limits unknown (Backend).
- Required MVP behavior: single-use, hashed, expiring, rate-limited invitations; independent visibility selection; verified only after both accept; every material change is an immutable status event (`MVP 4.3`, `C2`).
- Target entities: `relationship_invitations`, `relationships`, `relationship_members`, `relationship_status_events`, `relationship_visibility_grants`. Repository: `InvitationRepository`, `RelationshipRepository`. Use cases: `CreateRelationshipInvitation`, `AcceptRelationshipInvitation`, `ConfirmRelationship`. Server: create-invitation and accept-invitation Edge Functions (one transaction each).
- Required RLS: members only; a client cannot add itself to a relationship by id.
- Required UI changes: keep the `PinInput`/`TapToCopy` interaction; add visibility-selection and invitation-expiry states.
- Failure states: expired, reused, brute-forced, over-capacity, blocked, malformed invites fail without information leakage (`MVP D11`).
- Block/no-contact impact: a blocked user cannot invite or accept.
- Audit events: invitation created/accepted; status event on verification.
- Notifications: invitation and acceptance notices.
- Tests: invitation abuse suite; block enforcement.
- Migration dependencies: Phase 5.
- Implementation status: Implemented as match code; workflow needs redesign.
- Recommended sequence: P1.
- Evidence: `PairScreen.tsx:92-103`; `pairUsers.ts:17`.

### Flow: Shared memory timeline

- Purpose: archive and revisit shared moments.
- Actors: relationship members.
- Entry points: `/timeline` tab, `add_memory` modal.
- Prerequisites: a relationship.
- Current implementation: `TimelineScreen` reads `relationshipStore.memories` (populated by the `onSnapshot` at `app/_layout.tsx:142`); `AddMemoryScreen` uploads photos plus JSON to `/timeline/add_memory`; `StoryModeScreen` views and opens edit. The paged feed fetch (`getTimeline`) currently returns a mock (`getTimeline.ts:10-12`).
- Current files: `Timeline/*`, `server/set/addMemory.tsx`, `server/set/editMemory.tsx`, `components/cards/TimelineEventCard.tsx`, `components/elements/GalleryScreen.tsx`.
- Current data sources: Firestore memories subcollection, Firebase Storage, external API.
- Current authorization: bearer token plus relationship membership on the backend (Backend).
- Required MVP behavior: the timeline becomes the unified History feed carrying memories, feelings, badges, rating changes, status events, redaction markers, and closure events, each with a visibility label (`MVP 4.4`, `F2`). Enforce one photo per memory in MVP.
- Target entities: `memories`, `memory_media`, `memory_revisions`, plus a feed projection. Repository: `MemoryRepository`. Use case: `AddMemory`. Server: memory Edge Function (upload plus insert), edits create revisions, deletes become withdrawals.
- Required RLS: member and entry-visibility gated; no public access to private text.
- Required UI changes: add visibility labels to every card; add new feed event types; add loading/empty/error/redacted states.
- Failure states: upload failure, missing media on read.
- Block/no-contact impact: closure freezes new shared entries; historical read-only remains for members.
- Audit events: redaction and status markers appear inline.
- Notifications: acknowledgement requests.
- Tests: member isolation, revision-on-edit, withdrawal-on-delete.
- Migration dependencies: Phase 4 then Phase 5.
- Implementation status: Implemented with limitations; feed fetch mocked.
- Recommended sequence: P1 core, P2 event-type expansion.
- Evidence: `TimelineScreen.tsx:38`; `getTimeline.ts:10-12`; `app/_layout.tsx:142-152`.

### Flow: Would You Rather game

- Purpose: light shared engagement.
- Actors: relationship members.
- Entry points: Home nav button to `/games`, `start_game` modal.
- Prerequisites: a relationship.
- Current implementation: `GamesScreen` lists `gameData` as flip cards; `StartGameScreen` starts a session; `WouldYouRather` runs rounds and calls `updateGame`; the active game syncs through the `onSnapshot` at `app/_layout.tsx:121`.
- Current files: `Tabs/games/*`, `data/games/*`, `server/game/*`.
- Required MVP behavior: keep as secondary engagement under Growth/Play; do not let it delay the trust foundation (`MVP C1`).
- Target entities: `games`, `game_responses`. Repository: `GameRepository`. Server: game RPCs.
- Migration dependencies: Phase 6.
- Implementation status: Implemented; 1 of 12 games real.
- Recommended sequence: P3.
- Evidence: `WouldYouRather.tsx:205-210`; `gameData.ts`.

## 6. Current Firebase dependency map

See `history-love-current-code-map.md` §6. Auth in `src/database/auth/*` and `AuthContext`; six Firestore `onSnapshot` listeners in `app/_layout.tsx`; Storage reads via `getImages.ts`; token writes via `handleFcmMessaging.ts` and `markRead.ts`. Realtime recommendation: do not replicate all six listeners with Supabase Realtime. Keep realtime only where it earns its cost: the active game (fast two-player turn-taking) and notifications. Convert memories, calendar, relationship, and user reads to TanStack Query fetches with event-driven invalidation. This reduces socket load and simplifies the cache story.

## 7. External API dependency map

See `history-love-current-code-map.md` §7. Fourteen endpoints behind `fetchServer`, all pointed at one ngrok tunnel. Sensitive multi-step operations (pairing, memory upload, onboarding) become Edge Functions; simple owned reads/writes (calendar) become direct RLS-protected queries; the rest become RPCs. Every endpoint's current authorization needs the backend repo to verify (Backend).

## 8. Current feature implementation matrix

See `history-love-mvp-feature-matrix.md` for the full table across MVP groups A-L. Summary counts: roughly a dozen features Implemented with limitations (auth, onboarding, pairing, memories, calendar, one game, push tokens), a handful Mocked or Stub (consent, journal, timeline feed, questions), and the large majority Not implemented (age gate, verification, versioned consent, badges, ratings, closure, safety, search, privacy rights, moderation, immutable history).

## 9. MVP requirements gap analysis

The gap is not evenly distributed. The memory loop is close. The trust platform is mostly absent. The sharpest gaps, in priority order:

1. No enforcement layer. RLS, RPCs, and immutable-history tables do not exist; authorization lives in an unreadable backend (security-model C1, C2).
2. No safety spine. No blocks, no-contact, reports, or moderation, which are alpha gates (`MVP 12.2`, `13.1`).
3. No consent persistence, and an off-spec consent screen that collects prohibited data (feature matrix A, scope-control).
4. No immutable ratings or badges, the product's signature transparency and gamification (`MVP 5`, `6`).
5. No closure, search, or privacy rights, the beta gates (`MVP 7`, `10.2`).

## 10. Target domain model

See `history-love-security-model.md` §1. A relationship container plus membership rows, append-only event tables for status/ratings/badges/audit/redaction, versioned consents, private buckets, and a sanitized public profile projection. The `partner_one_id`/`partner_two_id` sketch from the handoff PDF is rejected per `MVP C2`.

## 11. Target Supabase architecture

Feature-first layout from `MVP E1`: `src/features/{auth,profiles,relationships,memories,badges,ratings,closure,safety,notifications,calendar,games}` each with `domain`, `data`, `hooks`, `ui`, plus `src/shared/{ui,lib,config,types}` and `supabase/{migrations,functions,tests/database}`. One-direction dependency rule: screens call use cases, use cases hold behavior, repositories hide Supabase, migrations and RLS enforce authorization.

## 12. RLS and authorization plan

See `history-love-security-model.md` §2, including the membership helper, the policy matrix, the immutable-revision example, the list of privileged operations that must run server-side, and the twelve block/no-contact enforcement points.

## 13. Storage-security plan

See `history-love-security-model.md` §3. Four private buckets, storage RLS on all verbs, server-generated paths, MIME/size/signature checks, EXIF stripping, short-lived signed URLs.

## 14. Repository and use-case architecture

See `history-love-supabase-migration-plan.md` Phase 1 for the thirteen repository interfaces and eighteen use cases. The rule that keeps this from rotting: no `supabase.from`, storage, or `functions.invoke` call inside a screen or visual component, and no authorization based on route params, hidden buttons, Zustand values, or client-supplied ids (`MVP E4`).

## 15. State-management migration

Today every server document is copied into Zustand via `onSnapshot` (code-map §8). Target split (`MVP E3`):

- TanStack Query owns server state: profiles, relationships, memories, badges, ratings, notifications, search results. Each resource gets a typed query key, a repository method, loading/error states, and an invalidation plan.
- Zustand keeps ephemeral UI only: onboarding progress, local drafts, active filters, UI preferences.
- Auth session state is centralized in one place; feature stores never keep competing user ids or permission booleans.
- Delete `generalStore.ts`; move the two image-URL caches into the query cache.

Cache-key sketch: `['profile','me']`, `['relationship',relId]`, `['memories',relId]`, `['notifications','unread']`, `['badges',profileId]`, `['ratings',relId]`. Invalidate memories on add/edit/withdraw, ratings on revision, notifications on mark-read and on any server event that generates one.

## 16. UI and navigation integration

This section applies the UI/UX Pro Max design intelligence. The database query for a private, trust-sensitive, calm and warm mobile product returned a Soft UI Evolution style (full light and dark support, WCAG AA+), a warm palette anchored on a journal brown with an ink-violet accent, and Lora/Raleway typography for a calm wellness mood. The tool's auto-selected page pattern (Enterprise Gateway) is a landing-page template and does not fit a mobile app; the skill documents that auto-detection can misroute overlapping terms, so that pattern is discarded and the style, palette direction, and the app-UI pre-delivery checklist are kept.

### 16.1 Navigation: evaluated, not accepted blindly

The MVP proposes Home, History, Add, Growth, Me (`MVP F1`). Measured against the bottom-nav rules (five items maximum, predictable back, deep linking) and the current route structure, this is the right target, with the mapping below. The current tab bar is Home, Timeline, Journal, Profile, Settings, which is five tabs that mix a shared surface (Timeline), a private surface (Journal), and two account surfaces (Profile, Settings) while hiding creation inside modals and orphaning calendar and games.

| Current | Target | Action | Rationale |
|---|---|---|---|
| Home | Home | Keep | The dashboard, quick actions, and mood card already match `MVP F1`. Reuse `HomeScreen`, remove duplicate nav entries (`HomeScreen.tsx:124-181`). |
| Timeline | History | Rename and expand | The shared timeline is the seed of the unified History feed. Keep `TimelineScreen`, `TimelineEventCard`, `GalleryScreen`; add badge, rating, status, redaction, and closure event types. |
| Journal | (folds into Add + History) | Merge | A private journal is a create action and a private-visibility entry, not a top-level destination. Journaling starts from Add; entries surface in History with an "Only me" label. |
| (modals) create actions | Add | Promote | Creation is scattered across modals reached imperatively. A center Add tab (memory, journal entry, check-in, badge, concern, event, photo) makes the core action a first-class target and matches the existing modal screens as its sheets. |
| /calendar, /games (orphaned) | Growth | Consolidate | Calendar and games currently render as stack pushes from Home with no tab. Growth gives them a home alongside ratings, check-ins, goals, and conversation prompts, and matches `MVP F1`'s "do not let games delay the foundation". |
| Profile + Settings | Me | Merge | Identity, searchability, relationship visibility, privacy center, blocks, export, deletion, and consent records belong in one account surface. |

One defensible adjustment: keep Journal reachable in two taps from both Add (to write) and History (to read), rather than as its own tab, so the private surface stays present without competing with the shared History feed for the primary slot. This preserves the existing `JournalScreen` visual work while fixing its information architecture.

### 16.2 Screen-level design direction for the highest-priority new surfaces

Each entry gives user goal, primary action, secondary actions, information hierarchy, required components, required states, privacy treatment, accessibility, safety, reusable components, new shared components, and navigation behavior. The remaining new surfaces follow the same template and the same shared card system.

**Home (redesign of `HomeScreen`)**
- Goal: see the current verified relationship at a glance and act quickly. Primary action: open a create sheet. Secondary: view notifications, review a recent badge or rating change, open the relationship snapshot.
- Hierarchy: verified relationship card first, recent appreciation before any analytics (`MVP F2`), quick actions, notifications entry.
- Components: relationship card, quick-action row, recent-recognition card, notifications badge.
- States: loading, empty (no relationship yet, prompt to invite), error, blocked, no-relationship, pending-invitation.
- Privacy: relationship card shows its visibility label ("Verified", "Status only", "Private").
- Accessibility: 44pt targets, dynamic type, screen-reader labels on the card and quick actions, no color-only status.
- Safety: block and no-contact reachable within two taps from the relationship card (`MVP F4`).
- Reuse: `HomeScreen`, `RelationshipCard`, `MoodCard`, `Screen`. New shared: the unified card component (below).
- Nav: tab root; create sheet from Add; notifications push to inbox.

**History (redesign of `TimelineScreen`)**
- Goal: read a trustworthy history of the relationship. Primary action: open an event. Secondary: filter by type, jump to a date.
- Hierarchy: reverse-chronological feed of typed events, each with a visibility label and, where relevant, a change marker.
- Components: unified card variants (relationship, moment, badge, score event, redaction, warning, public fact), filter bar, gallery.
- States: loading, empty, error, blocked, disputed, redacted, archived, closed-relationship, pending-invitation.
- Privacy: every card displays Only me, Shared, Confirmed, Approved profile, or Moderation only (`MVP F4`).
- Accessibility: redaction markers convey meaning in text, not color alone; badge cards pair icon with label and lifecycle state.
- Safety: closure and status-change events read calm and neutral, never as public shaming.
- Reuse: `TimelineScreen`, `TimelineEventCard`, `GalleryScreen`, `MemoryFilterBar`.
- New shared: score-event card, redaction-marker card.
- Nav: tab root; cards open detail modals; redaction detail explains what changed without exposing restricted content.

**Add (new)**
- Goal: create the right kind of entry fast. Primary action: pick a type (memory, journal, check-in, badge, concern, event, photo). Secondary: cancel, save draft.
- Hierarchy: a short typed list, each row with icon, label, and a one-line description of who will see it.
- Components: type list, then the existing create modals as sheets.
- States: loading (submitting), error, offline (queue draft), cooling-period notice for score submissions.
- Privacy: each type states its default visibility before the user starts, and a score change previews old value, new value, reason, visibility, and permanence before submit (`MVP F4`).
- Accessibility: labeled options, focus order matches visual order, reduced-motion on the create-sheet transition.
- Safety: serious concerns route to the confidential safety-report flow, never a badge (`MVP 5.3`).
- Reuse: `AddMemoryScreen`, `AddCalendarEventScreen`, journal editor (new), `PhotoInput`.
- New shared: create-type sheet, visibility-preview row.
- Nav: center tab; each type opens its sheet; back returns to the type list.

**Me (merge of Profile and Settings)**
- Goal: control identity, visibility, privacy, and safety. Primary action: edit profile. Secondary: toggle searchability, manage relationship visibility, open privacy center, manage blocks, export, delete.
- Hierarchy: identity block, searchable status, relationship visibility, privacy center, blocks, data (export/deletion), consent records, settings.
- States: loading, error, blocked-list empty, export-in-progress, deletion-pending.
- Privacy: searchable status defaults off after breakup and turns on only after a clear privacy-review screen (`MVP F4`).
- Accessibility: destructive actions (delete, unpublish, block) use confirmation with clear labels, not color alone.
- Safety: block and no-contact reachable in two taps; deletion and export require step-up auth (`MVP D6`).
- Reuse: `ProfileScreen`, `SettingsScreen`, `RelationshipSettings`.
- New shared: settings-row component, consent-record list, privacy-review screen.
- Nav: tab root; rows open detail or modal screens.

### 16.3 Design-system consolidation

Keep both NativeWind and React Native Paper, with strict ownership (`MVP F5`): Paper or a `shared/ui` layer owns interactive primitives and accessibility; NativeWind handles layout and approved token classes only. Concrete fixes tied to current evidence:

- Mirror `src/theme/colors.ts` into `tailwind.config.js` `theme.extend` so `bg-primary` and friends resolve to the brand palette. Today `theme.extend` is empty and those classes silently miss (code-map §10).
- Add a dark palette and switch `paperTheme` to theme-aware tokens. Today only `MD3LightTheme` exists while the app declares automatic UI style (security-model M4).
- Separate destructive from primary. Primary `#E63946` and `semantic.error #EA4335` are nearly the same red; a user cannot tell a primary action from a destructive one by color. Move brand toward the MVP's calm direction (deep navy for trust, rose for warmth and actions, muted gold for achievements, restrained green for confirmed improvement, neutral grays for privacy and history) and reserve red for genuine danger only.
- Replace RN-invalid CSS gradients in `JournalScreen.tsx:88,200` with `expo-linear-gradient` (already a dependency) or flat surfaces.
- Build one shared card component with the variants above so memory, badge, score, redaction, and public-fact cards read as one system and each can render its visibility label.
- Replace emoji status meaning (`constants/index.ts:8-19` mood emoji, badge and status contexts) with vector icons plus text labels (`MVP F5`, pro-rules: no emoji as structural icons).

## 17. Feature-by-feature implementation blueprint

Blueprints for the highest-priority net-new features. Each follows the required format. Lower-priority features (calendar, games, notifications inbox, conversation requests, resolution status) reuse these patterns and are scoped in the feature matrix.

### Feature: Blocking and no-contact

- Product outcome: a user can make another user disappear from every surface, in two taps, silently.
- Current reusable implementation: none. `RelationshipSettings` gives a starting place for a safety section.
- Current code to retire: none.
- Domain model: `blocks(blocker_id, blocked_id, mode, created_at)`.
- Database entities: `blocks`. Constraints: unique (blocker, blocked). Indexes: both id columns. RLS: blocker reads own list; a `security.is_blocked(a,b)` helper checks both directions and is joined into search, profile, invitation, notification, badge, rating, closure, mention, public history, and signed-URL paths.
- Repository interface: `SafetyRepository.block/unblock/listBlocks`. Use cases: `BlockUser`.
- RPCs: `block`, `unblock`. Edge Functions: none.
- Query hooks: `useBlocks`, mutation `useBlockUser` invalidating search, profile, and notification queries.
- UI screens: Me → Blocks; a block action on any profile and relationship settings.
- UI states: loading, empty list, blocked-confirmation, error.
- Notifications: none to the blocked user (silent).
- Audit requirements: block/unblock recorded.
- Retention: life of account.
- Analytics: block counts only, no identities.
- Tests: block enforcement in both directions across every surface (`MVP D11`).
- Migration considerations: none legacy.
- Security concerns: this is the acceptance-criterion feature; a leak through any side channel fails alpha.
- Estimated effort: 1-2 weeks including enforcement joins.
- Dependencies: Phase 2 schema, `security` helpers.
- Recommended delivery phase: P1 (Phase 5, first).

### Feature: Versioned consent and adult onboarding

- Product outcome: a legally defensible, separable consent record and a real 18+ gate.
- Current reusable implementation: the onboarding form engine (`OnboardingScreen`) and its slide components.
- Current code to retire: `ConsentVerificationScreen` (biometric plus location, off-spec) and its mock `saveConsentRecord`.
- Domain model: `user_consents(profile_id, consent_type, policy_version, accepted_at, withdrawn_at, ...)`; `profiles.age_verified`, `birth_year`, `birth_month`.
- Constraints: append-only (no update/delete). Indexes: (profile_id, consent_type). RLS: owner insert via RPC, owner read.
- Repository: `ProfileRepository`, plus a consent method. Use cases: `SignUpAdultUser`, `AcceptPolicies`.
- RPCs/Edge: signup Edge Function enforces the age gate and writes consent atomically.
- Query hooks: `useConsents`, `useAcceptPolicies`.
- UI screens: an onboarding consent step (Terms, Privacy, Community Standards, Relationship Record Consent, no-background-check), separable toggles, and a Me → Consent records viewer.
- UI states: loading, error, under-18 rejection with data minimization.
- Notifications: verification emails/SMS.
- Audit requirements: each acceptance and withdrawal append-only.
- Retention: life of account plus a counsel-set post-deletion period.
- Analytics: completion rate only, no content.
- Tests: age-gate rejection, consent persistence, separability, withdrawal (`MVP 12.2`).
- Migration considerations: backfill a baseline consent version for existing users at first Supabase sign-in.
- Security concerns: never collect biometrics or precise location (`MVP 11.3`, Legal review).
- Estimated effort: 1-2 weeks.
- Dependencies: Phase 3 auth.
- Recommended delivery phase: P1.

### Feature: Immutable ratings and score history

- Product outcome: score changes are transparent and never overwrite the past.
- Current reusable implementation: none.
- Domain model: `rating_assessments`, `rating_revisions(relationship_id, rater_id, category, prior_score, new_score, reason_code, note, visibility, created_at, prior_revision_id)`, `rating_acknowledgements`.
- Constraints: revisions append-only, no authenticated update/delete; reason code enum. Indexes: (relationship_id, category), rater_id. RLS: rater-only insert, member read, public only via aggregate projection.
- Repository: `RatingRepository`. Use cases: `SubmitRatingRevision`.
- RPCs: submit-revision (validates cooling period: a drop of two or more within 24 hours of a conflict marker holds the shared notification for 24 hours unless a safety reason is set, `MVP 6.3`).
- Query hooks: `useRatingHistory`, `useCurrentScores` (projection), `useSubmitRevision`.
- UI screens: Growth → Ratings; a score-change sheet that previews old value, new value, reason, visibility, and permanence before submit (`MVP F4`).
- UI states: loading, empty (before 30-day eligibility), cooling-period hold, error.
- Notifications: shared only when the user chooses to share or a shared dashboard is on.
- Audit requirements: every revision is the audit; current score is a projection.
- Retention: life of relationship record.
- Analytics: "score update with reason" completion only, no scores or notes.
- Tests: immutability (no client update/delete), cooling period, correction retains original.
- Security concerns: no combined public attractiveness or worth score ever (`MVP 5.3`).
- Estimated effort: 2-3 weeks.
- Dependencies: Phase 5, relationships.
- Recommended delivery phase: P2.

### Feature: Badges and lifecycle

- Product outcome: recognition that rewards effort and closes respectfully, under a controlled taxonomy.
- Current reusable implementation: none; `FlipCard` and the icon system help the visual layer.
- Domain model: `badge_definitions` (taxonomy from `Appendix A`), `badge_awards`, `badge_award_events` (Draft → Given → Accepted → Published → Disputed → Improved → Resolved → Withdrawn → Archived).
- Constraints: allowed-taxonomy check, no self or anonymous awards, rate limits, pattern badges need repeated events across 30 days. Indexes: recipient, issuer, relationship. RLS: issuer and recipient read; public only via projection after recipient consent.
- Repository: `BadgeRepository`. Use cases: `IssueBadge`, `RespondToBadge`.
- RPCs: issue-badge (taxonomy plus anti-gaming guards), respond-badge (accept/publish/dispute/withdraw/archive).
- Query hooks: `useBadges`, `useIssueBadge`, `useRespondToBadge`.
- UI screens: Add → Badge; History badge cards; public badges on the Me profile projection.
- UI states: loading, empty, disputed, withdrawn, archived.
- Privacy: concern markers never public or searchable (`MVP 5.1`, `A4`).
- Accessibility: icon plus label plus lifecycle state; no emoji-only meaning; no public red styling for ordinary concerns (`MVP F5`).
- Safety: serious accusations are not badges; they route to the safety-report flow.
- Tests: anti-gaming (rate limits, self/anon rejection, pattern window), recipient-consent gating for public.
- Estimated effort: 3-4 weeks.
- Dependencies: Phase 5.
- Recommended delivery phase: P2.

### Feature: Breakup and closure

- Product outcome: either person can end respectfully, independently, and keep a fair record.
- Current reusable implementation: `unpairUsers` and `RelationshipSettings` as the entry point.
- Current code to retire: the bare unpair semantics (too destructive, no snapshot).
- Domain model: `relationship_status_events`, `closure_events`, `closure_badges`; a closure snapshot grant for historical read-only access.
- Constraints: append-only events; publication needs affected-user consent. RLS: member and historical-member read.
- Repository: `ClosureRepository`. Use cases: `EndRelationship`, `ConfirmRelationship` (closure variant).
- RPCs: close-relationship (freeze new shared badges/concerns/ratings, snapshot, notify, preserve journals).
- Query hooks: `useClosure`, `useEndRelationship`.
- UI screens: an independent, calm closure flow (status, end date, mutual-confirmation choice, exit badges, private lessons, past-visibility choice, searchable-status choice).
- UI states: loading, error, awaiting-confirmation, disputed.
- Privacy: searchable status defaults off; exit badges only neutral or positive, subject to approval (`MVP 7.3`).
- Safety: a user can complete closure even when the other refuses to confirm (`MVP F4`); a safety-related exit is available.
- Tests: independent-end, freeze, snapshot, historical read-only, journal preservation.
- Estimated effort: 3-4 weeks.
- Dependencies: Phase 5, ratings and badges for exit summaries.
- Recommended delivery phase: P2.

## 18. Firebase-to-Supabase migration plan

See `history-love-supabase-migration-plan.md`. Seven phases from Freeze/inventory through Firebase removal, with the architecture seam deliberately placed before the database swap.

## 19. Data migration and identity-linking plan

See `history-love-supabase-migration-plan.md` (Data migration section). `legacy_identity_map`, relationship-to-container transform, match-code retirement, timestamp and naming normalization, sanitized fixtures only, and dual-read rollback.

## 20. Security and privacy findings

See `history-love-security-model.md` §4. Two Critical (unverifiable authorization; missing trust features), five High (tunnel plus relaxed transport, committed DEV_MODE seed, private-content logging, prohibited-data consent screen, auth-shape crash), four Medium, three Low, plus informational.

## 21. Reliability and performance findings

- The root layout holds eight effects and six listeners plus image fetching (`app/_layout.tsx`), so every relationship change re-runs work in the top-level component. Moving reads into query hooks (Phase 1) removes that re-render pressure.
- The memory image fetch mutates the store's `memoryImages` object in place and calls `delete` on it (`app/_layout.tsx:96,103`), which is a state-mutation smell that can drop cached URLs. Runtime-confirm.
- `getTimeline` returns a mock, so the History feed likely shows nothing from the server today (security-model L3, Runtime).
- No crash reporting or structured logging; failures are invisible in production (feature matrix L).
- No list virtualization is guaranteed for the memory gallery; `@shopify/flash-list` is a dependency and should back long feeds (Inference).

## 22. Accessibility findings

Target WCAG 2.2 AA, a launch requirement (`MVP 11.1`). Current gaps, from the app-UI checklist:

- No dark theme while automatic UI style is declared; hardcoded `text-gray-900` fails contrast in dark contexts (security-model M4).
- Meaning conveyed by color and emoji: mood emoji (`constants/index.ts`), near-identical primary and error reds, and status implied by color. Add text labels and vector icons, and distinguish states by more than color.
- Touch targets and focus: verify 44pt minimums across icon buttons (`BackButton`, `CloseButton`), and that screen-reader focus order matches visual order (Runtime).
- Reduced motion: badge reveals and milestone celebrations must respect reduced-motion (`MVP F5`).
- Forms: onboarding and create forms need visible labels, helper text, and errors near the field, not only at the top.
- Blocking, no-contact, and closure must be reachable and legible: block/no-contact in two taps, closure calm and independent (`MVP F4`).
- `alert()` in `ConsentVerificationScreen.tsx:55` is a web dialog; use accessible native dialogs.

## 23. Testing and CI plan

None exists today; tests are a Critical MVP requirement (`MVP C4`, `E7`). Build in this order:

- Unit: domain rules, visibility resolution, badge lifecycle, rating-revision and cooling-period rules, closure transitions, searchability, block predicates, consent state, data mappers, env parsing.
- Repository: Auth, Profile, Relationship, Memory, Badge, Rating, Closure, Search, Notification against a local Supabase.
- Database (pgTAP/RLS): clean migration from zero, RLS isolation, block enforcement, immutable-event rejection, storage isolation, invitation abuse, public-profile projection, delete/export treatment, moderator boundaries.
- Component: every critical screen renders loading, empty, error, blocked, disputed, redacted, archived, closed-relationship, pending-invitation, and consent-required states.
- Integration: Supabase Auth, repositories, RPCs, Edge Functions, Storage, Realtime with realistic auth claims.
- E2E: signup, age gate, email verification, policy acceptance, invite, accept, add memory, add journal, issue badge, accept badge, submit rating, update rating, close relationship, block, report, search opt-in, export, delete.
- Release gate: no dev URL, no Firebase config, no test credentials, no service-role secret, no fake onboarding, no debug menu, no forced skip, no unapproved feature flag.

CI: branch or reset the database, apply all migrations from zero, seed known users, run pgTAP/RLS, then integration and E2E; regenerate database types and fail on drift (`MVP E6`).

## 24. Environment and deployment plan

- Separate local, staging, production Supabase projects; migrations are the only source of schema truth (`MVP D1`).
- Validated env schemas per environment; the client receives only the Supabase publishable key. No service-role, secret, or database credential in Expo env or the bundle (`MVP E4`).
- Remove the ngrok URL and the ATS/cleartext relaxation; fail closed in production (security-model H1).
- EAS: today `eas.json` has development/preview/production profiles; add a release check that fails on `DEV_MODE`, a tunnel URL, or a secret in the bundle.

## 25. Closed-alpha readiness checklist (`MVP 13.1`)

- [ ] Threat model and abuse-case workshop (stalking, coercive control, impersonation, revenge, takeover).
- [ ] RLS test suite and authorization review for every table and Edge Function.
- [ ] Synthetic-data test environment; no production data in dev.
- [ ] Draft Terms, Privacy Notice, Community Standards, Badge Policy, Safety Center.
- [ ] Moderator decision tree, escalation contacts, evidence handling.
- [ ] Account deletion, export, block, no-contact, and safety-report flows working end-to-end.
- [ ] Verification-language audit so "verified" is never overstated.
- [ ] P0 remediations shipped (DEV_MODE out, tunnel out, logs cleaned, consent screen replaced).
- [ ] 18+ gate, verified email, versioned consent persisted.

## 26. Public-beta readiness checklist (`MVP 13.2`)

- [ ] Outside legal review of federal and state privacy, dating-safety, UGC, communications, and consumer-protection requirements.
- [ ] Launch-state matrix and geofenced notices where required.
- [ ] Security assessment, penetration test, backup/restore exercise, breach tabletop.
- [ ] DMCA agent registration and copyright workflow if photo uploads remain.
- [ ] Vendor inventory, DPAs, subprocessors, transfer map.
- [ ] Moderation staffing, response-time targets, appeals, law-enforcement process.
- [ ] Age-gate testing, minor-report process, CyberTipline escalation.
- [ ] Accessibility audit against WCAG 2.2 AA.
- [ ] Privacy rights center: access, correction, deletion, export, appeal.
- [ ] Searchable profiles, public projection, immutable ratings, closure, redaction, notification inbox, periodic confirmation.

## 27. Prioritized implementation roadmap

Each item lists problem, outcome, systems affected, dependencies, security impact, effort, testing, rollback, and whether a product decision is required.

### P0: Migration and trust-boundary blockers

1. Remove prototype shortcuts. Problem: DEV_MODE seed, ngrok tunnel, relaxed transport, sensitive logs. Outcome: safe-to-build baseline. Systems: `app.config.ts`, `constants`, `OnboardingScreen`, logging. Dependencies: none. Security: High. Effort: 2-3 days. Testing: CI release gate. Rollback: revert config commit. Product decision: no.
2. Architecture seam. Problem: screens call providers directly; server state in Zustand. Outcome: repositories, use cases, TanStack Query behind Firebase. Systems: `src/features/*`, `app/_layout.tsx`, stores. Dependencies: item 1. Security: enables everything else. Effort: 2-3 weeks. Testing: repository contract tests. Rollback: feature flags. Product decision: no.
3. Supabase schema plus RLS foundation. Problem: no enforcement layer. Outcome: schema, RLS, storage, pgTAP. Systems: `supabase/*`. Dependencies: item 2 in parallel. Security: Critical. Effort: 3-4 weeks. Testing: RLS isolation, block enforcement. Rollback: drop/recreate. Product decision: on retention windows (counsel).
4. Backend inventory. Problem: external API authorization unknown. Outcome: documented ownership and a plan to move sensitive commands into Edge Functions. Systems: backend repo. Dependencies: none. Security: Critical. Effort: 1 week. Testing: n/a. Rollback: n/a. Product decision: no. Requires Backend access.

### P1: Closed-alpha requirements

Adult gate, verified email, versioned consent persistence, relationship invitations (hashed, single-use), memories on Supabase, private journals, blocks and no-contact, account deletion, export, reports and basic moderation, safety copy, audit history. Dependencies: P0. Security: High to Critical. Effort: 8-10 weeks. Testing: alpha E2E set. Rollback: per-feature flags. Product decision: closure and moderation policy specifics.

### P2: Closed-beta requirements

Searchability and public projection, badges, ratings with immutable score changes, closure, redaction, appeals, notification inbox, periodic confirmation. Dependencies: P1. Effort: 10-14 weeks. Testing: beta E2E plus RLS attack cases. Product decision: exit-badge taxonomy, search rate limits.

### P3: Secondary engagement

Calendar, games, conversation prompts, relationship trends, richer analytics. Dependencies: P2 stable. Effort: 3-4 weeks. Product decision: whether calendar stores only coarse location.

### P4: Deferred expansion

AI, payments, subscriptions, discovery, messaging, background checks, biometrics. Each requires a new legal gate (`MVP 13.3`). Do not build in MVP.

## 28. Product decisions required

1. Calendar location granularity. `LocationSearchScreen` and `fetchLocations` support venue search. Broad city/state is allowed; precise location is excluded. Decide whether the calendar stores only coarse data or the feature defers.
2. Journal AI framing. `JournalScreen` markets AI prompts. AI is deferred and legal-gated. Decide to remove the AI framing for MVP or defer journals entirely.
3. Subscription surface. `SubscriptionScreen` exists; payments are deferred. Confirm hide, not remove, so the UI can return post-legal-gate.
4. Realtime scope. Confirm realtime only for active game and notifications; everything else is fetch-plus-invalidate.
5. Phone verification timing. The MVP names phone verification in onboarding but SMS is security-only. Decide alpha versus beta.
6. Exit-badge and concern taxonomy governance. Who curates `badge_definitions`, and what is the review cadence.

## 29. Open questions

- Firestore and Storage security rules: what do they currently allow (Firebase-console)?
- External API: where is its code, what authorization does it enforce, and which endpoints validate ownership (Backend)?
- Current user and relationship counts, and how many carry `DEV_MODE` contamination (Backend/Firebase-console)?
- Does the backend rate-limit match-code attempts today (Backend)?
- Are there existing signed legal documents (Terms, Privacy) to align consent versions against (Legal review)?
- Is there an admin console today, or is it net-new (Backend)?

## 30. Appendix

- Routes: see code-map §2 (28 route files).
- Screens: see code-map §3.
- Firebase symbols and listeners: code-map §6.
- API endpoints: code-map §7 (14 endpoints, one tunnel base URL).
- Stores and contexts: code-map §8-§9.
- Firestore collections in use: `users/{uid}`, `users/{uid}/notifications`, `users/{uid}/deviceTokens`, `relationships/{id}`, `relationships/{id}/memories`, `relationships/{id}/calendarEvents`, `relationships/{id}/games`.
- Target tables: security-model §1.
- Env vars: `EXPO_PUBLIC_FIREBASE_API_KEY`, `EXPO_PUBLIC_WEB_CLIENT_ID`, `EXPO_PUBLIC_ANDROID_CLIENT_ID`, `extra.api_url` (app.config.ts), `DEV_MODE` (constants).

## Skill application review

**Where Stop Slop materially improved the documentation.** The audit avoids the usual filler verdicts. It does not call the codebase "robust" or "production-ready"; it says which of six `onSnapshot` listeners live in which file and at which line. Findings state the failure scenario rather than a vague "risk", severity is tied to evidence, and uncertainty is labeled (Backend, Firebase-console, Runtime) instead of hedged with soft language. Every section leads with the specific thing (a file, a line, a table) rather than a throat-clearing sentence, and the writing keeps active voice with a named actor. The rule against em dashes shaped punctuation throughout.

**Where UI/UX Pro Max materially changed the proposed product or interface direction.** Three concrete changes came from the skill, not from the raw MVP text. First, the database query surfaced a Soft UI Evolution style with full dark support and a warm palette, which turned the vague "calm and warm" brief into specific token guidance and exposed that the app ships no dark theme while declaring automatic UI style. Second, the app-UI pre-delivery checklist drove the emoji-as-status and color-only-meaning findings and the 44pt touch-target and reduced-motion accessibility items. Third, the navigation evaluation used the bottom-nav rules (five items maximum, predictable back, deep linking) to test the MVP's Home/History/Add/Growth/Me proposal rather than accept it: the result endorses the target but adds a defensible adjustment (Journal reachable in two taps from Add and History rather than as its own tab) and a red-versus-error color separation the MVP does not call out.

**Conflicts between the skills, the code, and the requirements.** The design database auto-selected an Enterprise Gateway landing-page pattern for a mobile app; the skill documents that auto-detection misroutes overlapping terms, so that pattern was discarded and only the style, palette, and checklist were kept. The current brand red (`#E63946`) conflicts with the MVP's calm direction and with its rule against public red styling for ordinary concerns; the audit recommends moving toward the MVP palette. The handoff PDF's `partner_one_id`/`partner_two_id` data model conflicts with the MVP's container-plus-membership rule; the audit follows the MVP.

**Recommendations rejected because they would reduce clarity, safety, accessibility, or maintainability.** Replicating all six Firestore listeners as Supabase Realtime was rejected as needless socket load; realtime is kept only for the active game and notifications. A full UI rewrite was rejected because the memory loop and its components port well and the MVP's own portability decision preserves them. Retaining the current Consent screen behind a backend was rejected because it collects prohibited biometric and location data; it is replaced, not wired up. Keeping Journal as a primary tab was rejected because a private surface should not compete with the shared History feed for the primary slot.
