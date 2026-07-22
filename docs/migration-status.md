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

### Next: Phase 0B (on approval)

Folder restructure to `src/app` + `features/` + `shared/`, TanStack Query provider, ESLint + import-boundary rules, TypeScript debt reduction, dark-token groundwork. No Supabase code until Phase 1.
