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
import { useRelationshipStore } from '@/src/store/relationshipStore';
import { ref, getDownloadURL } from "firebase/storage";
import getImages from '@/src/database/getImages';
import { useImagesStore } from '@/src/store/imagesStore';

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

  const relationship = useRelationshipStore((s) => s.relationship);

  const setRelationship = useRelationshipStore((s) => s.setRelationship);

  const setProfileImage = useImagesStore((s) => s.setProfileImage);
  const setPartnerProfileImage = useImagesStore((s) => s.setPartnerProfileImage);


  const [profileLoading, setProfileLoading] = useState(true);
  const segments = useSegments();


  async function fetchProfileImage(imageId: string, uid: string) {
    if (!authUser || !user?.profile?.profileImage?.name) return null;
    const urls = await getImages(`profile-images/${uid}`, [imageId]);
    console.log("Fetched profile image: ", urls[0])
    return urls[0];
  }

  useEffect(() => {
    console.log("Reloading Instance")
  }, []);

  // Get partners profile image
  useEffect(() => {
    if (!relationship || !authUser) return;

    const partnerUID = relationship.users.filter((u) => u!=authUser.uid)[0]

    console.log("relationship profile Image ids: ", relationship?.profileImageIds)
    const partnerImage = relationship?.profileImageIds[partnerUID];
    console.log(partnerImage)
    if (!partnerImage) return;

    fetchProfileImage(partnerImage, partnerUID).then((profileImage) => {
      setPartnerProfileImage(profileImage );
    })
  }, [relationship]);

  // Get users profile image
  useEffect(() => {
    if (!authUser || !user?.profile?.profileImage || !user?.profile?.profileImage?.name) return;

    fetchProfileImage(user?.profile?.profileImage?.name, authUser.uid).then((profileImage) => {
      setProfileImage(profileImage );
    })
  }, [user?.id, user?.profile?.profileImage])

  useEffect(() => {
   const relationship_id = user?.partner?.relationship_id;

   if (!relationship_id) return;


    const unsub = onSnapshot(doc(db, "relationships", relationship_id), (snap) => {
      setRelationship(snap.exists() ? (snap.data() as any) : null);
    });
    return unsub;

  }, [authUser, user?.partner, user?.partner?.relationship_id]);
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
      setProfileLoading(false);
    });
    return unsub;
  }, [authUser, authUserLoading, setUser]);


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