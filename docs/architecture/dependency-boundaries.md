# Dependency Boundaries

Enforced by `eslint.config.js` (sections 3-4) and CI. The lint gate fails on any new violation; the temporary exceptions below are exact file paths that only shrink.

## Allowed direction

```
Route files (src/app)            compose layout, read hook state, navigate
   ↓
Screens / feature UI             render props and hook state
   ↓
Hooks (features/*/hooks)         query cache, loading/error, use-case calls
   ↓
Use cases (features/*/domain)    product workflow; no React, no provider types
   ↓
Repositories (features/*/data)   the ONLY layer that may import providers
   ↓
Providers                        Firebase (legacy, dying) / Supabase (target)
```

`src/shared` sits beside features: anything may import shared; shared imports no feature, ever.

## Prohibited imports (lint-enforced today)

| From | May not import | Rule |
|---|---|---|
| `src/app`, `src/pages`, `src/shared/ui`, `src/features/*/ui` | `firebase*`, `@supabase/*`, the Firebase client config, `**/server/**` (HTTP layer) | `no-restricted-imports` |
| `src/features/**` (ui/hooks/domain) | `firebase*`, `@supabase/*`, Firebase client config | same |
| `src/features/**` | any feature's `data` layer **by alias** (`@/src/features/*/data/*`) | same |
| `src/shared/**` | anything under `src/features` | same |
| everywhere | `console.*` outside `src/shared/lib/logger.ts` and `scripts/` | `no-console` |

**Own-feature data convention:** a feature reaches its own data layer through *relative* imports (`../data/legacy/x`) from its hooks or ui. Cross-feature access goes through the other feature's domain contract, never its data implementation. The alias ban makes cross-feature data reads visible; the relative form marks intentional own-feature wiring.

`src/features/*/data/**` is exempt from the provider ban: talking to providers is that layer's job.

## Correct and incorrect examples

```ts
// CORRECT: screen -> own feature hook
import { useLogin } from '@/src/features/auth/hooks/useLogin';

// CORRECT: hook -> own feature data, relative
import loginWithEmail from '../data/legacy/loginWithEmail';

// CORRECT: anything -> shared
import { logger } from '@/src/shared/lib/logger';

// INCORRECT: screen imports a provider
import { collection } from 'firebase/firestore';        // lint error

// INCORRECT: screen calls the HTTP layer
import fetchServer from '@/src/server/fetchServer';      // lint error

// INCORRECT: cross-feature data reach
import { registerFcmToken }
  from '@/src/features/notifications/data/legacy/handleFcmMessaging'; // lint error

// INCORRECT: shared depending on a feature
// (in src/shared/ui/…)
import { useAuth } from '@/src/features/auth/hooks/AuthContext';      // lint error
```

## Temporary legacy exceptions (shrink-only)

Recorded in `eslint.config.js` section 4 with exact paths. Summary and death plan:

| Group | Files | Dies in |
|---|---|---|
| Firebase in auth hooks | `features/auth/hooks/AuthContext.tsx`, `features/auth/hooks/useGoogleLogin.ts` | Phase 2 (Supabase Auth repository) |
| Cross-feature data reach | `features/profiles/ui/SettingsScreen.tsx`, `features/profiles/ui/forms/WelcomeForm.tsx` (auth logout), `features/auth/hooks/useLogin.ts` (FCM token) | Phase 2 |
| UI -> external API | `features/profiles/ui/OnboardingScreen.tsx`, `features/profiles/ui/forms/ProfileForm.tsx` (Phase 2); `features/relationships/ui/PairScreen.tsx`, `RelationshipSettings.tsx` (Phase 3); `features/memories/ui/AddMemoryScreen.tsx`, `EditMemoryScreen.tsx` (Phase 4); `features/calendar/ui/AddCalendarEventScreen.tsx`, `features/games/ui/*`, WYR (Phase 6); `src/pages/Location/LocationSearchScreen.tsx` (Phase 3 or product decision) | per phase |
| Legacy `any` (63 uses) | 34 exact files listed in 4a | as each file is rebuilt |
| Benign `console` (pre-logger) | 21 exact files listed in 4b | swap to logger on migration |
| Individual | `shared/ui/elements/CloudText.tsx` (stable-order hook violation), `src/pages/Home/HomeScreen.tsx` (jsx-key; file carries user-owned uncommitted work) | memories UI phase / next HomeScreen edit |

**How the list shrinks:** every later phase that rebuilds a file must delete its allowlist entry in the same commit. A PR that adds a new path to section 4 is a rejected PR; the rules exist to make new violations impossible, not to catalog them.

## Firebase-touching files after Phase 0B (complete list)

`src/shared/config/firebase.ts` (client init), `src/shared/lib/legacy/getImages.ts` (Storage reads), `src/shared/lib/legacy/useLegacyFirebaseSync.ts` (the six Firestore listeners), `features/auth/hooks/{AuthContext,useGoogleLogin}`, `features/auth/data/legacy/*` (5 files), `features/notifications/data/legacy/{handleFcmMessaging,markRead}`. Nothing else imports `firebase*`. All die by Phase 7.
