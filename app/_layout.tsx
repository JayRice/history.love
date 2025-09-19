import { useEffect, useState } from 'react';
import { router, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { PaperProvider } from 'react-native-paper';
import { paperTheme } from '@/src/theme/paperTheme';
import { useUserStore } from '@/src/store/userStore';
import { doc, onSnapshot } from "firebase/firestore";
import {db, storage} from "@/src/config/firebase";
import {getDoc} from "firebase/firestore"
import {DEV_MODE} from '@/constants';

import Toast from "react-native-toast-message";



import User from "../src/types/User"
import { AuthProvider, useAuth } from "@/src/contexts/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <InnerLayout />
    </AuthProvider>
  );
}
function InnerLayout() {
  useFrameworkReady();
  const { authUser, authUserLoading } = useAuth();


  const user = useUserStore((state) => state.user);

  const setUser = useUserStore((s) => s.setUser);

  const [profileLoading, setProfileLoading] = useState(true);
  const segments = useSegments();


  // Live subscribe to the user doc when signed in
  useEffect(() => {
    if (authUserLoading) return;

    if (!authUser) {
      setUser(undefined as any);
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    const unsub = onSnapshot(doc(db, "users", authUser.uid), (snap) => {
      setUser(snap.exists() ? (snap.data() as any) : null);
      console.log("user exists: ", snap.exists());
      setProfileLoading(false);
    });
    return unsub;
  }, [authUser, authUserLoading, setUser]);

  useEffect(() => {
    console.log("user:", user)
  }, [user]);
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
      </Stack>
      <StatusBar style="auto" />
      <Toast />

    </PaperProvider>
  );
}