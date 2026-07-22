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
    files: ['src/lib/logger.ts'],
    rules: { 'no-console': 'off' },
  },

  // ---- 3. Architecture boundaries ----------------------------------------
  // Route files and screens/visual components: no provider or HTTP imports.
  {
    files: ['app/**/*.{ts,tsx}', 'src/pages/**/*.{ts,tsx}', 'src/components/**/*.{ts,tsx}', 'src/features/*/ui/**/*.{ts,tsx}'],
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
      'app/_layout.tsx',
      'src/components/animations/CollisionHeartAnimation.tsx',
      'src/components/buttons/BackButton.tsx',
      'src/components/elements/GalleryScreen.tsx',
      'src/components/inputs/CategoryPicker.tsx',
      'src/components/inputs/DatePicker.tsx',
      'src/components/inputs/PinInput.tsx',
      'src/components/inputs/TextField.tsx',
      'src/components/inputs/ToggleButtons.tsx',
      'src/components/layout/Screen.tsx',
      'src/contexts/ModalContext.tsx',
      'src/data/games/gameImages.ts',
      'src/database/auth/loginWithEmail.ts',
      'src/database/auth/signupWithEmail.ts',
      'src/hooks/useCurrentModal.tsx',
      'src/hooks/useGoogleLogin.ts',
      'src/hooks/useJpegCompressor.ts',
      'src/hooks/useLogin.ts',
      'src/lib/sfx.ts',
      'src/pages/Home/HomeScreen.tsx',
      'src/pages/Location/LocationSearchScreen.tsx',
      'src/pages/Onboarding/OnboardingScreen.tsx',
      'src/pages/Start/StartScreen.tsx',
      'src/pages/Tabs/calendar/CalendarScreen.tsx',
      'src/pages/Tabs/games/GamesScreen.tsx',
      'src/pages/Timeline/StoryModeScreen.tsx',
      'src/server/fetchServer.ts',
      'src/server/game/updateGame.ts',
      'src/server/pairUsers.ts',
      'src/server/set/addMemory.tsx',
      'src/server/set/editMemory.tsx',
      'src/server/unpairUsers.ts',
      'src/server/user/handleOnboarding.ts',
      'src/types/Notification.ts',
    ],
    rules: { '@typescript-eslint/no-explicit-any': 'off' },
  },

  // 4b. Benign console usage predating the centralized logger (the
  // sensitive logs were already removed in Phase 0A). Each file converts
  // to src/lib/logger when it migrates to its feature module.
  {
    files: [
      'src/components/elements/CloudText.tsx',
      'src/components/inputs/DatePicker.tsx',
      'src/components/inputs/PhotoInput.tsx',
      'src/components/layout/SwipeDownContainer.tsx',
      'src/contexts/ModalContext.tsx',
      'src/database/getImages.ts',
      'src/database/messaging/handleFcmMessaging.ts',
      'src/database/notifications/markRead.ts',
      'src/hooks/useCurrentModal.tsx',
      'src/hooks/useJpegCompressor.ts',
      'src/pages/Auth/LoginScreen.tsx',
      'src/pages/Consent/ConsentVerificationScreen.tsx',
      'src/pages/Journal/JournalScreen.tsx',
      'src/pages/Pair/PairScreen.tsx',
      'src/pages/Settings/SettingsScreen.tsx',
      'src/pages/Start/StartScreen.tsx',
      'src/pages/Tabs/calendar/AddCalendarEventScreen.tsx',
      'src/pages/Tabs/games/game-modes/WouldYouRather.tsx',
      'src/pages/Timeline/TimelineScreen.tsx',
      'src/server/fetchServer.ts',
      'src/server/user/handleOnboarding.ts',
    ],
    rules: { 'no-console': 'off' },
  },

  // 4c. Legacy provider/HTTP access from UI. These are the Firebase
  // listeners and external-API calls that later phases replace with
  // feature repositories; each entry dies with its migration phase
  // (see docs/migration-status.md "Remaining Firebase dependencies").
  {
    files: [
      'app/_layout.tsx', // six Firestore listeners (Phases 3-4, 6)
      'src/pages/Location/LocationSearchScreen.tsx', // fetchLocations (Phase 3/PD)
      'src/pages/Onboarding/OnboardingScreen.tsx', // handleOnboarding, match code (Phase 2-3)
      'src/pages/Onboarding/forms/ProfileForm.tsx', // isUsernameTaken (Phase 2)
      'src/pages/Pair/PairScreen.tsx', // getMatchCode, pairUsers (Phase 3)
      'src/pages/Settings/settings/RelationshipSettings.tsx', // unpairUsers (Phase 7)
      'src/pages/Tabs/calendar/AddCalendarEventScreen.tsx', // addCalenderEvent (Phase 6)
      'src/pages/Tabs/games/GamesScreen.tsx', // endGame/archiveGame (Phase 6)
      'src/pages/Tabs/games/StartGameScreen.tsx', // startGame (Phase 6)
      'src/pages/Tabs/games/game-modes/WouldYouRather.tsx', // updateGame (Phase 6)
      'src/pages/Timeline/AddMemoryScreen.tsx', // addMemory (Phase 4)
      'src/pages/Timeline/EditMemoryScreen.tsx', // editMemory (Phase 4)
    ],
    rules: { 'no-restricted-imports': 'off' },
  },

  // 4d. Individual pre-existing violations, preserved deliberately.
  {
    // Hook called via helper in stable order; works today, restructure in
    // the memories UI phase rather than risk an animation behavior change.
    files: ['src/components/elements/CloudText.tsx'],
    rules: { 'react-hooks/rules-of-hooks': 'off' },
  },
  {
    // User-owned uncommitted work in this file; not edited for lint.
    files: ['src/pages/Home/HomeScreen.tsx'],
    rules: { 'react/jsx-key': 'off' },
  },
]);
