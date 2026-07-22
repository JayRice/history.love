# History.love Migration Status

Tracks execution of `docs/plans/history-love-mvp-implementation-plan.md`. Updated per phase.

## Phase 0A: Safety and repository cleanup — COMPLETE (pending review)

Branch: `phase-0a-safety-cleanup`. Scope was deliberately narrow: remove footguns, no architecture moves, no Supabase code, no Firebase data-flow changes.

### Completed items

1. **DEV_MODE removed.** The committed `DEV_MODE=true` flag and the fake "Sarah Martinez" onboarding seed are gone (`constants/index.ts`, `OnboardingScreen.tsx`). Development and production now run the same code path.
2. **Tunnel and transport-security exceptions removed.** `app.config.ts` no longer hardcodes the personal ngrok URL; the API base comes from `EXPO_PUBLIC_API_URL`. iOS `NSAllowsArbitraryLoads` and Android `usesCleartextTraffic` are removed. `src/config/env.ts` (zod) validates required env at startup and refuses production builds pointing at tunnel hosts or non-https URLs. `.env.example` documents setup; the developer's real values live in the gitignored `.env.local`.
3. **Sensitive logging removed.** Seventeen files no longer log private data: full HTTP responses, consent records, journal entries, pairing responses, partner data, onboarding form contents, media URLs, photo assets, calendar contents, match-code digits and keystrokes, uid/notification ids, storage error dumps, and game payloads. `src/lib/logger.ts` provides a dev-gated logger (debug/warn no-op in production) with a documented no-private-data rule. Benign flow logs were left alone per scope rules.
4. **Environment safety.** Zod validation fails clearly on missing vars; only `EXPO_PUBLIC_*` values reach the bundle; `.gitignore` now covers the dotless `env.local` variant that had slipped past `.env*.local` (the accidentally staged empty file was removed from the index). `src/config/firebase.ts` returned to the env-driven apiKey, reverting an uncommitted regression that had hardcoded the key.
5. **Dependency and build cleanup.** Corrupt `"undefined": "\\"` dependency removed; broken `@/src/hooks/useAuth` import fixed (the only app-code tsc error); dead firebase imports removed from six files; deleted: empty `generalStore.ts`, empty `stop-slop/` directory, stray `Untitled` file. Verified by a clean `npx expo export --platform android` (full Metro bundle, exit 0).
6. **CI safety gates.** `scripts/check-migration-safety.mjs` (also `npm run check:safety`) fails on DEV_MODE flags, tunnel/emulator hosts, server-side secret patterns, private keys/admin credentials, and transport relaxation. GitHub Actions workflow runs the safety check plus an Android bundle check.

### Remaining Firebase dependencies (untouched by design, removed in later phases)

- **Auth:** `src/config/firebase.ts`, `src/contexts/AuthContext.tsx`, `src/database/auth/*`, `src/hooks/useGoogleLogin.ts`, `src/hooks/useLogin.ts` (Phase 2).
- **Firestore listeners:** six `onSnapshot` subscriptions in `app/_layout.tsx` (user, relationship, memories, calendar events, notifications, active game) (Phases 3-4, 6).
- **Firestore writes:** `src/database/messaging/handleFcmMessaging.ts` (device tokens), `src/database/notifications/markRead.ts` (Phase 4/6).
- **Storage reads:** `src/database/getImages.ts` (Phase 4).
- **External API:** all of `src/server/*` still calls the legacy backend through `fetchServer` with a Firebase bearer token (replaced per feature, Phases 3-6).

### Known migration risks (carried forward)

- Firestore/Storage security rules and the external API's authorization remain unverifiable from this repo (audit finding C1). Treat current data as potentially overexposed.
- `tsc --noEmit` fails on pre-existing type errors in `src/components/*` and on react-native-paper shipping raw `.tsx`; TypeScript cannot gate CI until Phase 0B addresses this (`skipLibCheck`/excludes plus targeted fixes).
- `expo lint` is broken: eslint was never installed. Enabling it (plus import-boundary rules) is Phase 0B work.
- `npm run build:web` fails on a pre-existing web-only issue: `lottie-react-native` requires the optional `@lottiefiles/dotlottie-react` on web. Native bundles are unaffected.
- Auth provider return shapes remain inconsistent (crash on cancelled Google login, audit H5); fixed in Phase 2 when auth is rebuilt on Supabase.
- The `babel.config.js` still lists deprecated `expo-router/babel` (warning during bundling); cleanup candidate for Phase 0B.
- Uncommitted user change retained in the working tree: `src/pages/Home/HomeScreen.tsx` (comments out an empty "Updated:" line). Left uncommitted deliberately.

## Phase 0B: Engineering baseline and feature-first structure — COMPLETE

Branch: `phase-0b-baseline` (stacked on `phase-0a-safety-cleanup`). All gates green at completion: `npm run check:safety`, `npm run typecheck` (0 errors), `npm run lint` (0 errors, 177 documented warnings), `npx expo export --platform android`, `npx expo export --platform web`.

### Completed

1. **TypeScript is a trustworthy gate.** 96 baseline errors to 0 without weakening strict mode, adding skip patterns, or new `any`. Key decisions, each commented at its boundary:
   - `AppColors` type + a single sanctioned cast in `useThemeColors` (paperTheme's custom tokens are real at runtime; MD3 typings cannot know them). `border`/`text`/`textSecondary` are typed optional because they are genuinely undefined at runtime today.
   - Removing two bogus imports in OnboardingScreen (`postcss`, `react-native-paper/src/...`) eliminated all seven third-party source errors.
   - Legacy field aliases (`Memory.note/private_note/tags`, `Relationship.partnerName`) typed optional with Phase 3-4 reconciliation notes; renders unchanged.
   - `Calender` -> `Calendar` type-only import typo (Babel elides type imports, which is why Metro never failed); `FormProps.updateFormUser`/`setUserProperty` typed to their dynamic implementations; null-safety guards where the old code would crash; discriminant-guarded and documented casts for WYR payload/animation.
2. **ESLint installed and configured** (eslint 9 + eslint-config-expo 57 flat + unused-imports). `lint`, `lint:fix`, `typecheck` scripts. ~200 unused imports auto-removed; 10 JSX entities escaped; two missing list keys added; a dead conditional-hook call fixed (CategoryPicker); a raw text node in Pressable fixed (GalleryScreen; latent RN crash reached only when the feed has data). React-hooks v6 advisory rules run as warnings repo-wide (fixing them changes runtime behavior; they return to errors as screens are rebuilt).
3. **Architecture boundaries enforced** with exact-path shrink-only allowlists. See `docs/architecture/dependency-boundaries.md`. The rules caught five real cross-feature/provider leaks during the moves, which is the intended behavior.
4. **Feature-first structure in place.** Route tree moved to `src/app` (Expo Router 6 native support; typed-route manifest identical before/after: 27 routes, zero diff). `src/shared/{ui,lib,config,types}` created; features moved in order: auth, profiles, relationships, memories, notifications, calendar, games, journal, each with `ui` + `data/legacy` (+ `domain` where pure logic exists), own-feature relative imports, and a green gate per commit.
5. **Root layout reduced 281 -> 94 lines.** The six Firestore listeners moved verbatim into `src/shared/lib/legacy/useLegacyFirebaseSync` (effect order, dependency arrays, subscriptions, and casts unchanged). `src/app/_layout.tsx` now contains zero Firebase imports.
6. **Tooling debt resolved.** Deprecated `expo-router/babel` removed; `@lottiefiles/dotlottie-react` installed so `build:web` passes (native untouched; web stays outside the required CI gate).
7. **CI runs the full gate:** safety check, typecheck, lint, Android bundle.

### Final structure

```
src/
  app/                  route files only (guard + providers in _layout, 94 lines)
  features/
    auth/          ui, hooks (legacy Firebase session), data/legacy
    profiles/      ui (+ onboarding forms), data/legacy
    relationships/ ui, domain, data/legacy
    memories/      ui, data/legacy
    notifications/ data/legacy
    calendar/      ui, domain, data/legacy
    games/         ui (+ game-modes), domain (static content), data/legacy
    journal/       ui, data/legacy
  shared/
    ui/            components, theme, ModalContext, ToastProvider
    lib/           logger, sfx, hooks/, utils/, legacy/ (getImages, useLegacyFirebaseSync)
    config/        env (zod), firebase (legacy), constants
    types/         shared contracts
  pages/           legacy remainder: Home (user-owned change), Consent,
                   Subscription, Location, Tabs/questions (all replaced/hidden in later phases)
  server/          legacy remainder: fetchServer + mocks (fetchLocations,
                   getMessages, getProfile, getVenues, saveConsentRecord)
  store/           legacy Zustand mirrors (die with TanStack Query adoption)
```

### Boundary allowlist, TS decisions, lint exceptions

Cataloged with death plans in `docs/architecture/dependency-boundaries.md`. Counts: 34 files with legacy `any`, 21 with pre-logger `console`, 12 UI files calling the external API, 5 cross-feature/provider legacy exceptions, 2 individual rule exceptions.

### Files still containing direct Firebase imports

`src/shared/config/firebase.ts`, `src/shared/lib/legacy/getImages.ts`, `src/shared/lib/legacy/useLegacyFirebaseSync.ts`, `src/features/auth/hooks/{AuthContext,useGoogleLogin}`, `src/features/auth/data/legacy/*`, `src/features/notifications/data/legacy/*`. Nothing else.

### Files still using the external API

`src/server/fetchServer.ts` (client) plus the feature `data/legacy` modules for profiles, relationships, memories, calendar, games, and `src/server/fetchLocations.ts`.

### Requires future runtime verification

- Full app flows on a device/emulator (all Phase 0A/0B changes verified via typecheck, lint, and full Metro bundles only; the layout-extraction hook preserves effect order by construction but has not run on hardware).
- The `.env.local`-driven Firebase apiKey + API URL against the real backend.
- TanStack Query provider deliberately deferred: it was in the original 0B sketch, but installing it without any consumer adds dead surface; it lands with the first Supabase repository in Phase 2. (Documented decision.)

### Risks before Phase 1

- Legacy stores still mirror Firestore; the guard still depends on the user store via the legacy hook. Unchanged behavior, but any Phase 1+ work must not add new consumers.
- `src/pages/Home/HomeScreen.tsx` carries a user-owned uncommitted change; sweeps must keep excluding it from staging.

## Phase 1: Supabase foundation — LOCAL FOUNDATION COMPLETE

Migration group 01 authored, applied, and tested against the local stack (Docker + supabase CLI, ports shifted to 553xx to coexist with another local project).

### Completed

- Migrations 0001-0004: identity (profiles, append-only consents, service-only legacy_identity_map), relationship container model (members, invitations with hash-only codes, visibility grants, append-only status events/confirmations), blocks + both-direction predicate, append-only audit ledger, security helper schema, four private storage buckets with per-verb policies, and the trusted RPCs (accept_policy, create/accept/revoke_invitation, confirm_relationship).
- Grant discipline: explicit table grants are the ceiling; append-only tables have no UPDATE/DELETE grant so forgery fails with 42501 rather than silently matching zero rows.
- pgTAP suite: 50/50 passing (schema/RLS-forced checks, cross-user isolation incl. UUID guessing, immutability, block visibility, invitation lifecycle with six abuse cases). `supabase db lint`: zero findings in public/private/security.
- Generated TypeScript database types at `src/shared/types/database.ts`.
- CI `database` job: fresh stack, migrations from zero, pgTAP.

### Remaining Phase 1 work

- Remote projects (staging/production): NOT created. Spends money and needs an org decision (see Questions for Morning Review).
- supabase-js client factory + TanStack Query provider: deliberately deferred to Phase 2 with their first consumer (the auth repository).

### Requires future runtime verification

- CI `database` job has not run on GitHub Actions yet (verified locally only).
- Hosted-platform grant semantics (service_role/authenticated) assumed to match local; re-verify against the first staging project.
