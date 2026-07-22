import { useEffect, useState } from 'react';
import { router, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { PaperProvider } from 'react-native-paper';
import { paperTheme } from '@/src/theme/paperTheme';
import { useUserStore } from '@/src/store/userStore';
import { collection, doc, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import {db} from "@/src/config/firebase";

import Toast from "react-native-toast-message";



import User from "../src/types/User"
import { AuthProvider, useAuth } from "@/src/contexts/AuthContext";
import { useRelationshipStore } from '@/src/store/relationshipStore';
import { ref, getDownloadURL } from "firebase/storage";
import getImages from '@/src/database/getImages';
import { useImagesStore } from '@/src/store/imagesStore';
import { useNotificationsStore } from '@/src/store/notificationsStore';
import { Notification } from '@/src/types/Notification';
import Memory from '@/src/types/Memory';
import { useMemoryImageStore } from '@/src/store/memoryImageStore';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ModalProvider } from '../src/contexts/ModalContext';
import { CalendarEvent } from '@/src/types/Calendar';
import { Game } from '@/src/types/Game';

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

  console.log(" Inside app")
  const { authUser, authUserLoading } = useAuth();


  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((s) => s.setUser);

  const relationship = useRelationshipStore((s) => s.relationship);
  const setRelationship = useRelationshipStore((s) => s.setRelationship);

  const memories = useRelationshipStore((s) => s.memories);
  const setMemories = useRelationshipStore((s) => s.setMemories);

  const setCalendarEvents = useRelationshipStore(s => s.setCalendarEvents);


  const setProfileImage = useImagesStore((s) => s.setProfileImage);
  const setPartnerProfileImage = useImagesStore((s) => s.setPartnerProfileImage);

  const notifications = useNotificationsStore(s => s.notifications);
  const setNotifications = useNotificationsStore(s => s.setNotifications)

  const memoryImages = useMemoryImageStore(s => s.memoryImages);
  const setMemoryImage = useMemoryImageStore(s => s.setMemoryImage);


  const [profileLoading, setProfileLoading] = useState(true);
  const segments = useSegments();

  const setCurrentGame = useRelationshipStore(s => s.setCurrentGame);





  async function fetchProfileImage(imageId: string, uid: string) {
    if (!authUser || !user?.profile?.profileImage?.name) return null;
    const urls = await getImages(`profile-images/${uid}`, [imageId]);
    return urls[0];
  }
  async function fetchMemoryImages(memories: Memory[]) {
    if (!authUser || !memories || !user) return null;
    memories.forEach((memory) => {
      if (!memory.photos) {return}

      memory.photos.forEach(async (photo) => {
        if (!photo.name) {return}

        // already cached
        if (memoryImages[photo.name]) {return}

        const urls = await getImages(`memory-images/${user?.partner?.relationship_id}/${memory.id}`, [photo.name])
        const downloadURL = urls?.[0]
        if (downloadURL){
          setMemoryImage(photo.name, downloadURL);
        }else{
          delete memoryImages[photo.name]
        }
      })
    })

  }

  useEffect(() => {
    console.log("Reloading Instance")
  }, []);


  useEffect(() => {

    if (!relationship || !relationship?.activeGame) {return}

    const activeGameId = relationship.activeGame;
    console.log("listening to active game: ", activeGameId)
    const unsubGame = onSnapshot(doc(db, "relationships", relationship.id, "games", activeGameId), (snap) => {
      if (snap.exists()) {
        const game = snap.data() as Game;
        setCurrentGame(game);
        console.log("Game updated:", game);
      } else {
        setCurrentGame(null)
        console.log("Game document does not exist");
      }


    });

    return unsubGame;

  }, [relationship?.activeGame]);

  useEffect(() => {
    if (!user || !authUser || !user?.partner?.relationship_id ) return;


    const unsubMemory = onSnapshot(collection(db, "relationships", user?.partner?.relationship_id, "memories"), (snap) => {
      const memories = snap.docs.map(d => ({  ...d.data() } as Memory));

      try {
        fetchMemoryImages(memories)
        setMemories(memories);
      } catch(err) {
        console.log("Error while fetching memory images: ", err)
      }

    });

    const unsubCalendarEvents = onSnapshot(collection(db, "relationships", user?.partner?.relationship_id, "calendarEvents"), (snap) => {
      const calendarEvents = snap.docs.map(d => ({  ...d.data() } as CalendarEvent));

      setCalendarEvents(calendarEvents);
    });

    const q = query(
      collection(db, "users", user.id, "notifications"),
      where("readAt", "==", null),
      orderBy("createdAt", "desc"),
      limit(10)
    );
    const unsubNoti = onSnapshot(q, (snap) => {
      const notifs = snap.docs.map(d => ({  ...d.data() } as Notification));
      setNotifications(notifs);
    });



    return () => {
      unsubNoti();
      unsubMemory();
      unsubCalendarEvents();
    };


  }, [user?.id, authUser]);


  // Get partners profile image
  useEffect(() => {
    if (!relationship || !authUser) return;



    const partnerUID = relationship.users.filter((u) => u!=authUser.uid)[0]

    const partnerImage = relationship?.profileImageIds[partnerUID];
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