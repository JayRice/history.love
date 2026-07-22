# History.love Current Code Map

Read-only inventory of the Expo React Native client at `history.love`, current as of the audit date. Every claim below cites a file path and, where it matters, a line number. This document is the factual base for the four sibling documents:

- `history-love-mvp-implementation-audit.md` (synthesis, blueprints, roadmap)
- `history-love-mvp-feature-matrix.md` (feature-by-feature gap table)
- `history-love-supabase-migration-plan.md` (phased migration and data linking)
- `history-love-security-model.md` (domain model, RLS, findings)

Evidence labels used throughout: **Verified** (read directly in this audit), **Traced** (followed through imports/callers), **Inference** (reasoned from code, not executed), **Runtime** (needs a running app to confirm), **Backend** (needs the external API repo), **Firebase-console** (needs Firebase rules/console).

## 1. Stack and entry points

| Item | Value | Source |
|---|---|---|
| Package name | `bolt-expo-starter` (unchanged Bolt.new scaffold name) | `package.json:2` |
| Expo SDK | 54 | `package.json:24` |
| React Native | 0.81.4, React 19.1.0 | `package.json:54,56` |
| Router | expo-router ~6.0.4, typed routes on | `package.json:42`, `app.config.ts:31` |
| State | Zustand 5.0.8 | `package.json:75` |
| UI | React Native Paper 5.14.5 + NativeWind 2.0.11 | `package.json:53,59` |
| Backend SDK | firebase 12.1.0 (Auth, Firestore, Storage) | `package.json:50` |
| Server state lib | none (no `@tanstack/*`, no `react-query`) | `package.json` grep, Verified |
| Supabase | not present | `package.json` grep, Verified |
| Tests | no test runner, no test files | `package.json` scripts, Verified |
| App entry | `expo-router/entry` then `app/_layout.tsx` `RootLayout` | `package.json:3`, `app/_layout.tsx:32` |

`package.json:74` carries a corrupt dependency `"undefined": "\\"`, an accidental `npm install` artifact. Remove it.

## 2. Route tree (expo-router, file-based)

Full route file listing (Verified via directory walk):

```
app/_layout.tsx                         Root: providers + Stack + global listeners + nav guard
app/index.tsx                           /            splash (logo + spinner)
app/start.tsx                           /start       StartScreen (landing / social auth)
app/onboarding.tsx                      /onboarding  OnboardingScreen (13-step form)
app/consent.tsx                         /consent     ConsentVerificationScreen
app/+not-found.tsx                      catch-all    NotFoundScreen
app/(auth)/login.tsx                    /login       LoginScreen
app/(auth)/register.tsx                 /register    RegisterScreen
app/(app)/_layout.tsx                   Tabs navigator (the real bottom tab bar)
app/(app)/home.tsx                      /home        HomeScreen
app/(app)/timeline.tsx                  /timeline    TimelineScreen
app/(app)/journal.tsx                   /journal     JournalScreen
app/(app)/profile.tsx                   /profile     ProfileScreen
app/(app)/settings.tsx                  /settings    SettingsScreen
app/(tabs)/calendar.tsx                 /calendar    CalendarScreen        (no _layout in group)
app/(tabs)/games.tsx                    /games       GamesScreen           (no _layout in group)
app/(tabs)/questions.tsx               /questions    QuestionsScreen stub  (no _layout in group)
app/(modals)/_layout.tsx                Nested modal Stack
app/(modals)/pair.tsx                   PairScreen
app/(modals)/pair_congratulations.tsx   PairCongratulationsScreen
app/(modals)/add_memory.tsx             AddMemoryScreen
app/(modals)/edit_memory.tsx            EditMemoryScreen
app/(modals)/story_mode.tsx             StoryModeScreen (fullScreenModal)
app/(modals)/add_calendar_event.tsx     AddCalendarEventScreen
app/(modals)/location_search.ts         LocationSearchScreen   (.ts extension, not .tsx)
app/(modals)/start_game.tsx             StartGameScreen
app/(modals)/active_game.tsx            ActiveGameScreen
app/(modals)/subscription.tsx           SubscriptionScreen
app/(settings)/relationship_settings.tsx RelationshipSettings (modal presentation)
```

Structural facts that shape the migration:

1. **The real tab bar has five tabs**: Home, Timeline, Journal, Profile, Settings (`app/(app)/_layout.tsx:21-55`). The MVP target is Home, History, Add, Growth, Me. None of Add or Growth exists yet, and Journal sits as a full tab rather than an Add entry point.
2. **`app/(tabs)/` is misnamed.** It holds calendar, games, questions but has no `_layout.tsx`, so those screens render as plain stack pushes reached from Home's navigation buttons (`src/pages/Home/HomeScreen.tsx:129,136,143`), not as tabs. Verified.
3. **Modals are opened imperatively** through `ModalContext.openModal(name, data)` which runs `router.push('/(modals)/'+name)` (`src/contexts/ModalContext.tsx:39-44`). Only `story_mode` overrides to `fullScreenModal` (`app/(modals)/_layout.tsx:12-20`).
4. **`app/index.tsx:6` imports `useAuth` from `@/src/hooks/useAuth`, which does not exist.** The real hook lives in `@/src/contexts/AuthContext`. The value is unused on that screen, so it does not crash today, but the import is dead and misleading. Verified.
5. The nav guard comment at `app/_layout.tsx:242` references an `(app)` / `(onboarding)` grouping that does not match the literal strings it checks (`"(auth)"`, `"onboarding"`). Cosmetic, but it hides the real branch logic.

## 3. Screen inventory and current status

Status legend matches the feature matrix: Fully implemented, Implemented with limitations, Partial, UI only, Mocked, Broken, Stub, Not implemented.

| Route | Screen file | Purpose | Status | Evidence |
|---|---|---|---|---|
| `/` | inline in `app/index.tsx:14-23` | Splash while auth resolves | Implemented | Verified |
| `/start` | `src/pages/Start/StartScreen.tsx` | Landing + Apple/Google/email entry | Implemented w/ limits | Verified; Apple button `:78-80` |
| `/login`, `/register` | `src/pages/Auth/*` | Email auth | Implemented w/ limits | Traced to `useLogin` |
| `/onboarding` | `src/pages/Onboarding/OnboardingScreen.tsx` | 13-step profile + pairing intake | Implemented w/ limits + DEV seed | `:114-172` seeds "Sarah Martinez" |
| `/consent` | `src/pages/Consent/ConsentVerificationScreen.tsx` | 3-step consent | Mocked + off-spec | `:46-62` mock; collects biometric + location |
| `/home` | `src/pages/Home/HomeScreen.tsx` | Dashboard, quick actions, mood | Implemented w/ limits | Duplicate nav entries `:124-181` |
| `/timeline` | `src/pages/Timeline/TimelineScreen.tsx` | Shared memories feed/gallery | Implemented; feed fetch mocked | `getTimeline.ts` mock |
| `/journal` | `src/pages/Journal/JournalScreen.tsx` | Private journal list | Mocked | `:137-168` mock entries |
| `/profile` | `src/pages/Profile/ProfileScreen.tsx` | View own profile | UI only (no editing) | Traced |
| `/settings` | `src/pages/Settings/SettingsScreen.tsx` | Settings rows | Partial | See §4 |
| `/(settings)/relationship_settings` | `src/pages/Settings/settings/RelationshipSettings.tsx` | Unpair control | Partial; calls `unpairUsers` `:26` | Traced |
| `/calendar` | `src/pages/Tabs/calendar/CalendarScreen.tsx` | Shared calendar (big-calendar + rrule) | Implemented w/ limits | Verified |
| `/(modals)/add_calendar_event` | `AddCalendarEventScreen.tsx` | Create event | Implemented | `addCalenderEvent.ts` |
| `/games` | `src/pages/Tabs/games/GamesScreen.tsx` | Game grid + active banner | Implemented w/ limits | 1 of 12 games real |
| `/(modals)/start_game`, `/(modals)/active_game` | `StartGameScreen`, `ActiveGameScreen` | WYR session | Implemented | Traced |
| WYR mode | `game-modes/WouldYouRather.tsx` | Round/choice/reveal | Implemented | `:205-210` `updateGame` |
| `/questions` | `src/pages/Tabs/questions/QuestionsScreen.tsx` | Placeholder | Stub (header only) | `:15-26` |
| `/(modals)/pair` | `src/pages/Pair/PairScreen.tsx` | Enter/share match code | Implemented w/ limits | `:92-103` |
| `/(modals)/pair_congratulations` | `PairCongratulationsScreen.tsx` | Pair success | Implemented | Traced |
| `/(modals)/add_memory`, `/edit_memory`, `/story_mode` | `Timeline/*` | Memory CRUD + story view | Implemented | multipart upload via API |
| `/(modals)/location_search` | `src/pages/Location/LocationSearchScreen.tsx` | Venue/location search | Implemented | `fetchLocations.ts` |
| `/(modals)/subscription` | `src/pages/Subscription/SubscriptionScreen.tsx` | Paywall | UI only | Handoff doc names it UI-only |

## 4. Settings rows (Phase 2 requirement)

`src/pages/Settings/SettingsScreen.tsx` and its nested `settings/RelationshipSettings.tsx` are the only settings surfaces. The MVP "Me" tab requires profile editing, searchability, relationship visibility, privacy center, blocks, export, deletion, consent records, and communication preferences. Current coverage:

- Relationship settings with an unpair action (`RelationshipSettings.tsx:26` → `unpairUsers`). Traced.
- No account deletion, no data export, no block list, no searchability toggle, no consent-record viewer, no password change, no email change. Verified absent (no files match those concepts under `src/pages/Settings`).

Treat the Settings surface as roughly 10% of the required "Me" tab.

## 5. Dependency map (UI to data)

Direction of access, from screens down to providers. This is the coupling the migration must break.

```
Screen / route file
  -> src/pages/* screen component
       -> Zustand store (userStore, relationshipStore, notificationsStore, imagesStore, memoryImageStore)
       -> src/server/* (HTTP to external API via fetchServer)  [mutations + some reads]
       -> src/database/* (Firebase Auth, Firestore writes, Storage reads) [auth + tokens + images]
  app/_layout.tsx InnerLayout
       -> firebase/firestore onSnapshot x6  [ALL realtime reads live here]
       -> src/database/getImages (Firebase Storage)
       -> Zustand setters (fan-out of every server doc into stores)
```

Direct provider access from UI files (the anti-spaghetti violations, Verified):

- `app/_layout.tsx` imports `firebase/firestore` (`:8,10`) and `firebase/storage` (`:20`) and runs six `onSnapshot` listeners plus image fetches inline in a route file. This is the single largest coupling point.
- `src/pages/Start/StartScreen.tsx:11,78-80` renders the Apple auth button and calls Apple sign-in from the screen.
- `src/hooks/useGoogleLogin.ts:53-54` calls `signInWithCredential(auth, cred)` directly.
- `src/pages/Tabs/games/GamesScreen.tsx:12` and `ActiveGameScreen.tsx:6` import `doc, onSnapshot` from `firebase/firestore` (dead imports, no call). Remove.

Every `src/server/*` call and every `src/database/*` call is invoked from a screen or a screen-scoped hook. No repository or use-case layer exists between UI and providers.

## 6. Firebase dependency inventory

Config: `src/config/firebase.ts`. The Firebase web config is hardcoded (`:11-19`), including the API key, despite `app.config.ts:43` wiring `firebaseApiKey` from env and `.env.local` holding the same key. `Constants` is imported (`:4`) but unused. Auth uses AsyncStorage persistence (`:24-27`).

### 6.1 Auth (Traced)

| File:line | API | Purpose |
|---|---|---|
| `src/contexts/AuthContext.tsx:26` | `onAuthStateChanged` | App-wide session listener |
| `src/database/auth/loginWithEmail.ts:16` | `signInWithEmailAndPassword` | Email login |
| `src/database/auth/signupWithEmail.ts:17` | `createUserWithEmailAndPassword` | Email signup |
| `src/hooks/useGoogleLogin.ts:53-54` | `GoogleAuthProvider.credential` + `signInWithCredential` | Google OAuth |
| `src/database/auth/loginWithApple.ts:33,40` | `OAuthProvider('apple.com')` + `signInWithCredential` | Apple OAuth |
| `src/database/auth/logout.ts:14` | `signOut` | Logout (FCM token cleanup commented out `:13`) |
| `src/database/auth/getAuthUser.ts:4` | `auth.currentUser` | Sync current user for ID token |

ID token retrieval for API auth: `authUser.getIdToken()` at `src/server/fetchServer.ts:34`, `src/server/user/handleOnboarding.ts:33`, `src/server/user/isUsernameTaken.ts:17`.

### 6.2 Firestore (Traced)

Realtime listeners, all in `app/_layout.tsx`:

| Line | Path watched | Store setter |
|---|---|---|
| `:121` | `relationships/{relId}/games/{activeGameId}` | `setCurrentGame` |
| `:142` | `relationships/{relId}/memories` | `setMemories` (+ image fetch) |
| `:154` | `relationships/{relId}/calendarEvents` | `setCalendarEvents` |
| `:160-166` | `users/{uid}/notifications` where `readAt==null` orderBy `createdAt` desc limit 10 | `setNotifications` |
| `:214` | `relationships/{relId}` | `setRelationship` |
| `:230` | `users/{uid}` | `setUser` |

Direct Firestore writes outside the API layer:

- `src/database/messaging/handleFcmMessaging.ts:35,54` `setDoc`/`deleteDoc` on `users/{uid}/deviceTokens/{token}`.
- `src/database/notifications/markRead.ts:8` `updateDoc` on `users/{uid}/notifications/{id}`, importing from `@firebase/firestore` while the rest of the app imports `firebase/firestore`. Inconsistent module path.

### 6.3 Storage (Traced)

- `src/database/getImages.ts:9-10` `ref` + `getDownloadURL` for profile and memory images. Called from `app/_layout.tsx` image-fetch effects. No `uploadBytes` anywhere; uploads go to the external API as multipart form data (see §7).

Firestore/Storage security rules are not in this repo. Treat all read/write authorization as **Firebase-console** unknown. The MVP appendix flags this as a Critical risk.

## 7. External HTTP API inventory

Base URL is a hardcoded personal ngrok tunnel: `https://confineless-alyson-lower.ngrok-free.dev/` (`app.config.ts:46`). iOS `NSAllowsArbitraryLoads: true` (`app.config.ts:20`) and Android `usesCleartextTraffic: true` (`app.config.ts:36`) relax transport security app-wide.

Central client `src/server/fetchServer.ts`: builds `{api_url}/api/{route}` (`:30`), attaches `Authorization: Bearer {firebaseIdToken}` on every call (`:34,39`), requires `json.success` truthy (`:74-76`), and logs the full `Response` object at `:56`. Identity is derived server-side from the bearer token; the client does not send its own user id on these calls.

| Caller | Route | Method | Body | In-repo backend? | Verdict |
|---|---|---|---|---|---|
| `fetchLocations.ts:4` | `/utils/get_locations` | POST | `{query}` | Backend | RPC or keep external |
| `getMatchCode.ts:11` | `/matches/get_match_code` | GET | none | Backend | Replace: invitation RPC |
| `pairUsers.ts:17` | `/matches/pair_users` | POST | `{matchCode}` | Backend | Replace: accept-invitation RPC |
| `unpairUsers.ts:8` | `/matches/unpair_users` | POST | `{}` | Backend | Replace: closure RPC |
| `game/startGame.ts:7` | `/games/start_game` | POST | `{gameData, preferences}` | Backend | RPC |
| `game/endGame.ts:5` | `/games/end_game` | POST | `{}` | Backend | RPC |
| `game/archiveGame.ts:5` | `/games/archive_game` | POST | `{}` | Backend | RPC |
| `game/updateGame.ts:8` | `/games/update_game` | POST | `{game, edit}` | Backend | RPC |
| `set/addCalenderEvent.ts:6` | `/calendar/add_event` | POST | `{calendarEvent}` | Backend | Direct insert + RLS |
| `set/addMemory.tsx:21` | `/timeline/add_memory` | POST | FormData: `memory_photos`, `memoryData` | Backend | Edge Function (upload + insert) |
| `set/editMemory.tsx:28` | `/timeline/edit_memory` | POST | FormData: photos + `memoryData` + `deletedPhotos` | Backend | Edge Function |
| `user/handleOnboarding.ts:38` | `/users/handle_onboarding` | POST | FormData: `profile_picture`, `user` | Backend | Edge Function |
| `user/isUsernameTaken.ts:20` | `/users/is_username_taken` | POST | `{username}` | Backend | RPC |
| `getTimeline.ts:10-12` | `/timeline` | GET | `{scrollIndex}` | Disabled | Currently returns mock; real call commented out |

Two endpoints (`handleOnboarding`, `isUsernameTaken`) hand-roll their own `fetch` with duplicated token/URL logic instead of using `fetchServer`. Consolidate.

Mock server functions returning canned data (no HTTP): `getMessages.ts`, `getProfile.ts`, `getVenues.ts`, `saveConsentRecord.ts` (logs full record `:16`), `saveJournalEntry.ts` (logs full entry `:16`), `getTimeline.ts`.

## 8. State management

Stores live in `src/store/`. No `persist` middleware is actually applied anywhere; `userStore.ts:2-3` imports `persist`/AsyncStorage but never wraps `create()`. Only Firebase Auth's own AsyncStorage persistence survives a restart.

| Store | Holds | Classification | Target |
|---|---|---|---|
| `userStore.ts` | `user` (users/{uid} doc), `isUserInitialized` | Server + one UI flag | Server → TanStack Query; keep session/auth in a thin auth store |
| `relationshipStore.ts` | `relationship`, `memories`, `calendarEvents`, `currentGame` | Server | TanStack Query |
| `notificationsStore.ts` | `notifications` | Server | TanStack Query |
| `imagesStore.ts` | `profileImage`, `partnerProfileImage` | Derived URL cache | Query cache |
| `memoryImageStore.ts` | `memoryImages` map | Derived URL cache | Query cache |
| `generalStore.ts` | nothing (empty file) | Dead | Delete |

Every store except the two image caches is a live mirror of a Firestore document copied in via `onSnapshot` in `app/_layout.tsx`. That duplication is the state-layer work the migration removes (see the migration plan, Phase 1).

## 9. Contexts

- `src/contexts/AuthContext.tsx` provides `{authUser, authUserLoading}` and `useAuth`. Grabs `useUserStore.getState().reset` at `:27` but never calls it (dead). `signOut` imported at `:5` but unused.
- `src/contexts/ModalContext.tsx` provides an imperative, promise-based modal stack wired to expo-router.
- `src/contexts/ToastProvider.tsx` provides `useToast`/`showToast` over a Paper `Snackbar`, but **`ToastProvider` is never mounted** in `app/_layout.tsx`. Two toast systems exist; only `react-native-toast-message` (`app/_layout.tsx:284`) is live. `src/database/auth/loginWithEmail.ts:3` imports `useToast` at module scope and never calls it. Verified.

## 10. Design system

Hybrid Paper (MD3) + NativeWind, with custom wrappers in `src/components/` (buttons, cards, inputs, layout, feedback, elements, text, animations). The universal page wrapper is `src/components/layout/Screen.tsx`. `PrimaryButton.tsx:12-69` includes a built-in 3-second anti-double-tap debounce.

Token state (drives the UI/UX findings):

- Single color source `src/theme/colors.ts`: `primary #E63946` (red), `secondary #1D3557` (navy), `semantic.error #EA4335` (near-identical red to primary), plus accents and a gray ramp.
- `src/theme/paperTheme.ts` extends `MD3LightTheme` only. **No dark theme exists**, yet `app.config.ts:12` sets `userInterfaceStyle: "automatic"` and `app/_layout.tsx:283` sets `StatusBar style="auto"`. Screens that hardcode `text-gray-900` (for example `ConsentVerificationScreen.tsx`, `JournalScreen.tsx`) will be unreadable in any dark context.
- `tailwind.config.js` has an empty `theme.extend`. NativeWind color classes such as `bg-primary/10` (`ConsentVerificationScreen.tsx:81`) do not resolve to the brand red; they fall back to Tailwind defaults or nothing. The Paper palette and the Tailwind palette are unsynchronized.
- `JournalScreen.tsx:88,200` uses `bg-gradient-to-r` and `backgroundColor: 'linear-gradient(...)'`, which are web CSS with no effect in React Native. Those gradient cards render as no-ops.
- `constants/index.ts:8-19` `MOOD_EMOJI` and multiple screens use emoji for status meaning, against the MVP rule "no meaning conveyed by color alone" and "avoid emoji-only meaning" (`MVP F4`, `F5`).

## 11. Dead, stub, and off-spec code (remove or rewrite)

- `src/store/generalStore.ts` empty. Delete.
- `src/pages/Tabs/questions/QuestionsScreen.tsx` header-only stub. Hide until built.
- `stop-slop/` empty directory and stray root file `Untitled` (a PowerShell snippet). Remove.
- Dead Firebase imports: `GamesScreen.tsx:12`, `ActiveGameScreen.tsx:6`, `AuthContext.tsx:5`, `useLogin.ts:7`, `loginWithEmail.ts:1` (`createUserWithEmailAndPassword`).
- Broken import: `app/index.tsx:6` `@/src/hooks/useAuth`.
- Off-spec by product rule (not just incomplete): `ConsentVerificationScreen.tsx` collects biometric consent (fingerprint + voice signature UI, `:160-220`) and precise-location consent (`:144-149`), both explicitly excluded and legal-gated by the MVP. This screen must be replaced, not merely wired to a backend.

## 12. Naming inconsistencies to normalize in migration

- `matchCode` (server layer: `getMatchCode.ts:14`, `pairUsers.ts:5`) versus `match_code` (`types/User.ts:61`, `PairScreen.tsx:39`). `OnboardingScreen.tsx:110-112` writes `profile.matchCode` while `PairScreen` reads `profile.match_code`. Data-path mismatch, Verified.
- `relationship_id` (`types/User.ts:81`, used across `app/_layout.tsx`) versus `relationshipId` (`types/Relationship.ts:7`, `types/Notification.ts:14`, `types/Journal.ts:10`). Two conventions for one concept.
- Auth return shapes differ per provider: email returns `{success, user|error}`, Apple returns `{success:true, user, fullName, email}` and throws on failure, Google returns `{success:true, user}` or raw `null` on cancel. `useLogin.ts:49` does `if (response.success)` unconditionally and will throw on a cancelled Google login. `:52` passes the stale `error` state instead of `response.error`. Traced.
