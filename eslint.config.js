// https://docs.expo.dev/guides/using-eslint/
//
// Structure:
//   1. Expo base (TypeScript, React, React Hooks, RN conventions)
//   2. Project rules (console, any, unused imports)
//   3. Architecture-boundary rules (dependency direction; see
//      docs/architecture/dependency-boundaries.md)
//   4. Legacy allowlist: exact files carrying pre-existing violations.
//      This list must only shrink. New files are NEVER added here; CI
//      fails on violations outside this list.
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const unusedImports = require('eslint-plugin-unused-imports');

// Screens, route files, and visual components must not talk to providers
// (Firebase today, Supabase later) or the HTTP layer directly.
const PROVIDER_IMPORT_PATTERNS = [
  {
    group: ['firebase', 'firebase/*', '@firebase/*'],
    message:
      'UI must not import Firebase. Data access belongs in feature data modules (see docs/architecture/dependency-boundaries.md).',
  },
  {
    group: ['@supabase/*'],
    message:
      'UI must not import Supabase directly. Use feature repositories via hooks.',
  },
  {
    group: ['**/config/firebase', '**/config/firebase.*'],
    message: 'UI must not import the Firebase client.',
  },
  {
    group: ['**/server/*', '**/server/**'],
    message:
      'UI must not call the HTTP layer directly. Route data access through feature hooks.',
  },
];

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      'dist/*',
      '.expo/*',
      'node_modules/*',
      'scripts/*', // node CLI scripts, console usage expected
    ],
  },

  // ---- 2. Project rules --------------------------------------------------
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'unused-imports': unusedImports,
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
    },
    rules: {
      // All logging goes through src/lib/logger (dev-gated, no private data).
      'no-console': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      'unused-imports/no-unused-imports': 'error',
    },
  },
  {
    files: ['src/shared/lib/logger.ts'],
    rules: { 'no-console': 'off' },
  },

  // ---- 3. Architecture boundaries ----------------------------------------
  // Route files and screens/visual components: no provider or HTTP imports.
  {
    files: ['src/app/**/*.{ts,tsx}', 'src/pages/**/*.{ts,tsx}', 'src/shared/ui/**/*.{ts,tsx}', 'src/features/*/ui/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: PROVIDER_IMPORT_PATTERNS }],
    },
  },
  // Feature UI and hooks must not import any feature's data layer via alias.
  // Convention: a feature reaches its OWN data layer through relative
  // imports from its hooks; cross-feature access goes through domain
  // contracts, never another feature's data implementation.
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            ...PROVIDER_IMPORT_PATTERNS.slice(0, 3), // providers stay out of ui/hooks/domain; data/ is exempted below
            {
              group: ['@/src/features/*/data/*', '@/src/features/*/data'],
              message:
                "Do not import a feature's data layer by alias. Own-feature data: relative import from hooks. Cross-feature: use the feature's domain contract.",
            },
          ],
        },
      ],
    },
  },
  // Feature data implementations MAY import providers (that is their job).
  {
    files: ['src/features/*/data/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': 'off' },
  },
  // Shared code must never import feature code.
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/src/features/*', '**/features/*'],
              message: 'shared/ must not depend on features/.',
            },
          ],
        },
      ],
    },
  },

  // React-hooks v6 advisory rules: downgraded to warnings repo-wide. They
  // flag real but PRE-EXISTING patterns (ref reads in render, setState in
  // effects, mutation of memoized values). Fixing them changes runtime
  // behavior, which Phase 0B must not do. New code should keep these at
  // zero; they return to errors as legacy screens are rebuilt per phase.
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      'react-hooks/refs': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/static-components': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
    },
  },

  // ---- 4. Legacy allowlist (exact paths; shrink-only) ---------------------
  // Pre-existing violations recorded at the Phase 0B baseline lint run.
  // Rules stay ON everywhere else; CI fails on any NEW violation. Each
  // entry is removed when its file is migrated (docs/architecture/
  // dependency-boundaries.md documents the shrink plan).

  // 4a. `any` usage predating the migration (63 occurrences).
  {
    files: [
      'src/app/_layout.tsx',
      'src/shared/ui/animations/CollisionHeartAnimation.tsx',
      'src/shared/ui/buttons/BackButton.tsx',
      'src/shared/ui/elements/GalleryScreen.tsx',
      'src/shared/ui/inputs/CategoryPicker.tsx',
      'src/shared/ui/inputs/DatePicker.tsx',
      'src/shared/ui/inputs/PinInput.tsx',
      'src/shared/ui/inputs/TextField.tsx',
      'src/shared/ui/inputs/ToggleButtons.tsx',
      'src/shared/ui/layout/Screen.tsx',
      'src/shared/ui/ModalContext.tsx',
      'src/features/games/domain/gameImages.ts',
      'src/features/auth/data/legacy/loginWithEmail.ts',
      'src/features/auth/data/legacy/signupWithEmail.ts',
      'src/shared/lib/hooks/useCurrentModal.tsx',
      'src/features/auth/hooks/useGoogleLogin.ts',
      'src/shared/lib/hooks/useJpegCompressor.ts',
      'src/features/auth/hooks/useLogin.ts',
      'src/shared/lib/sfx.ts',
      'src/pages/Home/HomeScreen.tsx',
      'src/pages/Location/LocationSearchScreen.tsx',
      'src/features/profiles/ui/OnboardingScreen.tsx',
      'src/features/auth/ui/StartScreen.tsx',
      'src/features/calendar/ui/CalendarScreen.tsx',
      'src/features/games/ui/GamesScreen.tsx',
      'src/features/memories/ui/StoryModeScreen.tsx',
      'src/server/fetchServer.ts',
      'src/features/games/data/legacy/updateGame.ts',
      'src/features/relationships/data/legacy/pairUsers.ts',
      'src/features/memories/data/legacy/addMemory.tsx',
      'src/features/memories/data/legacy/editMemory.tsx',
      'src/features/relationships/data/legacy/unpairUsers.ts',
      'src/features/profiles/data/legacy/handleOnboarding.ts',
      'src/shared/types/Notification.ts',
    ],
    rules: { '@typescript-eslint/no-explicit-any': 'off' },
  },

  // 4b. Benign console usage predating the centralized logger (the
  // sensitive logs were already removed in Phase 0A). Each file converts
  // to src/lib/logger when it migrates to its feature module.
  {
    files: [
      'src/shared/ui/elements/CloudText.tsx',
      'src/shared/ui/inputs/DatePicker.tsx',
      'src/shared/ui/inputs/PhotoInput.tsx',
      'src/shared/ui/layout/SwipeDownContainer.tsx',
      'src/shared/ui/ModalContext.tsx',
      'src/shared/lib/legacy/getImages.ts',
      'src/features/notifications/data/legacy/handleFcmMessaging.ts',
      'src/features/notifications/data/legacy/markRead.ts',
      'src/shared/lib/hooks/useCurrentModal.tsx',
      'src/shared/lib/hooks/useJpegCompressor.ts',
      'src/features/auth/ui/LoginScreen.tsx',
      'src/pages/Consent/ConsentVerificationScreen.tsx',
      'src/pages/Journal/JournalScreen.tsx',
      'src/features/relationships/ui/PairScreen.tsx',
      'src/features/profiles/ui/SettingsScreen.tsx',
      'src/features/auth/ui/StartScreen.tsx',
      'src/features/calendar/ui/AddCalendarEventScreen.tsx',
      'src/features/games/ui/game-modes/WouldYouRather.tsx',
      'src/features/memories/ui/TimelineScreen.tsx',
      'src/server/fetchServer.ts',
      'src/features/profiles/data/legacy/handleOnboarding.ts',
    ],
    rules: { 'no-console': 'off' },
  },

  // 4c. Legacy provider/HTTP access from UI. These are the Firebase
  // listeners and external-API calls that later phases replace with
  // feature repositories; each entry dies with its migration phase
  // (see docs/migration-status.md "Remaining Firebase dependencies").
  {
    files: [
      'src/app/_layout.tsx', // six Firestore listeners (Phases 3-4, 6)
      'src/pages/Location/LocationSearchScreen.tsx', // fetchLocations (Phase 3/PD)
      'src/features/profiles/ui/OnboardingScreen.tsx', // handleOnboarding, match code (Phase 2-3)
      'src/features/profiles/ui/forms/ProfileForm.tsx', // isUsernameTaken (Phase 2)
      'src/features/relationships/ui/PairScreen.tsx', // getMatchCode, pairUsers (Phase 3)
      'src/features/relationships/ui/RelationshipSettings.tsx', // unpairUsers (Phase 7)
      'src/features/calendar/ui/AddCalendarEventScreen.tsx', // addCalenderEvent (Phase 6)
      'src/features/games/ui/GamesScreen.tsx', // endGame/archiveGame (Phase 6)
      'src/features/games/ui/StartGameScreen.tsx', // startGame (Phase 6)
      'src/features/games/ui/game-modes/WouldYouRather.tsx', // updateGame (Phase 6)
      'src/features/memories/ui/AddMemoryScreen.tsx', // addMemory (Phase 4)
      'src/features/memories/ui/EditMemoryScreen.tsx', // editMemory (Phase 4)
    ],
    rules: { 'no-restricted-imports': 'off' },
  },

  // 4d-pre. Legacy Firebase session code living in the auth hooks layer.
  // AuthContext (onAuthStateChanged) and useGoogleLogin (signInWithCredential)
  // ARE the files Phase 2 replaces with the Supabase AuthRepository; until
  // then they keep their provider imports.
  {
    files: [
      'src/features/auth/hooks/AuthContext.tsx',
      'src/features/auth/hooks/useGoogleLogin.ts',
      // Cross-feature reach into auth's legacy logout; replaced by an auth
      // use case in Phase 2.
      'src/features/profiles/ui/SettingsScreen.tsx',
      'src/features/profiles/ui/forms/WelcomeForm.tsx',
      // useLogin registers the FCM token from notifications' legacy data;
      // replaced when Phase 2 rebuilds the sign-in use case.
      'src/features/auth/hooks/useLogin.ts',
    ],
    rules: { 'no-restricted-imports': 'off' },
  },

  // 4d. Individual pre-existing violations, preserved deliberately.
  {
    // Hook called via helper in stable order; works today, restructure in
    // the memories UI phase rather than risk an animation behavior change.
    files: ['src/shared/ui/elements/CloudText.tsx'],
    rules: { 'react-hooks/rules-of-hooks': 'off' },
  },
  {
    // User-owned uncommitted work in this file; not edited for lint.
    files: ['src/pages/Home/HomeScreen.tsx'],
    rules: { 'react/jsx-key': 'off' },
  },
]);
