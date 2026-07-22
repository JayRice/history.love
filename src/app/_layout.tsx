import { validateEnv } from '@/src/shared/config/env';

import { useEffect } from 'react';
import { router, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/src/shared/lib/hooks/useFrameworkReady';
import { PaperProvider } from 'react-native-paper';
import { paperTheme } from '@/src/shared/ui/theme/paperTheme';

import Toast from "react-native-toast-message";

import { AuthProvider, useAuth } from "@/src/features/auth/hooks/AuthContext";
import { useLegacyFirebaseSync } from '@/src/shared/lib/legacy/useLegacyFirebaseSync';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ModalProvider } from '@/src/shared/ui/ModalContext';

// Fail fast on missing or unsafe configuration before anything else loads.
validateEnv();

export default function RootLayout() {
  return (
    <ModalProvider>
      <AuthProvider>
        <GestureHandlerRootView style={{flex:1}}>
          <InnerLayout />
        </GestureHandlerRootView>
      </AuthProvider>
    </ModalProvider>

  );
}
function InnerLayout() {
  useFrameworkReady();

  const { authUser, authUserLoading } = useAuth();

  // LEGACY: the six Firestore listeners live in this hook until their
  // Supabase replacements land (Phases 3-4, 6).
  const { user, profileLoading } = useLegacyFirebaseSync(authUser, authUserLoading);

  const segments = useSegments();

  // Route guard (runs on every nav)
  useEffect(() => {
    if (authUserLoading || profileLoading) return;

    const group = segments[0]; // e.g. "(auth)", "(onboarding)", "(app)"
    const inAuth = group === "(auth)";
    const inOnboarding = group === "onboarding";

    if (!authUser && !inAuth) {
      router.replace("/start"); // public auth screens
    } else if (authUser && !user && !inOnboarding) {
      router.replace("/onboarding");
    } else if (authUser && user && (inAuth || inOnboarding || group == undefined) ) {
      router.replace("/home");
    }
  }, [segments, authUser, user, authUserLoading, profileLoading, router]);

  return (
    <PaperProvider theme={paperTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="+not-found" />



        <Stack.Screen
          name="(modals)"
          options={{
            presentation: "modal",           // <- important
            headerShown: false,
            gestureEnabled: true,            // iOS swipe down
            animation: "slide_from_bottom",  // iOS nicely slides up
          }}
        />
        <Stack.Screen
          name="(settings)"
          options={{
            presentation: "modal",
            headerShown: false,
            gestureEnabled: true,
            animation: "slide_from_bottom",
          }}
        />

      </Stack>
      <StatusBar style="auto" />
      <Toast />

    </PaperProvider>
  );
}
